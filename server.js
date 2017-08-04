const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const session = require('express-session');
const flash = require('express-flash');
const bcrypt = require('bcrypt-nodejs');

const dbConnection = require('./dbapi/connection.js');
const DbApi = require('./dbapi/api.js');

const Converter = require('./Converter.js');

let dbApi = new DbApi(dbConnection);

const app = express();
let SchemeDebug = require('./SchemeDebug.js');

let http_server = http.Server(app);

let io = socketio(http_server);

let debuggerInstances = {};

app.use(express.static(path.join(__dirname, 'static')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(flash());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

const child_process = require('child_process');
const fs = require('fs');

io.on('connection', (socket) => {
	console.log('A user connected with id ',socket.id);
	socket.on("debug", (phpCode) => {
		var rez = Converter(phpCode);
		debuggerInstances[socket.id] = new SchemeDebug(rez, (data) => {
			console.log(socket.id + ": " + data);
			socket.emit("debug_output", data);
		});
		socket.emit("highlight", {high: debuggerInstances[socket.id].getHighId(), 
			flag: debuggerInstances[socket.id].flagRead});
	});

	socket.on("step", () => {
		debuggerInstances[socket.id].flagRead = null;
		debuggerInstances[socket.id].next();
		socket.emit("highlight", {high: debuggerInstances[socket.id].getHighId(), 
			flag: debuggerInstances[socket.id].flagRead});
	});

	socket.on("read_variable", (data) => {
		debuggerInstances[socket.id].varValues[data.expr] = parseInt(data.value);
	});
});

function checkAuth(req, res, next) {
	return req.session.user ? next() : res.redirect('/login');
}

function checkIfTeacher(req, res, next) {
	return req.session.user.is_teacher ? next() : res.send('Nu aveţi permisiuni pentru a accesa pagina!');
}

app.get('/', (req, res) => {
	if(req.session.user)
		if(!req.session.user.is_teacher) {
			dbApi.getLatestLessons(3)
				.then(lessons => {
					dbApi.getLatestProblems(3)
						.then(problems => {
							res.render("elev/dashboard", {
								user: req.session.user,
								lessons,
								problems
							});
						});
					});
		} else {
			dbApi.getLatestLessons(3)
				.then(lessons => {
					dbApi.getLatestProblems(3)
						.then(problems => {
							res.render("profesor/dashboard", {
								user: req.session.user,
								lessons,
								problems
							});
						});
				});
		}
	else {
		res.render("anonim/dashboard");
	}
});

app.get('/login', (req, res) => {
	res.render("login");
});

app.post('/login', (req, res) => {
	if(!req.body.email) {
		req.flash('error', 'Adresă de e-mail invalidă!');
		return res.redirect('/login');
	}

	if(!req.body.password) {
		req.flash('error', 'Parolă invalidă!');
		return res.redirect('/login');
	}

	dbApi.loginUser(req.body.email, req.body.password)
		.then((result) => {
			if(result.is_teacher && !result.is_activated) {
				req.flash('error', 'Contul aşteaptă aprobare de la un moderator');
				return res.redirect('/login');
			}
			req.session.user = {
				email: req.body.email,
				name: result.name,
				id: result.id,
				is_teacher: result.is_teacher
			};
			return res.redirect('/');
		})
		.catch((err) => {
			req.flash('error', 'Date de autentificare incorecte!');
			return res.redirect('/login');
		});
});

app.get('/signup', (req, res) => {
	res.render("signup");
});

app.post('/signup', (req, res) => {
	if(!req.body.name) {
		req.flash('error', 'Nume invalid!');
		return res.redirect('/signup');
	}

	if(!req.body.email) {
		req.flash('error', 'Email invalid!');
		return res.redirect('/signup');
	}

	if(!req.body.password) {
		req.flash('error', 'Parolă invalidă');
		return res.redirect('/signup');
	}

	if(req.body.password_confirm != req.body.password) {
		req.flash('error', 'Parola trebuie confirmată');
		return res.redirect('/signup');
	}

	dbApi.signupUser(req.body.email,
		req.body.password,
		req.body.name,
		req.body.is_teacher == "on" ? true : false)
		.then(() => {
			req.flash('email', req.body.email);
			return res.redirect('/login');
		})
		.catch((err) => {
			console.log(err);
			req.flash('error', 'Adresa de e-mail nu este disponibilă!');
			return res.redirect('/signup');
		});
});

app.get('/logout', (req, res) => {
	req.session.user = undefined;
	res.redirect('/');
});

app.get('/lectii', checkAuth, (req, res) => {
	dbApi.getAllLessons()
		.then(lessons => {
			res.render("elev/lectii", {
				lessons
			});
		});
});


app.get('/lectie/adauga', checkAuth, checkIfTeacher, (req, res) => {
	res.render("profesor/adauga_lectie");
});

app.post('/lectie/adauga', checkAuth, checkIfTeacher, (req, res) => {
	dbApi.addLesson(req.session.user.id, req.body.name, req.body.content)
		.then(() => {
			console.log('Success adding lesson');
			res.json({
				success: true
			});
		})
		.catch((err) => {
			console.log(err);
		});
	;
});

app.get('/lectie/:id', checkAuth, (req, res) => {
	dbApi.getLessonById(req.params.id)
		.then(lessons => {
			if(!lessons.length)
				return res.send("Lecţie negăsită");
			res.render("elev/lectie", {
				user: req.session.user,
				lesson: lessons[0]
			});
		});
});

app.get('/problema/adauga', checkAuth, checkIfTeacher, (req, res) => {
	res.render("profesor/adauga_problema");
});

app.post('/problema/adauga', (req, res) => {
	dbApi.addProblem(req.body.name, req.body.text, req.body.level)
		.then((data) => {
			let problemId = data.insertId;
			dbApi.addTests(problemId, JSON.parse(req.body.tests))
				.then(data => {
					res.json({success: true});
				});
		});
});

app.get('/problema/:id', (req, res) => {
	dbApi.getProblemById(req.params.id)
		.then(data => {
			if(!data || !data.length)
				return res.send("Problemă negăsită!");
			res.render("problema", {
				data: data[0],
				user: req.session.user
			});
		});
});

app.get('/problema/:id/rezolva', checkAuth, (req, res) => {
	res.render("elev/rezolva", {
		problema: req.params.id
	});
});

app.post('/submit', checkAuth, (req, res) => {
	console.log(req.body);
	var problema = req.body.id;
	var code = req.body.code;

	fs.writeFileSync(__dirname + '/code.php', "<?php\n"+code+"\n?>");

	var passedTests = 0;
	var totalTests = 0;

	dbApi.getAllTestFromProblem(problema)
		.then(data=>{
			console.log(JSON.stringify(data));
			data.forEach(function(item) {
				++totalTests;
				var result = child_process.execSync("php code.php", {
					input: item.input.split(' ').join('\n'),
					timeout: 2000
				}).toString();
				console.log(result.toString());
				if(result == item.output) {
					++passedTests;
				}
			});
			res.json({
				passed: passedTests,
				total: totalTests
			});
		});
});

app.get('/workspace', checkAuth, (req, res) => {
	res.render("elev/workspace");
});

app.get('/workspace/:id', checkAuth, (req, res) => {
	dbApi.getCodeById(req.params.id)
		.then(data => {
		res.render("elev/workspace", { data: data.xml_code });
	});
});

app.get('/probleme', checkAuth, (req, res) => {
	dbApi.getAllProblems()
		.then(problems => {
			res.render("elev/probleme", {
				problems
			});
		});
});


const FlowchartTranslator = require('./FlowchartTranslator.js');

app.post('/schema', (req, res) => {
	let code = req.body.code;
	let sol = FlowchartTranslator(Converter(code));
	res.json({ source:  sol});
});

app.post('/save', (req, res) => {
	dbApi.addCode(req.body.xml)
		.then(result => {
			res.json({
				'url' : '/workspace/'+result.insertId
			});
		});
});


http_server.listen(3000, () => {
	console.log('Server started on port 3000');
});
