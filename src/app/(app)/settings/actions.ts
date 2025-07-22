'use server';

import clientPromise from '@/lib/mongodb';

export async function getUserSettings(userId: string) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('userSettings');
        const settings = await collection.findOne({ userId });
        return settings;
    } catch (err) {
        console.error('DB Load Error:', err);
        return null;
    }
}

export async function saveSettingsAction(formData: any) {
    console.log('Received settings:', formData);

    try {
        const client = await clientPromise;
        const db = client.db(); // defaults to DB in your URI
        const collection = db.collection('userSettings');

        // Use userId from formData
        const userId = formData.userId;
        if (!userId) {
            throw new Error('Missing userId in formData');
        }

        // Upsert (update or insert) settings for this user
        const result = await collection.updateOne(
            { userId },
            { $set: { ...formData, updatedAt: new Date() } },
            { upsert: true }
        );

        console.log('Saved to DB:', result.upsertedId || result.modifiedCount);
        return { success: true };
    } catch (err) {
        console.error('DB Save Error:', err);
        return { success: false, error: 'Failed to save settings' };
    }
}
