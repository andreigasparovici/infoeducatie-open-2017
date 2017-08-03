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

app.post('/schema', (req, res) => {
	res.json({ source: " st=>start: Start:>http://www.google.com[blank]\n e=>end:>http://www.google.com\n op1=>operation: My Operation\n sub1=>subroutine: My Subroutine\n cond=>condition: Yes\n or No?:>http://www.google.com\n io=>inputoutput: catch something...\n st->op1->cond\n cond(yes)->io->e\n cond(no)->sub1(right)->op1 " });
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
