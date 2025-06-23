import 'dotenv/config'
await connectDB();

import express from 'express';
import cors from 'cors';
import * as cron from "node-cron";
import { connectDB } from './db/db.js';
import adminRouter from './routes/admin.route.js';
import studentRouter from './routes/student.route.js';
import voteRouter from './routes/vote.route.js';
import categoryRouter from './routes/category.route.js';
import groupRouter from './routes/groupe.route.js';
import candidacyRouter from './routes/candidacy.route.js';
import studentVoteRouter from './routes/studentVote.route.js';


import { sequelize } from './models/index.js';
import { updateVoteStatusWithJob } from './controllers/vote.controller.js';

const corsOptions = {
    origin: 'https://awward-polytech.onrender.com',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
}
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors(corsOptions));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


app.use('/student', studentRouter);
app.use('/admin', adminRouter)
app.use('/vote', voteRouter)
app.use('/category', categoryRouter)
app.use('/group', groupRouter)
app.use('/candidacy', candidacyRouter)
app.use('/studentVote', studentVoteRouter);

app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found' });
})

sequelize.sync()
    .then(() => {
        console.log('Database synced successfully.');
        cron.schedule('0 0 * * * *', async () => {
            await updateVoteStatusWithJob()
        })
        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
        })

    })
    .catch((error) => {
        console.error('Unable to sync the database:', error);
    });



