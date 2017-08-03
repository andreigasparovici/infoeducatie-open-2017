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
    this.id = ++globalIdCount;
    this.edges = [];
}

var addEdge = function(a, b, t) {
    a.edges.push(new Edge(a.id, b.id, t));
    b.edges.push(new Edge(b.id, a.id, t));
}

var parseCursor;

var convert = function(phpText) {
    this.blocks = [];
    parseCursor = 0;
    this.blocks.push(new Block("START", "START"));
    addEdge(this.blocks[0], parsePhpCode(phpText), "EMPTY");
    return phpText;
}

var parsePhpCode = function(phpText) {
    
}

var phpText = fs.readFileSync('phptestfile.php');
console.log(JSON.stringify(convert(phpText)));