// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;

// Serve static files from React app
app.use(express.static(path.join(__dirname, 'client/build')));

let users = [];
let wordAssignments = {};
let drawings = {};

// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining the game
  socket.on('join', (username) => {
    users.push({ id: socket.id, username });
    console.log(`${username} has joined.`);
    io.emit('users', users);
  });

  // Handle word submission
  socket.on('submitWord', (word) => {
    wordAssignments[socket.id] = word;
    
    if (Object.keys(wordAssignments).length === users.length) {
      // Assign words to users
      const userIds = Object.keys(wordAssignments);
      userIds.forEach((id, index) => {
        const nextUserId = userIds[(index + 1) % userIds.length];
        io.to(nextUserId).emit('assignedWord', wordAssignments[id]);
      });
    }
  });

  // Handle drawing submission
  socket.on('submitDrawing', (drawing) => {
    drawings[socket.id] = drawing;
    
    if (Object.keys(drawings).length === users.length) {
      // Send drawings to users
      const userIds = Object.keys(drawings);
      userIds.forEach((id, index) => {
        const nextUserId = userIds[(index + 1) % userIds.length];
        io.to(nextUserId).emit('receiveDrawing', drawings[id]);
      });
    }
  });

  // Handle guesses
  socket.on('submitGuess', (guess) => {
    io.emit('userGuess', { userId: socket.id, guess });
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    users = users.filter(user => user.id !== socket.id);
    delete wordAssignments[socket.id];
    delete drawings[socket.id];
    io.emit('users', users);
    console.log('A user disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
