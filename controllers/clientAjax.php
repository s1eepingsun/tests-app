<?php
require_once("../classes/TestsDB.php");
$testsDB = new TestsDB(); 

// $testsDB::$file =  '../test-data/math1.json';
$testsDB::$file =   '../test-data/math1.json';
$data = $testsDB->getTestsData();
echo $data;