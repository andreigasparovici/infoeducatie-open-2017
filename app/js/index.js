var workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')});
function exportCode(e) {
	e.preventDefault();
	var code = Blockly.JavaScript.workspaceToCode(workspace);
	console.log(code);
}

function getXml(workspace) {
	return Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
}

// Add change event for persistence

workspace.addChangeListener(function(event) {
	if (event.type == Blockly.Events.CHANGE &&
		!event.oldValue && event.newValue) {
		Cookies.set('blocky_xml', getXml(workspace));
	}
});

window.addEventListener('load', function(event) {
	if(Cookies.get('blocky_xml')) {
		var xml = Blockly.Xml.textToDom(Cookies.get('blocky_xml'));
		Blockly.Xml.domToWorkspace(xml, workspace);
	}
});
