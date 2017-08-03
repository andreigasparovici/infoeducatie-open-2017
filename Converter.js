var fs = require('fs');

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
    blockMap[this.id] = this;
}

var getBlockById = function(id) {
    return blockMap[id];
}

var addEdge = function(a, b, t) {
    if (a == null || b == null || a.id == b.id)
        return;
    a.edges.push(new Edge(a.id, b.id, t));
    //b.edges.push(new Edge(b.id, a.id, t));
}

/**
 * 
 * @param {Block} a 
 * @param {Block} b 
 * @param {String} t 
 */
var addSuccessorEdge = function(a, b, t) {
    /*console.log(a);
    console.log("si");
    console.log(b);*/
    if (a == null || b == null)
        return;
    for (var i = 0; i < a.edges.length; i++) {
        var p = a.edges[i].y;
        var zp = getBlockById(p);
        //console.log(p + " " + JSON.stringify(zp));
        addSuccessorEdge(getBlockById(a.edges[i].y), b, t);
    }
    if (a.edges.length == 0 || (a.edges.length == 1 && a.type == "condition"))
        addEdge(a, b, t);
}

var parseCursor;
var phpCode;
var blocks = [];
var blockMap;
var globalIdCount = 0;

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

var getToParantText = function() {
    var news = "";
    var inpar = 0;
    while (parseCursor < phpCode.length) {
        if (phpCode[parseCursor] == '(')
            inpar++;
        else if (phpCode[parseCursor] == ')') {
            inpar--;
            if (inpar == 0)
                return news;
        }
        else if (inpar == 1)
            news += phpCode[parseCursor];
        parseCursor++;
    }
    return news;
}

var eliminateHolders = function(text) {
    var news = "";
    for (var i = 0; i < text.length; i++)
        if (text[i] != '$')
            news += text[i];
    return news;
}

var goPast = function(c) {
    while (parseCursor < phpCode.length) {
        if (phpCode[parseCursor++] == c)
            return;
    }
}

/// Creates execution graph from php code
var convert = function(phpText) {
    blocks = [];
    globalIdCount = 0;
    parseCursor = 0;
    blockMap = {};
    phpCode = phpText;
    blocks.push(new Block("Start", "start"));
    addEdge(blocks[0], parsePhpCode(), "EMPTY");
    return blocks;
}

var addBlock = function(e, t) {
    var b = new Block(e, t);
    blocks.push(b);
    return b;
}

/**
 * @return null if it is an invalid block
 */
var parsePhpCode = function(runOnce) {
    slideWhites();
    if (phpCode[parseCursor] == '}')
        return null;
    if (parseCursor >= phpCode.length)
        return addBlock("Stop", "end");
    if (phpCode[parseCursor] == '$') {
        var expression = getToSemicolon()
        expression = eliminateHolders(expression);
        var toR;
        if (!expression.includes('='))
            return parsePhpCode();
        else
            toR = addBlock(expression, "operation"); 
        if (!runOnce)
            addEdge(toR, parsePhpCode(), "EMPTY");
        return toR;
    }
    else if (phpCode[parseCursor] == 'i') {
        var expression = getToParantText();
        expression = eliminateHolders(expression);
        goPast('{');
        var toR = addBlock(expression, "condition");
        var DA = parsePhpCode();
        var NU = null;
        addEdge(toR, DA, "DA");
        goPast('}'); parseCursor++;
        if (phpCode[parseCursor] == 'e') {
            parseCursor += 5;
            if (phpCode[parseCursor] == '{') {
                parseCursor++;
                NU = parsePhpCode();
                goPast('}');
            }
            else 
                NU = parsePhpCode(true);
            addEdge(toR, NU, "NU");
        }
        if (!runOnce) {
            var continuation = parsePhpCode();
            addSuccessorEdge(toR, continuation, "EMPTY");
        }
        return toR;
    }
}

//var phpText = fs.readFileSync('phptestfile.php');
//console.log(JSON.stringify(convert(phpText)));

module.exports = convert;