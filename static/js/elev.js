var workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')});

function getPhpCode() {
	return Blockly.PHP.workspaceToCode(workspace);
}

function getXml(workspace) {
	return Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
}

// Add change event for persistence

workspace.addChangeListener(function(event) {
	Cookies.set('blocky_xml', getXml(workspace));
});

window.onload = function(event) {
	if(Cookies.get('blocky_xml')) {
		var xml = Blockly.Xml.textToDom(Cookies.get('blocky_xml'));
		Blockly.Xml.domToWorkspace(xml, workspace);
	}
};

document.getElementById("generate_schema").onclick = function() {
	$.post('/schema', {
		code: getPhpCode()
	}, function(data) {
		$('#diagram').html('');
		var diagram = flowchart.parse(data);
		diagram.drawSVG('diagram');
	});
};

document.getElementById("debug").onclick = function() {

}

document.getElementById("step").onclick = function() {
	socket.emit()
	console.log("step");
}

document.getElementById("submit").onclick = function() {
	$.post('/submit', {
		code: getPhpCode(),
		id: problem_id
	}, function(data) {
		alert('Ai obţinut ' + data.passed +' puncte din ' +data.total);
	});
};
