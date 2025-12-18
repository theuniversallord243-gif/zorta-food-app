import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Rating, Order } from '@/lib/models';
import { validateInput, ratingSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const outletId = searchParams.get('outletId');

        const ratings = outletId 
            ? await Rating.find({ outletId })
            : await Rating.find();

        const averageRating = ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : 0;

        return NextResponse.json({
            ratings,
            averageRating,
            totalRatings: ratings.length
        });
    } catch (error) {
        console.error('Rating fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const validation = validateInput(body, ratingSchema);

        if (!validation.valid) {
            return NextResponse.json({ errors: validation.errors }, { status: 400 });
        }

        const { outletId, userId, orderId, rating, comment } = body;

        const order = await Order.findOne({ _id: orderId, userId, outletId });
        if (!order) {
            return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
        }

        const existingRating = await Rating.findOne({ orderId, userId });
        if (existingRating) {
            return NextResponse.json({ error: 'You have already rated this order' }, { status: 400 });
        }

        const newRating = new Rating({
            outletId,
            userId,
            orderId,
            rating: Number(rating),
            comment: comment || ''
        });

        await newRating.save();
        return NextResponse.json(newRating, { status: 201 });
    } catch (error) {
        console.error('Rating creation error:', error);
        return NextResponse.json({ error: 'Failed to add rating' }, { status: 500 });
    }
}
