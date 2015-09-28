var testApp = testApp || {};
testApp.TestModel = function() {
    //дефолтный конфиг
    this.config = {
        answerOrder: 'rand',
        taskTimer: false,
        taskTimerMode: 'inc',
        freeTaskChange: true,
        lastTaskFinish: true,
        multipleChoices: false,
        resultAnswersStyle: 'default',
        navInResult: false
    };

    this.data = phpTestData; //берёт данные теста из json'а посланного при загрузке страницы
    this.correctAnswers = []; //массив с баллами за ответы, полученный с сервера
    this.answersGiven = []; //массив с ответами данными пользователем
    this.taskTimer = []; //array of Timer instances
    this.tasksTimeSpent = []; //время затраченное на прохождение каждого отдельного задания
    this.tasksCount = 0; //заданий всего
    this.resultMode = false; //служит для переключения стилей: false)прохождение теста; true)просмотр результатов
    this.selectedTaskID = 0; //id задачи выбранной в данный момет

    //метод для запуска событий
    this.fireEvent = function(type, data, context) {
        this.constructor.superclass.fireEvent(type, data, context);
    };

    //метод для прослушивания событий
    this.listen = function(type, method, scope, context) {
        this.constructor.superclass.listen(type, method, scope, context);
    };

    //привотит тест в готовность
    this.init = function(attrs) {
        //заменяет дефолтные параметры конфига на указанные при инициализации
        if(attrs.config) {
            for(property in attrs.config) {
                if(attrs.config.hasOwnProperty(property)) {
                    this.config[property] = attrs.config[property];
                }
            }
        }

        console.log('TestModel this', this);

        //проводит первичную обработку полученных с сервера данных: заполняет массив ответов correctAnswers,
        //производит подсчёт задач tasksCount, сортирует задания по order_num
        this.prepareData();

        //отключает возможность переключаться на предыдущий вопрос
        if(this.config.freeTaskChange == false) {
            this.fireEvent('test:disableFreeTaskChange');
        }
    };

    //начинает новый тест
    this.startNewTest = function() {
        console.log('test model start new test');

        //обнуляет данные, заполненные при прошлых прохождениях теста
        this.answersGiven = [];
        this.taskTimer = [];
        this.tasksTimeSpent = [];
        this.selectedTaskID = 0;
        this.resultMode = false;

        this.fireEvent('test:setModeTestActive');

        this.fireEvent('test:startNewTest');

        var oldID = 0; //предыдущего задания не было
        var id = 1; //первое задание
        this.showTask(id, oldID);

        //запускает таймер
        this.testTimerStart();

        this.selectedTaskID = id;//for active task id to be available for other functions
    };

    this.testTimerStart = function() {
        if(typeof  this.timer !== 'undefined') this.timer.stop();
        //var timerData = JSON.parse(JSON.stringify(this.data.testTimerData));
        var timerData = this.data.testTimerData;
        console.log('testTimerStart this.data', this.data);
        this.timer = new Timer(timerData, 1);
        this.fireEvent('test:testTimerShow', timerData);

        this.timer.newTimer();
        this.timer.goDown();
        console.log('timer start timerData: ', timerData);
    };

    //слушает каждое изменение таймера, если время == 0, заканчивает тест
    this.timersTick = function(timeNow, that) {
        var recievedTimerID = that.activeTimer; //id таймера данные которого получены
        var testTimerID = this.timer.activeTimer; //id таймера теста



        //таймер теста, вывести значение и проверить не равен ли он 0
        if(testTimerID == recievedTimerID) {
            //console.log('this.timer, that', testTimerID, recievedTimerID);
            //timeNow = this.timer.timeNow;
            this.fireEvent('test:testTimerShow', timeNow);
            this.testTimerCheck(timeNow);
        }

        //таймер задания, вывести значение и проверить не равен ли он 0
        if(this.config.taskTimer == true) {
            var taskTimerID = this.taskTimer[this.selectedTaskID].activeTimer; //id таймера задачи

            if(taskTimerID == recievedTimerID) {
                //console.log('this.taskTimer, that', taskTimerID, recievedTimerID);
                //timeNow = this.timer.timeNow;
                this.fireEvent('test:taskTimerShow', timeNow);

                if(this.config.taskTimerMode == 'dec') {
                    this.taskTimerCheck();
                }
            }
        }

    };

    //если врямя на прохождение теста = 0, заканчивает тест
    this.testTimerCheck = function(timeNow) {
        if(timeNow == 0) {
            //console.log('testTimerCheck timeNow == 0 => finishTest');
            this.timer.stop();
            this.finishTest();
        }
    };

    //при переключении задачи запускает таймер и записывает результат предыдущего таймера, если он был
    this.taskChange = function(id) {
        var oldID = this.selectedTaskID;
        console.log('------- taskChange', id, oldID, this.data.tasks[id]);
        console.log('Test this', this);

        if(this.config.taskTimer == false) return;

        if(id === oldID) return; //защита от нажатия на ту же задачу, что приводит к торможению таймера

        //записывает timestamp время затраченное на каждую задчу в массив tasksTimeSpent
        this.writeDownSpentTime();

        if(this.resultMode == true) return;

        //task timer id start
        if(id === null) return;

        var taskTimer;
        if(this.config.taskTimerMode == 'dec') {
            taskTimer = this.data.tasks[id].taskTimerData;
        } else {
            taskTimer = 0;
        }

        if(typeof taskTimer === 'undefined') return;

        console.log('is taskTimer[id] an inctance of Timer?', this.taskTimer[id] instanceof Timer);
        if(!(this.taskTimer[id] instanceof Timer)) {
            this.taskTimer[id] = new Timer(taskTimer, 4);
            this.taskTimer[id].newTimer();
            console.log('************* task Timer started', id);
        }

        if(this.config.taskTimerMode == 'dec') {
            this.taskTimer[id].goDown(id);
        } else {
            this.taskTimer[id].goUp(id);
        }
    };

    //записывает timestamp время затраченное на каждую задчу в массив tasksTimeSpent
    this.writeDownSpentTime = function() {
        var oldID = this.selectedTaskID;

        if(this.config.taskTimer == false) return;

        //stop prev timer and save data
        //console.log('is task timer an inctance of Timer-2', this.taskTimer[oldID] instanceof Timer);
        if(this.taskTimer[oldID] instanceof Timer) {
            this.taskTimer[oldID].stop();
            var timeSpent = this.taskTimer[oldID].getTimeSpent();
            console.log('taskTimer timespent', timeSpent, oldID);

            if(oldID != 0) {
                this.tasksTimeSpent[oldID] = timeSpent;
            }
        }
    };

    //слушает таймер задания и переходит к след. заданию если время = 0
    this.taskTimerCheck = function() {
        var id = this.selectedTaskID;
        //console.log('this.taskTimerCheck, id, timeNow', id, this.taskTimer[id].timeNow);
        if(this.taskTimer[id].timeNow == 0) {
            this.taskTimer[id].stop();
            //console.log('this.taskTimerCheck this.taskTimer[id].timeNow == 0', id);
            this.showNextTask();
        }
    };

    //проводит первичную обработку полученных с сервера данных: заполняет массив ответов correctAnswers,
    //производит подсчёт задач tasksCount, сортирует задания по order_num
    this.prepareData = function() {
        var data = this.data;

        data = this.sortByOrderNum(data);
        console.log('this.prepareData', data);

        for (var property in data.tasks) {
            if (data.tasks.hasOwnProperty(property)) {
                this.correctAnswers[property] = data.tasks[property]['answer_points'];

                this.tasksCount++;
            }
        }

        this.data = data;
        console.log('data after prepareData: ', this.data);
        console.log('this.correctAnswers: ', this.correctAnswers);
    };

    //сортирует задания по order_num
    this.sortByOrderNum = function(data) {
        var sortedKeys = Object.keys(data.tasks).sort(function(keyA, keyB) {
            return data.tasks[keyA].order_num - data.tasks[keyB].order_num;
        });

        var newTasks = [];
        sortedKeys.forEach(function(item) {
            for(var property in data.tasks) {
                if (data.tasks.hasOwnProperty(property)) {
                    if(property == item) {
                        newTasks.push(data.tasks[property]);
                    }
                }
            }
        });

        data.tasks = {};
        newTasks.forEach(function(item, i) {
            data.tasks[i + 1] = item; //if not put +1 here, 0 index will break assignments
        });

        return data;
    };

    //клик на сайдбар
    this.sidebarClick = function(id, element){
        var oldID = this.selectedTaskID;
        var maxID = this.tasksCount;

        console.log('result mode: ', this.resultMode);

        //показ задания №id, если при просмотре результата - установка стилей
        if (this.resultMode) {
            if ($(element).parent().hasClass('answer-given')) {
                this.showTask(id, oldID, maxID);
            }
        } else if (this.selectedTaskID > 0 && this.config.freeTaskChange == true) { //если тест запущен
            this.showTask(id, oldID, maxID);
        }
    };

    //показывает задачу
    this.showTask = function(id) {
        var oldID = this.selectedTaskID;
        console.log('testMOdel SHOW TASK!', id, oldID);
        var maxID, minID;
        var data = {id: id, oldID: oldID};
        var freeTaskChange = this.config.freeTaskChange;

        this.fireEvent('test:showTask', data);

        //отображение времени задачи при переключении задания
        if(this.resultMode != true && this.config.taskTimer == true) this.taskChange(id, oldID);

        //отключает/включает кнопки навигции когда ответ последний или первый
        if(this.resultMode != true) {
            maxID = this.tasksCount;
            id == maxID? this.fireEvent('test:disableNextButtons'): this.fireEvent('test:enableNextButtons');
            id == 1 || freeTaskChange != true? this.fireEvent('test:disablePrevButtons'): this.fireEvent('test:enablePrevButtons');
        } else if(this.config.navInResult == true) {
            maxID =  Array.max(this.finalData.allAnswered);
            minID =  Array.min(this.finalData.allAnswered);
            id == maxID? this.fireEvent('test:disableNextButtons'): this.fireEvent('test:enableNextButtons');
            id == minID? this.fireEvent('test:disablePrevButtons'): this.fireEvent('test:enablePrevButtons');
        }

        this.selectedTaskID = id;
    };

    //показывает следующую задачу
    this.showNextTask = function() {
        if(this.selectedTaskID == 0) return;
        var id = Number(this.selectedTaskID);
        console.log('showNextTask, id, this.tasksCount', id, this.tasksCount);
        if(this.resultMode == true) {
            console.log('showNextTask this.resultMode == true');
            var allAnswered = this.finalData.allAnswered;
            if (id < this.tasksCount) {
                while($.inArray(id + 1, allAnswered) < 0) {
                    id++;
                }
                this.showTask(id + 1, 0 ,true);
            }
        } else {
            console.log('showNextTask else');
            if (id < this.tasksCount) this.showTask(id + 1);
        }

        //закончить тест если последний вопрос, сейчас действует от прямого вызова по таймеру, не от кнопок
        if (this.resultMode != true && id == this.tasksCount && this.config.lastTaskFinish == true) {
            console.log('finish test in showNextTask');
            this.finishTest();
        }
    };

    //показывает предыдущую задачу
    this.showPrevTask = function() {
        if(this.selectedTaskID == 0) return;
        var id = Number(this.selectedTaskID);
        console.log('showPrevTask', id);

        if(this.resultMode == true) {
            var allAnswered = this.finalData.allAnswered;
            if (id > 1) {
                while($.inArray(id - 1, allAnswered) < 0) {
                    id--;
                }
                this.showTask(id - 1);
            }
        } else if (this.config.freeTaskChange == true) {
            console.log('freeTaskChange == true', id);
            if (id > 1) this.showTask(id - 1);
        }
    };

    //клик на ответ
    this.giveAnswer = function(id, answer) {
        //записывает данные ответы в this.answersGiven; если элемент найден в массиве, удаляет его
        if (!this.answersGiven[id]) this.answersGiven[id] = [];
        var index = $.inArray(answer, this.answersGiven[id]);

        if(this.config.multipleChoices == true) {
            if (index > -1) {
                this.answersGiven[id].splice(index, 1);
            } else {
                this.answersGiven[id].push(answer);
            }
        } else {
            if (index > -1) {
                this.answersGiven[id] = [];
            } else {
                this.answersGiven[id] = [];
                this.answersGiven[id].push(answer);
            }
        }

        //передаёт выбранные ответы в методы вьюшек для визуального отображения данных ответов
        console.log('this.answersGiven', this.answersGiven);
        if(this.answersGiven.length > 0) {
            var data = {id: id, answers: this.answersGiven[id]};
            this.fireEvent('test:reflectAnswers', data);
        }

        //показывает след. вопрос, в случае если это был последний вопрос показывает результат теста
        if (this.config.multipleChoices != true) {
            var maxID = this.tasksCount;
            if (id < maxID) {
                this.showTask(id + 1);
            } else if (id == maxID && this.config.lastTaskFinish == true) {
                this.finishTest();
            }
        }
    };

    //заканчивает тест, подсчитывает и показывает результат
    this.finishTest = function() {
        if(this.selectedTaskID == 0) return;

        var correctAnswers = this.correctAnswers;
        var answersGiven = this.answersGiven;
        console.log('--- FINISHING TEST answers given, this', answersGiven, this);

        //остановка таймера
        this.timer.stop();

        //остановка таймера отдельной задачи
        if(this.taskTimer instanceof Timer) this.taskTimer.stop();
        console.log('invoking taskChange from fninishTest');
        this.writeDownSpentTime();

        //затраченное время
        this.timeSpent = this.timer.getTimeSpent();
        this.timeSpent = this.timer.timeToObject(this.timeSpent);
        console.log(' this.timeSpent ',  this.timeSpent);
        var timeSpent = this.timeSpent;

        /**
         * подготовка данных для показа результата теста
         */
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
        var tasksAnswered = allAnsweredArr.length;
        var tasksSkipped = Number(totalTasks) - Number(tasksAnswered);
        console.log('tasksAnswered: ', tasksAnswered);
        console.log('tasksSkipped: ', tasksSkipped);
        console.log('correctAnswers77: ', correctAnswers);
        console.log('answersGiven: ', answersGiven);

        //Заполняет массивы с правильными и непр-ми ответами, с данными ответами, и считает набранные баллы
        answersGiven.forEach(function(taskAnswers, i) {
            taskAnswers.forEach(function(answer) {
                var answerPoints = correctAnswers[i][answer + '_points'];

                if($.isNumeric(answerPoints) && answerPoints > 0) {
                    //console.log('answer for question ' + i + ' is correct');
                    totalPoints += Number(answerPoints);
                    correctAnswersArr.push(i);
                } else {
                    //console.log('answer for question ' + i + ' is wrong');
                    wrongAnswersArr.push(i);
                }
            });
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
            tasksAnswered: tasksAnswered,
            tasksSkipped: tasksSkipped,
            maxPoints: maxPoints,
            seconds: timeSpent.s,
            minutes: timeSpent.m,
            hours: timeSpent.h
        };

        //показать результат теста во вьюшках
        this.resultMode = true;
        this.fireEvent('test:showResult', this.finalData);
    };

};

//добавление возможности запускать и слушать события
extend(testApp.TestModel, Observable);