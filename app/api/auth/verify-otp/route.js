import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OTP } from '@/lib/models';
import { validateInput } from '@/lib/validation';
import Joi from 'joi';
import crypto from 'crypto';

const verifySchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required()
});

const constantTimeCompare = (a, b) => {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    if (bufferA.length !== bufferB.length) {
        return false;
    }
    return crypto.timingSafeEqual(bufferA, bufferB);
};

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const validation = validateInput(body, verifySchema);

        if (!validation.valid) {
            return NextResponse.json({ errors: validation.errors }, { status: 400 });
        }

        const otpRecord = await OTP.findOne({ email: body.email });

        if (!otpRecord) {
            return NextResponse.json({ error: 'OTP not found' }, { status: 400 });
        }

        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ email: body.email });
            return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
        }

        try {
            if (!constantTimeCompare(otpRecord.otp, body.otp)) {
                return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
            }
        } catch (err) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        await OTP.deleteOne({ email: body.email });
        return NextResponse.json({ success: true, message: 'OTP verified' });
    } catch (error) {
        console.error('OTP verification error:', error);
        return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
    }
}
