'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { UserCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  return (
    <div
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      <div className="relative min-h-screen flex flex-col">
        {/* Header with user info */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Ingredient Imposter
                </Link>
                {!isPending && session?.user && (
                  <><Link
                    href="/upload"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Upload</span>
                  </Link><Link
                    href="/smart-swap"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >

                      <span className="text-sm">Smart Swap</span>
                    </Link></>

                )}
              </div>
              <Link
                href="/account"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                {isPending ? (
                  <LoadingSpinner size="w-6 h-6" />
                ) : session?.user ? (
                  <>
                    <span className="text-sm">{session?.user?.email}</span>
                    <UserCircle className="w-6 h-6" />
                  </>
                ) : (
                  <>
                    <span className="text-sm">Sign in</span>
                    <UserCircle className="w-6 h-6" />
                  </>
                )}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-grow flex justify-center py-12 px-4 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black text-gray-300">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center sm:justify-center gap-4 sm:gap-12">
              <div>
                Need Help?&nbsp;
                <Link href="/contact" className="text-white font-medium transition-colors duration-300 hover:text-gray-300">
                  Contact Us
                </Link>
              </div>
              <div>© Ingredient Imposter {new Date().getFullYear()}</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 