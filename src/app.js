import express from 'express';
import logger from '#config/logger.js';
import helmet from "helmet";
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { timestamp } from 'drizzle-orm/gel-core';
import authRoutes from '#routes/auth.routes.js';
import securetyMiddleware from '#middleware/security.middleware.js'
const app=express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

app.use(morgan('combined',{stream:{
    write: (message)=>logger.info(message.trim())
}}));

app.use(
    securetyMiddleware
);

app.get('/',(req,res)=>{
  logger.info('Hello from devops Aquisitions,');
  res.status(200).send('Hello from aquisitions API !!');
});

app.get('/health',(req,res)=>{

    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api',(req,res)=>{

 res.status(200).json({
    message: ' Devops Aquisition API is Running !!'
 });
});


// all routes in authRoutes seront prefixe par /api/auth
app.use('/api/auth',authRoutes);


export default app;
