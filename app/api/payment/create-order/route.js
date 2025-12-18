import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { amount, currency = 'INR', receipt } = await request.json();

        // Initialize Razorpay with PRODUCTION credentials
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_SECRET'
        });

        // Create Razorpay Order
        const options = {
            amount: amount * 100, // Amount in paise (₹1 = 100 paise)
            currency: currency,
            receipt: receipt || `order_${Date.now()}`,
            payment_capture: 1 // Auto capture payment
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error) {
        console.error('Razorpay Order Creation Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
