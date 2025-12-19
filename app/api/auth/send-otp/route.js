import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/mongodb';
import { OTP } from '@/lib/models';
import { generateOTP } from '@/lib/crypto';
import { validateInput } from '@/lib/validation';
import Joi from 'joi';

const emailSchema = Joi.object({
    email: Joi.string().email().required()
});

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const validation = validateInput(body, emailSchema);

        if (!validation.valid) {
            return NextResponse.json({ errors: validation.errors }, { status: 400 });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000));

        await OTP.findOneAndUpdate(
            { email: body.email },
            { otp, expiresAt },
            { upsert: true }
        );

        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('[DEV MODE] OTP:', otp);
            return NextResponse.json({ 
                success: true, 
                message: 'OTP generated (email not configured)', 
                otp: otp
            });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            connectionTimeout: 10000
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: body.email,
            subject: 'Your Zorta Password Reset OTP',
            html: `
                <h2>Password Reset Request</h2>
                <p>Your OTP is: <strong>${otp}</strong></p>
                <p>This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        return NextResponse.json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        console.error('OTP send error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
