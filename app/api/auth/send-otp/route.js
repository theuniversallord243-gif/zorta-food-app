import { NextResponse } from 'next/server';
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

        console.log('OTP Generated:', otp, 'for', body.email);
        
        return NextResponse.json({ 
            success: true, 
            message: 'OTP generated successfully', 
            otp: otp
        });
    } catch (error) {
        console.error('OTP generation error:', error);
        return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }
}
