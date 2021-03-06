//---controler
var userCtrl = require('./controllers/userController');
var chatCtrl = require('./controllers/chatController');

//---Repo
var chatRepo = require('./repos/chatRepo');
var userRepo = require('./repos/userRepo');
//----Upload files
var multer = require("multer");
var fs = require("fs");
//---libs
var express = require('express')
var app = express();
var bodyParser = require('body-parser');
const path = require('path');

//---app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('uploads'));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/user', userCtrl);
app.use('/chat', chatCtrl);

// define a route to download a file 
app.get('/download/:file(*)', (req, res) => {
    console.log(req);
    var file = req.params.file;
    var fileLocation = path.join('./uploads', file);
    console.log(fileLocation);
    res.download(fileLocation, file);
});

//-----get Topic by userID
app.post('/getTopicByUserID', (req, res) => {
    const body = req.body
    if (body.userID != null) {
        chatRepo.getListTopic().then(response => {
            let topicByUserID = [];
            response.map(topic => {
                let topicID = topic.topicId.split("_");
                for (var i = 0; i < topicID.length; i++) {
                    if (topicID[i] === body.userID + "") {
                        topic.name = JSON.parse(topic.name)
                        topicByUserID.push(topic);
                    }
                }
            })
            res.send({ response: (topicByUserID) })
        })
    }
    else {
        res.send({ error: 'userID is null' })
    }

});
//-----get Message by TopicID
app.post('/getMessageByTopicID', (req, res) => {
    const body = req.body
    if (body.topicID != null) {
        console.log(body)
        chatRepo.getMessageByTopicID(body.topicID).then(response => {

            // response.map(topic=>{
            //     topic.name = JSON.parse(topic.name)
            // })
            res.send({ response: (response) })
        })
    }
    else {
        res.send({ error: 'topicID is null' })
    }

});

//-----get List Friends by userID
app.post('/getListFriendsByUserId', (req, res) => {
    const body = req.body
    if (body.userID != null) {
        console.log(body)
        userRepo.getListFriendsByUserId(body.userID).then(response => {
            res.send({ response: (response) })
        })
    }
    else {
        res.send({ error: 'topicID is null' })
    }

});

//-----Register
app.post('/register', (req, res) => {
    const body = req.body
    console.log('register', body);
    if (body != null) {

        userRepo.searchEmail(body.email).then(respon => {
            if (respon.length == 0) {
                const user = {
                    email: body.email,
                    password: body.password,
                    fullname: body.fullname,
                    avatar: 'https://sm.ign.com/t/ign_in/screenshot/i/iron-man/iron-man_aw54.640.jpg'
                }
                userRepo.registerUser(user).then(ressponse => {
                    res.send({
                        result: 1,
                        msg: "Thành công"
                    })
                }).catch(err => {
                    res.send({
                        result: 0,
                        msg: "Đăng ký lỗi, xin vui lòng thử lại sau."
                    })
                    console.log(`register err: ${err}`)
                })
            }
            else {
                res.send({
                    result: 0,
                    msg: "Email đã được đăng ký"
                })
            }
        }).catch(err => {
            console.log(`err ${err}`)
        })


    }
    else {
        res.send({ error: 'topicID is null' })
    }

});
//----upload file
// app.post("/upload", multer({ dest: "./uploads/" }).array("uploads", 12), function (request, res) {
//     const req = request.body
//     if (true) {
//         fs.writeFile('./uploads/' + req.name, decodeBase64Image(req.name, req.data), 'base64', function (err) {
//             console.log(err);
//         });
//     }
// })


function uploadFile(name, dataString) {
    fs.writeFile('./uploads/' + name, decodeBase64Image(dataString), 'base64', function (err) {
        console.log(err);
    });
}

function decodeBase64Image(dataString) {
    let response = {};
    response.data = new Buffer(dataString, 'base64');
    return response.data;
}
//---socket
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
    console.log('Server listening on ' + port);
});
var io = require('socket.io').listen(server);

let users = [];

