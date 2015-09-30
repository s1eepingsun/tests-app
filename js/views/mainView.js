var testApp = testApp || {};
testApp.MainView = function(model) {
    this._model = model;
};

//добавление возможности запускать и слушать события
extend(testApp.MainView, Observable);

//метод для прослушивания событий
testApp.MainView.prototype.listen = function(event, listenerHandler, listener) {
    this.constructor.superclass.listen(event, listenerHandler, listener);
};

//метод который запускается сразу после инициализации объекта
testApp.MainView.prototype.init = function() {
    console.log('MainView init');
    //event listeners
    this.listen('test:setModeTestActive', this.setModeTestActive, this);
    this.listen('test:showResult', this.showResult, this);
    this.listen('test:reflectAnswers', this.reflectAnswers, this);
    this.listen('test:showTask', this.showTask, this);
    this.listen('test:disableFreeTaskChange', this.disableFreeTaskChange, this);
    this.listen('test:startNewTest', this.startNewTest, this);
    this.listen('test:testTimerShow', this.testTimerShow, this);
    this.listen('test:taskTimerShow', this.taskTimerShow, this);
    this.listen('test:disablePrevButtons', this.disablePrevButtons, this);
    this.listen('test:disableNextButtons', this.disableNextButtons, this);
    this.listen('test:enablePrevButtons', this.enablePrevButtons, this);
    this.listen('test:enableNextButtons', this.enableNextButtons, this);

    //отключает прокрутку страницы при прокрутке центрального блока
    $.cache('#field').on('mouseenter', function () {
        if($.cache('#field')[0].scrollHeight > $.cache('#field')[0].offsetHeight) {
            $.cache('html, body').on('mousewheel', function (e) {
                e.preventDefault();
            });
            $.cache('#field').on('mousewheel', function (e) {
                var step = 30;
                var direction = e.originalEvent.deltaY > 0 ? 1 : -1;
                $(this).scrollTop($(this).scrollTop() + step * direction);
            });
        }
    });
    $.cache('#field').on('mouseleave', function () {
        $.cache('html,body').off('mousewheel');
    });
};

//начинает новый тест
testApp.MainView.prototype.startNewTest = function() {
    console.log('main view start new test');
    $.cache('#tb-finish-test').removeClass('disabled');
    $.cache('#left-side-bar').show();

    //сортировка ответов
    if(this._model.config.answerOrder) {
        this.sortAnswers(this._model.config.answerOrder);
    }
};

//рендерит результат теста по шаблону
testApp.MainView.prototype.renderResultScore = function(data) {
    var templateSource = $('#test-result-tmpl').html();
    var template = Handlebars.compile(templateSource);
    var rendered = template(data);
    $.cache('.single-test-data').hide();
    $.cache('#test-result').show();
    $.cache('#test-result').html(rendered);
};

//включение режима стилей для прохождения теста
testApp.MainView.prototype.setModeTestActive = function() {
    //подключает навигацию
    $.cache('#tb-prev-task').removeClass('disabled');
    $.cache('#tb-next-task').removeClass('disabled');
    $.cache('.single-test-data').find('.test-button').show();

    $.cache('.start-message').hide();
    $.cache('#time-left').show();
    $.cache('#tb-finish-test').removeClass('disabled');
    $.cache('.single-test-data').find('.answers .answer').addClass('hoverable');
    $.cache('.single-test-data').find('.answers .answer').removeClass('disabled');
    $.cache('#field').find('.in-task-description').show();
    $.cache('.task-timer').removeClass('in-result');

    //убирает окраску ответов
    $.cache('.single-test-data').find('.answer').removeClass('answer-chosen answered-wrong answered-right');
    $.cache('.single-test-data').find('.answer').removeClass('answered-basic-border answered-right-border answered-wrong-border');

    $.cache('#close-result-task').hide();
    $.cache('#field').removeClass('result-field');
};

//включение режиа стилей для просмотра результатов теста
testApp.MainView.prototype.setModeTestResult = function() {
    //отключает навигацию
    $.cache('#tb-prev-task').addClass('disabled');
    $.cache('#tb-next-task').addClass('disabled');
    if(this._model.config.navInResult != true) {
        $.cache('.single-test-data').find('.test-button').hide();
    }

    $.cache('#tb-finish-test').addClass('disabled');
    $.cache('.single-test-data').find('.answers .answer').removeClass('hoverable');
    $.cache('.single-test-data').find('.answers .answer').addClass('disabled');
    $.cache('#field').find('.in-task-description').hide();
    $.cache('.task-timer').addClass('in-result');
    $.cache('#time-left').hide();
};

