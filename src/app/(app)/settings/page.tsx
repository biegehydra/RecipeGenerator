import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server-utils';
import SettingsForm from '../../components/SettingsForm';
import { getUserSettings } from './actions';

export default async function SettingsPage() {
    const session = await getServerSession();

    if (!session?.user) {
        redirect('/login');
    }

    // Use user ID or email as identifier
    const userId = session.user.id || session.user.email;
    const userSettings = await getUserSettings(userId);

    // Default settings for new users
    const defaultSettings = {
        diet: '',
        allergies: [],
        spice_tolerance: 3,
        sweetness_preference: 3,
        saltiness_preference: 3,
        acidity_sourness_preference: 3,
        health_consciousness: 3,
        budget_tolerance: 3,
    };

    // Use settings from DB or defaults, then clean them
    const settingsToUse = userSettings || defaultSettings;
    const { _id, userId: _userId, ...rest } = settingsToUse as any;
    const cleanSettings: {
        diet: string;
        allergies: string[];
        spice_tolerance: number;
        sweetness_preference: number;
        saltiness_preference: number;
        acidity_sourness_preference: number;
        health_consciousness: number;
        budget_tolerance: number;
    } = rest;

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
            <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg p-8 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 tracking-tight drop-shadow-sm">Settings</h1>
                <SettingsForm initialSettings={cleanSettings} userId={userId} />
            </div>
        </div>
    );
} 