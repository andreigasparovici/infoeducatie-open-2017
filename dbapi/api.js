const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');

class DbApi {
	constructor(connection) {
		this.connection = connection;
	}

	signupUser(email, password, name, isTeacher) {
		console.log(password);
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT 1 from `users` where `email` = ?',
				[email],
				(err, results, fields) => {
					if(err) {
						return reject(err);
					}
					if(!results.length) {
						this.connection.query(
							'INSERT INTO `users`(email, password, name, is_teacher) VALUES(?, ?, ?, ?)',
							[email, bcrypt.hashSync(password), name, isTeacher],
							(err, results, fields) => {
								if(err) reject(err);
								resolve(results);
							});
					} else {
						console.log(results);
						reject('email taken');
					}
				});
		});
	}

	loginUser(email, password) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT name, is_activated, is_teacher, id, password FROM `users` WHERE `email` = ?',
				[email],
				(err, results, fields) => {
					console.log(JSON.stringify(results[0]));
					if(err) reject(err);

					if(!results || !results.length)
						return reject('No such email!');

					if(bcrypt.compareSync(password, results[0].password)) {
						resolve(results[0]);
					} else {
						reject('Wrong password');
					}
				});
		});
    }

    addCode(xmlCode) {
        return new Promise ((resolve, reject) => {
            this.connection.query(
				'INSERT INTO code_sharing (xml_code) VALUES (?)',
				[xmlCode],
				(err, results, fields) => {
					resolve(results);
				});
        });
    }

    getCodeById(id) {
        return new Promise ((resolve, reject) => {
            this.connection.query(
				'SELECT * FROM code_sharing WHERE id = ?',
				[id],
				(err, results, fields) => {
					resolve(results);
				});
        });
    }

    /// userId - is the id of the author of the lesson
    addLesson(userId, title, content) {
        return new Promise ((resolve, reject) => {
            this.connection.query(
				'INSERT INTO lessons (author, title, content, date_added) VALUES (?, ?, ?, ?)',
				[userId, title, content, (new Date()).toISOString().substring(0, 19).replace('T', ' ')],
				(err, results, fields) => {
					if(err) reject(err);
					resolve(results);
				});
        });
    }
}

module.exports = DbApi;
