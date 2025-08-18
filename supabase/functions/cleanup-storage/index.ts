
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting storage cleanup process...')

    // Get all files from profile-images bucket
    const { data: files, error: listError } = await supabaseClient.storage
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

    // Get all referenced profile images from database
    const { data: profileImages, error: dbError } = await supabaseClient
      .from('general_information')
      .select('profile_image')
      .not('profile_image', 'is', null)

    if (dbError) {
      console.error('Error fetching profile images from database:', dbError)
      throw dbError
    }

    console.log(`Found ${profileImages?.length || 0} referenced images in database`)

    // Create set of referenced file paths for quick lookup
    const referencedPaths = new Set<string>()
    const sampleReferencedFiles: string[] = []
    
    profileImages?.forEach(record => {
      if (record.profile_image) {
        try {
          const url = new URL(record.profile_image)
          // Extract the path after /profile-images/
          const pathParts = url.pathname.split('/profile-images/')
          if (pathParts.length > 1) {
            const filePath = pathParts[1]
            referencedPaths.add(filePath)
            if (sampleReferencedFiles.length < 20) {
              sampleReferencedFiles.push(filePath)
            }
            console.log('Referenced path:', filePath)
          }
        } catch (error) {
          console.error('Error parsing URL:', record.profile_image, error)
        }
      }
    })

    console.log(`Extracted ${referencedPaths.size} referenced file paths`)

    // Identify orphaned files
    const orphanedFiles: string[] = []
    const allStorageFiles: string[] = []
    const errors: Array<{ file: string; error: string }> = []

    // Process all files and folders in storage
    const processStorageItems = async (items: any[], prefix = '') => {
      for (const item of items) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name
        
        try {
          if (item.metadata) {
            // This is a file
            allStorageFiles.push(fullPath)
            
            if (!referencedPaths.has(fullPath)) {
              orphanedFiles.push(fullPath)
              console.log('Orphaned file found:', fullPath)
            } else {
              console.log('Referenced file found:', fullPath)
            }
          } else {
            // This might be a folder, list its contents
            const { data: subItems, error: subError } = await supabaseClient.storage
              .from('profile-images')
              .list(fullPath, {
                limit: 1000,
                sortBy: { column: 'name', order: 'asc' }
              })
            
            if (!subError && subItems) {
              await processStorageItems(subItems, fullPath)
            } else if (subError) {
              console.error('Error listing subfolder:', fullPath, subError)
            }
          }
        } catch (error) {
          console.error('Error processing item:', fullPath, error)
          errors.push({ file: fullPath, error: error.message })
        }
      }
    }

    if (files) {
      await processStorageItems(files)
    }

    console.log(`Total files in storage: ${allStorageFiles.length}`)
    console.log(`Orphaned files to delete: ${orphanedFiles.length}`)

    // Delete orphaned files
    let deletedCount = 0
    const deletedFiles: string[] = []

    if (orphanedFiles.length > 0) {
      const { data: deleteResult, error: deleteError } = await supabaseClient.storage
        .from('profile-images')
        .remove(orphanedFiles)

      if (deleteError) {
        console.error('Error deleting files:', deleteError)
        errors.push({ file: 'bulk_delete', error: deleteError.message })
      } else {
        deletedCount = deleteResult?.length || 0
        deletedFiles.push(...orphanedFiles)
        console.log(`Successfully deleted ${deletedCount} files`)
      }

      // Verify deletion
      console.log('Verifying deletion...')
      const { data: remainingFiles, error: verifyError } = await supabaseClient.storage
        .from('profile-images')
        .list('', { limit: 1000 })

      if (!verifyError) {
        console.log(`Files remaining after cleanup: ${remainingFiles?.length || 0}`)
      }
    }

    const result = {
      success: true,
      summary: {
        totalFilesInStorage: allStorageFiles.length,
        totalReferencedImages: profileImages?.length || 0,
        uniqueReferencedPaths: referencedPaths.size,
        orphanedFilesFound: orphanedFiles.length,
        filesDeleted: deletedCount,
        filesRemaining: allStorageFiles.length - deletedCount,
        errors: errors.length
      },
      deletedFiles: deletedFiles,
      referencedFiles: sampleReferencedFiles,
      errors: errors,
      message: orphanedFiles.length === 0 
        ? 'No orphaned files found. Storage is clean!'
        : `Cleanup completed. Deleted ${deletedCount} orphaned files.`
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Storage cleanup error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to cleanup storage'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
