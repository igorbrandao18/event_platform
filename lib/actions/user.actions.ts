'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/database'
import getUserModel from '@/lib/database/models/user.model'
import getOrderModel from '@/lib/database/models/order.model'
import getEventModel from '@/lib/database/models/event.model'
import { handleError } from '@/lib/utils'

import { CreateUserParams, UpdateUserParams } from '@/types'

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    
    const User = await getUserModel();

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ clerkId: user.clerkId });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return JSON.parse(JSON.stringify(existingUser));
    }

    // Criar novo usuário
    const newUser = await User.create({
      ...user,
      events: [],
      orders: []
    });

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    console.log('User created successfully:', newUser);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error('Error in createUser:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to create user');
  }
}

export async function getUserById(userId: string) {
  try {
    const User = await getUserModel();
    const user = await User.findById(userId);

    if (!user) throw new Error('User not found');
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    const User = await getUserModel();
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });

    if (!updatedUser) throw new Error('User update failed');
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
  try {
    const User = await getUserModel();
    const Order = await getOrderModel();
    const Event = await getEventModel();
    
    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error('User not found');
    }

    // Unlink relationships
    await Promise.all([
      // Update the 'events' collection to remove references to the user
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),

      // Update the 'orders' collection to remove references to the user
      Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: 1 } }),
    ]);

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath('/');

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}
