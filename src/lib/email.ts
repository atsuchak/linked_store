import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

export const sendOTP = async (to: string, otp: string, type: 'register' | 'reset' = 'register') => {
  try {
    const isRegister = type === 'register';
    const subject = isRegister ? 'Welcome to Link Base - Verification Code' : 'Link Base - Password Reset Code';
    const heading = isRegister ? 'Welcome to Link Base!' : 'Password Reset Request';
    const message = isRegister 
      ? 'Your verification code to create your account is:' 
      : 'Your verification code to reset your password is:';
      
    const { data, error } = await resend.emails.send({
      from: `Link Base <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">${heading}</h2>
          <p style="color: #4b5563; font-size: 16px;">${message}</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="font-size: 40px; letter-spacing: 8px; color: #4F46E5; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #4b5563; font-size: 14px;">This code will expire in 5 minutes.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            If you did not request this, please ignore this email and your account will remain secure.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email: ', error);
      throw new Error('Failed to send verification email.');
    }
    
    return data;
  } catch (error) {
    console.error('Exception sending email: ', error);
    throw new Error('Failed to send verification email.');
  }
};
