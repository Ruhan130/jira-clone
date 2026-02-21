import nodemailer from 'nodemailer';

// ✅ Create transporter (same as verification emails)
const transporter = nodemailer.createTransport({
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

export const sendInviteEmail = async (email: string, token: string, workspaceName: string) => {
    try {
        console.log("📤 Preparing invite email for:", email);

        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
        console.log("🔗 Invite link:", inviteLink);

        const mailOptions = {
            from: `"Myra" <${process.env.GMAIL_USER!}>`,
            to: email,
            subject: `You're invited to join ${workspaceName} on Myra`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #1f2937;">MYRA</h1>
                    <h2>You're invited to join ${workspaceName}!</h2>
                    <p>You've been invited to collaborate on <strong>${workspaceName}</strong> workspace.</p>
                    
                    <div style="margin: 30px 0;">
                        <a href="${inviteLink}" 
                           style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Accept Invitation
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">
                        This invitation will expire in 7 days.<br>
                        If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px;">
                        This email was sent to ${email}
                    </p>
                </div>
            `,
            text: `
                You're invited to join ${workspaceName} on Myra!
                
                Click the link below to accept your invitation:
                ${inviteLink}
                
                This invitation will expire in 7 days.
                
                If you didn't expect this invitation, you can safely ignore this email.
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Invite email sent via Nodemailer:", info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Nodemailer invite email failed:", error);
        throw error;
    }
};

