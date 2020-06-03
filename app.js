// Setup basic express server
const express = require('express');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

// 链接数据库并初始化
// const db = require('./db')
// const api = require('./api')
// api(app)


let chat = {}
let roomNum = {}
let chatLog = []
//socket.io
io.on('connection', function (socket) {
    console.log('center.vue connection')
    // room join
    socket.on('joinToRoom', function (data) {
        console.log('joinToRoom')
        chat = data
        socket.userid = chat.userid
        socket.nickname = chat.nickname
        let roomGroupId = chat.chatToGroup
        // 在线人数
        if (!roomNum[roomGroupId]) {
            roomNum[roomGroupId] = []
        }
        roomNum[roomGroupId].push(socket.nickname)
        console.log('sad' + roomNum)
        console.log('asdads+=' + roomNum[roomGroupId])

        socket.join(roomGroupId)
        io.sockets.in(roomGroupId).emit('joinToRoom', chat)
        io.sockets.in(roomGroupId).emit('updateGroupNumber', roomNum[roomGroupId])
    })
    socket.on('leaveToRoom', function (data) {
        console.log('leaveToRoom')
        console.log(roomNum)
        chat = data
        socket.userid = chat.userid
        socket.nickname = chat.nickname
        let roomGroupId = chat.chatToGroup
        // 从房间名单中移除
        let index = roomNum[roomGroupId].indexOf(socket.nickname);
        if (index !== -1) {
            roomNum[roomGroupId].splice(index, 1);
        }
        console.log(roomNum[roomGroupId])

        socket.leave(roomGroupId)
        io.sockets.in(roomGroupId).emit('leaveToRoom', chat)
        io.sockets.in(roomGroupId).emit('updateGroupNumber', roomNum[roomGroupId])
    })

    socket.on('disconnect', function () {
        console.log('one disconnect')
        chat = {
            userid: socket.userid,
            nickname: socket.nickname,
            chatTime: Date.parse(new Date()),
            chatMes: 'off-line',
            chatToId: 401,
            chatType: 'tips'     // chat/tips
        }
        socket.broadcast.emit('userQuit', chat);
    })
    // 接收消息
    socket.on('emitChat', function (data) {
        chat = data
        console.log(data)
        let roomGroupId = chat.chatToGroup
        chatLog.push(data)
        socket.in(roomGroupId).emit('broadChat', chat)
    })
});

app.get('/get_chat_log', function (req, res) {
    res.json({ code: 200, msg: '读取群消息成功', chatLog: chatLog })

})
http.listen(7788, function () {
    console.log('Server listening at port 7788');
});

