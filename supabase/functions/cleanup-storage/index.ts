
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

    // Extract just the filenames from the URLs
    const referencedFilenames = new Set(
      referencedImages
        ?.map(item => {
          if (!item.profile_image) return null
          
          // Handle both full URLs and just filenames
          if (item.profile_image.includes('/storage/v1/object/public/profile-images/')) {
            return item.profile_image.split('/profile-images/')[1]
          } else if (item.profile_image.startsWith('http')) {
            // Handle other URL formats
            const parts = item.profile_image.split('/')
            return parts[parts.length - 1]
          } else {
            // Assume it's already just a filename or path
            return item.profile_image
          }
        })
        .filter(Boolean) || []
    )

    console.log('Referenced filenames:', Array.from(referencedFilenames))

    // Find orphaned files
    const orphanedFiles = files?.filter(file => {
      // Check if this file (or any path containing it) is referenced
      const isReferenced = Array.from(referencedFilenames).some(refFile => 
        refFile.includes(file.name) || file.name.includes(refFile)
      )
      return !isReferenced
    }) || []

    console.log(`Found ${orphanedFiles.length} orphaned files`)

    // Delete orphaned files
    const deletedFiles = []
    const errors = []

    for (const file of orphanedFiles) {
      try {
        const { error: deleteError } = await supabase.storage
          .from('profile-images')
          .remove([file.name])

        if (deleteError) {
          console.error(`Error deleting ${file.name}:`, deleteError)
          errors.push({ file: file.name, error: deleteError.message })
        } else {
          console.log(`Successfully deleted: ${file.name}`)
          deletedFiles.push(file.name)
        }
      } catch (err) {
        console.error(`Exception deleting ${file.name}:`, err)
        errors.push({ file: file.name, error: err.message })
      }
    }

    const result = {
      success: true,
      summary: {
        totalFilesInStorage: files?.length || 0,
        totalReferencedImages: referencedImages?.length || 0,
        orphanedFilesFound: orphanedFiles.length,
        filesDeleted: deletedFiles.length,
        errors: errors.length
      },
      deletedFiles,
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
          orphanedFilesFound: 0,
          filesDeleted: 0,
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
