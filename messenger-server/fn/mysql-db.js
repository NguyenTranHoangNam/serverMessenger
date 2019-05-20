var mysql = require('mysql');

exports.load = function(sql) {
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection({
            host: 'us-cdbr-iron-east-03.cleardb.net',
            port: '3306',
            user: 'b4365d18a732e1',
            password: '7ea1ae13',
            database: 'heroku_b5b9a760242b4e1'
        });

        connection.connect();

        connection.query(sql, (error, results, fields) => {
            if (error)
                reject(error);
            else resolve(results);

            connection.end();
        });
    });
}

exports.write = function(sql) {
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection({
            host: 'us-cdbr-iron-east-01.cleardb.net',
            port: '3306',
            user: 'b375cdf9dcedd3',
            password: 'ae0a1f00',
            database: 'heroku_ae446112e19ccfa'

            // host: '127.0.0.1',
            // port: '3306',
            // user: 'root',
            // password: '',
            // database: 'website_tuvan'

        });

        connection.connect();

        connection.query(sql, (error, results) => {
            if (error)
                reject(error);
            else resolve(results);

            connection.end();
        });
    });
}