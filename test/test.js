const chai = require('chai');
const path = require('path');

let converter = require('../Converter.js');

describe('Converter testing', () => {
	describe('Testing graf creation', () => {
        it('Check declaration 1', () => {
            var text = `$x;
$y;
$x = 12 + 15;
$x = 4 + 3;
$x = $x + 10;
$y = 2*$x + $y;`;
            var rez = converter(text);
            chai.expect(rez[0].type).to.equal("START");
            chai.expect(rez[2].type).to.equal("operation");
            chai.expect(rez[4].expr).to.equal("y = 2*x + y");
            chai.expect(rez[5].expr).to.equal("STOP");
        });
        
        it('Check if 1', () => {
            var text = `$x;
$x = 12 + 15;
if ($x >= 3) {
  $x = 2 + 5;
} else {
  $x = 7;
}
$x = 3;`;
            var rez = converter(text);
            //console.log(JSON.stringify(rez));
            chai.expect(rez[0].type).to.equal("START");
            chai.expect(rez[rez.length-1].type).to.equal("STOP");
            chai.expect(rez[2].type).to.equal("condition");
            chai.expect(rez[2].edges.length).to.equal(2);
            chai.expect(rez[4].expr).to.equal("x = 7");
            chai.expect(rez[5].type).to.equal("operation");
		});

	});
});