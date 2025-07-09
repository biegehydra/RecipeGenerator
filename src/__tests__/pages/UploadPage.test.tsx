import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UploadPage from '../../app/(app)/upload/page';
import { authClient } from '@/lib/auth-client';

// Mock the auth-client module
jest.mock('@/lib/auth-client', () => require('../../__tests__/__mocks__/auth-client'));

// Mock the router push function
const mockPush = jest.fn();

// Mock the router
jest.mock('next/navigation', () => {
    return {
        useRouter: () => ({
            push: mockPush,
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
        }),
        usePathname: () => "",
        useSearchParams: () => ({
            get: jest.fn(),
        }),
    };
});

// Mock the FileUploadContainer component
jest.mock('@/app/(app)/upload/FileUploadContainer', () => {
    return function MockFileUploadContainer() {
        return <div data-testid="file-upload-container">File Upload Container</div>;
    };
});

describe('UploadPage Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading spinner while checking authentication', () => {
        // Mock useSession to return isPending true
        (authClient.useSession as jest.Mock).mockReturnValueOnce({
            data: null,
            isPending: true,
        });

        render(<UploadPage />);

        // Check for loading state
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        expect(screen.queryByTestId('file-upload-container')).not.toBeInTheDocument();
    });

    it('redirects to login page when user is not authenticated', async () => {
        // Mock useSession to return no user
        (authClient.useSession as jest.Mock).mockReturnValueOnce({
            data: null,
            isPending: false,
        });

        render(<UploadPage />);

        // Check if router.push was called with /login
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });

        // Content should not be rendered
        expect(screen.queryByTestId('file-upload-container')).not.toBeInTheDocument();
    });

    it('renders upload page when user is authenticated', () => {
        // Mock useSession to return an authenticated user
        (authClient.useSession as jest.Mock).mockReturnValueOnce({
            data: { user: { id: '1', email: 'test@example.com' } },
            isPending: false,
        });

        render(<UploadPage />);

        // Check that content is rendered
        expect(screen.getByText(/upload social media data/i)).toBeInTheDocument();
        expect(screen.getByTestId('file-upload-container')).toBeInTheDocument();

        // Router.push should not be called
        expect(mockPush).not.toHaveBeenCalled();
    });
}); 