<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("classes/TestsDB.php");

//получить данные теста
$testsDB = new TestsDB();
$testsDB::$file =   'test-data/math1.json';

$testData = $testsDB->getTestsData();
$testData = json_decode($testData, true);

$testData['tasks'] = array_values($testData['tasks']);

//helper: первая заглавная буква для utf-8 строки
function mb_ucfirst($text) {
    return mb_strtoupper(mb_substr($text, 0, 1)) . mb_substr($text, 1);
}

//set view_number & max_points
foreach($testData['tasks'] as $key => $task) {
    $testData['tasks'][$key]['view_number'] = $key + 1 ;

    $testData['tasks'][$key]['type'] = mb_ucfirst($task['type']) ;

    $taskPoints = 0;
    foreach($task['answer_points'] as $answerPoints) {
        $taskPoints += $answerPoints;
    }
    $testData['tasks'][$key]['max_points'] = $taskPoints ;
}

//подключить шаблон центральный шаблон админки
require_once 'views/adminMain.php';
?>