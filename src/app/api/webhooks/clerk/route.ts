import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sairishigangarapu@gmail.com'

export async function GET() {
  return new Response('Webhook endpoint working', { status: 200 })
}

export async function POST(req: NextRequest) {
  // ALWAYS verify signature - never skip
  let evt
  try {
    evt = await verifyWebhook(req) // uses CLERK_WEBHOOK_SECRET env var automatically
  } catch (err) {
    return new Response('Verification failed', { status: 400 })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || null
    
    // Check if this email is the admin email
    const isAdmin = email === ADMIN_EMAIL
    const userRole = isAdmin ? 'admin' : 'student'

    try {
      // Insert user into database with appropriate role
      const { error } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: id,
          email: email,
          full_name: fullName,
          avatar_url: image_url,
          role: userRole,
        })
      if (error) throw error
      
      // If admin, set public metadata in Clerk
      if (isAdmin) {
        await setClerkMetadata(id, { role: 'admin' })
      }
    } catch (err) {
      return new Response('Error syncing user', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const email = email_addresses[0]?.email_address
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || null
    
    // Check if this email is now the admin email
    const isAdmin = email === ADMIN_EMAIL

    try {
        await supabaseAdmin
          .from('users')
          .update({
             email: email,
             full_name: fullName,
             avatar_url: image_url,
             role: isAdmin ? 'admin' : 'student'
          })
          .eq('clerk_id', id)
          
        // Update Clerk metadata if admin status changed
        if (isAdmin) {
          await setClerkMetadata(id, { role: 'admin' })
        }
    } catch (err) {
        // Database update error
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    try {
        await supabaseAdmin.from('users').delete().eq('clerk_id', id)
    } catch (err) {}
  }

  return new Response('OK', { status: 200 })
}

// Helper function to update Clerk public metadata via Backend API
async function setClerkMetadata(userId: string, metadata: Record<string, any>) {
  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: metadata,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      // Failed to set Clerk metadata
    }
  } catch (err) {
    // Error calling Clerk API
  }
}
