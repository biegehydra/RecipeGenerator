'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

function App() {
    const router = useRouter();
    const [ingredientInput, setIngredientInput] = useState('');
    const [results, setResults] = useState<{ [ingredient: string]: any[] }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Allergies and search history state
    const [allergies, setAllergies] = useState<string[]>([]);
    const [searchHistory, setSearchHistory] = useState<{
        ingredient: string;
        date: string;
        bestSubstitute?: string;
        allergenInfo?: string;
        substitutes: any[];
    }[]>([]);
    const [preferences, setPreferences] = useState<any>(null);
    // Track which history entry is selected for viewing
    const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null);

    // Load allergies, search history, and preferences from localStorage on mount
    useEffect(() => {
        const storedAllergies = localStorage.getItem('userAllergies');
        if (storedAllergies) {
            try {
                setAllergies(JSON.parse(storedAllergies));
            } catch { }
        }
        const storedHistory = localStorage.getItem('searchHistory');
        if (storedHistory) {
            try {
                setSearchHistory(JSON.parse(storedHistory));
            } catch { }
        }
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
            try {
                setPreferences(JSON.parse(storedPreferences));
            } catch { }
        }
    }, []);

    // Helper to summarize preferences for prompt
    const getPreferenceSummary = () => {
        if (!preferences) return '';
        const scale = (val: number, min: string, max: string) => {
            if (val <= 1) return min;
            if (val >= 5) return max;
            if (val <= 2) return `slightly ${min}`;
            if (val >= 4) return `slightly ${max}`;
            return 'moderate';
        };
        return `The user prefers: ${scale(preferences.spice_tolerance, 'mild spice', 'very spicy')}, ${scale(preferences.sweetness_preference, 'not sweet', 'very sweet')}, ${scale(preferences.saltiness_preference, 'low salt', 'salty')}, ${scale(preferences.acidity_sourness_preference, 'mild acidity', 'very sour')}, ${scale(preferences.health_consciousness, 'indulgent', 'lean/healthy')}, ${scale(preferences.budget_tolerance, 'cheap', 'expensive')
            }.`;
    };

    // Save search to history (now includes best substitute, allergen info, and full substitutes array)
    const saveSearchToHistory = (ingredient: string, bestSubstitute: string, allergenInfo: string, substitutes: any[]) => {
        const now = new Date();
        const entry = {
            ingredient,
            date: now.toLocaleString(),
            bestSubstitute,
            allergenInfo,
            substitutes,
        };
        const updatedHistory = [entry, ...searchHistory].slice(0, 20); // keep last 20
        setSearchHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    };

    // Clear search history
    const clearSearchHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
        setSelectedHistoryIdx(null);
    };

    const findSubstitutes = async (ingredients: string[]) => {
        setLoading(true);
        setResults({});
        setError(null);
        setSelectedHistoryIdx(null); // Reset selected history when new search

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        if (!apiKey) {
            setError('Google API key is missing.');
            setLoading(false);
            return;
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const allResults: { [ingredient: string]: any[] } = {};

        for (const ingredient of ingredients) {
            const preferenceSummary = getPreferenceSummary();
            const prompt = `For the ingredient '${ingredient}', suggest 1–3 suitable substitutes. For each suggestion, return:\n- 'substitute'\n- 'score' (0–100 relevance)\n- 'reason'\n- 'cuisine_context' (optional)\n- 'allergen_info' (e.g. dairy, nuts)\n- 'historical_notes' (brief food history). ${preferenceSummary} Return the output as a JSON array.`;

            const payload = {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                substitute: { type: 'STRING' },
                                score: { type: 'NUMBER' },
                                reason: { type: 'STRING' },
                                cuisine_context: { type: 'STRING' },
                                allergen_info: { type: 'STRING' },
                                historical_notes: { type: 'STRING' },
                            },
                            required: ['substitute', 'score', 'reason'],
                        },
                    },
                },
            };

            try {
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                const jsonString = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!jsonString) {
                    console.warn('Empty response:', JSON.stringify(data, null, 2));
                    throw new Error('Gemini response missing or empty.');
                }

                let parsed;
                try {
                    parsed = JSON.parse(jsonString);
                } catch (err) {
                    console.warn('Failed to parse Gemini response:', err);
                    throw new Error('Failed to parse Gemini response as JSON.');
                }

                allResults[ingredient] = parsed;

                // Save to search history (only first ingredient for now)
                if (ingredients.length > 0) {
                    // Find best substitute (highest score)
                    let bestSub = '';
                    let bestAllergen = '';
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const best = parsed.reduce((a, b) => (a.score > b.score ? a : b));
                        bestSub = best.substitute;
                        bestAllergen = best.allergen_info || '';
                    }
                    saveSearchToHistory(ingredient, bestSub, bestAllergen, parsed);
                }
            } catch (err: any) {
                setError(`Error for ingredient "${ingredient}": ${err.message}`);
            }
        }

        setResults(allResults);
        setLoading(false);
    };

    const handleTextSearch = () => {
        const trimmed = ingredientInput.trim();
        if (trimmed) {
            findSubstitutes([trimmed]);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch {
            console.error('Logout failed');
        }
    };

    // Helper to map preference values to labels and emojis
    const preferenceMeta = {
        spice_tolerance: { label: 'Spice', emoji: '🌶️' },
        sweetness_preference: { label: 'Sweetness', emoji: '🍬' },
        saltiness_preference: { label: 'Saltiness', emoji: '🧂' },
        acidity_sourness_preference: { label: 'Acidity', emoji: '🍋' },
        health_consciousness: { label: 'Health', emoji: '🥗' },
        budget_tolerance: { label: 'Budget', emoji: '💰' },
    };

    function getPreferenceLabel(key: string, value: number) {
        if (key === 'spice_tolerance') {
            if (value >= 4) return 'Spicy';
            if (value <= 2) return 'Mild';
            return 'Moderate';
        }
        if (key === 'sweetness_preference') {
            if (value >= 4) return 'Very Sweet';
            if (value <= 2) return 'Not Sweet';
            return 'Moderate';
        }
        if (key === 'saltiness_preference') {
            if (value >= 4) return 'Salty';
            if (value <= 2) return 'Low Salt';
            return 'Moderate';
        }
        if (key === 'acidity_sourness_preference') {
            if (value >= 4) return 'Very Sour';
            if (value <= 2) return 'Mild';
            return 'Moderate';
        }
        if (key === 'health_consciousness') {
            if (value >= 4) return 'Lean';
            if (value <= 2) return 'Indulgent';
            return 'Balanced';
        }
        if (key === 'budget_tolerance') {
            if (value >= 4) return 'Expensive';
            if (value <= 2) return 'Cheap';
            return 'Moderate';
        }
        return value;
    }

    // Helper to check if a substitute matches a user's high preference
    function matchesPreference(sub: any, preferences: any) {
        if (!preferences) return false;
        // Simple keyword matching for demo purposes
        const reason = (sub.reason || '').toLowerCase();
        if (preferences.spice_tolerance >= 4 && reason.includes('spicy')) return true;
        if (preferences.sweetness_preference >= 4 && reason.includes('sweet')) return true;
        if (preferences.saltiness_preference >= 4 && reason.includes('salty')) return true;
        if (preferences.acidity_sourness_preference >= 4 && (reason.includes('sour') || reason.includes('acidic'))) return true;
        if (preferences.health_consciousness >= 4 && (reason.includes('lean') || reason.includes('healthy'))) return true;
        if (preferences.budget_tolerance <= 2 && reason.includes('cheap')) return true;
        if (preferences.budget_tolerance >= 4 && reason.includes('expensive')) return true;
        return false;
    }


    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-6 font-sans bg-gray-100">
            <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg p-8 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center w-full max-w-2xl mb-4">
                    <h1 className="text-4xl font-bold text-gray-900">Smart Swap</h1>
                </div>

                {/* Allergies & Preferences Display */}
                {(allergies.length > 0 || preferences) && (
                    <div className="w-full max-w-2xl mb-4 p-4 bg-gray-50 border-l-4 border-gray-400 rounded">
                        {allergies.length > 0 && (
                            <>
                                <h2 className="font-semibold text-blue-800 mb-1">Your Allergies:</h2>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {allergies.map((allergy, idx) => (
                                        <span key={idx} className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                        {preferences && (
                            <>
                                <h2 className="font-semibold text-blue-800 mb-1 mt-2">Flavor & Lifestyle Preferences:</h2>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(preferenceMeta).map(([key, meta]) => (
                                        <span key={key} className="flex items-center gap-1 bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full text-sm font-medium">
                                            <span>{meta.emoji}</span>
                                            <span>{meta.label}:</span>
                                            <span className="font-bold">{preferences[key]}/5</span>
                                            <span>({getPreferenceLabel(key, preferences[key])})</span>
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Search History Display */}
                {searchHistory.length > 0 && (
                    <div className="w-full max-w-2xl mb-4 p-4 bg-gray-100 border-l-4 border-gray-300 rounded">
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="font-semibold text-gray-800">Search History:</h2>
                            <button
                                onClick={clearSearchHistory}
                                className="text-sm text-gray-600 hover:text-gray-800 underline"
                            >
                                Clear History
                            </button>
                        </div>
                        <ul className="text-sm text-gray-700 space-y-2">
                            {searchHistory.map((entry, idx) => (
                                <li key={idx} className="flex flex-col gap-1 border-b border-gray-200 pb-2 last:border-b-0">
                                    <div className="flex justify-between items-center cursor-pointer group"
                                        onClick={() => setSelectedHistoryIdx(idx)}
                                        title="Show saved substitutes for this ingredient">
                                        <span className={selectedHistoryIdx === idx ? 'font-bold text-indigo-700 underline' : 'group-hover:underline'}>
                                            <strong>Ingredient:</strong> {entry.ingredient}
                                        </span>
                                        <span className="text-gray-500 ml-4">{entry.date}</span>
                                    </div>
                                    {entry.bestSubstitute && (
                                        <div><strong>Best Substitute:</strong> {entry.bestSubstitute}</div>
                                    )}
                                    {entry.allergenInfo && (
                                        <div><strong>Allergen Info:</strong> {entry.allergenInfo}</div>
                                    )}
                                    {selectedHistoryIdx === idx && entry.substitutes && (
                                        <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 rounded p-2">
                                            <h3 className="font-semibold mb-1">Saved Substitutes:</h3>
                                            {entry.substitutes.map((item, subIdx) => (
                                                <div key={subIdx} className="mb-2 pl-2">
                                                    <p><strong>{item.substitute}</strong> — Score: {item.score}/100</p>
                                                    <p className="text-sm text-gray-700">{item.reason}</p>
                                                    {item.cuisine_context && (
                                                        <p className="text-sm text-gray-600">Cuisine: {item.cuisine_context}</p>
                                                    )}
                                                    {item.allergen_info && (
                                                        <p className="text-sm text-red-600">Allergen Info: {item.allergen_info}</p>
                                                    )}
                                                    {item.historical_notes && (
                                                        <p className="text-sm text-gray-600 italic">History: {item.historical_notes}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="w-full max-w-2xl">
                    <label className="block text-sm text-black font-semibold mb-2">Ingredient to Substitute:</label>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={ingredientInput}
                            onChange={(e) => setIngredientInput(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-4 py-2 text-black"
                            placeholder="e.g., Butter"
                            disabled={loading}
                        />
                        <button
                            onClick={handleTextSearch}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading || !ingredientInput.trim()}
                        >
                            Submit
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="mt-6 text-gray-600">
                        <p>Finding substitutes...</p>
                    </div>
                )}

                {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded w-full max-w-xl">
                        {error}
                    </div>
                )}

                {/* Show substitutes for selected history, or for latest search */}
                {!loading && ((selectedHistoryIdx !== null && searchHistory[selectedHistoryIdx]?.substitutes) || Object.keys(results).length > 0) && (
                    <div className="mt-8 w-full max-w-3xl text-black space-y-6">
                        {selectedHistoryIdx !== null && searchHistory[selectedHistoryIdx]?.substitutes ? (
                            <div className="mb-4 p-3 border-l-4 border-gray-400 bg-gray-50 rounded">
                                <h2 className="font-semibold mb-2">Substitutes for <span className="text-indigo-700">{searchHistory[selectedHistoryIdx].ingredient}</span>:</h2>
                                {searchHistory[selectedHistoryIdx].substitutes.map((item, subIdx) => (
                                    <div key={subIdx} className="mb-2 pl-2">
                                        <p><strong>{item.substitute}</strong> — Score: {item.score}/100
                                            {matchesPreference(item, preferences) && (
                                                <span className="ml-2 inline-block bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-semibold align-middle">Matches your preference!</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-700">{item.reason}</p>
                                        {item.cuisine_context && (
                                            <p className="text-sm text-gray-600">Cuisine: {item.cuisine_context}</p>
                                        )}
                                        {item.allergen_info && (
                                            <p className="text-sm text-red-600">Allergen Info: {item.allergen_info}</p>
                                        )}
                                        {item.historical_notes && (
                                            <p className="text-sm text-gray-600 italic">History: {item.historical_notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            Object.entries(results).map(([ingredient, subs]) => (
                                <div key={ingredient} className="mb-4 p-3 border-l-4 border-gray-400 bg-gray-50 rounded">
                                    <h2 className="font-semibold mb-2">Substitutes for <span className="text-indigo-700">{ingredient}</span>:</h2>
                                    {Array.isArray(subs) && subs.map((item, subIdx) => (
                                        <div key={subIdx} className="mb-2 pl-2">
                                            <p><strong>{item.substitute}</strong> — Score: {item.score}/100
                                                {matchesPreference(item, preferences) && (
                                                    <span className="ml-2 inline-block bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-semibold align-middle">Matches your preference!</span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-700">{item.reason}</p>
                                            {item.cuisine_context && (
                                                <p className="text-sm text-gray-600">Cuisine: {item.cuisine_context}</p>
                                            )}
                                            {item.allergen_info && (
                                                <p className="text-sm text-red-600">Allergen Info: {item.allergen_info}</p>
                                            )}
                                            {item.historical_notes && (
                                                <p className="text-sm text-gray-600 italic">History: {item.historical_notes}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
