'use server';

import clientPromise from '@/lib/mongodb';

export async function getUserSettings(userId: string) {
    console.log('getUserSettings called with userId:', userId);
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('userSettings');
        console.log('Searching for settings with query:', { userId });
        const settings = await collection.findOne({ userId });
        console.log('getUserSettings result:', settings);
        return settings;
    } catch (err) {
        console.error('DB Load Error:', err);
        return null;
    }
}

export async function debugListAllSettings() {
    console.log('debugListAllSettings called');
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('userSettings');
        const allSettings = await collection.find({}).toArray();
        console.log('All settings in database:', allSettings);
        return allSettings;
    } catch (err) {
        console.error('DB Debug Error:', err);
        return [];
    }
}

export async function migrateUserSettings(oldUserId: string, newUserId: string) {
    console.log('migrateUserSettings called:', { oldUserId, newUserId });
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('userSettings');

        // Find settings under old userId
        const oldSettings = await collection.findOne({ userId: oldUserId });
        if (!oldSettings) {
            console.log('No settings found for oldUserId:', oldUserId);
            return { success: false, error: 'No settings found to migrate' };
        }

        // Update to new userId
        const result = await collection.updateOne(
            { userId: oldUserId },
            { $set: { userId: newUserId, updatedAt: new Date() } }
        );

        console.log('Migration result:', result);
        return { success: true, result };
    } catch (err) {
        console.error('Migration Error:', err);
        return { success: false, error: 'Failed to migrate settings' };
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

        console.log('Saving settings for userId:', userId);

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
