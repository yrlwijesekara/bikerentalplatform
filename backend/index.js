import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRouter from './routes/userRouter.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use('/api/users', userRouter);
const connectionString = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

mongoose.connect(connectionString).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/*Vv0NTmQ6Yx9iVvIu
yehanjb_db_user
*/