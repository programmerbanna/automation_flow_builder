import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 * Uses Ethereal for testing or SMTP if configured
 */
const initializeTransporter = async (): Promise<Transporter> => {
  if (transporter) {
    return transporter;
  }

  // Check if SMTP credentials are provided
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    // Use configured SMTP
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    console.log("✅ SMTP transporter initialized");
  } else {
    // Use Ethereal for testing
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("✅ Ethereal test transporter initialized");
    console.log(`📧 Test account: ${testAccount.user}`);
  }

  return transporter;
};

/**
 * Send an email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param message - Email body (plain text)
 * @returns Message info including preview URL for Ethereal
 */
export const sendEmail = async (
  to: string,
  subject: string,
  message: string,
): Promise<{ messageId: string; previewUrl?: string }> => {
  try {
    const emailTransporter = await initializeTransporter();

    const mailOptions = {
      from:
        process.env.SMTP_FROM || '"Automation Flow" <noreply@automation.local>',
      to,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    // Generate preview URL for Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log(`📧 Email sent! Preview: ${previewUrl}`);
    } else {
      console.log(`📧 Email sent to ${to}`);
    }

    return {
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

/**
 * Verify transporter connection
 */
export const verifyMailer = async (): Promise<boolean> => {
  try {
    const emailTransporter = await initializeTransporter();
    await emailTransporter.verify();
    console.log("✅ Mailer connection verified");
    return true;
  } catch (error) {
    console.error("❌ Mailer verification failed:", error);
    return false;
  }
};
