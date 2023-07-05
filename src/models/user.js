import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const user = new Schema(
  {
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  wallet: { type: Number, default: 0.0 },
  bet_amount: {
    type: Number,
    default: 0
  },
  payout_multiplier: {
    type: Number,
    default: 0
  },

});

const User = model('User', user);
export default User;