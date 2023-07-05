import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const game_loop = new mongoose.Schema(
  {
  roundNumber: {
    type: Number,
    default: 1
  },
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  multiplierCrash: {
    type: Number,
    default: 0
  },
  bettingPhase: {
    type: Boolean,
    default: true
  },
  gamePhase: {
    type: Boolean,
    default: false
  },
  cashoutPhase: {
    type: Boolean,
    default: false
  },
  timeNow: {
    type: Number,
    default: -1
  },
isActive: { type: Boolean, default: true }
});

// module.exports = mongoose.model("game_loop", game_loop);
const GameModal = model('game_loop', game_loop);
export default GameModal;
