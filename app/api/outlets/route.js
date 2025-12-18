import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'; // Prevent Next.js caching

const dataFilePath = path.join(process.cwd(), 'data', 'outlets.json');

// Helper to read data
function getOutlets() {
    try {
        const fileData = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        return [];
    }
}

// Helper to write data
function saveOutlets(outlets) {
    fs.writeFileSync(dataFilePath, JSON.stringify(outlets, null, 2));
}

export async function GET(request) {
    const outlets = getOutlets();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    // Security Check: Only Master Admin can see Bank Details
    const adminEmailHeader = request.headers.get('x-admin-email');
    const isMasterAdmin = adminEmailHeader === 'zortahelpline@gmail.com';

    // Helper to strip sensitive data
    const stripSensitiveData = (outlet) => {
        if (isMasterAdmin) return outlet; // Return full data for Master Admin

        // Create a copy and remove sensitive fields
        const safeOutlet = { ...outlet };
        delete safeOutlet.accountHolderName;
        delete safeOutlet.bankAccountNumber;
        delete safeOutlet.ifscCode;
        delete safeOutlet.bankName;
        delete safeOutlet.upiId;
        return safeOutlet;
    };

    if (id) {
        const outlet = outlets.find(o => o.id === id);
        return NextResponse.json(outlet ? [stripSensitiveData(outlet)] : []);
    }

    if (email) {
        const query = email.trim().toLowerCase();
        const outlet = outlets.find(o => (o.email ? o.email.trim().toLowerCase() : '') === query);
        // If searching by own email (e.g. login/settings), usually they should see their own data, 
        // but for now let's keep it strict or allow self-view. 
        // For simplicity in this flow, we strip unless it's the Master Admin header.
        // NOTE: In SettingsTab, the user might need to see their own bank details to edit them.
        // However, SettingsTab fetches by `email`. Let's allow if header matches query email too?
        // Actually, SettingsTab likely sends the request. Browser doesn't automatically add custom headers easily without fetch wrapper.
        // But SettingsTab uses `fetch`. We will need to update SettingsTab if we want them to see their own data.
        // For now, let's stick to the Master Admin restriction requested by user "mere alwa aur koi to nhi dek skta".
        // If the user wants to see their OWN data, we might need to adjust.
        // But the user said "mere alwa aur koi to nhi dek skta" implying they want to HIDE it from others.
        // Let's implement the Master Admin check first.
        return NextResponse.json(outlet ? [stripSensitiveData(outlet)] : []);
    }

    // List all outlets
    const safeOutlets = outlets.map(stripSensitiveData);
    return NextResponse.json(safeOutlets);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const outlets = getOutlets();

        // Basic validation
        if (outlets.find(o => o.email === body.email)) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Add new outlet
        const newOutlet = {
            ...body,
            id: 'outlet_' + Date.now(),
            createdAt: new Date().toISOString()
        };

        outlets.push(newOutlet);
        saveOutlets(outlets);

        return NextResponse.json(newOutlet);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create outlet' }, { status: 500 });
    }
}

// PUT for updating outlet (Password Reset OR Full Settings Update)
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, email, password, ...updateFields } = body;

        let outlets = getOutlets();
        const index = outlets.findIndex(o => o.id === id || o.email === email);

        if (index > -1) {
            // If password is provided, update it
            if (password) {
                outlets[index].password = password;
            }

            // If other fields provided, update them too
            if (Object.keys(updateFields).length > 0) {
                outlets[index] = {
                    ...outlets[index],
                    ...updateFields
                };
            }

            saveOutlets(outlets);
            return NextResponse.json({ success: true, outlet: outlets[index] });
        }

        return NextResponse.json({ error: 'Outlet not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
