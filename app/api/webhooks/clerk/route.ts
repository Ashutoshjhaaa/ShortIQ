import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!SIGNING_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET)

    // Get headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing Svix headers', {
            status: 400,
        })
    }

    // Get body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    let evt: WebhookEvent

    // Verify payload with headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error: Could not verify webhook:', err)
        return new Response('Error: Verification error', {
            status: 400,
        })
    }

    // Handle the webhook
    const eventType = evt.type

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id, first_name, last_name, email_addresses, image_url } = evt.data
        const email = email_addresses[0]?.email_address
        const name = `${first_name || ''} ${last_name || ''}`.trim() || email?.split('@')[0] || ''

        // Upsert into 'profiles' table (matches supabase_schema.sql)
        // user_id = Clerk User ID, id = auto-generated UUID
        const { error } = await supabaseAdmin.from('profiles').upsert(
            {
                user_id: id,
                email: email,
                full_name: name,
                avatar_url: image_url,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
        )

        if (error) {
            console.error('Error syncing user to Supabase profiles:', error)
        }
    }

    if (eventType === 'user.deleted') {
        const { id } = evt.data
        if (id) {
            // Delete user profile and let CASCADE handle related data
            const { error } = await supabaseAdmin
                .from('profiles')
                .delete()
                .eq('user_id', id)

            if (error) {
                console.error('Error deleting user profile from Supabase:', error)
            }
        }
    }

    // For Clerk Billing (Stripe integration managed by Clerk)
    // You would handle subscription events here if Clerk sends them
    // Check Clerk docs for specific billing webhook event types
    // if (eventType === 'subscription.created') { ... }

    return new Response('Webhook received', { status: 200 })
}
