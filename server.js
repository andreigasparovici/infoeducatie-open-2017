const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');

const app = express();

require('dotenv').config();

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

function checkAuth(req, res, next) {
	return req.session.user ? next() : res.redirect('/login');
}

app.get('/', (req, res) => {
	if(req.session.user)
		if(!req.session.user.teacher)
			res.render("elev/dashboard");
		else res.render("profesor/dashboard");
	else {
		res.render("anonim/dashboard");
	}
});

app.get('/login', (req, res) => {
	res.render("login");
});

app.get('/signup', (req, res) => {
	res.render("signup");
});

app.get('/lectii', checkAuth, (req, res) => {
	res.render("elev/lectii");
});

app.get('/workspace', checkAuth, (req, res) => {
	res.render("elev/workspace");
});

app.get('/probleme', checkAuth, (req, res) => {
	res.render("elev/probleme");
});

const Converter = require('./Converter.js');
const FlowchartTranslator = require('./FlowchartTranslator.js');

app.post('/schema', (req, res) => {
	let code = req.body.code;
	let sol = FlowchartTranslator(Converter(code));
	res.json({ source:  sol});
});

/*
app.get('/profesor', (req, res) => {
	res.sendFile(path.join(__dirname, 'app', 'profesor.html'));
});

app.get('/profesor/lectii', (req, res) => {

});
*/

app.listen(3000, () => {
	console.log('Server started on port 3000');
});
