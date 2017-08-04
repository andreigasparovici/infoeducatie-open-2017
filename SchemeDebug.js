var SDebugger = function(bs, outS) {
	this.blocks = bs;
	this.currentBlock = bs[0];
	this.varValues = {};
	this.blockMap = {};
	this.outputSubscriber = outS;
	this.flagRead = null;
	for (var i = 0; i < bs.length; i++)
		this.blockMap[bs[i].id] = bs[i];
}

var lookup = function(arithmetic, st, dr, arr) {
	var inpar = 0, inghi = 0;
	for (var i = dr; i >= st; i--) {
		if (arithmetic[i] == ')')
			inpar++;
		if (arithmetic[i] == '(')
			inpar--;
		if (arithmetic[i] == '\'')
			inghi = !inghi;
		if (inpar == 0 && inghi == 0) {
			for (var j = 0; j < arr.length; j++)
				if (arithmetic[i] == arr[j])
					return i;
		}
	}
	return -1;
}

SDebugger.prototype.evaluate = function(arithmetic, st, dr) {
	var pos;
	if (!st) st = 0;
	if (dr == undefined) dr = arithmetic.length-1;
	//console.log(arithmetic + " " + st + " " + dr);
	if (st > dr)
		return 0;
	while (arithmetic[st] == ' ') st++;
	while (arithmetic[dr] == ' ') dr--;
	if ((pos = lookup(arithmetic, st, dr, ['+', '-'])) != -1) {
		if (arithmetic[pos] == '+')
			return this.evaluate(arithmetic, st, pos-1) + this.evaluate(arithmetic, pos+1, dr);
		else
			return this.evaluate(arithmetic, st, pos-1) - this.evaluate(arithmetic, pos+1, dr);
	}
	if ((pos = lookup(arithmetic, st, dr, ['*', '/'])) != -1) {
		if (arithmetic[pos] == '*') {
			return this.evaluate(arithmetic, st, pos-1) * this.evaluate(arithmetic, pos+1, dr);
		}
		else
			return this.evaluate(arithmetic, st, pos-1) / this.evaluate(arithmetic, pos+1, dr);
	}
	var inpar = 0, inghi = 0;
	for (var i = dr; i >= st; i--) {
		if (arithmetic[i] == ')')
			inpar++;
		if (arithmetic[i] == '(')
			inpar--;
		if (arithmetic[i] == '\'') {
			inghi = !inghi;
		}
		if (inpar == 0 && inghi == 0) {
			if (arithmetic[i] == '<')
				return this.evaluate(arithmetic, st, i-1) < this.evaluate(arithmetic, i+1, dr);
			if (arithmetic[i] == '>')
				return this.evaluate(arithmetic, st, i-1) > this.evaluate(arithmetic, i+1, dr);
			if (arithmetic[i] == '=') {
				if (arithmetic[i-1] == '=')
					return this.evaluate(arithmetic, st, i-2) == this.evaluate(arithmetic, i+1, dr);
				if (arithmetic[i-1] == '<')
					return this.evaluate(arithmetic, st, i-2) <= this.evaluate(arithmetic, i+1, dr);
				if (arithmetic[i-1] == '>')
					return this.evaluate(arithmetic, st, i-2) >= this.evaluate(arithmetic, i+1, dr);
			}
		}
	}
	if (arithmetic[st] == '(' && arithmetic[dr] == ')')
		return eval(arithmetic, st+1, dr-1);
	if (arithmetic[st] == '\'' && arithmetic[dr] == '\'')
		return arithmetic.substr(st+1, dr-st-1);
	var rest = "";
	for (var i = st; i <= dr; i++)
		rest += arithmetic[i];
	if (rest[0] >= '0' && rest[0] <= '9') {
		return parseInt(rest);
	}
	if (this.varValues[rest] != undefined)
		return this.varValues[rest];
	console.log("ERROR at " + arithmetic);
	return 10;
}

SDebugger.prototype.processState = function(block) {
	var expression = block.expr;
	if (block.type == "start" || block.type == "end")
		return 1;
	if (block.type == "operation") {
		var varName = "", pos = 0;
		while (pos < expression.length && expression[pos] != '=')
			varName += expression[pos++];
		varName = varName.trim();
		var arithmetic = "";
		for (pos = pos+1; pos < expression.length; pos++)
			arithmetic += expression[pos];
		arithmetic = arithmetic.trim();
		this.varValues[varName] = this.evaluate(arithmetic);
		//console.log(varName + " received " + this.varValues[varName]);
	}
	else if (block.type == "condition") {
		return this.evaluate(block.expr.trim());
	}
	else if (block.type == "inputoutput") {
		if (block.expr[0] == 's') {
			//console.log(block.expr);
			var txt = "", pos = 0;
			while (block.expr[pos] != ' ')
				pos++;
			for (pos = pos+1; pos < block.expr.length; pos++)
				txt += block.expr[pos];
			txt = txt.trim();
			this.onOutput(this.evaluate(txt)); /// this includes character types !!!
		}
		else {
			var txt = "", pos = 0;
			while (block.expr[pos] != ' ')
				pos++;
			for (pos = pos+1; pos < block.expr.length; pos++)
				txt += block.expr[pos];
			txt = txt.trim();
			this.flagRead = txt;
		}
	}
}

SDebugger.prototype.onOutput = function(output) {
	if (this.outputSubscriber)
		this.outputSubscriber(output);
	//console.log("c: " + output);
}

SDebugger.prototype.nextBadBlock = function(block) {
	if (block.edges.length < 2) {
		console.log("ERROR");
	}
	if (block.edges[0].type == "NU")
		return this.blockMap[block.edges[0].y];
	else
		return this.blockMap[block.edges[1].y];
}

SDebugger.prototype.nextGoodBlock = function(block) {
	if (block.edges.length < 2) {
		console.log("ERROR");
	}
	if (block.edges[0].type == "DA")
		return this.blockMap[block.edges[0].y];
	else
		return this.blockMap[block.edges[1].y];
}

SDebugger.prototype.next = function() {
	if (!this.currentBlock)
		return;
	var rez = this.processState(this.currentBlock);
	if (this.currentBlock.type == "condition") {
		if (rez == 0)
			this.currentBlock = this.nextBadBlock(this.currentBlock);
		else
			this.currentBlock = this.nextGoodBlock(this.currentBlock);
	}
	else if (this.currentBlock.type == "end") {
		this.currentBlock = null;
	}
	else 
		this.currentBlock = this.blockMap[this.currentBlock.edges[0].y];
}

SDebugger.prototype.getHighId = function() {
	if (this.currentBlock)
		return this.currentBlock.id;
	return -1;
}

module.exports = SDebugger;