//отображает таймер теста
testApp.MainView.prototype.testTimerShow = function(observable, eventType, timeNow) {
    //console.log('timeNow 1', timeNow);
    var timer = this._model.timer;
    var testTimerObj = timer.timeToObject(timeNow);
    var timeString = timer.timeObToString(testTimerObj);
    $('#time-left').html(timeString);
};

//отображает таймер отдельной задачи
testApp.MainView.prototype.taskTimerShow = function(observable, eventType, timeNow) {
    var id = this._model.selectedTaskID;
    if(!this._model.taskTimer[id]) return;

    var timer = this._model.taskTimer[id];
    //console.log('taskTimerShow', timer.timeNow);
    var taskTimerObj = timer.timeToObject(timer.timeNow);
    var taskTimerString = timer.timeObToString(taskTimerObj);
    //console.log('taskTimerShow id', id, $('#vn' + id + '.task-timer'));
    $('#vn' + id + ' .task-timer').html(taskTimerString);
};

//показать задание
testApp.MainView.prototype.showTask = function(observable, eventType, data) {
    var id = data['id'];
    var oldID = data['oldID'];
    //this._model.taskChange(id, oldID);//передаёт в модель новость о показе задачи
    this.taskTimerShow();
    console.log('mainVIew showTask id, oldID', id, oldID);
    $.cache('#test-result').hide();
    $.cache('.single-test-data').hide();
    $('#vn' + id).show();

    if(this._model.resultMode == true) {
        $.cache('#test-result').hide();
        $.cache('#close-result-task').show();
        $.cache('#field').addClass('result-field');
    }
};

//визуально отображает данные ответы
testApp.MainView.prototype.reflectAnswers = function(observable, eventType, data) {
    var id = data['id'];
    var answers = data['answers'];
    console.log('MainView reflectAnswers id, answer: ', id, answers);
    $('#vn' + id + ' .answers .answer').removeClass('answer-chosen');
    answers.forEach(function(item) {
        $('#vn' + id + ' .answers .answer[answer="' + item + '"]').addClass('answer-chosen');
    })

};

//показывает результат прохождения теста
testApp.MainView.prototype.showResult = function(observable, eventType, data) {
    //ставит режим стилей и работы кнопок для показа результата теста
    this.setModeTestResult();

    //окрашивает ответы на задания с данными ответамиданные ответами
    for (var property in data.allAnswered) {
        var taskNumber = data.allAnswered[property];
        var config = this._model.config;
        var allCorrectAnswers = this._model.correctAnswers;//массив правильных ответов на все вопрсы
        var answersGiven = this._model.answersGiven;
        console.log('property', property);
        console.log('data.allAnswered property', data.allAnswered[property]);
        console.log('task number', taskNumber);

        //обработка ответов в основном поле
        for (property in allCorrectAnswers[taskNumber]) {
            var answerPoints = allCorrectAnswers[taskNumber][property];
            var answerNum = property.substring(0, 7);

            //если ответ отмечен пользователем
            if($.inArray(answerNum, answersGiven[taskNumber]) > -1) {
                if(config.resultAnswersStyle == 'wrong-borders') {
                    $('#vn' + taskNumber + ' .answers .answer[answer="' + answerNum + '"]').removeClass('answer-chosen');
                    $('#vn' + taskNumber + ' .answers .answer[answer="' + answerNum + '"]').addClass('answered-basic-border');
                    if (answerPoints <= 0) {
                        $('#vn' + taskNumber + ' .answers .answer[answer="' + answerNum + '"]').addClass('answered-wrong-border');
                    }
                } else if(config.resultAnswersStyle == 'answered-borders') {
                    $('#vn' + taskNumber + ' .answers .answer[answer="' + answerNum + '"]').addClass('answered-basic-border');
                    $('#vn' + taskNumber + ' .answers .answer[answer="' + answerNum + '"]').addClass('answered-wrong');
                } else {
                    $('#vn' + taskNumber + ' .answers .answer[answer="' + answerNum + '"]').addClass('answered-wrong');
                }
            }

            //все правильные ответы
            if(answerPoints > 0) {
                if(config.resultAnswersStyle == 'right-wrong-borders') {
                    $('#vn' + taskNumber + ' .answers .answer[answer="' + answerNum + '"]').addClass('answered-right-border');
                } else {
                    $('#vn' + taskNumber + ' .answers .answer[answer="' + answerNum + '"]').addClass('answered-right');
                }
            } else if(config.resultAnswersStyle == 'right-wrong-borders') {
                $('#vn' + taskNumber + ' .answers .answer[answer="' + answerNum + '"]').addClass('answered-wrong-border');
            }
        }
    }

    this.renderResultScore(data);
};

