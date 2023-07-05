import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const bettingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    gameType: {
      type: String,
      required: true,
      trim: true,
      enum: ['plinko', 'limbo', 'slot','crash'],
    },
    transactionType: {
      type: String,
      required: true,
      trim: true,
      enum: ['deposit', 'withdraw'],
    },
    amount: {
      type: Number,
      required: true,
    },
    multiplier: {
      type: Number,
    },
    profit: {
      type: Number,
    },
    transactionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const bettingModal = model('betting', bettingSchema);
export default bettingModal;
