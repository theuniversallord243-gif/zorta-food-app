import fs from 'fs';
import path from 'path';

const otpFilePath = path.join(process.cwd(), 'data', 'otp-store.json');

function getOTPStore() {
    try {
        const fileData = fs.readFileSync(otpFilePath, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        return {};
    }
}

function saveOTPStore(store) {
    fs.writeFileSync(otpFilePath, JSON.stringify(store, null, 2));
}

export function storeOTP(email, otp) {
    const store = getOTPStore();
    store[email] = {
        otp,
        expiresAt: Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000)
    };
    saveOTPStore(store);
}

export function verifyOTP(email, otp) {
    const store = getOTPStore();
    const record = store[email];

    if (!record) {
        return { valid: false, error: 'OTP not found' };
    }

    if (Date.now() > record.expiresAt) {
        delete store[email];
        saveOTPStore(store);
        return { valid: false, error: 'OTP expired' };
    }

    if (record.otp !== otp) {
        return { valid: false, error: 'Invalid OTP' };
    }

    delete store[email];
    saveOTPStore(store);
    return { valid: true };
}

export function clearOTP(email) {
    const store = getOTPStore();
    delete store[email];
    saveOTPStore(store);
}
