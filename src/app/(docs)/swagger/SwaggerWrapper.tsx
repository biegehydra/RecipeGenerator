'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Import SwaggerUI dynamically to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
    ssr: false,
    loading: () => (
        <div style={{
            padding: '20px',
            color: '#666',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            Loading API documentation...
        </div>
    ),
});

export default function SwaggerWrapper() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Only mount SwaggerUI on client side
        setMounted(true);

        // Store original console.error
        const originalError = console.error;

        // Override console.error to filter out specific warnings
        console.error = (...args: any[]) => {
            // Filter out UNSAFE_componentWillReceiveProps warning
            if (typeof args[0] === 'string' &&
                (args[0].includes('UNSAFE_componentWillReceiveProps') ||
                    args[0].includes('Please update the following components'))) {
                return;
            }

            // Pass through all other errors
            originalError.apply(console, args);
        };

        // Cleanup: restore original console.error
        return () => {
            console.error = originalError;
        };
    }, []);

    if (!mounted) return null;

    return (
        <div style={{
            backgroundColor: 'white',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <SwaggerUI url="/openapi.json" />
        </div>
    );
} 