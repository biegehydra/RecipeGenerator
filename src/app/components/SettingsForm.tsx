'use client';

import { useState, useTransition, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import * as Slider from '@radix-ui/react-slider';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { saveSettingsAction } from '../(app)/settings/actions';
import { useRouter } from 'next/navigation';





// Simple utility function for conditional classes
function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

// Mock data - replace with your actual data
const dietOptions = ['Vegetarian', 'Vegan', 'Paleo', 'Keto', 'Gluten-Free', 'None'];
const allergyOptions = [
    'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame', 'Mustard',
    'Celery', 'Lupin', 'Molluscs', 'Sulphites', 'Corn', 'Avocado', 'Banana', 'Kiwi', 'Citrus', 'Garlic'
];

type Settings = {
    diet: string;
    allergies: string[];
    spice_tolerance: number;
    sweetness_preference: number;
    saltiness_preference: number;
    acidity_sourness_preference: number;
    health_consciousness: number;
    budget_tolerance: number;
};

export default function SettingsForm({ initialSettings }: { initialSettings: Settings }) {
    const [settings, setSettings] = useState(initialSettings);
    const [isPending, startTransition] = useTransition();
    const [isDirty, setIsDirty] = useState(false);
    const router = useRouter();
    useEffect(() => {
        setIsDirty(JSON.stringify(settings) !== JSON.stringify(initialSettings));
    }, [settings, initialSettings]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
            await saveSettingsAction(settings);
            setIsDirty(false);
            router.push("/smart-swap");
        });
    };

    const handleSliderChange = (key: keyof Settings) => (value: number[]) => {
        setSettings(prev => ({ ...prev, [key]: value[0] }));
    };

    return (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                    <div>
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Dietary Information</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">Help us tailor recipes to your needs.</p>
                    </div>

                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                        <div className="sm:col-span-4">
                            <label htmlFor="diet" className="block text-sm font-medium leading-6 text-gray-900">
                                Dietary Restriction
                            </label>
                            <div className="mt-2">
                                <Select.Root value={settings.diet} onValueChange={(value) => setSettings(prev => ({ ...prev, diet: value }))}>
                                    <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <Select.Value placeholder="Select a diet..." />
                                        <Select.Icon>
                                            <ChevronDownIcon />
                                        </Select.Icon>
                                    </Select.Trigger>
                                    <Select.Portal>
                                        <Select.Content position="popper" className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-900 shadow-md">
                                            <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-gray-600 cursor-default">
                                                <ChevronUpIcon />
                                            </Select.ScrollUpButton>
                                            <Select.Viewport className="p-[5px]">
                                                {dietOptions.map(option => (
                                                    <Select.Item key={option} value={option} className="text-[13px] leading-none text-gray-900 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-gray-400 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                                                        <Select.ItemText>{option}</Select.ItemText>
                                                        <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
                                                            <CheckIcon />
                                                        </Select.ItemIndicator>
                                                    </Select.Item>
                                                ))}
                                            </Select.Viewport>
                                        </Select.Content>
                                    </Select.Portal>
                                </Select.Root>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="allergies" className="block text-sm font-medium leading-6 text-gray-900">
                                Allergies
                            </label>
                            <div className="mt-2">
                                {/* A proper multi-select would be better here, maybe from a library like react-select */}
                                <p className="text-sm text-gray-500 mb-2">Select all that apply (multi-select coming soon):</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {allergyOptions.map(allergy => (
                                        <button
                                            type="button"
                                            key={allergy}
                                            onClick={() => {
                                                setSettings(prev => {
                                                    const newAllergies = prev.allergies.includes(allergy)
                                                        ? prev.allergies.filter(a => a !== allergy)
                                                        : [...prev.allergies, allergy];
                                                    return { ...prev, allergies: newAllergies };
                                                });
                                            }}
                                            className={cn(
                                                "text-sm py-1.5 px-3 rounded-full border transition-colors",
                                                settings.allergies.includes(allergy)
                                                    ? "bg-gray-900 text-white border-gray-900"
                                                    : "bg-gray-100 hover:bg-gray-200 border-gray-400 text-gray-800"
                                            )}
                                        >
                                            {allergy}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-t border-gray-900/10 pt-10 md:grid-cols-3">
                    <div>
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Flavor & Lifestyle Preferences</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">Adjust these sliders to match your taste.</p>
                    </div>

                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                        {[
                            { key: 'spice_tolerance', label: 'Spice Tolerance', minLabel: 'Mild', maxLabel: 'Very Spicy' },
                            { key: 'sweetness_preference', label: 'Sweetness', minLabel: 'Not Sweet', maxLabel: 'Very Sweet' },
                            { key: 'saltiness_preference', label: 'Saltiness', minLabel: 'Low Salt', maxLabel: 'Salty' },
                            { key: 'acidity_sourness_preference', label: 'Acidity / Sourness', minLabel: 'Mild', maxLabel: 'Very Sour' },
                            { key: 'health_consciousness', label: 'Healthiness', minLabel: 'Indulgent', maxLabel: 'Lean' },
                            { key: 'budget_tolerance', label: 'Budget', minLabel: 'Cheap', maxLabel: 'Expensive' },
                        ].map(({ key, label, minLabel, maxLabel }) => (
                            <div key={key} className="sm:col-span-6">
                                <label htmlFor={key} className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
                                <Slider.Root
                                    className="relative flex items-center select-none touch-none w-full h-5"
                                    defaultValue={[settings[key as keyof Settings] as number]}
                                    onValueChange={handleSliderChange(key as keyof Settings)}
                                    max={5} step={1}
                                    id={key}
                                >
                                    <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
                                        <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
                                    </Slider.Track>
                                    <Slider.Thumb className="block w-5 h-5 bg-white shadow-md rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" />
                                </Slider.Root>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{minLabel}</span>
                                    <span>{maxLabel}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        className="text-sm font-semibold leading-6 text-gray-900"
                        onClick={() => setSettings(initialSettings)}
                        disabled={!isDirty || isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!isDirty || isPending}
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}