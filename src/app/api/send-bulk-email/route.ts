import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifyAuthUser } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

// Helper sleep function for rate-limiting protection on Gmail personal/workspace SMTP
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    // 0. Verify authenticated user session
    const caller = await verifyAuthUser(req);
    if (!caller) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Unauthorized: You must be logged in to dispatch emails.',
        },
        { status: 401 }
      );
    }
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();

    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'GMAIL_NOT_CONFIGURED',
          message:
            'Gmail SMTP credentials (GMAIL_USER and GMAIL_APP_PASSWORD) are not configured in environment variables (.env.local / Vercel). Please configure your agency Gmail and 16-character App Password.',
        },
        { status: 500 }
      );
    }

    const payload = await req.json();
    const { recipients, subject, body, senderName } = payload;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_RECIPIENTS',
          message: 'Please provide at least one valid recipient email address.',
        },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_SUBJECT',
          message: 'Subject line is required.',
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'string' || !body.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_BODY',
          message: 'Email body is required.',
        },
        { status: 400 }
      );
    }

    // Filter and sanitize email list
    const validRecipients = Array.from(
      new Set(
        recipients
          .map((r: any) => (typeof r === 'string' ? r.trim().toLowerCase() : ''))
          .filter((email: string) => email && email.includes('@') && email.includes('.'))
      )
    );

    if (validRecipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_VALID_EMAILS',
          message: 'None of the provided contacts have a valid email address.',
        },
        { status: 400 }
      );
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword.replace(/\s+/g, ''), // Strip spaces from 16-char app password if present
      },
    });

    // Verify SMTP connection before attempting dispatch loop
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      console.error('Gmail SMTP Verification Failed:', verifyError);
      return NextResponse.json(
        {
          success: false,
          error: 'SMTP_AUTH_FAILED',
          message: `Failed to authenticate with Gmail SMTP: ${verifyError.message || 'Check your GMAIL_USER and App Password.'}`,
        },
        { status: 401 }
      );
    }

    const fromName = senderName?.trim() || 'Exhibition Agency Curation';
    const fromAddress = `"${fromName}" <${gmailUser}>`;

    let sentCount = 0;
    let failedCount = 0;
    const failedEmails: string[] = [];
    const errors: { email: string; error: string }[] = [];

    // Convert plain text body to structured HTML while preserving formatting
    const formattedHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #141714; line-height: 1.6; font-size: 14px; max-width: 600px; margin: 0 auto;">
        <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="white-space: pre-wrap; font-size: 14px; color: #141714;">${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <hr style="margin: 24px 0 16px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <div style="font-size: 12px; color: #64748b;">
            <p style="margin: 0; font-weight: 600; color: #2E452E;">Exhibition Agency Platform</p>
            <p style="margin: 2px 0 0 0; color: #94a3b8;">Curated Exhibitions & Stall Management</p>
          </div>
        </div>
      </div>
    `;

    // Loop through each recipient individually for recipient privacy & delivery tracking
    for (let i = 0; i < validRecipients.length; i++) {
      const recipient = validRecipients[i];

      try {
        await transporter.sendMail({
          from: fromAddress,
          to: recipient,
          subject: subject.trim(),
          text: body.trim(),
          html: formattedHtml,
        });

        sentCount++;
      } catch (sendErr: any) {
        console.error(`Failed to send email to ${recipient}:`, sendErr);
        failedCount++;
        failedEmails.push(recipient);
        errors.push({ email: recipient, error: sendErr.message || 'Delivery error' });
      }

      // Delay between emails (1.2 seconds) to respect Gmail rate limits
      if (i < validRecipients.length - 1) {
        await delay(1200);
      }
    }

    const isOverallSuccess = sentCount > 0;

    return NextResponse.json({
      success: isOverallSuccess,
      total: validRecipients.length,
      sentCount,
      failedCount,
      failedEmails,
      errors: errors.length > 0 ? errors : undefined,
      message: `${sentCount}/${validRecipients.length} email(s) sent successfully${
        failedCount > 0 ? ` (${failedCount} failed)` : ''
      }.`,
    });
  } catch (error: any) {
    console.error('Unhandled error in send-bulk-email route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: error.message || 'An unexpected error occurred while sending emails.',
      },
      { status: 500 }
    );
  }
}