//============SOCKET================
io.on('connection', function (socket) {

    socket.on('disconnect', function () {
        console.log('user disconnect with id: ' + socket.id);
        users = users.filter(user => user.socketId !== socket.id);
        console.log('online users: ', users);
    });

    setInterval(() => socket.emit('time', new Date().toTimeString()), 10000);

    //ok dc r
    //-----ACK-----
    socket.on('ackMessage', function (params) {
        console.log('message: ', params);

        chatRepo.getListTopic(params)
            .then(value => {
                io.emit('reAckMessage', value);
            })
            .catch(value => {

            })
    });

    socket.on('USER_LOGIN', function (userId) {
        let user = {
            socketId: socket.id,
            userId: userId,
        }
        console.log('USER LOGIN: ', user.socketId, user.userId);
        users.push(user);;
    });

    //-----Chat-----
    socket.on('MESSAGE_FROM_USER', function (msg) {
        let message = JSON.parse(msg);
        //Nhận tin nhắn từ client
        console.log('message from user: ', message);
        let oReceiverIds = message.topicId.split('_');
        let senderId = message.senderId + '';
        console.log('senderId', senderId);
        senderSocketId = users.filter(user => user.userId + '' === senderId)[0].socketId;
        receiverIds = oReceiverIds.filter(userId => userId !== senderId);
        console.log('receiverIds', receiverIds[0]);
        userRepo.getRelationByFriendIdAndUserId(receiverIds, senderId).then(res => {
            if (res.length == 0) {
                userRepo.insertUserAndFriendByID(receiverIds, senderId)
                userRepo.insertUserAndFriendByID(senderId, receiverIds)
            }
            else {
                console.log('Relationship')
            }
        })

        var promises = oReceiverIds.map((receiverId) => {
            return userRepo.searchUserById(parseInt(receiverId))
                .then(value => {
                    return value[0].fullname;
                })
                .catch(err => {
                    console.log(err);
                    res.statusCode = 500;
                    res.end('View error log on server console');
                })
        });

        Promise.all(promises).then(function (results) {
            console.log('results', results);
            //Gửi topic đến client
            let lastMess = message.content;
            if (message.type === 5) {
                lastMess = "Tập tin";
            }
            if (message.type === 2) {
                lastMess = "Hình ảnh"
            }
            let topic = {
                name: results,
                lastMess: lastMess,
                sendTime: message.sendTime,
                topicId: message.topicId,
                hasNewMessage: 1
            }

            //Gửi topic đến client
            chatRepo.getTopic(message.topicId).then(res => {
                if (res.length == 0) {
                    chatRepo.insertTopicIfFirstChat(topic)
                        .then(res => {
                            console.log('insert topic success')
                        }).catch(err => {
                            console.log({ 'Error': err })
                        })
                }
                else {
                    chatRepo.updateTopic(message.topicId, lastMess)
                        .then(res => {
                            console.log('update topic success')
                        }).catch(err => {
                            console.log({ 'Error': err })
                        })

                    chatRepo.insertMessage(message).then(res => {
                        console.log('insert message success')
                    }).catch(err => {
                        console.log(`insert message: ${err}`)
                    })
                }
            })

            receiverIds.map(receiverId => {
                let receiver = users.filter(user => user.userId + '' === receiverId)[0];

                try {
                    io.to(receiver.socketId).emit('TOPIC_FROM_SERVER', JSON.stringify(topic));
                } catch (error) {
                    console.log('TOPIC_FROM_SERVER', error)
                }
            })
            io.to(senderSocketId).emit('TOPIC_FROM_SERVER', JSON.stringify(topic));
        })

        receiverIds.map(receiverId => {
            let receiver = users.filter(user => user.userId + '' === receiverId)[0];
            //Gửi tin nhắn đến client
            try {
                io.to(receiver.socketId).emit('MESSAGE_FROM_SERVER', msg, message.type);
            } catch (error) {
                // console.log('MESSAGE_FROM_SERVER', error) 
            }
        })
    });
})

//============END SOCKET================