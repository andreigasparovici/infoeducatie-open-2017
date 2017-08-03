var fs = require('fs');

var convert = function(phpText) {
    return phpText;
}

var phpText = fs.readFileSync('phptestfile.php');
console.log(JSON.stringify(convert(phpText)));