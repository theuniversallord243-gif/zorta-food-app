import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'data', 'menu.json');

// Helper to read data
function getMenuItems() {
    try {
        const fileData = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        return [];
    }
}

// Helper to write data
function saveMenuItems(items) {
    fs.writeFileSync(dataFilePath, JSON.stringify(items, null, 2));
}

export async function GET(request) {
    const items = getMenuItems();
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');

    if (outletId) {
        const outletItems = items.filter(item => item.outletId === outletId);
        return NextResponse.json(outletItems);
    }

    return NextResponse.json(items);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const items = getMenuItems();

        // Add new menu item
        const newItem = {
            ...body,
            id: 'item_' + Date.now(),
            active: true,
            createdAt: new Date().toISOString()
        };

        items.push(newItem);
        saveMenuItems(items);

        return NextResponse.json(newItem);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        let items = getMenuItems();
        items = items.filter(item => item.id !== id);
        saveMenuItems(items);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...updatedData } = body;

        let items = getMenuItems();
        const itemIndex = items.findIndex(item => item.id === id);

        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        // Update item while preserving created date
        items[itemIndex] = {
            ...items[itemIndex],
            ...updatedData,
            updatedAt: new Date().toISOString()
        };

        saveMenuItems(items);
        return NextResponse.json(items[itemIndex]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}
