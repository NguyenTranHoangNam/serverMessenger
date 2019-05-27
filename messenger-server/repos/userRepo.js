var db = require('../fn/mysql-db');

exports.login = function(u) {
    var sql = `select * from user u where u.email = '${u.email}' and u.password = '${u.password}'`;
	return db.load(sql);
}

exports.register = function(u) {
    var sql = `insert into user(fullname, email, avatar, password)
                values('${u.fullname}', '${u.email}', '${u.avatar}',  '${u.password}'`;
    return db.write(sql);
}

exports.searchUser = function(email) {
    var sql = `SELECT * FROM user u WHERE u.email LIKE '%${email}%'`;
    return db.load(sql);
}

exports.searchUserById = function(id) {
    var sql = `SELECT * FROM user u WHERE u.id = '${id}'`;
    return db.load(sql);
}

exports.insertUserAndFriendByID = function(userID,friendID) {
    var sql = `INSERT into friends(user,friend_id) VALUES(${userID},${friendID})`;
    return db.load(sql);
}

exports.getRelationByFriendIdAndUserId = function(userID,friendID) {
    var sql = `SELECT * FROM friends f WHERE f.user = '${userID}' and f.friend_id = '${friendID}'`;
    return db.load(sql);
}

exports.getGetByUserId = function(userID) {
    var sql = `SELECT * from friends, user WHERE friends.user = '${userID}' and user.id = friends.friend_id`;
    return db.load(sql);
}