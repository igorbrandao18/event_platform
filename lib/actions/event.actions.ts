'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs'
import { Types, Model } from 'mongoose'

import { connectToDatabase } from '@/lib/database'
import getEventModel from '@/lib/database/models/event.model'
import getUserModel from '@/lib/database/models/user.model'
import Category from '@/lib/database/models/category.model'
import { handleError } from '@/lib/utils'
import { IEvent } from '@/lib/database/models/event.model'

import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from '@/types'

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

const populateEvent = async (query: any) => {
  const User = await getUserModel();
  return query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
    .populate({ path: 'category', model: Category, select: '_id name' })
}

// CREATE
export async function createEvent({ event, path }: CreateEventParams) {
  try {
    const { userId: clerkId } = auth();

    if (!clerkId) {
      throw new Error('Unauthorized: Please log in');
    }

    console.log('Creating event for clerkId:', clerkId);

    await connectToDatabase();
    
    const User = await getUserModel();
    const Event = await getEventModel();

    // Verificar se o usuário existe no MongoDB usando o clerkId
    const mongoUser = await User.findOne({ clerkId });
    
    if (!mongoUser) {
      console.error('User not found for clerkId:', clerkId);
      throw new Error('User not found in database');
    }

    console.log('Found user:', mongoUser);

    // Criar o evento usando o _id do MongoDB do usuário
    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: mongoUser._id
    });

    if (!newEvent) {
      throw new Error('Failed to create event');
    }

    // Adicionar o evento à lista de eventos do usuário
    await User.findByIdAndUpdate(
      mongoUser._id,
      { $push: { events: newEvent._id } }
    );

    console.log('Event created successfully:', newEvent);

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    console.error('Error in createEvent:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create event');
  }
}

// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase();
    const Event = await getEventModel();
    const event = await populateEvent(Event.findById(eventId));

    if (!event) throw new Error('Event not found');

    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase();
    const Event = await getEventModel();

    const eventToUpdate = await Event.findById(event._id);
    if (!eventToUpdate || eventToUpdate.organizer.toString() !== userId) {
      throw new Error('Unauthorized or event not found');
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true }
    );
    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase();
    const Event = await getEventModel();
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (deletedEvent) revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}

// GET ALL EVENTS
export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
  try {
    await connectToDatabase();
    const Event: Model<IEvent> = await getEventModel();

    const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {};
    const categoryCondition = category ? { category: category } : {};
    const conditions = {
      ...titleCondition,
      ...categoryCondition,
    };

    const skipAmount = (page - 1) * limit;

    const events = await Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate('organizer', '_id firstName lastName')
      .populate('category', '_id name');

    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

// GET EVENTS BY ORGANIZER
export async function getEventsByUser({ userId, limit = 6, page }: GetEventsByUserParams) {
  try {
    await connectToDatabase();
    const Event = await getEventModel();

    const conditions = { organizer: userId };
    const skipAmount = (page - 1) * limit;

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit)
    };
  } catch (error) {
    handleError(error);
  }
}

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase()
    const Event = await getEventModel();

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}
