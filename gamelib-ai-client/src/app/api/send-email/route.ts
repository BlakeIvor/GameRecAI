import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, category } = await request.json();

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // ben.seidenberg@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // App-specific password
      },
    });

    // Format email subject and body
    const emailSubject = `${name}, ${category}, ${subject}`;
    const emailBody = `${message}\n\n---\nFrom: ${email}`;

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Sending to yourself
      subject: emailSubject,
      text: emailBody,
      replyTo: email, // Allow replying directly to the sender
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
