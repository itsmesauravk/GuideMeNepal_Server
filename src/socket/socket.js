// import {Server} from "socket.io";
// import express from "express";
// import http from "http";

// const app = express();

// const server = http.createServer(app);

// const io = new Server(server, {
//     cors:{
//         origin:process.env.URL,
//         methods:['GET','POST']
//     }
// })

// const userSocketMap = {} ; // this map stores socket id corresponding the user id; userId -> socketId

// export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// io.on('connection', (socket)=>{
//     const userId = socket.handshake.query.userId;
//     console.log("userId", userId);
//     if(userId){
//         userSocketMap[userId] = socket.id;
//         console.log(`User ${userId} connected with socket id ${socket.id}`);
//     }

//     io.emit('getOnlineUsers', Object.keys(userSocketMap));


//     //for live location of the user
//     socket.on('guide-location',(location)=>{
//         const {latitude, longitude} = location;
//         console.log(`User ${userId} location: ${latitude}, ${longitude}`);
//     })

//     socket.on('disconnect',()=>{
//         if(userId){
//             delete userSocketMap[userId];
//             console.log(`User ${userId} disconnected`);
//         }
//         io.emit('getOnlineUsers', Object.keys(userSocketMap));
//     });
// })

// export {app, server, io};


//updated

import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.URL,
    methods: ["GET", "POST"],
  },
});

// Map to store user socket mappings: userId -> socketId
const userSocketMap = {};

// Map to store guide locations: guideId -> { latitude, longitude, name, timestamp }
const guideLocationsMap = {};

// Map to store admin socket IDs
const adminSocketMap = {};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  const userRole = socket.handshake.query.role; // 'guide' or 'admin'
  
  console.log(`User connected: ${userId}, Role: ${userRole}, Socket ID: ${socket.id}`);
  
  if (userId) {
    userSocketMap[userId] = socket.id;
    
    // Register admin users in a separate map
    if (userRole === "admin") {
      adminSocketMap[userId] = socket.id;
      console.log(`Admin ${userId} registered for location updates`);
      
      // Send current guide locations to the newly connected admin
      socket.emit("initial-guide-locations", Object.entries(guideLocationsMap).map(([guideId, data]) => ({
        guideId,
        ...data
      })));
    }
  }

  // Broadcast online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle guide location updates
  socket.on("guide-location", (location) => {
    if (!userId) return;
    
    const { latitude, longitude } = location;
    const name = socket.handshake.query.name || `Guide ${userId}`;
    
    console.log(`Guide ${userId} (${name}) location: ${latitude}, ${longitude}`);
    
    // Store the location data with timestamp
    guideLocationsMap[userId] = {
      latitude,
      longitude,
      name,
      timestamp: Date.now()
    };
    
    // Broadcast the location update to all admin users
    Object.values(adminSocketMap).forEach(adminSocketId => {
      io.to(adminSocketId).emit("guide-location-update", {
        guideId: userId,
        latitude,
        longitude,
        name
      });
    });
  });
  
  // Handle request for guide locations (from admin)
  socket.on("request-guide-locations", () => {
    if (userRole === "admin") {
      console.log(`Admin ${userId} requested all guide locations`);
      // Send all current guide locations to the requesting admin
      const locationData = Object.entries(guideLocationsMap).map(([guideId, data]) => ({
        guideId,
        ...data
      }));
      socket.emit("initial-guide-locations", locationData);
    }
  });
  
  // Handle guide stopping location sharing
  socket.on("guide-location-stopped", () => {
    if (userId && guideLocationsMap[userId]) {
      console.log(`Guide ${userId} stopped sharing location`);
      
      // Notify admins that this guide is no longer sharing location
      Object.values(adminSocketMap).forEach(adminSocketId => {
        io.to(adminSocketId).emit("guide-disconnected", userId);
      });
      
      // Remove from the locations map
      delete guideLocationsMap[userId];
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (userId) {
      console.log(`User ${userId} disconnected`);
      
      // If the disconnected user is a guide who was sharing location, notify admins
      if (userRole === "guide" && guideLocationsMap[userId]) {
        Object.values(adminSocketMap).forEach(adminSocketId => {
          io.to(adminSocketId).emit("guide-disconnected", userId);
        });
        
        // Remove from the locations map
        delete guideLocationsMap[userId];
      }
      
      // Remove from appropriate maps
      delete userSocketMap[userId];
      if (userRole === "admin") {
        delete adminSocketMap[userId];
      }
    }
    
    // Broadcast updated online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };