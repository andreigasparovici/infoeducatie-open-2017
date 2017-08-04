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

document.getElementById("adauga").onclick = function() {

};
