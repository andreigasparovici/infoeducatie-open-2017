var fs = require('fs');
var globalIdCount = 0;

/// Edge between i and j with type t
var Edge = function(i, j, t) {
    this.x = i;
    this.y = j;
    this.type = t; /// DA, NU, EMPTY
}

var Block = function(e, t) {
    this.expr = e;
    this.type = t;
    this.id = "e" + (++globalIdCount);
    this.edges = [];
}

var addEdge = function(a, b, t) {
    a.edges.push(new Edge(a.id, b.id, t));
    //b.edges.push(new Edge(b.id, a.id, t));
}

var parseCursor;
var phpCode;
var blocks = [];

var isWhite = function(c) {
    if (c == ' ' || c == '\t' || c == '\n')
        return true;
    return false;
}

var slideWhites = function() {
    while (parseCursor < phpCode.length && isWhite(phpCode[parseCursor]))
        parseCursor++;
}

var getToSemicolon = function() {
    var news = "";
    while (parseCursor < phpCode.length && phpCode[parseCursor] != ';')
        news += phpCode[parseCursor++];
    parseCursor++;
    return news;
}

var eliminateHolders = function(text) {
    var news = "";
    for (var i = 0; i < text.length; i++)
        if (text[i] != '$')
            news += text[i];
    return news;
}

/// Creates execution graph from php code
var convert = function(phpText) {
    blocks = [];
    parseCursor = 0;
    phpCode = phpText;
    blocks.push(new Block("START", "START"));
    addEdge(blocks[0], parsePhpCode(), "EMPTY");
    return blocks;
}

var addBlock = function(e, t) {
    var b = new Block(e, t);
    blocks.push(b);
    return b;
}

var parsePhpCode = function() {
    slideWhites();
    if (parseCursor >= phpCode.length)
        return addBlock("STOP", "STOP");
    if (phpCode[parseCursor] == '$') {
        var expression = getToSemicolon()
        expression = eliminateHolders(expression);
        var toR;
        if (!expression.includes('='))
            return parsePhpCode();
        else
            toR = addBlock(expression, "operation"); 
        addEdge(toR, parsePhpCode(), "EMPTY");
        return toR;
    }
}

//var phpText = fs.readFileSync('phptestfile.php');
//console.log(JSON.stringify(convert(phpText)));

module.exports = convert;