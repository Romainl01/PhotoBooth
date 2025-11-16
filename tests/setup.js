import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load real environment variables from nextjs-app/.env.local for integration tests
// This allows tests to connect to real Supabase database
config({ path: resolve(__dirname, '../nextjs-app/.env.local') });

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Note: Environment variables are now loaded from .env.local file above
// This includes:
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY
// - GOOGLE_API_KEY
// - STRIPE_SECRET_KEY
// - STRIPE_WEBHOOK_SECRET
// - All Stripe price IDs
