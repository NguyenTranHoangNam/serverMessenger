var express = require('express');
var chatRepo = require('../repos/chatRepo');
var userRepo = require('../repos/userRepo');
var utils = require('../utils/Utils');
var router = express.Router();

router.post('/insertTopic', (req, res) => {
    let topic = {
        topicId: req.body.topicId,
        lastMessage: req.body.lastMessage,
        sendTime: req.body.sendTime,
        isRead: req.body.isRead,
    }

    chatRepo.insertTopic(topic)
        .then(value => {
            var message = '';
            var returnCode = 0;
            if (value != null) {
                if (value.insertId > 0) {
                    message = 'insert success';
                    returnCode = 1;
                } else {
                    message = 'insert fail';
                }
            }
            res.statusCode = 200;
            res.json({
                returnCode: returnCode,
                message: message
            })
        })
        .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on server console');
        })
})

router.post('/getListTopic', (req, res) => {
    var userId = req.body.userId;

    chatRepo.getListTopic()
        .then(listTopic => {
            let result = [];
            listTopic.map(topic => {
                var userArray = topic.split('_');
                if (userArray.includes(userId)){
                    result.push(topic);
                }
            })

            res.statusCode = 200;
            if (result.length > 0) {
                res.json({
                    returnCode: 1,
                    message: 'get list topic success',
                    topics: result,
                })
            } else {
                res.json({
                    returnCode: 0,
                    message: 'get list topic fail',
                })
            }

        })
        .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on server console');
        })
})

router.post('/getTopic', (req, res) => {
    var topicId = req.body.topicId;
    chatRepo.getTopic(topicId)
        .then(value => {
            var topic = value;
            res.statusCode = 200;
            if (topic.length > 0){
                var listUserId = topic.topicId.split('_');
                var users = [];
                listUserId.map(userId => {
                    userRepo.searchUserById(userId)
                    .then(value => {
                        var user = {
                            id: value[0].id,
                            name: value[0].fullname,
                            avatar: value[0].avatar,
                        }
                        users.push(user);
                    })
                    .catch(err => {
                        console.log(err);
                        res.statusCode = 500;
                        res.end('View error log on server console');
                    })
                })
                res.json({
                    returnCode: 1,
                    message: 'get topic success',
                    topic: {
                        users: users,
                        lastMess: topic.lastMessage,
                        sendTime: topic.sendTime,
                        topicID: topic.topicId,
                        isRead: topic.isRead,
                    },
                })
            } else {
                res.json({
                    returnCode: 0,
                    message: 'get topic fail',
                })
            }
           
        })
        .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on server console');
        })
})

router.post('/insertMessage', (req, res) => {
    var message = {
        topicId: req.body.topicID, 
        sendTime: req.body.sendTime,
        senderId: req.body.senderId, 
        content: req.body.content,
    }
    chatRepo.insertMessage(message)
        .then(value => {
            var message = '';
            var returnCode = 0;
            if (value != null) {
                if (value.insertId > 0) {
                    message = 'insert success';
                    returnCode = 1;
                } else {
                    message = 'insert fail';
                }
            }
            res.statusCode = 200;
            res.json({
                returnCode: returnCode,
                message: message
            })
        })
        .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on server console');
        })
})


module.exports = router;