<?php
$y;
$x;
$s;
$n;


$n = floatval(readline(''));
$s = 0;
$repeat_end = $n;
for ($count = 0; $count < $repeat_end; $count++) {
  $x = floatval(readline(''));
  $s = $s + $x;
}
print($s);

?>