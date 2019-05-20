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


//----upload file
app.post("/upload", multer({dest: "./uploads/"}).array("uploads", 12), function(request, res) {
    const req = request.body
    if(true){
        fs.writeFile('./uploads/'+ req.name, decodeBase64Image(req.name,req.data), 'base64', function(err) {
            console.log(err);
   });
   
    }
  
function decodeBase64Image(name,dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};
   
    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    res.send({
        response:"Success",
        link:"http://localhost:3000/" + name
    })
    return response.data;
  }
  

});

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
        let senderId = message.user.id + '';
        console.log('senderId', senderId);
        receiverIds = oReceiverIds.filter(userId => userId !== senderId);
        console.log('receiverIds', receiverIds);
        let topicUsers = [];
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
        Promise.all(promises).then(function(results) {
            console.log('results', results);
            receiverIds.map(receiverId => {
                let receiver = users.filter(user => user.userId + '' === receiverId)[0];
                //Gửi topic đến client
                let topic = {
                    name: results,
                    lastMess: message.content,
                    sendTime: message.sendTime,
                    topicId: message.topicId,
                    hasNewMessage: true
                }
                io.to(receiver.socketId).emit('TOPIC_FROM_SERVER', JSON.stringify(topic));
            })
        })
        
        receiverIds.map(receiverId => {
            let receiver = users.filter(user => user.userId + '' === receiverId)[0];
            //Gửi tin nhắn đến client
            io.to(receiver.socketId).emit('MESSAGE_FROM_SERVER', msg);
        })
        // chatRepo.insertMessage(msg)
        //     .then(value => {
        //         console.log(value);
        //         var topic = {
        //             LastMessageSendTime: msg.SendTime,
        //             TopicID: msg.TopicID,
        //             id: msg.TopicID,
        //             VisitorName: msg.VisitorName ? msg.VisitorName : msg.SenderID,
        //             UnreadMessageCount: 0,
        //             ServicerID: msg.ServicerID ? msg.ServicerID : null,
        //             CompanyID: msg.CompanyID
        //         }
        //         //------kiểm tra topic có tổn tại?-------
        //         chatRepo.getTopicInfo(topic)
        //             .then(value => {
        //                 console.log('getTopic', value[0]);
        //                 //-----CÓ: update
        //                 if (value[0] != undefined) {
        //                     chatRepo.updateTopic(topic)
        //                         .then(value => {
        //                             console.log('updateTopic', value);
        //                             // io.emit('chat message', msg);
        //                         })
        //                         .catch(error => {
        //                             console.log(error);
        //                         })
        //                     //-----KHÔNG: insert
        //                 } else {
        //                     chatRepo.insertTopic(topic)
        //                         .then(value => {
        //                             console.log('insertTopic', value);
        //                             // io.emit('chat message', msg);
        //                         })
        //                         .catch(error => {
        //                             console.log(error);
        //                         })
        //                 }
        //             })
        //             .catch(error => {
        //                 console.log(error);
        //             })
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     });
    });
})

//============END SOCKET================