//закрытие ответа при просмотре результатов теста
testApp.MainView.prototype.closeTask = function() {
    $.cache('#field').removeClass('result-field');
    $.cache('#test-result').show();
    $.cache('.single-test-data').hide();
    $.cache('#close-result-task').hide();
    $.cache('.mainLayout').find('.in-task-description').hide();
};

//отключает кнопки "предыдущий вопрос"
testApp.MainView.prototype.disablePrevButtons = function() {
    $.cache('#tb-prev-task').addClass('disabled');
    $.cache('.single-test-data').find('.tb-prev-task div:last-child').addClass('disabled');
    $.cache('.single-test-data').find('.tb-prev-task div:last-child').removeClass('hoverable');
};

//отключает кнопки "следующий вопрос"
testApp.MainView.prototype.disableNextButtons = function() {
    $.cache('#tb-next-task').addClass('disabled');
    $.cache('.single-test-data').find('.tb-next-task div:last-child').addClass('disabled');
    $.cache('.single-test-data').find('.tb-next-task div:last-child').removeClass('hoverable');
};

//делает кнопки "предыдущий вопрос" активными
testApp.MainView.prototype.enablePrevButtons = function() {
    $.cache('#tb-prev-task').removeClass('disabled');
    $.cache('.single-test-data').find('.tb-prev-task div:last-child').removeClass('disabled');
    $.cache('.single-test-data').find('.tb-prev-task div:last-child').addClass('hoverable');
};

//делает кнопки "следующий вопрос" активными
testApp.MainView.prototype.enableNextButtons = function() {
    $.cache('#tb-next-task').removeClass('disabled');
    $.cache('.single-test-data').find('.tb-next-task div:last-child').removeClass('disabled');
    $.cache('.single-test-data').find('.tb-next-task div:last-child').addClass('hoverable');
};

//показывает описание теста
testApp.MainView.prototype.showDescription = function() {
    $.cache('.test-description').show();
};

//закрывает описание теста
testApp.MainView.prototype.closeDescription = function() {
    $.cache('.test-description').hide();
};

//отключает и убирает кнопки "предыдущий вопрос"
testApp.MainView.prototype.disableFreeTaskChange = function() {
    $.cache('#tb-prev-task').addClass('disabled');
    $.cache('.single-test-data').find('.tb-prev-task div:last-child').addClass('disabled');
    $.cache('.single-test-data').find('.tb-prev-task div:last-child').removeClass('hoverable');
    $.cache('.single-test-data').find('.tb-prev-task div:last-child').hide();
    $.cache('#tb-next-task').html('Пропустить вопрос');
    $.cache('.single-test-data').find('.tb-next-task div:last-child').html('Пропустить вопрос');
};

//сортировка вопросов
testApp.MainView.prototype.sortAnswers = function(answerOrder) {
    var tasksCount = this._model.tasksCount;

    //сортировка dec - по убыванию
    if(answerOrder === 'dec') {
        //сортировка dec переворачивает список ответов, поэтому если сделать дважы снова будет дефолтный порядок
        if(this.sorted == true) return;
        for(var i = 1; i <= tasksCount; i++) {
            var divs = $( '#vn' + i + ' .answers .answer').get().reverse();
            console.log('divs after reverse: ', divs);
            $( '#vn' + i + ' .answers').append(divs);
        }
        this.sorted = true;

        //сортировка rand - случайный порядок
    } else if(answerOrder === 'rand') {
        for(i = 1; i <= tasksCount; i++) {
            divs = $( '#vn' + i + ' .answers > div:last-child .answer').get();
            //console.log('divs: ', divs);
            divs = shuffle(divs);
            //console.log('divs after shuffle: ', divs[0]);
            $( '#vn' + i + ' .answers > div:last-child').append(divs[0]);
        }
    }

    //helper: перемешивает массив
    function shuffle(array) {
        var counter = array.length, temp, index;
        while (counter > 0) {
            index = Math.floor(Math.random() * counter);
            counter--;
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return [array];
    }
};





