const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static(path.join(__dirname, 'static')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

// ELEV
app.get('/', (req, res) => {
	res.render("elev/dashboard");
});

app.get('/lectii', (req, res) => {
	res.render("elev/lectii");
});

app.get('/workspace', (req, res) => {
	res.render("elev/workspace");
});

app.get('/probleme', (req, res) => {
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
