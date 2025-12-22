import { NextResponse } from 'next/server';
import { generateOTP } from '@/lib/crypto';
import { validateInput } from '@/lib/validation';
import { storeOTP } from '@/lib/otp-store';
import Joi from 'joi';
import nodemailer from 'nodemailer';

// Use MongoDB in production, file storage in development
let useDatabase = false;
try {
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb')) {
        const { connectDB } = require('@/lib/mongodb');
        const { OTP } = require('@/lib/models');
        useDatabase = true;
    }
} catch (e) {
    useDatabase = false;
}

const emailSchema = Joi.object({
    email: Joi.string().email().required()
});

const getTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('Email credentials not configured');
    }
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

export async function POST(request) {
    try {
        const body = await request.json();
        const validation = validateInput(body, emailSchema);

        if (!validation.valid) {
            return NextResponse.json({ errors: validation.errors }, { status: 400 });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000));

        storeOTP(body.email, otp, expiresAt);

        try {
            const transporter = getTransporter();
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: body.email,
                subject: 'Your Zorta OTP Code',
                html: `<h2>Password Reset OTP</h2><p>Your OTP code is: <strong>${otp}</strong></p><p>Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes</p>`
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return NextResponse.json({ error: 'Failed to send OTP email. Please check server logs or contact support.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'OTP sent to your email'
        });
    } catch (error) {
        console.error('OTP generation error:', error);
        return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }
}
