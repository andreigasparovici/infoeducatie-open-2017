var workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')});

var x = function() {
	var code = Blockly.PHP.workspaceToCode(workspace);
	console.log(code);
	return false;
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
