import express from 'express';

import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin:"*",
    credentials:true
}))

app.use(express.json({limit: '20kb'}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); //for accessing static files from public folder

app.use(cookieParser());


//importing routes
import adminRoutes from "./routers/admin/admin.routes.js";



//using routes
app.use('/api/v1/admin', adminRoutes);




//tesing routes
app.get('/', (req, res) => {
    res.send('HAKUNA MATATA - SAURAV KARKI');
    })
app.get('/api/v1', (req, res) => {
    res.send('SERVER IS WORKING GOOD.');
    })



export default app;