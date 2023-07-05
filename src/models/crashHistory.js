import  mongoose from 'mongoose';
const carshGameSchema = mongoose.Schema(
  {
    result: {
      type: Object,
    },
    secret: {
      type: String,
    },
    nonce: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    isLock: {
      type: Boolean,
      default: false,
    },
    bets: [
      {
        amount: {
          type: Number,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        betId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'bet',
        },
        betAt: {
          type: Date,
          default: new Date(),
        },
        blockChain: {
          type: String,
        },
        autoCashOut: {
          type: Number,
        },
        profitOnWin:{
          type: Number
        },
        clientSeed:{
          type:String
        }
      },
    ],
    clientSeedMain:{
      type:String
    },
    winners: Array,
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('crashgame', carshGameSchema);
