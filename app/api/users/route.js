import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { hashPassword } from '@/lib/crypto';
import { validateInput, userSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (email) {
            const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
            return NextResponse.json(user ? [user] : []);
        }

        const users = await User.find().select('-password');
        return NextResponse.json(users);
    } catch (error) {
        console.error('User fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const validation = validateInput(body, userSchema);

        if (!validation.valid) {
            return NextResponse.json({ errors: validation.errors }, { status: 400 });
        }

        const emailExists = await User.findOne({ email: body.email.toLowerCase() });
        if (emailExists) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(body.password);
        const newUser = new User({
            name: body.name,
            email: body.email.toLowerCase(),
            phone: body.phone,
            password: hashedPassword
        });

        await newUser.save();
        const userObj = newUser.toObject();
        delete userObj.password;

        return NextResponse.json(userObj, { status: 201 });
    } catch (error) {
        console.error('User creation error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const result = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { password: hashedPassword, updatedAt: new Date() },
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Password update error:', error);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
