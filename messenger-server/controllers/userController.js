
var utils = require('../utils/Utils');
var express = require('express');
var userRepo = require('../repos/userRepo');
var router = express.Router();

router.post('/login', (req, res) => {
    var u = {
        email: req.body.email,
        password: req.body.password
    }
    userRepo.login(u)
        .then(value => {
            console.log(value[0]);
            var user = value[0];
            var message = '';
            var returnCode = 0;
            res.statusCode = 200;
            if (user != undefined) {
                message = 'login success';
                returnCode = 1;
                res.json({
                    returnCode: returnCode,
                    message: message,
                    user: {
                        fullname: user.fullname,
                        id: user.id,
                        avatar: user.avatar,
                    }
                })
            } else {
                message = 'login fail';
                res.json({
                    returnCode: returnCode,
                    message: message,
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on server console');
        })
})

router.post('/register', (req, res) => {
    var u = {
        email: req.body.email,
        password: req.body.password,
        fullname: req.body.fullname,
    }
    userRepo.register(u)
        .then(value => {
            var message = '';
            var returnCode = 0;
            if (value != null) {
                if (value.insertId > 0) {
                    message = 'register success';
                    returnCode = 1;
                } else {
                    message = 'register fail';
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

router.post('/searchUser', (req, res) => {
    let email = req.body.email;
    userRepo.searchUser(email)
    .then(value => {
        console.log(value);
        var users = [];
        value.map(user => {
            let u = {
                fullname: user.fullname,
                id: user.id,
                avatar: user.avatar,
            }
            users.push(u);
        });
        var message = '';
        var returnCode = 0;
        res.statusCode = 200;
        if (users.length > 0) {
            message = 'search success';
            returnCode = 1;
            res.json({
                returnCode: returnCode,
                message: message,
                users: users
            })
        } else {
            message = 'search fail';
            res.json({
                returnCode: returnCode,
                message: message,
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.statusCode = 500;
        res.end('View error log on server console');
    })
})

module.exports = router;