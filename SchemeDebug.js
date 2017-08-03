var SDebugger = function(bs, outS) {
    this.blocks = bs;
    this.currentBlock = bs[0];
    this.varValues = {};
    this.blockMap = {};
    this.ouputSubscriber = outS;
    for (var i = 0; i < bs.length; i++)
        this.blockMap[bs[i].id] = bs[i];
}

SDebugger.prototype.evaluate = function(arithmetic) {
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
        console.log(varName + " w become " + arithmetic);
    }
    else if (block.type == "condition") {
        return this.evaluate(block.expr.trim());
    }
    else if (block.type == "inputoutput") {
        if (block.expr[0] == 's') {
            /// scriere
            var txt = "", pos = 0;
            while (block.expr[pos] != ' ')
                pos++;
            for (pos = pos+1; pos < block.expr.length; pos++)
                txt += block.expr[pos];
            txt = txt.trim();
            this.onOutput(this.evaluate(txt)); /// this includes character types !!!
        }
        else {
            /// citire
        }
    }
}

SDebugger.prototype.onOutput = function(output) {
    if (this.ouputSubscriber)
        this.ouputSubscriber(output);
    console.log("c: " + output);
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
            this.currentBlock = this.badNextBlock(this.currentBlock);
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