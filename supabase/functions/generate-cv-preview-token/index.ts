
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface TokenRequest {
  profileId: string
  templateId: string
  expiresInDays?: number
  maxUsage?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify user is authenticated and has admin/manager role
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin or manager role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'manager'])

    if (!roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { profileId, templateId, expiresInDays = 7, maxUsage }: TokenRequest = await req.json()

      if (!profileId || !templateId) {
        return new Response(
          JSON.stringify({ error: 'Profile ID and Template ID are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .single()

      if (!profile) {
        return new Response(
          JSON.stringify({ error: 'Profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify template exists
      const { data: template } = await supabase
        .from('cv_templates')
        .select('id')
        .eq('id', templateId)
        .single()

      if (!template) {
        return new Response(
          JSON.stringify({ error: 'Template not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate secure token
      const tokenData = {
        profileId,
        templateId,
        timestamp: Date.now()
      }
      
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(tokenData))
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(Deno.env.get('SUPABASE_JWT_SECRET') || 'fallback-secret'),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signature = await crypto.subtle.sign('HMAC', key, data)
      const token = btoa(JSON.stringify(tokenData)) + '.' + btoa(String.fromCharCode(...new Uint8Array(signature)))

      // Calculate expiration date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)

      // Store token in database
      const { data: tokenRecord, error: insertError } = await supabase
        .from('cv_preview_tokens')
        .insert({
          token,
          profile_id: profileId,
          template_id: templateId,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          max_usage: maxUsage
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating token:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate public URL using FRONTEND_BASE_URL secret
      const frontendBaseUrl = Deno.env.get('FRONTEND_BASE_URL') || 'http://localhost:3000'
      const publicUrl = `${frontendBaseUrl}/public/cv/${token}`

      return new Response(
        JSON.stringify({
          success: true,
          token,
          publicUrl,
          expiresAt: expiresAt.toISOString(),
          tokenRecord
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Token generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
