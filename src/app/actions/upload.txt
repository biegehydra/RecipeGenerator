'use server';

import { revalidatePath } from 'next/cache';
import { Root } from '@/lib/instagram-models';
import { processInstagramData, type InstagramStats } from '@/lib/processors';

/**
 * Process the uploaded JSON file
 */
export async function processJsonFile(formData: FormData): Promise<{
    success: boolean;
    message?: string;
    data?: Root;
    stats?: InstagramStats;
}> {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, message: 'No file uploaded' };
        }

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json') && !file.type.includes('json')) {
            return { success: false, message: 'Only JSON files are allowed' };
        }

        // Read file content
        const content = await file.text();

        // Parse JSON
        let data: Root;
        try {
            data = JSON.parse(content);
        } catch {
            return { success: false, message: 'Invalid JSON format' };
        }

        // Validate the structure if needed
        if (!data.messages || !Array.isArray(data.messages) || !data.participants) {
            return { success: false, message: 'Invalid Instagram data format' };
        }

        // Process the data
        const stats = processInstagramData(data);

        // Revalidate the path to refresh the data on the client
        revalidatePath('/');

        return {
            success: true,
            data,
            stats
        };
    } catch (error) {
        console.error('Error processing file:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process file'
        };
    }
} 