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
	socket.emit("debug", getPhpCode());
}

document.getElementById("step").onclick = function() {
	socket.emit("step");
	console.log("step");
}
try{
	document.getElementById("submit").onclick = function() {
		$.post('/submit', {
			code: getPhpCode(),
			id: problem_id
		}, function(data) {
			alert('Ai obţinut ' + data.passed +' puncte din ' +data.total);
		});
	};
}catch(e) {
	console.log('Mi se fâlfâie');
}

var currentHighlight = null;
socket.on("highlight", function(data) {
	if (data.flag != null) {
		var x = prompt(data.flag + " = ?");
		socket.emit("read_variable", {expr: data.flag, value: x});
	}
	changeHighlight(data.high);
});

socket.on("debug_output", function(data) {
	alert(data);
});

var changeHighlight = function(id) {
	console.log(id);
	if (currentHighlight != null) {
		$("#" + currentHighlight).attr('fill', "#ffffff");
	}
	$("#" + id).attr('fill', "#ff0000");
	currentHighlight = id;
}

try {
	document.getElementById("save").onclick = function() {
		$.post('/save', {
			xml: getXml(workspace)
		}, function(data) {
			alert('Code saved to '+data.url);
		});
	}
}catch(e) { }
