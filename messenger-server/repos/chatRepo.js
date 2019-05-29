var db = require('../fn/mysql-db');

exports.insertTopic = function(topic){
    var sql = `insert into topic(topicId, latsMessage, sendTime, isRead) values('${topic.topicId}', '${topic.lastMessage}', '${topic.sendTime}', '0')`;
    return db.write(sql);
}

exports.getListTopic = function(){
    var sql = `select * from topic t`;
	return db.load(sql);
}

exports.getTopic = function(topicId){
    var sql = `select * from topic t where t.topicId = '${topicId}'`;
	return db.load(sql);
}

exports.updateTopic = function(topicId, lastMess){
    var sql = "update topic set lastMess = '" + lastMess + "' where topicId = '" + topicId + "'";
    return db.load(sql);
}

exports.insertMessage = function(message){
    var sql = `insert into message(topicId, sendTime, status, senderId, content, photoURL, downloadURL, filename, type) values('${message.topicId}', '${message.sendTime}', '1', '${message.senderId}', '${message.content}', '${message.photoURL}', '${message.downloadURL}', '${message.filename}', '${message.type}')`;
    return db.load(sql);
}

exports.getTopicByUserID = function(userId){
    var sql = `select * from topic t`
	return db.load(sql);
}

exports.getMessageByTopicID = function(topicId){
    var sql = `SELECT * from message m where m.topicId = '${topicId}'`
	return db.load(sql);
}
exports.insertTopicIfFirstChat = function(topic){
    topic.name = JSON.stringify(topic.name);
    var sql = `insert into topic(topicId, lastMess, sendTime,name, hasNewMessage) values('${topic.topicId}', '${topic.lastMess}', '${topic.sendTime}', '${topic.name}','${topic.hasNewMessage}')`;
    return db.load(sql);
}