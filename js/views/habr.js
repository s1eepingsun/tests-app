var OMVC = {};
OMVC.makeObservableSubject = function () {
    var observers = [];
    var addObserver = function (o) {
        if (typeof o !== 'function') {
            throw new Error('observer must be a function');
        }
        for (var i = 0, ilen = observers.length; i < ilen; i++) {
            var observer = observers[i];
            if (observer === o) {
                throw new Error('observer already in the list');
            }
        }
        observers.push(o);
    };
    var removeObserver = function (o) {
        for (var i = 0, ilen = observers.length; i < ilen; i += 1) {
            var observer = observers[i];
            if (observer === o) {
                observers.splice(i, 1);
                return;
            }
        }
        throw new Error('could not find observer in list of observers');
    };
    var notifyObservers = function (data) {
        // Make a copy of observer list in case the list
        // is mutated during the notifications.
        var observersSnapshot = observers.slice(0);
        for (var i = 0, ilen = observersSnapshot.length; i < ilen; i += 1) {
            observersSnapshot[i](data);
        }
    };
    return {
        addObserver: addObserver,
        removeObserver: removeObserver,
        notifyObservers: notifyObservers,
        notify: notifyObservers
    };
};


OMVC.Model = function () {
    var that = this;
    var items = [];
    this.modelChangedSubject = OMVC.makeObservableSubject();
    this.addItem = function (value) {
        if (!value) {
            return;
        }
        items.push(value);
        that.modelChangedSubject.notifyObservers();
    };
    this.removeCurrentItem = function () {
        if (that.selectedIndex === -1) {
            return;
        }
        items.splice(that.selectedIndex, 1);
        if (items.length === 0) {
            that.setSelectedIndex(-1);
        }
        that.modelChangedSubject.notifyObservers();
    };
    this.getItems = function () {
        return items;
    };
    this.selectedIndex = -1;
    this.getSelectedIndex = function () {
        return that.selectedIndex;
    };
    this.selectedIndexChangedSubject = OMVC.makeObservableSubject();
    this.setSelectedIndex = function (value) {
        that.selectedIndex = value;
        that.selectedIndexChangedSubject.notifyObservers();
    }
};

OMVC.View = function (model, rootObject) {
    var that = this;
    that.select = $('<select/>').appendTo(rootObject);
    that.select.attr('size', '4');
    that.buttonAdd = $('<button>+</button>').appendTo(rootObject).height(20);
    that.buttonRemove = $('<button>-</button>').appendTo(rootObject).height(20).fadeOut();
    model.modelChangedSubject.addObserver(function () {
        var items = model.getItems();
        var innerHTML = '';
        for (var i = 0; i<items.length; i += 1) {
            innerHTML += "<option>"+items[i]+"</option>";
        }
        that.select.html(innerHTML);
    });
    model.selectedIndexChangedSubject.addObserver(function () {
        if(model.getSelectedIndex() === -1) {
            that.buttonRemove.fadeOut();
        } else {
            that.buttonRemove.fadeIn();
        }
    });
};

OMVC.Controller = function (model, view) {
    view.buttonAdd.bind('click', function () {
        model.addItem(prompt('addvalue'));
    });
    view.buttonRemove.bind('click', function () {
        model.removeCurrentItem();
    });
    view.select.bind('click', function () {
        model.setSelectedIndex(view.select[0].selectedIndex);
    });
};

$(document).ready(function () {
    var model = new OMVC.Model();
    var view = new OMVC.View(model, $('<div/>').appendTo($("body")));
    var controller = new OMVC.Controller(model, view);
});