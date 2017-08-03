var SDebugger = function(bs) {
    this.blocks = bs;
    this.currentBlock = bs[0];
    this.varValues = {};
    this.blockMap = {};
    for (var i = 0; i < bs.length; i++)
        blockMap[bs[i].id] = bs[i];
}

SDebugger.prototype.processState = function(block) {

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
    var rez = this.processState(currentBlock);
    if (this.currentBlock.type == "condition") {
        if (rez == 0)
            this.currentBlock = badNextBlock(this.currentBlock);
        else
            this.currentBlock = nextGoodBlock(this.currentBlock);
    }
}

SDebugger.prototype.getHighId = function() {
    if (this.currentBlock)
        return this.currentBlock.id;
    return -1;
}