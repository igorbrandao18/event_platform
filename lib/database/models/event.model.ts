import mongoose, { Schema, model, Model } from "mongoose";
import { connectToDatabase } from "../index";

export interface IEvent {
  title: string;
  description?: string;
  location?: string;
  createdAt: Date;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  url?: string;
  category: Schema.Types.ObjectId;
  organizer: Schema.Types.ObjectId;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  price: { type: String },
  isFree: { type: Boolean, default: false },
  url: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Função para obter o modelo Event
const getEventModel = async (): Promise<Model<IEvent>> => {
  await connectToDatabase();
  return mongoose.models.Event || model<IEvent>('Event', EventSchema);
};

export default getEventModel;