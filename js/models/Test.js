/**
Конфиг:
testConfig: {
    answerOrder: 'inc' //сортировка вопросов
}
Варианты сортировки для конфига:
dec - по убыванию order_num,
rand - случайный порядок
 */

var testApp = testApp || {};
testApp.Test = Backbone.Model.extend({
    defaults: {
        testConfig: {
            answerOrder: 'inc'
        }
    },
    initialize: function () {
        this.data = phpTestData; //берёт данные теста из json'а посланного при загрузке страницы
        this.correctAnswers = [];
        this.answersGiven = [];
        this.tasksCount = 0;
        this.realTimeGiven = phpTestData.timerData;
        console.log('this data: ', this);

        //заполняет массив correctAnswers и считает задачи
        this.prepareData();

        //передаёт обработчик во View
        this.testView = new testApp.TestView({model: this});

        //слушает каждое изменение таймеры, если время == 0, заканчивает тест
        this.listenTo(Backbone, 'testTimerTick', this.testTimerCheck);//передаётся из Timer.js
    },

    //записывает данные ответы в this.answersGiven
    recieveAnswer: function(args) {
        this.answersGiven[args[0]] = args[1];
        console.log('answersGiven: ', this.answersGiven);
    },

    //проводит первичную обработку полученных с сервера данных
    prepareData: function() {
        var data = this.data;

        data = this.sortByOrderNum(data);

        for (var property in data.tasks) {
            if(data.tasks.hasOwnProperty(property)) {
                //заполняет correctAnswers
                console.log(' data.tasks[property]',  data.tasks[property]);
                this.correctAnswers[property] = data.tasks[property]['answer_points'];

                //считает задачи
                this.tasksCount++;
            }
        }

        this.data = data;
        console.log('data after prepareData: ', this.data);
        console.log('this.correctAnswers: ', this.correctAnswers);
    },

    //сортирует задания по order_num
    sortByOrderNum: function(data) {
        var sorted = _.sortBy(data.tasks, 'order_num');
        data.tasks = {};
        sorted.forEach(function(item, i) {
            data.tasks[i + 1] = item; //if not put +1 here, 0 index will break assignments
        });
        return data;
    },

    //запускает таймер
    testTimerStart: function() {
        if(typeof  this.timer !== 'undefined') this.timer.stop();
        var timerData = JSON.parse(JSON.stringify(this.data.timerData));
        console.log('this.data', this.data.tasks);
        console.log('this.realTimeGiven', this.realTimeGiven);
        this.timer = new Timer(timerData, this);
        this.timer.newTimer();
        this.timer.go();
        console.log('timer start; Model object: ', this);
    },

    //слушает таймер и останавливает тест если время = 0
    testTimerCheck: function() {
        //console.log('tick was heard by model ' ,this.timer.timeNow);
        //console.log('time timespent', this.timer.getTimeSpent());
        if(this.timer.timeNow.s == 0 && this.timer.timeNow.m == 0 && this.timer.timeNow.h == 0) {
            this.timer.stop();
            this.timeSpent = this.timer.getTimeSpent();
            //console.log('time stop timespent', this.timeSpent);
            this.finishTest();
        }
    },

    //подсчитывает результат теста и передаёт обработчик в TestView
    finishTest: function() {
        var correctAnswers = this.correctAnswers;
        var answersGiven = this.answersGiven;
        console.log('FINISHING test answers given', answersGiven);

        //остановка таймера
        this.timer.stop();

        //затраченное время
        this.timeSpent = this.timer.getTimeSpent();
        console.log(' this.timeSpent 877 ',  this.timeSpent);
        var timeSpent = this.timeSpent;
        console.log(' this.timeSpent 877  m',  this.timeSpent.m);
        console.log(' this.timeSpent 877  s',  this.timeSpent.s);

        //подготовка данных для показа результата теста

        //создает массив всех данных валидных ответов
        var allAnsweredArr = [];
        $.map(answersGiven, function(value, index) {
            if(typeof value !== 'undefined') {
                allAnsweredArr.push(index);
            }
        });
        console.log('allAnsweredArr: ',allAnsweredArr);

        var totalPoints = 0;
        var maxPoints = 0;
        var wrongAnswersArr = [];
        var correctAnswersArr = [];
        var totalTasks = Number(this.tasksCount);
        console.log('that.taskCount 2: ', this.tasksCount);
        var answersGivenCount = allAnsweredArr.length;
        var tasksSkipped = Number(totalTasks) - Number(answersGivenCount);
        console.log('answersGivenCount: ', answersGivenCount);
        console.log('tasksSkipped: ', tasksSkipped);
        console.log('correctAnswers77: ', correctAnswers);
        console.log('answersGiven: ', answersGiven);

        //Заполняет массивы с правильными и непр-ми ответами, с данными ответами, и считает набранные баллы
        answersGiven.forEach(function(item, i) {
            var answerPoints = correctAnswers[i][item + '_points'];
            console.log('answersGiven item: ', item);
            console.log('correct answers i: ', correctAnswers[i]);
            console.log('correct answers i item _points: ', answerPoints);
            console.log('i: ', i);

            if($.isNumeric(answerPoints) && answerPoints > 0) {
                console.log('answer for question ' + i + ' is correct');
                totalPoints += Number(answerPoints);
                correctAnswersArr.push(i);
            } else {
                console.log('answer for question ' + i + ' is wrong');
                wrongAnswersArr.push(i);
            }

            console.log('correctAnswersArr', correctAnswersArr);
            console.log('wrongAnswersArr', wrongAnswersArr);
        });

        //считает макс. сумму баллов за все ответы вместе
        correctAnswers.forEach(function(item) {
            for (var property in item) {
                // console.log('correctAnswers item property: ', item[property]);
                if($.isNumeric(item[property])) {
                    maxPoints += Number(item[property]);
                }
            }
        });

        //расчёт оценки
        var pointsPercent = totalPoints / maxPoints;
        if(pointsPercent >= 0.6 && pointsPercent <= 0.8) {
            var mark = 3;
        } else if(pointsPercent > 0.8 && pointsPercent <= 0.9) {
            mark = 4;
        } else if(pointsPercent > 0.9 && pointsPercent <= 1) {
            mark = 5;
        } else if(pointsPercent < 0.6) {
            mark = 2;
        }

        //данные для показа результата
        this.finalData = {
            mark: mark,
            totalTasks: totalTasks,
            correctAnswers: correctAnswersArr,
            wrongAnswers: wrongAnswersArr,
            allAnswered: allAnsweredArr,//массив с индексами всех отвеченных вопросов
            totalPoints: totalPoints,
            answersGivenCount: answersGivenCount,
            tasksSkipped: tasksSkipped,
            maxPoints: maxPoints,
            seconds: timeSpent.s,
            minutes: timeSpent.m,
            hours: timeSpent.h
        };

        //показать результат теста в TestView
        this.testView.showResult(this.finalData);

    }

});