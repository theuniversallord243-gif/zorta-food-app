import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/lib/models';
import { validateInput, orderSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const userId = searchParams.get('userId');
        const outletId = searchParams.get('outletId');

        if (id) {
            const order = await Order.findById(id);
            return NextResponse.json(order || {});
        }

        if (userId) {
            const orders = await Order.find({ userId });
            return NextResponse.json(orders);
        }

        if (outletId) {
            const orders = await Order.find({ outletId });
            return NextResponse.json(orders);
        }

        const orders = await Order.find();
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Order fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();

        if (!body.items || !body.outletId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newOrder = new Order({
            userId: body.userId || null,
            outletId: body.outletId,
            items: body.items,
            totalAmount: body.total || body.totalAmount,
            deliveryAddress: body.details?.address || body.deliveryAddress || '',
            status: 'Pending',
            paymentStatus: body.paymentStatus || 'Pending',
            statusHistory: [{ status: 'Pending', timestamp: new Date() }]
        });

        await newOrder.save();
        return NextResponse.json({ id: newOrder._id, ...newOrder.toObject() }, { status: 201 });
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, status, paymentStatus } = body;

        if (!id) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
        
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updateData = { updatedAt: new Date() };
        if (status) {
            updateData.status = status;
            updateData.$push = { statusHistory: { status, timestamp: new Date() } };
        }
        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }

        const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order update error:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
