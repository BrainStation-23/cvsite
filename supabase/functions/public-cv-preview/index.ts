
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Template processor utilities (simplified versions of the main codebase)
function mapEmployeeData(employeeData: any) {
  return {
    firstName: employeeData?.first_name || '',
    lastName: employeeData?.last_name || '',
    fullName: `${employeeData?.first_name || ''} ${employeeData?.last_name || ''}`.trim(),
    biography: employeeData?.biography || '',
    currentDesignation: employeeData?.current_designation || '',
    employeeId: employeeData?.employee_id || '',
    profileImage: employeeData?.profile_image || '',
    technicalSkills: employeeData?.technical_skills || [],
    specializedSkills: employeeData?.specialized_skills || [],
    experiences: employeeData?.experiences || [],
    education: employeeData?.education || [],
    trainings: employeeData?.trainings || [],
    achievements: employeeData?.achievements || [],
    projects: employeeData?.projects || []
  }
}

function processTemplate(htmlTemplate: string, mappedData: any): string {
  let processedHTML = htmlTemplate

  // Simple template variable replacement
  const replaceVariables = (html: string, data: any, prefix = '') => {
    let result = html
    
    Object.keys(data).forEach(key => {
      const value = data[key]
      const placeholder = prefix ? `{{${prefix}.${key}}}` : `{{${key}}}`
      
      if (Array.isArray(value)) {
        // Handle arrays with simple iteration
        const arrayPlaceholder = `{{#each ${prefix ? prefix + '.' : ''}${key}}}`
        const endArrayPlaceholder = `{{/each}}`
        
        if (result.includes(arrayPlaceholder)) {
          const startIndex = result.indexOf(arrayPlaceholder)
          const endIndex = result.indexOf(endArrayPlaceholder) + endArrayPlaceholder.length
          
          if (startIndex !== -1 && endIndex !== -1) {
            const template = result.substring(startIndex + arrayPlaceholder.length, endIndex - endArrayPlaceholder.length)
            let arrayHTML = ''
            
            value.forEach((item: any, index: number) => {
              let itemHTML = template
              if (typeof item === 'object') {
                Object.keys(item).forEach(itemKey => {
                  const itemPlaceholder = `{{${itemKey}}}`
                  itemHTML = itemHTML.replace(new RegExp(itemPlaceholder, 'g'), item[itemKey] || '')
                })
              }
              arrayHTML += itemHTML
            })
            
            result = result.substring(0, startIndex) + arrayHTML + result.substring(endIndex)
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        result = replaceVariables(result, value, prefix ? `${prefix}.${key}` : key)
      } else {
        result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || '')
      }
    })
    
    return result
  }

  processedHTML = replaceVariables(processedHTML, mappedData)
  
  return processedHTML
}

function generateFullHTML(processedHTML: string): string {
  const baseStyles = `
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      line-height: 1.6; 
      background: #f5f5f5;
      padding: 20px;
    }
    .cv-container {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 20mm;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    @media print {
      body { 
        background: white; 
        padding: 0; 
      }
      .cv-container {
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        max-width: none !important;
      }
    }
    @media (max-width: 768px) {
      body {
        padding: 10px;
      }
      .cv-container {
        padding: 15mm;
      }
    }
  `

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CV Preview</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="cv-container">
          ${processedHTML}
        </div>
      </body>
    </html>
  `
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Extract token from URL path
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const token = pathParts[pathParts.length - 1]

    if (!token) {
      return new Response(
        'Token is required',
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      )
    }

    // Verify and increment token usage
    const { data: isValid, error: usageError } = await supabase.rpc('increment_token_usage', {
      token_value: token
    })

    if (usageError || !isValid) {
      const errorHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>CV Preview - Access Denied</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1 class="error">Access Denied</h1>
            <p>This CV preview link has expired or is invalid.</p>
          </body>
        </html>
      `
      return new Response(errorHTML, {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      })
    }

    // Get token details
    const { data: tokenData, error: tokenError } = await supabase
      .from('cv_preview_tokens')
      .select('profile_id, template_id')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        'Invalid token',
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      )
    }

    // Fetch employee data using masked function for privacy
    const { data: employeeData, error: employeeError } = await supabase.rpc('get_employee_data_masked', {
      profile_uuid: tokenData.profile_id
    })

    if (employeeError) {
      console.error('Error fetching employee data:', employeeError)
      return new Response(
        'Error fetching employee data',
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      )
    }

    // Fetch template data
    const { data: templateData, error: templateError } = await supabase
      .from('cv_templates')
      .select('*')
      .eq('id', tokenData.template_id)
      .single()

    if (templateError) {
      console.error('Error fetching template:', templateError)
      return new Response(
        'Error fetching template',
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      )
    }

    // Process template with employee data
    const mappedData = mapEmployeeData(employeeData)
    const processedHTML = processTemplate(templateData.html_template, mappedData)
    const fullHTML = generateFullHTML(processedHTML)

    return new Response(fullHTML, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('Public CV preview error:', error)
    const errorHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CV Preview - Error</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1 class="error">Error</h1>
          <p>An error occurred while loading the CV preview.</p>
        </body>
      </html>
    `
    return new Response(errorHTML, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    })
  }
})
