import nodemailer from 'nodemailer';``
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',           
  port: 587,                        
  secure: false,                    
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
  tls: {
    rejectUnauthorized: false     
  },
  pool: true,                      
  maxConnections: 1,                
  rateDelta: 20000,                 
  rateLimit: 5                    
});

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log(' Email service connected');
    return true;
  } catch (error) {
    console.error(' Email service failed:', error);
    return false;
  }
};

export const sendVerificationCode = async (email: string, code: string) => {
  const mailOptions = {
    from: `"Myra" <${process.env.GMAIL_USER!}>`,
    to: email,
    subject: 'Your Myra Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; font-size: 28px; margin: 0;">MYRA</h1>
        </div>
        
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">Your Verification Code</h2>
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.5; margin: 0 0 25px 0;">
            Welcome to Myra! Please use the verification code below to complete your registration.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px 30px; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; color: #1e293b; letter-spacing: 6px; font-family: 'Courier New', monospace;">
                ${code}
              </span>
            </div>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 25px 0 0 0;">
            <strong>Important:</strong><br>
            • This code will expire in 15 minutes<br>
            • Enter this code in the app to verify your email<br>
            • If you didn't create an account, please ignore this email<br>
            • For security, don't share this code with anyone
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            This email was sent to ${email}
          </p>
        </div>
      </div>
    `,
    text: `
      Your Myra Verification Code
      
      Welcome to Myra! Please use the verification code below to complete your registration.
      
      Your verification code: ${code}
      
      This code will expire in 15 minutes.
      Enter this code in the app to verify your email.
      If you didn't create an account, please ignore this email.
      
      This email was sent to ${email}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(' Verification code email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(' Code email send failed:', error);
    return { success: false, error: error };
  }
};



// import sgMail from '@sendgrid/mail';

// // ✅ Initialize SendGrid
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// export const sendVerificationCode = async (email: string, code: string) => {
//     const msg = {
//         to: email,
//         from: {
//             email: 'ruhank170@gmail.com',  // ✅ Verified sender
//             name: 'Myra'
//         },
//         subject: 'Your Myra Verification Code',
//         html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                 <h1 style="color: #1f2937;">MYRA</h1>
//                 <h2>Your Verification Code</h2>
//                 <p>Welcome to Myra! Please use the verification code below:</p>
//                 <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
//                     <h2 style="color: #1f2937; font-size: 32px; margin: 0;">${code}</h2>
//                 </div>
//                 <p>This code will expire in 15 minutes.</p>
//                 <p style="color: #6b7280; font-size: 14px;">This email was sent to ${email}</p>
//             </div>
//         `,
//         text: `
//             Your Myra Verification Code: ${code}
            
//             This code will expire in 15 minutes.
//             Enter this code in the app to verify your email.
//         `
//     };

//     try {
//         const response = await sgMail.send(msg);
//         console.log('✅ Email sent via SendGrid:', response[0].statusCode);
//         return { success: true, messageId: response[0].headers['x-message-id'] };
//     } catch (error: any) {
//         console.error('❌ SendGrid send failed:', error);
//         return { success: false, error };
//     }
// };

// export const verifyEmailConnection = async () => {
//     return true; // SendGrid doesn't need connection verification
// };