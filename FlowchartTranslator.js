const util = require("util");

/**
 * Returns diagram blob equivalent to block
 * @param {Block} block 
 */
var generateDeclaration = function(block) {
    return util.format("%s=>%s: %s", block.id, block.type, block.expr);
}

/**
 * 
 * @param {Block[]} diagramGraph 
 */
var createCodeDefinion = function(diagramGraph) {
    var code = "";
    for (var i = 0; i < diagramGraph.length; i++) {
        code += generateDeclaration(diagramGraph[i]) + "\n";
    }
    code += "\n";
    for (var i = 0; i < diagramGraph.length; i++) {
        for (var j = 0; j < diagramGraph[i].edges.length; j++) {
            var edge = diagramGraph[i].edges[j];
            if (edge.type == "EMPTY" || edge.type == "JUMP") {
                code += edge.x + "->" + edge.y + "\n";
            }
            else if (edge.type == "DA") {
                code += edge.x + "(yes)->" + edge.y + "\n"; 
            }
            else if (edge.type == "NU") {
                code += edge.x + "(no)->" + edge.y + "\n";
            }
        }
    }
    return code;
}

module.exports = createCodeDefinion;