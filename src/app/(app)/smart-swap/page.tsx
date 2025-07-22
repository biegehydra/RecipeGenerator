import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server-utils';
import { getUserSettings } from '../settings/actions';
import App from '../../components/App';

export default async function SmartSwapPage() {
    const session = await getServerSession();

    if (!session?.user) {
        redirect('/login');
    }

    // Use email as primary identifier to ensure consistency
    const userId = session.user.email || session.user.id;
    console.log('Smart-swap page - using userId:', userId);

    const userSettings = await getUserSettings(userId);
    console.log('Smart-swap page - retrieved settings:', userSettings);

    // Extract allergies from settings, default to empty array if not found
    const allergies = userSettings?.allergies || [];

    // Extract preferences from settings, default to null if not found
    const preferences = userSettings ? {
        spice_tolerance: userSettings.spice_tolerance || 3,
        sweetness_preference: userSettings.sweetness_preference || 3,
        saltiness_preference: userSettings.saltiness_preference || 3,
        acidity_sourness_preference: userSettings.acidity_sourness_preference || 3,
        health_consciousness: userSettings.health_consciousness || 3,
        budget_tolerance: userSettings.budget_tolerance || 3,
    } : null;

    return <App allergies={allergies} preferences={preferences} />;
}
