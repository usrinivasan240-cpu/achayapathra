import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const ADMIN_EMAIL = 'usrinivasan240@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, phone, timestamp } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const roleLabels: Record<string, string> = {
      donor: 'Individual Donor / Restaurant',
      ngo: 'NGO / Social Organization',
      volunteer: 'Volunteer / Delivery Partner',
      receiver: 'Individual in Need',
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF6B35, #FF8C42); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New User Registration</h1>
          <p style="color: white; margin: 5px 0 0; opacity: 0.9;">Achayapathra Platform</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee;">
          <p style="font-size: 16px; color: #333;">A new user has registered on the platform:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Email</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Role</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${roleLabels[role] || role}</td>
            </tr>
            ${phone ? `<tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Phone</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${phone}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Registered At</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            This is an automated notification from Achayapathra Platform.
          </p>
        </div>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Achayapathra" <${process.env.SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `[Achayapathra] New User Registration: ${name} (${roleLabels[role] || role})`,
        html: htmlContent,
      });
      return NextResponse.json({ success: true, method: 'email' });
    }

    console.log('Email notification (no SMTP configured):', {
      to: ADMIN_EMAIL,
      subject: `[Achayapathra] New User Registration: ${name}`,
      user: { name, email, role, phone },
    });
    return NextResponse.json({ success: true, method: 'console' });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
