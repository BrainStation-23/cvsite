
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.7";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  profileId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const frontendBaseUrl = Deno.env.get('FRONTEND_BASE_URL')!;
    const senderEmail = Deno.env.get('SENDER_EMAIL')!;

    console.log('Environment variables loaded');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { profileId }: SendEmailRequest = await req.json();

    console.log('Fetching user data for profile ID:', profileId);

    // Fetch profile data including email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, employee_id, email')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Profile not found' 
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!profile.email) {
      console.error('No email found for profile:', profileId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No email found for this profile' 
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Sending profile completion email to:', profile.email);

    // Create the email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Complete Your Profile</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .login-button { 
              display: inline-block; 
              background-color: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .instructions { background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Employee Portal</h1>
            </div>
            <div class="content">
              <h2>Hello ${profile.first_name || 'Employee'} ${profile.last_name || ''},</h2>
              <p>We hope this email finds you well. We're writing to remind you to complete your employee profile in our system.</p>
              
              <div class="instructions">
                <h3>📋 Please Complete Your Profile</h3>
                <p>To ensure we have all your current information, please log in to your account and complete your profile with:</p>
                <ul>
                  <li>Personal information and biography</li>
                  <li>Work experience details</li>
                  <li>Educational background</li>
                  <li>Technical and specialized skills</li>
                  <li>Training and certifications</li>
                  <li>Projects and achievements</li>
                </ul>
              </div>

              <div class="instructions">
                <h3>🔐 Login Instructions</h3>
                <p><strong>Simple Login Process:</strong></p>
                <ol>
                  <li>Click the login button below</li>
                  <li>Use <strong>Microsoft Authentication</strong> to sign in</li>
                  <li>Use your company email address: <strong>${profile.email}</strong></li>
                  <li>Once logged in, go to "My Profile" to complete your information</li>
                </ol>
              </div>

              <div style="text-align: center;">
                <a href="${frontendBaseUrl}/login" class="login-button">
                  🚀 Login to Complete Profile
                </a>
              </div>

              <p><strong>Employee ID:</strong> ${profile.employee_id || 'N/A'}</p>
              
              <p>Having a complete profile helps us:</p>
              <ul>
                <li>Match you with relevant projects and opportunities</li>
                <li>Generate accurate CVs when needed</li>
                <li>Maintain up-to-date organizational records</li>
                <li>Support your career development</li>
              </ul>

              <p>If you have any questions or need assistance, please don't hesitate to reach out to the HR team.</p>
              
              <p>Thank you for your time and cooperation!</p>
              
              <p>Best regards,<br>
              The HR Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: senderEmail,
      to: [profile.email],
      subject: `Action Required: Complete Your Employee Profile - ${profile.first_name || 'Employee'} ${profile.last_name || ''}`,
      html: emailHtml,
    });

    console.log('Resend response:', emailResponse);

    // Check if Resend returned an error
    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: emailResponse.error.message || 'Failed to send email',
          resendError: emailResponse.error
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check if we have successful data
    if (!emailResponse.data || !emailResponse.data.id) {
      console.error('No email ID returned from Resend');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email sending failed - no confirmation ID received' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Email sent successfully with ID:', emailResponse.data.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Profile completion email sent successfully',
      emailId: emailResponse.data.id,
      sentTo: profile.email
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-profile-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
