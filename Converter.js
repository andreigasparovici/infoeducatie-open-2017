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
    b.edges.push(new Edge(b.id, a.id, t));
}

var parseCursor;
var phpCode;

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
    this.blocks = [];
    parseCursor = 0;
    phpCode = phpText;
    this.blocks.push(new Block("START", "START"));
    addEdge(this.blocks[0], parsePhpCode(phpCode), "EMPTY");
    return phpCode;
}

var parsePhpCode = function() {
    slideWhites();
    if (parseCursor >= phpCode.length)
        return new Block("", "EMPTY");
    if (phpCode[parseCursor] == '$') {
        var expression = getToSemicolon()
        expression = eliminateHolders(expression);
        if (!expression.includes('='))
            return new Block("", "EMPTY");
        return new Block(expression, "operation"); 
    }
}

var phpText = fs.readFileSync('phptestfile.php');
console.log(JSON.stringify(convert(phpText)));