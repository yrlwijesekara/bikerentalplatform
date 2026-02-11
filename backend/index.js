import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRouter from './routes/userRouter.js';
import jwt from 'jsonwebtoken';
import productRouter from './routes/productRouter.js';
import placeRouter from './routes/placeRouter.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    const value = req.header('Authorization');
    if (value != null) {
        const token = value.replace('Bearer ', '');
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (decoded == null) {
                return res.status(401).send({ error: 'Unauthorized' });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        next();
    }
});
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/places', placeRouter);
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