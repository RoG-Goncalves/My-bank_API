import mongoose from 'mongoose';


const accountSchema = mongoose.Schema({
  agencia: {
    type: Number,
    require: true,
  },
  conta: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  balance: {
    type: Number,
    require: true,
    validate(value) {
      if (value < 0)
        throw new Error('Valor negativo não permitido');
    },
    min: 0
  },
  lastModified: {
    type: Date,
    default: Date.now,
  }
});

const accountModel = mongoose.model('account', accountSchema, 'account');
export { accountModel }