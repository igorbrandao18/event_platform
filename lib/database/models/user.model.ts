import mongoose, { Schema, model, Model } from "mongoose";
import { connectToDatabase } from "../index";

interface IUser {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
  events: Schema.Types.ObjectId[];
  orders: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  photo: { type: String, required: true },
  events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
});

// Função para obter o modelo User
const getUserModel = async (): Promise<Model<IUser>> => {
  await connectToDatabase();
  return mongoose.models.User || model<IUser>('User', UserSchema);
};

export default getUserModel;