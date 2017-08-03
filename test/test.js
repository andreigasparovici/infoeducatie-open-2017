const chai = require('chai');
const path = require('path');

let converter = require('../Converter.js');
let flowTranslator = require('../FlowchartTranslator.js');
let SchemeDebug = require('../SchemeDebug.js');

describe('Converter testing', () => {
	describe('Testing graf creation', () => {
        it('Check declaration', () => {
            var text = `$x;
$y;
$x = 12 + 15;
$x = 4 + 3;
$x = $x + 10;
$y = 2*$x + $y;`;
            var rez = converter(text);
            chai.expect(rez[0].type).to.equal("start");
            chai.expect(rez[2].type).to.equal("operation");
            chai.expect(rez[4].expr).to.equal("y = 2*x + y");
            chai.expect(rez[5].expr).to.equal("Stop");
        });

        it('Check print', () => {
            var text = `$x;
$y;
$x = 12 + 15;
print('abc');
$x = $x + 10;
$y = 2*$x + $y;`;
            var rez = converter(text);
            //console.log(rez);
            chai.expect(rez[0].type).to.equal("start");
            chai.expect(rez[rez.length-1].type).to.equal("end");
            chai.expect(rez[2].type).to.equal("inputoutput");
        });
        
        it('Check if', () => {
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
            chai.expect(rez[0].type).to.equal("start");
            chai.expect(rez[rez.length-1].type).to.equal("end");
            chai.expect(rez[2].type).to.equal("condition");
            chai.expect(rez[2].edges.length).to.equal(2);
            chai.expect(rez[4].expr).to.equal("x = 7");
            chai.expect(rez[5].type).to.equal("operation");
        });
        
        it('Check elif', () => {
            var text = `$x;
$y;
$x = 12 + 15;
if ($x == 25) {
  $x = 0;
} else if ($x == 27) {
  $x = 1;
} else {
  $x = 3;
}
if (5 == 0) {
  $y = 4;
}`;
            var rez = converter(text);
            //console.log(flowTranslator(rez));
            chai.expect(rez[0].type).to.equal("start");
            chai.expect(rez[rez.length-1].type).to.equal("end");
            chai.expect(rez[2].type).to.equal("condition");
            chai.expect(rez[4].type).to.equal("condition");
            var cnt = 0;
            for (var i = 0; i < rez.length; i++)
                cnt += (rez[i].type == "end");
            chai.expect(cnt).to.equal(1);
        });
        
        it('Check while', () => {
            var text = `$x;
$y;
$x = 12 + 15;
while ($x < 30) {
  $x = 1 + 1;
}`;
            var rez = converter(text);
            //console.log(JSON.stringify(rez));
            //console.log(flowTranslator(rez));
    
            chai.expect(rez[0].type).to.equal("start");
            chai.expect(rez[rez.length-1].type).to.equal("end");
            chai.expect(rez[2].type).to.equal("condition");
            chai.expect(rez[3].expr).to.equal("x = 1 + 1");
        });
        
          it('Check for', () => {
            var text = `$x;
$i;
for ($i = 15; $i <= 23; $i += 2) {
  if ($x == 3) {
    $x = $x + 1;
  } else {
    $x = $x + 2;
  }
  print('i');
}`;
            var rez = converter(text);
            //console.log(JSON.stringify(rez));
            //console.log(flowTranslator(rez));
            chai.expect(rez[0].type).to.equal("start");
            chai.expect(rez[rez.length-1].type).to.equal("end");
            chai.expect(rez[2].type).to.equal("condition");
            chai.expect(rez[3].type).to.equal("condition");
		});

    });
    
    describe("Testing flow translation", () => {
        it ("Checks simple translation", () => {
            var text = `$x;
$y;
$x = 12 + 15;
$x = 4 + 3;
$x = $x + 10;
$y = 2*$x + $y;`;
            var rez = converter(text);
            var flow = flowTranslator(rez);
            chai.expect(flow).to.contain(`e1=>start: Start
e2=>operation: x = 12 + 15
e3=>operation: x = 4 + 3
e4=>operation: x = x + 10
e5=>operation: y = 2*x + y
e6=>end: Stop`);
        });
    });

    describe("Testing scheme debug", () => {
        it ("Check debug 1", () => {
            var text = `$x;
$y;
$x = 12 + 15;
if ($x == 25) {
  $x = $x + 13;
} else if ($x == 27) {
  $x = 1;
} else {
  $x = 3;
}
if ($x == 1) {
  $y = 4;
  print($x + $y);
}`;
            var rez = converter(text);
            //console.log(flowTranslator(rez));   
            var debug = new SchemeDebug(rez, (data) => {
                //console.log("xd " + data);
                chai.expect(data).to.equal(5);
            });
            debug.next();
            debug.next();
            chai.expect(debug.varValues["x"]).to.equal(27);
            debug.next();
            chai.expect(debug.varValues["x"]).to.equal(27);
            debug.next();
            chai.expect(debug.varValues["x"]).to.equal(27);
            debug.next();
            chai.expect(debug.varValues["x"]).to.equal(1);
            debug.next();
            debug.next();
            chai.expect(debug.varValues["y"]).to.equal(4);
            debug.next();
        });

        it ("Check debug 2", () => {
            var text = `$x;
$y;
$y = 20;
$x = 2*y - 15 - 1;
while ($x < 30) {
  $x = $x + 1;
  print($x);
}`;
            var rez = converter(text), arr = [];
            //console.log(flowTranslator(rez));   
            var debug = new SchemeDebug(rez, (data) => {
                 //console.log("xd " + data);
                 arr.push(data);
                 //chai.expect(data).to.equal(5);
            });
            while (debug.currentBlock) {
                debug.next();
            }
            chai.expect(arr).to.deep.equal([25, 26, 27, 28, 29, 30]);
        });
    });

});