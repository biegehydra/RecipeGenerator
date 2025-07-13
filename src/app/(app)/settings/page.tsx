import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server-utils';
import SettingsForm from '../../components/SettingsForm';

export default async function SettingsPage() {
    const session = await getServerSession();

    if (!session?.user) {
        redirect('/login');
    }

    const userSettings = {
        diet: '',
        allergies: [],
        spice_tolerance: 3,
        sweetness_preference: 3,
        saltiness_preference: 3,
        acidity_sourness_preference: 3,
        health_consciousness: 3,
        budget_tolerance: 3,
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-black">Settings</h1>
            <SettingsForm initialSettings={userSettings} />
        </div>
    );
} 