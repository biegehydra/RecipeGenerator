import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const envVars = {
        NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
        NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ? 'Set (value hidden)' : 'Not set',
        MONGODB_URI: process.env.MONGODB_URI ? 'Set (value hidden)' : 'Not set',
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_SECURE: process.env.SMTP_SECURE,
        NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json(
        {
            status: 'success',
            message: 'Environment variables check',
            env: envVars,
            timestamp: new Date().toISOString(),
            host: request.headers.get('host'),
        },
        {
            headers: {
                'Access-Control-Allow-Origin': 'http://192.168.1.191:3000',
                'Access-Control-Allow-Credentials': 'true',
            },
        }
    );
}
