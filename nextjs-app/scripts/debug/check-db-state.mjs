import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('🔍 Checking database state...\n')

// Check tables exist
console.log('📊 Checking if tables exist:')
const { data: tables, error: tablesError } = await supabase
  .from('credit_packages')
  .select('count')
  .limit(1)

if (tablesError) {
  console.error('❌ credit_packages table error:', tablesError.message)
} else {
  console.log('✅ credit_packages table exists')
}

// Check transactions table
const { data: transactions, error: transError } = await supabase
  .from('credit_transactions')
  .select('count')
  .limit(1)

if (transError) {
  console.error('❌ credit_transactions table error:', transError.message)
} else {
  console.log('✅ credit_transactions table exists')
}

// Get current user (first profile)
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .limit(5)

console.log('\n👥 Recent profiles:')
profiles?.forEach(p => {
  console.log(`  - ${p.email}: ${p.credits} credits (total_generated: ${p.total_generated})`)
})

// Check recent transactions
const { data: recentTx } = await supabase
  .from('credit_transactions')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5)

console.log('\n💰 Recent transactions:')
if (recentTx?.length > 0) {
  recentTx.forEach(tx => {
    const paymentId = tx.stripe_payment_id || 'no payment ID'
    console.log(`  - ${tx.transaction_type}: ${tx.amount} credits (${paymentId})`)
  })
} else {
  console.log('  (none)')
}

// Check credit packages
const { data: packages } = await supabase
  .from('credit_packages')
  .select('*')
  .order('display_order')

console.log('\n🎁 Credit packages:')
packages?.forEach(pkg => {
  const price = pkg.price_cents / 100
  console.log(`  - ${pkg.emoji} ${pkg.name}: ${pkg.credits} credits for €${price}`)
})
