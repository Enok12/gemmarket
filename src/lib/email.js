import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email, name, otp, token) {
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://ggmp.app'
  const verifyUrl = `${appUrl}/verify?token=${token}`
  await resend.emails.send({
    from:    'GGMP <otp@ggmp.app>',
    to:      email,
    subject: 'Verify your GGMP email',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <img
          src="https://res.cloudinary.com/dapowzg6d/image/upload/v1778816597/Copilot_20260515_104255_a6in1o.png"
          alt="GGMP Logo"
          style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 20px;"
        />
        <h2 style="color: #6235eb; margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #374151; margin-bottom: 20px;">Hi ${name}, welcome to GGMP — Global Gem Marketplace!</p>
        <p style="color: #374151; margin-bottom: 16px;">Tap the button below to verify your email and activate your account:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}"
             style="display: inline-block; background: #6235eb; color: #ffffff; text-decoration: none;
                    font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 12px;">
            Verify my email
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Or enter this code manually:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px;
                    color: #6235eb; padding: 18px; background: #f0eeff;
                    border-radius: 12px; text-align: center; margin: 8px 0 20px;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This link and code expire in <strong>1 hour</strong>.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 8px; word-break: break-all;">
          If the button doesn't work, paste this link into your browser:<br />${verifyUrl}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 12px;">If you didn't sign up for GGMP, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">GGMP — Global Gem Marketplace</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email, name, otp) {
  await resend.emails.send({
    from:    'GGMP <resetpassword@ggmp.app>',
    to:      email,
    subject: 'Reset your GGMP password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <img 
          src="https://res.cloudinary.com/dapowzg6d/image/upload/v1778816597/Copilot_20260515_104255_a6in1o.png"
          alt="GGMP Logo"
          style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 20px;"
        />
        <h2 style="color: #6235eb; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #374151; margin-bottom: 20px;">Hi ${name}, we received a request to reset your GGMP password.</p>
        <p style="color: #374151; margin-bottom: 12px;">Your password reset code is:</p>
        <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px;
                    color: #6235eb; padding: 24px; background: #f0eeff;
                    border-radius: 12px; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
          If you did not request a password reset, you can safely ignore this email. 
          Your password will not be changed.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">GGMP — Global Gem Marketplace</p>
      </div>
    `,
  })
}