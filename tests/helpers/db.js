/**
 * Database Test Helpers
 *
 * Utilities for creating and cleaning up test data in Supabase.
 * These helpers use the service role key to bypass RLS policies.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client with service role (bypasses RLS)
 * Only use this in tests for setup/teardown!
 */
export const createTestSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Generate a test UUID
 * Supabase profiles.id must be a valid UUID
 */
const generateTestUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Create a test user in the profiles table
 * @param {Object} supabase - Supabase client
 * @param {Object} overrides - Override default values
 * @returns {Promise<Object>} Created user profile
 */
export const createTestUser = async (supabase, overrides = {}) => {
  const timestamp = Date.now();
  const testId = generateTestUUID();

  const { data, error} = await supabase
    .from('profiles')
    .insert({
      id: testId, // UUID required for profiles table
      email: `test-${timestamp}@example.com`,
      credits: 3,
      total_generated: 0,
      ...overrides,
    })
    .select()
    .single();

  if (error) {
    console.error('[Test Helper] Error creating test user:', error);
    throw error;
  }

  return data;
};

/**
 * Clean up test user and related data
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID to delete
 */
export const cleanupTestUser = async (supabase, userId) => {
  if (!userId) return;

  try {
    // Delete related data first (if you have foreign keys)
    // await supabase.from('credit_transactions').delete().eq('user_id', userId);
    // await supabase.from('generations').delete().eq('user_id', userId);

    // Delete the profile
    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows deleted (already gone, that's ok)
      console.error('[Test Helper] Error cleaning up test user:', error);
    }
  } catch (error) {
    console.error('[Test Helper] Unexpected cleanup error:', error);
  }
};

/**
 * Set user's credit balance
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {number} credits - New credit balance
 */
export const setUserCredits = async (supabase, userId, credits) => {
  const { error } = await supabase
    .from('profiles')
    .update({ credits })
    .eq('id', userId);

  if (error) {
    console.error('[Test Helper] Error updating credits:', error);
    throw error;
  }
};

/**
 * Get user's profile
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
export const getTestUserProfile = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Test Helper] Error fetching profile:', error);
    throw error;
  }

  return data;
};
