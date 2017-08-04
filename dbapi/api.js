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

	getLatestLessons(limit) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT * FROM lessons ORDER BY date_added DESC LIMIT ?',
				[limit],
				(err, results, fields) => {
					if(err) reject(err);
					resolve(results);
				});
		});
	}

	getLessonById(lessonId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT * FROM lessons WHERE id = ?',
				[lessonId],
				(err, results, fields) => {
					if(err) reject(err);
					resolve(results);
				});
		});
	}

	getAllLessons() {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT * FROM lessons',
				[],
				(err, results, fields) => {
					if(err) reject(err);
					resolve(results);
				});
		});
	}

	addProblem(name, text, level) {
		console.log('text',text);
		console.log('level', level);
		return new Promise ((resolve, reject) => {
            this.connection.query(
				'INSERT INTO problems (name, text, level, date_added) VALUES (?, ?, ?, ?)',
				[name, text, level, (new Date()).toISOString().substring(0, 19).replace('T', ' ')],
				(err, results, fields) => {
					resolve(results);
				});
        });
	}

	getProblemById(id) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT * FROM problems WHERE id = ?',
				[id],
				(err, results, fields) => {
					resolve(results);
				});
		});
	}

	getLatestProblems(limit) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT * FROM problems ORDER BY date_added DESC LIMIT ?',
				[limit],
				(err, results, fields) => {
					if(err) reject(err);
					resolve(results);
				});
		});
	}

	getAllProblems() {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT * FROM problems',
				[],
				(err, results, fields) => {
					resolve(results);
				});
		});
	}

	getProblemsByRegex(regex) {
		return new Promise((resolve, reject) => {
			regex = '%' + regex + '%';
			this.connection.query(
				'SELECT * FROM problems WHERE text LIKE ?',
				[regex],
				(err, results, fields) => {
					resolve(results);
				});
		});
	}

	/**
	 * Adds multiple test to some problem
	 * @param {number} problemId
	 * @param {Object[]} tests - The tests to be added.
	 * @param {string} tests[].input - The line of the test
	 * @param {string} tests[].output - The expected output of the test
	 */
	addTests(problemId, tests) {
		return new Promise((resolve, reject) => {
			var values = [];
			for (var i = 0; i < tests.length; i++) {
				var value = [problemId, tests[i].input, tests[i].output];
				values.push(value);
			}
			this.connection.query(
				"INSERT INTO tests (problem_id, input, output) VALUES ?",
				[values],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	getAllTestFromProblem(problemId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				"SELECT id, input, output FROM tests WHERE problem_id = ?",
				[problemId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	checkCorrectAnswers(problemId, answers) {
		return new Promise((resolve, reject) => {
			var response = [];
			this.getAllTestFromProblem(problemId).then((data) => {
				for (var i = 0; i < data.length; i++) {
					if (answers[data[i].id].output.trim() == data[i].output.trim())
						response.push({id: data[i].id, correct:true});
				}
				resolve(response);
			});
		});
	}
}

module.exports = DbApi;
