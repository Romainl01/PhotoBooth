import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../.env.local') })

const webhookUrl = 'http://localhost:3003/api/webhooks/stripe'

// Get your user ID from database first
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data: profiles } = await supabase
  .from('profiles')
  .select('id, email, credits')
  .limit(1)

if (!profiles || profiles.length === 0) {
  console.error('❌ No profiles found in database')
  process.exit(1)
}

const userId = profiles[0].id
const userEmail = profiles[0].email
const currentCredits = profiles[0].credits

console.log(`\n🧪 Testing webhook for user: ${userEmail}`)
console.log(`📊 Current credits: ${currentCredits}`)
console.log(`🎯 Will attempt to add 10 credits via webhook...\n`)

// Simulate Stripe checkout.session.completed event
const mockEvent = {
  id: 'evt_test_' + Date.now(),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_' + Date.now(),
      payment_intent: 'pi_test_' + Date.now(),
      metadata: {
        user_id: userId,
        user_email: userEmail,
        package_name: 'Starter',
        credits: '10'
      }
    }
  }
}

console.log('📤 Sending mock webhook event...')

// Note: This will fail signature verification, but we can see the logs
try {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'mock_signature_for_testing'
    },
    body: JSON.stringify(mockEvent)
  })

  const responseText = await response.text()
  console.log(`\n📥 Response status: ${response.status}`)
  console.log(`📥 Response body:`, responseText)

  // Check credits again
  const { data: updatedProfile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  console.log(`\n✨ Credits after webhook: ${updatedProfile?.credits || 'error'}`)

  if (updatedProfile?.credits === currentCredits + 10) {
    console.log('✅ SUCCESS! Credits were added correctly!')
  } else {
    console.log('❌ Credits were NOT added. Check Next.js terminal for errors.')
  }

} catch (error) {
  console.error('❌ Error calling webhook:', error.message)
}
