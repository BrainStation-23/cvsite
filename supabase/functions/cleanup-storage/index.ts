
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting storage cleanup process...')

    // Get all files from the profile-images bucket
    const { data: files, error: listError } = await supabase.storage
      .from('profile-images')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (listError) {
      console.error('Error listing files:', listError)
      throw listError
    }

    console.log(`Found ${files?.length || 0} files in storage`)

    // Get all profile images referenced in the database
    const { data: referencedImages, error: dbError } = await supabase
      .from('general_information')
      .select('profile_image')
      .not('profile_image', 'is', null)

    if (dbError) {
      console.error('Error fetching referenced images:', dbError)
      throw dbError
    }

    console.log(`Found ${referencedImages?.length || 0} referenced images in database`)

    // Create a set of all referenced file paths for faster lookup
    const referencedPaths = new Set<string>()
    
    referencedImages?.forEach(item => {
      if (item.profile_image) {
        // Handle different URL formats
        let filePath = item.profile_image
        
        // If it's a full URL, extract just the path after profile-images/
        if (filePath.includes('/storage/v1/object/public/profile-images/')) {
          filePath = filePath.split('/storage/v1/object/public/profile-images/')[1]
        } else if (filePath.startsWith('http')) {
          // Handle other URL formats by taking everything after the last /profile-images/
          if (filePath.includes('/profile-images/')) {
            filePath = filePath.split('/profile-images/')[1]
          }
        }
        
        // Clean up the path
        filePath = filePath.replace(/^\/+/, '') // Remove leading slashes
        
        if (filePath) {
          referencedPaths.add(filePath)
          console.log(`Referenced file: ${filePath}`)
        }
      }
    })

    console.log(`Total unique referenced paths: ${referencedPaths.size}`)

    // Find orphaned files by checking each storage file against referenced paths
    const orphanedFiles = []
    const referencedFiles = []

    for (const file of files || []) {
      const fileName = file.name
      let isReferenced = false

      // Check if this file is directly referenced
      if (referencedPaths.has(fileName)) {
        isReferenced = true
      } else {
        // Check if this file is part of a referenced path (for nested folders)
        for (const referencedPath of referencedPaths) {
          if (referencedPath.includes(fileName) || fileName.includes(referencedPath)) {
            isReferenced = true
            break
          }
        }
      }

      if (isReferenced) {
        referencedFiles.push(fileName)
        console.log(`Keeping referenced file: ${fileName}`)
      } else {
        orphanedFiles.push(file)
        console.log(`Found orphaned file: ${fileName}`)
      }
    }

    console.log(`Found ${orphanedFiles.length} orphaned files`)
    console.log(`Found ${referencedFiles.length} referenced files`)

    // Delete orphaned files one by one with detailed logging
    const deletedFiles = []
    const errors = []

    for (const file of orphanedFiles) {
      try {
        console.log(`Attempting to delete: ${file.name}`)
        
        const { data: deleteData, error: deleteError } = await supabase.storage
          .from('profile-images')
          .remove([file.name])

        if (deleteError) {
          console.error(`Error deleting ${file.name}:`, deleteError)
          errors.push({ file: file.name, error: deleteError.message })
        } else {
          console.log(`Successfully deleted: ${file.name}`)
          console.log(`Delete response:`, deleteData)
          deletedFiles.push(file.name)
        }
      } catch (err) {
        console.error(`Exception deleting ${file.name}:`, err)
        errors.push({ file: file.name, error: err.message })
      }

      // Add a small delay between deletions to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Verify deletion by listing files again
    const { data: remainingFiles, error: verifyError } = await supabase.storage
      .from('profile-images')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (!verifyError) {
      console.log(`Files remaining after cleanup: ${remainingFiles?.length || 0}`)
    }

    const result = {
      success: true,
      summary: {
        totalFilesInStorage: files?.length || 0,
        totalReferencedImages: referencedImages?.length || 0,
        uniqueReferencedPaths: referencedPaths.size,
        orphanedFilesFound: orphanedFiles.length,
        filesDeleted: deletedFiles.length,
        filesRemaining: remainingFiles?.length || 0,
        errors: errors.length
      },
      deletedFiles,
      referencedFiles: referencedFiles.slice(0, 10), // Show first 10 for debugging
      errors
    }

    console.log('Cleanup completed:', result.summary)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Storage cleanup error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        summary: {
          totalFilesInStorage: 0,
          totalReferencedImages: 0,
          uniqueReferencedPaths: 0,
          orphanedFilesFound: 0,
          filesDeleted: 0,
          filesRemaining: 0,
          errors: 1
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
