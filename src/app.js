import express from 'express';

import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import cors from 'cors';

import passport from 'passport';
import session from 'express-session';

import './controllers/client/sub-controller/oauthlogin.controller.js';

import { app } from './socket/socket.js';

app.use(cors({
    origin:["https://guidemenepal.vercel.app","http://localhost:3000","http://localhost:3001"],
    credentials:true
}))

app.use(express.json({limit: '20kb'}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); //for accessing static files from public folder

app.use(cookieParser());

//for oauth 
// Session setup (required for Passport)
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


//importing routes
import adminRoutes from "./routers/admin/admin.routes.js";
import clientRoutes from "./routers/client/client.route.js";
import guideRoutes from "./routers/guide/guide.routes.js";
import oauthRoute from  "./routers/client/oauth.route.js";
import { commonRouter } from './routers/common/common.route.js';
import { messageRouter } from './routers/message/message.route.js';






//using routes
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/client', clientRoutes);
app.use('/api/v1/guide', guideRoutes);
app.use('/auth', oauthRoute);
app.use('/api/v1/common', commonRouter);
app.use('/api/v1/message', messageRouter);


//tesing routes
app.get('/', (req, res) => {
    res.send('HAKUNA MATATA - SAURAV KARKI');
    })
app.get('/api/v1', (req, res) => {
    res.send('SERVER IS WORKING GOOD.');
    })



  




export default app;