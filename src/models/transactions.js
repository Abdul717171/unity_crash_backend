import  mongoose from 'mongoose';
const transactionSchema = mongoose.Schema(
  {
    result: {
      type: Object,
    },
    nonce: {
      type: Number,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    betAt: {
        type: Date,
        default: new Date(),
    },
    clientSeed:{
      type:String
    },
    serverSeed:{
        type:String
      }
  },
  {
    timestamps: true,
  },
);
const transactionsModal = mongoose.model('transactions', transactionSchema);
export default transactionsModal;
