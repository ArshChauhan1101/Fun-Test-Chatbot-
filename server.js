const express = require('express.js');
const http = require('http');
const {Server} = require('socket.io');
const path = require('path');


const app = express();
const server = http.createServer(app);
const io = new Server(server);



