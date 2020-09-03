import express from 'express';
import mongoose from 'mongoose';
import { accountRouter } from './routes/accountRouter.js';

(async () => {
  try {
    mongoose.connect('mongodb+srv://roggoncalves:<PASSWORD>@cluster0.ulvso.mongodb.net/accounts?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  } catch (error) {
    console.log('Erro ao conectar')
  }

})();
const app = express();

app.use(express.json());
app.use(accountRouter);

app.listen(3000, () => console.log('API Started!'))
