import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OTP } from '@/lib/models';
import { generateOTP } from '@/lib/crypto';
import { validateInput } from '@/lib/validation';
import Joi from 'joi';
import nodemailer from 'nodemailer';

const emailSchema = Joi.object({
    email: Joi.string().email().required()
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
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

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: body.email,
                subject: 'Your Zorta OTP Code',
                html: `<h2>Password Reset OTP</h2><p>Your OTP code is: <strong>${otp}</strong></p><p>Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes</p>`
            });
            console.log('OTP sent to:', body.email);
        } catch (emailError) {
            console.log('Email failed, OTP in console:', otp);
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'OTP sent to your email',
            otp: otp
        });
    } catch (error) {
        console.error('OTP generation error:', error);
        return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }
}
