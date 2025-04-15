import mongoose, { Schema, model, Model } from "mongoose";
import { connectToDatabase } from "../index";

export interface IOrder {
  createdAt: Date;
  stripeId: string;
  totalAmount: string;
  event: {
    _id: Schema.Types.ObjectId;
    title: string;
  };
  buyer: Schema.Types.ObjectId;
}

export type IOrderItem = {
  _id: string;
  totalAmount: string;
  createdAt: Date;
  eventTitle: string;
  eventId: string;
  buyer: string;
};

const OrderSchema = new Schema<IOrder>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stripeId: {
    type: String,
    required: true,
    unique: true,
  },
  totalAmount: {
    type: String,
  },
  event: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
    },
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Função para obter o modelo Order
const getOrderModel = async (): Promise<Model<IOrder>> => {
  await connectToDatabase();
  return mongoose.models.Order || model<IOrder>('Order', OrderSchema);
};

export default getOrderModel;
