# Database Setup Scripts

This folder contains SQL migration scripts for setting up the Morpheo database.

## Initial Setup

Run `setup-complete.sql` in your Supabase SQL Editor to set up all database tables and functions.

## What it creates:

1. **credit_transactions** table - Tracks all credit purchases and usage
2. **credit_packages** table - Defines available credit packages for purchase
3. **add_credits()** function - RPC function called by Stripe webhooks to add credits

## How to run:

1. Open Supabase SQL Editor: `https://supabase.com/dashboard/project/YOUR_PROJECT/sql`
2. Copy contents of `setup-complete.sql`
3. Paste and click "Run"
4. Verify all tables and functions were created

## Troubleshooting

If you already ran the migration and need to fix issues, check the `.archive/` folder for individual fix scripts.
