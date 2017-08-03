const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('app'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.listen(3000, () => {
	console.log('Server started on port 3000');
});
