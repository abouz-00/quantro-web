import { Resend } from 'resend'
import { prisma } from './prisma'

// Initialize Resend lazily to avoid build-time errors
function getResendInstance() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

interface BetaInviteEmailProps {
  email: string
  code: string
  expiresAt?: Date | null
}

export async function sendBetaInviteEmail({ email, code, expiresAt }: BetaInviteEmailProps) {
  try {
    // Check if user has unsubscribed from marketing emails
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailUnsubscribed: true }
    })

    if (user?.emailUnsubscribed) {
      console.log(`📧 Email sending skipped - User has unsubscribed: ${email}`)
      return {
        success: true,
        data: null,
        skipped: true,
        message: 'Email sending skipped - User has unsubscribed'
      }
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.log('📧 Email sending skipped - RESEND_API_KEY not configured')
      console.log(`Would send beta invite to: ${email}`)
      console.log(`Invite code: ${code}`)
      console.log(`Invite URL: ${process.env.NEXTAUTH_URL}/beta-invite?code=${code}`)
      return { 
        success: true, 
        data: null,
        skipped: true,
        message: 'Email sending skipped - API key not configured'
      }
    }

    const inviteUrl = `${process.env.NEXTAUTH_URL}/beta-invite?code=${code}`
    const expirationText = expiresAt 
      ? `This invite expires on ${expiresAt.toLocaleDateString()}.`
      : 'This invite does not expire.'

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Quantro Beta</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0;">
        <tr>
          <td align="center" style="padding: 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header with Quantro Logo -->
              <tr>
                <td align="center" style="padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                  <!-- Fallback text logo if image doesn't load -->
                  <div style="background-color: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px 25px; margin-bottom: 15px; display: inline-block;">
                    <h1 style="color: #FFCC33; margin: 0; font-size: 36px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); letter-spacing: 2px;">QUANTRO</h1>
                  </div>
                  <h2 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Welcome to Beta!</h2>
                </td>
              </tr>
              
              <!-- Content Section -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="font-size: 18px; color: #333333; margin: 0 0 20px 0;">You've been invited to test Quantro, our smart nutrition tracking app!</p>
                  
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
                    <tr>
                      <td style="padding: 25px;">
                        <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">What is Quantro?</h2>
                        <p style="margin: 0; color: #555555; line-height: 1.8;">Quantro makes it easy to log your meals, track your nutrition goals, and build healthier eating habits. As a beta tester, you'll get early access to all our features and help shape the future of the app.</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 35px 0;">
                        <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">Accept Your Beta Invite</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Invite Details -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; margin: 25px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">Your Invite Details:</h3>
                        <p style="margin: 5px 0; color: #856404;"><strong>Invite Code:</strong> <code style="background-color: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${code}</code></p>
                        <p style="margin: 5px 0; color: #856404;"><strong>Expires:</strong> ${expirationText}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #666666; font-size: 14px; margin: 25px 0 0 0; text-align: center;">
                    Questions? Email us at <a href="mailto:hello@quantro.fit" style="color: #667eea; text-decoration: none;">hello@quantro.fit</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0; color: #666666; font-size: 14px;">Thanks for being part of our beta community!</p>
                  <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px; font-weight: 600;">The Quantro Team</p>
                  <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">© 2025 Quantro. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `

    const resend = getResendInstance()
    const data = await resend.emails.send({
      from: 'Quantro Team <hello@quantro.fit>',
      to: [email],
      subject: 'You\'re invited to Quantro Beta! 🎉',
      html: htmlContent,
      text: `
        You're invited to Quantro Beta!

        You've been invited to test Quantro, our smart nutrition tracking app. 

        What is Quantro?
        Quantro makes it easy to log your meals, track your nutrition goals, and build healthier eating habits. As a beta tester, you'll get early access to all our features and help shape the future of the app.

        Accept your invite: ${inviteUrl}
        
        Your invite code: ${code}
        ${expirationText}

        Questions? Email us at hello@quantro.fit

        Thanks!
        The Quantro Team
      `
    })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send beta invite email:', error)
    return { success: false, error }
  }
}
