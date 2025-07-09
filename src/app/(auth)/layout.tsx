import Link from 'next/link';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[#F1F5F9] bg-opacity-90">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem'
        }} />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center py-7 px-4 sm:px-6 lg:px-8">
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