const chai = require('chai');
const path = require('path');

let converter = require('../Converter.js');

describe('Converter testing', () => {
	describe('Testing declarations', () => {
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
	});
});