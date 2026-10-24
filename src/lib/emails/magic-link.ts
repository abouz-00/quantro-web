import { Resend } from 'resend'
import { serverEnv } from '@/lib/env'

let resendInstance: Resend | null = null

function getResend(): Resend | null {
  if (resendInstance) return resendInstance
  const apiKey = serverEnv.RESEND_API_KEY
  if (!apiKey || apiKey === 'your_resend_api_key_here') return null
  resendInstance = new Resend(apiKey)
  return resendInstance
}

interface SendMagicLinkParams {
  to: string
  url: string
}

export async function sendMagicLinkEmail({ to, url }: SendMagicLinkParams) {
  const resend = getResend()

  if (!resend) {
    console.log(`📧 Magic link email (no Resend key): ${to} → ${url}`)
    return
  }

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to Quantro</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0;">
      <tr>
        <td align="center" style="padding: 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <tr>
              <td align="center" style="padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background-color: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px 25px; display: inline-block;">
                  <h1 style="color: #FFCC33; margin: 0; font-size: 36px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); letter-spacing: 2px;">QUANTRO</h1>
                </div>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 22px; text-align: center;">Sign in to Quantro</h2>
                <p style="font-size: 16px; color: #555555; margin: 0 0 30px 0; text-align: center;">
                  Click the button below to securely sign in. This link expires in 10 minutes.
                </p>

                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="padding: 10px 0 30px 0;">
                      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">Sign In</a>
                    </td>
                  </tr>
                </table>

                <p style="color: #999999; font-size: 13px; text-align: center; margin: 0;">
                  If you didn't request this email, you can safely ignore it.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #999999; font-size: 12px;">&copy; ${new Date().getFullYear()}. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `

  await resend.emails.send({
    from: 'Quantro <hello@quantro.fit>',
    to: [to],
    subject: 'Sign in to Quantro',
    html: htmlContent,
    text: `Sign in to Quantro\n\nClick this link to sign in (expires in 10 minutes):\n${url}\n\nIf you didn't request this, you can safely ignore it.`,
  })
}
