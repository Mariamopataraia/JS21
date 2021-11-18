const ws = require('ws');
const uuid = require('uuid');

const server = new ws.WebSocketServer({ port: 8080 });
let activeUsers = [];
let messages = [];
server.on('connection', function connection(socket) {
  socket.id = uuid.v4();
  brodCastAll({type: 'activeUsers', data: activeUsers});
  socket.on('message', message => {
    const data = JSON.parse(message);
    console.log(data);
    if (data.type === 'newUser') {
      data.id = socket.id;
      activeUsers.push(data);
      brodCastAll(data);
    }
    if (data.type === 'userTyping') {
      brodCastAllExcludeCurrent(data, socket);
    }
    if (data.type === 'chatMessage') {
      const messageData = { ...data, id: uuid.v4() };
      messages.push(messageData);
      sendMessageWithSmile(messageData, socket);
    }
    if (data.type === 'messageLike') {
      let newCount = 0;
      messages = messages.map(m => {
        if(m.id === data.id){
          return {...m, likeCount: newCount = (m.likeCount || 0) + 1}
        }
        return m;
      })
      brodCastAll({type: 'messageLike', id: data.id, likeCount: newCount})
    }
  });

  socket.on('close', () => {
    server.emit('disconnection', socket)
    console.log('Connection Closed');
  });

  server.on('disconnection', socket => {
    activeUsers = activeUsers.filter(user => user.id !== socket.id);
    brodCastAll({type: 'activeUsers', data: activeUsers});
    console.log('User disconnected', socket.id);
  });
});

function brodCastAllExcludeCurrent(messageObject, socket) {
  server.clients.forEach(function each(client) {
    if (client !== socket&& client.readyState === ws.OPEN) {
      client.send(JSON.stringify(messageObject));
    }
  });
}

function brodCastAll(messageObject) {
  server.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(messageObject));
    }
  });
   
}
// Task
server.on ('is typing', function(socket){ 
        socket.broadcast.emit('typing', {nickname: data.userName});
});

let socketio = undefined;

const chatHistory = [];
const userList = [];

const userTypingStatus = {};
const timers = {};
const typingStatusTime = 2000;

const id = {
  message: 0,
  user: 0,
  unique: {}
};
// Task1
const express = require('express');
const app     = express();
const http    = require('http').createServer(app);
const io      = require('socket.io')(http);

app.use(express.static(__dirname + '/../client'));

http.listen(3000);

console.log('Server is listening on http://localhost:3000');

io.on('connection', socket => {
    console.log('connected...');
});





function sendMessageWithSmile(messageObject, socket) {
  const sender = activeUsers.find(user => user.id === socket.id);
  server.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      messageObject.data = messageObject.data.replace(/:D/gi, '😀');
      messageObject.data = messageObject.data.replace(/;\)/g, '😉');
      messageObject.data = messageObject.data.replace(/<3/g, '😍');
      messageObject.data = messageObject.data.replace(/:\|/g, '😐');
      messageObject.data = messageObject.data.replace(/:omg/g, '🤦');
      messageObject.data = `${client === socket ? 'You' : sender.data}: ${messageObject.data}`
      client.send(JSON.stringify(messageObject));
    }
  });
}