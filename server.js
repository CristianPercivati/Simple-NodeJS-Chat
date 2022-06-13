const express = require("express");
const app = express();
const http = require("http").Server(app);
const port = 3001;  
const io = require("socket.io")(http);
const mongoose = require("mongoose");
const path = require('path');

main().catch(err => console.log(err));

async function main () {
await mongoose.connect(process.env.MONGODB_URI);
}

const messagesSchema = new mongoose.Schema({
    name: String,
    msg: String,
    color: String
});
const messagesModel = mongoose.model('Messages', messagesSchema);

app.use(express.static(__dirname));
app.use("/lib", express.static(__dirname+'/node_modules')); 
app.use(express.urlencoded({ extended: false }));

io.on("connection", (socket) => { 
    socket.on('send message', ({name, msg, color}) => { 
    let messages = new messagesModel({name: name, msg: msg, color: color});
    messages.save();
    io.emit('receive message', {name, msg, color})
});
messagesModel.find({}).then( (data) => {
    for (let object of data){
    socket.emit('receive message', object)
    }
});    
});
const server = http.listen(process.env.PORT || 3001, () => console.log("server running"));
