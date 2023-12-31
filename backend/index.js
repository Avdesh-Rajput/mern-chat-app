const express = require('express');
const chats = require('./data/data');
const dotenv = require('dotenv');
const port = 8000;
const connectDB = require('./config/db');
const userRoutes =require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const {notFound , errorHandler} = require('./middleware/errorMiddleware');



dotenv.config();
connectDB();
const app = express();


app.use(express.json());

app.get('/' , (req,res)=>{
     res.send('Api is running')
});

app.use('/api/user' , userRoutes);
app.use('/api/chat' , chatRoutes);
app.use('/api/message' , messageRoutes);


app.use(notFound);
app.use(errorHandler);

const server = app.listen(port , function(error){
    if(error){
        console.log(error);
    }
    console.log('server is up at port' , port)
})

const io = require('socket.io')(server , {
    
    cors:{
        // origin: "*"
        origin: "http://localhost:3000"
    },
    pingTimeout: 6000,
});

io.on("connection" , (socket) => {
    console.log("connected to io");

    socket.on('setup' , (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on('join chat' , (room) => {
        socket.join(room);
        console.log("user joined room" + room)
    });

    socket.on('typing' , (room) => 
        socket.in(room).emit("typing")
    )
    socket.on('stop typing' , (room) => 
        socket.in(room).emit("stop typing")
    )

    socket.on('new message' , (newMessageRecieved) => {
         var chat = newMessageRecieved.chat;

         if(!chat.users) return console.log("chat.users not defined");

         chat.users.forEach(user => {
            if(user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved" , newMessageRecieved);
         });
    })

    socket.off('setup' , () => {
        socket.leave(userData._id);
        console.log("USER disconnected");
    });
})