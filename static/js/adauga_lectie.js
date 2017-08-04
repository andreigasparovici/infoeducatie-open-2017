function ensureHTTP (str) {
	return /^https?:\/\//.test(str) && str || `http://${str}`
}
var editor = window.pell.init({
	element: document.getElementById('pell'),
	styleWithCSS: false,
	actions: [
		'bold',
		'underline',
		'italic',
		{
			name: 'image',
			result: function(e) {
				e.preventDefault();
				const url = window.prompt('Enter the image URL');
				if (url) window.pell.exec('insertImage', ensureHTTP(url));
			}
		},
		{
			name: 'link',
			result: function(e) {
				e.preventDefault();
				const url = window.prompt('Enter the link URL');
				if (url) window.pell.exec('createLink', ensureHTTP(url));
			}
		}
	],
	onChange: function (html) {
		//document.getElementById('text-output').innerHTML = html;
		//document.getElementById('html-output').textContent = html;
		Cookies.set('pell_content_1', html);
	}
})

var dialog = document.querySelector('dialog');

var tests = [], testCount = 0;

function createTest(input, output) {
	return [
		"<h5>",
		"Test "+(++testCount),
		"</h5>",
		"<div class='test'>",
		"<textarea class=''>",
		input,
		"</textarea>",
		"<textarea class=''>",
		output,
		"</textarea>",
		"</div>"
	].join("");
}

function addTest(input, output) {
	tests.push({
		input, output
	});
	$("#tests").append(createTest(input, output));
}

if (!dialog.showModal) {
	dialogPolyfill.registerDialog(dialog);
}

window.onload = function() {
	document.getElementById("add_test").onclick = function() {
		dialog.showModal();
	}
	dialog.querySelector('.close').addEventListener('click', function() {
		dialog.close();
		addTest(document.getElementById('input').value, document.getElementById('output').value);
    });
}

document.getElementById("send").onclick = function() {
	var level = document.getElementById('sample1').value;
	var name = document.getElementById("title").value;
	console.log(editor.content.innerHTML);
	$.post('/problema/adauga', {
		text: editor.content.innerHTML,
		level: level,
		tests: JSON.stringify(tests),
		name: name
	}, function(data) {
		console.log(data)
		if(data.success)
			alert('Problem added!');
	});
}
