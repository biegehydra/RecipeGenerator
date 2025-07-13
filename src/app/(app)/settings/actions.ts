'use server';

import clientPromise from '@/lib/mongodb';

export async function saveSettingsAction(formData: any) {
    console.log('Received settings:', formData);

    try {
        const client = await clientPromise;
        const db = client.db(); // defaults to DB in your URI
        const collection = db.collection('userSettings');

        // Optional: Add timestamp or userId if needed
        const result = await collection.insertOne({
            ...formData,
            createdAt: new Date(),
        });

        console.log('Saved to DB:', result.insertedId);
        return { success: true };
    } catch (err) {
        console.error('DB Save Error:', err);
        return { success: false, error: 'Failed to save settings' };
    }
}
