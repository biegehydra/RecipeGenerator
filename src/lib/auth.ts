import { betterAuth } from "better-auth";
import { MongoClient, Db } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import nodemailer from "nodemailer";

// Async MongoDB connection helper with caching
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(uri: string) {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  cachedClient = client;
  cachedDb = db;
  console.log("MongoDB connected");
  return { client, db };
}

// Setup transporter with Mailtrap credentials
const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  secure: false, // TLS, not SSL
  auth: {
    user: "api", // Mailtrap API user (usually "api")
    pass: "8008660fd7cd99b181bf6fba848264a4", //  Mailtrap sending token
  },
  tls: { rejectUnauthorized: false },
});

// Test SMTP connection once at startup
transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "no-reply@mailtrap.io";

const verificationEmailRedirectURL =
  typeof process.env.NEXT_PUBLIC_BETTER_AUTH_URL === "string"
    ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/verify-email`
    : "http://localhost:3000/verify-email";

const sendEmail = async (options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  try {
    console.log(`Attempting to send email to ${options.to}`);

    const mailOptions = {
      from: `"Ingredient Imposter" <${SMTP_FROM_EMAIL}>`,
      ...options,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully to ${options.to}, message ID: ${info.messageId}`
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

export const auth = (async () => {
  const { db } = await connectToDatabase(process.env.MONGODB_URI!);

  return betterAuth({
    trustedOrigins: ["http://localhost:3000", "http://192.168.1.191:3000"],
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url, token }) => {
        const resetUrl =
          typeof url === "string" ? url : `${verificationEmailRedirectURL}?token=${token}`;
        console.log(`Sending password reset email to ${user.email}, URL: ${resetUrl}`);

        await sendEmail({
          to: user.email,
          subject: "Reset Your Password - Ingredient Imposter",
          text: `Click the link to reset your password: ${resetUrl}`,
          html: `
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }) => {
        const verificationUrl =
          typeof url === "string" ? url : `${verificationEmailRedirectURL}?token=${token}`;
        console.log(`Sending verification email to ${user.email}, URL: ${verificationUrl}`);

        const result = await sendEmail({
          to: user.email,
          subject: "Verify Your Email - Ingredient Imposter",
          text: `Click the link to verify your email: ${verificationUrl}`,
          html: `
            <h2>Email Verification</h2>
            <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Verify Email</a>
          `,
        });

        if (!result.success) {
          console.error("Failed to send verification email:", result.error);
        }
      },
      verificationEmailRedirectURL,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
  });
})();
