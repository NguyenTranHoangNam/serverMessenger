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
