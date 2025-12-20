import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, Outlet } from '@/lib/models';
import { hashPassword } from '@/lib/crypto';
import Joi from 'joi';
import { validateInput } from '@/lib/validation';

const resetSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    type: Joi.string().valid('user', 'admin').default('user')
});

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const validation = validateInput(body, resetSchema);

        if (!validation.valid) {
            return NextResponse.json({ errors: validation.errors }, { status: 400 });
        }

        const hashedPassword = await hashPassword(body.password);
        const type = body.type || 'user';

        let result;
        if (type === 'admin') {
            result = await Outlet.findOneAndUpdate(
                { email: body.email },
                { password: hashedPassword },
                { new: true }
            );
        } else {
            result = await User.findOneAndUpdate(
                { email: body.email },
                { password: hashedPassword },
                { new: true }
            );
        }

        if (!result) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
