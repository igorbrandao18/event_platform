import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
import { clerkClient } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import getUserModel from '@/lib/database/models/user.model'
import { connectToDatabase } from '@/lib/database'
 
export async function POST(req: Request) {
 
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
 
  if (!WEBHOOK_SECRET) {
    console.error('Missing WEBHOOK_SECRET');
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }
 
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
 
  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }
 
  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);
 
  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.WEBHOOK_SECRET || '');
 
  let evt: WebhookEvent
 
  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }
 
  // Handle the webhook
  const eventType = evt.type;
 
  if (eventType === 'user.created') {
    try {
      const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

      // Verificar se o usuário já existe
      await connectToDatabase();
      const User = await getUserModel();
      const existingUser = await User.findOne({ clerkId: id });

      if (existingUser) {
        console.log('User already exists in webhook:', existingUser);
        return NextResponse.json({ message: 'User already exists', user: existingUser });
      }

      // Verificar se há um email disponível
      if (!email_addresses?.[0]?.email_address) {
        throw new Error('No email address available');
      }

      const user = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: (username || first_name?.toLowerCase() || 'user') + '_' + id.substring(0, 8),
        firstName: first_name || 'Anonymous',
        lastName: last_name || 'User',
        photo: image_url || 'https://example.com/default-avatar.png',
      }

      const newUser = await createUser(user);

      if (newUser) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id
          }
        })
      }

      console.log('User created successfully in webhook:', newUser);
      return NextResponse.json({ message: 'OK', user: newUser })
    } catch (error) {
      console.error('Error in user.created webhook:', error);
      return NextResponse.json({ message: 'Error creating user', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    try {
      const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

      const user = {
        email: email_addresses[0].email_address,
        username: username || first_name?.toLowerCase() || '',
        firstName: first_name || '',
        lastName: last_name || '',
        photo: image_url,
      }

      const updatedUser = await updateUser(id, user);
      console.log('User updated successfully in webhook:', updatedUser);
      return NextResponse.json({ message: 'OK', user: updatedUser })
    } catch (error) {
      console.error('Error in user.updated webhook:', error);
      return NextResponse.json({ message: 'Error updating user', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      const { id } = evt.data;
      const deletedUser = await deleteUser(id);
      console.log('User deleted successfully in webhook:', deletedUser);
      return NextResponse.json({ message: 'OK', user: deletedUser })
    } catch (error) {
      console.error('Error in user.deleted webhook:', error);
      return NextResponse.json({ message: 'Error deleting user', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
  }
 
  return NextResponse.json({ message: 'OK' })
}
 