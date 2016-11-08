#!/usr/bin/env node
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _sourceMapSupport = require('source-map-support');

var _couchService = require('./couchService');

var _couchService2 = _interopRequireDefault(_couchService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _sourceMapSupport.install)();
var config = require('config');


var watchedDatabaseList = [];

// Get the collection of databases to watch
var completedDatabase = new _couchService2.default('completed-visits');
completedDatabase.getUserDatabaseList().then(function (list) {
    start(list);
}).catch(function (err) {
    return console.log('Error: Unable to fetch list of user databases', err);
});

// Store userdb instances in collection e.g. watchedDataBaseList[ 'userdb-xxxxxx', ... ]
var start = function start(watchList) {
    watchList.forEach(function (d) {
        watchedDatabaseList[d] = new _couchService2.default(d);
        watchedDatabaseList[d].subscribe(processChange, handleError);
    });
    console.log('MFA Processing Service Running...');
};

// Ignore deleted records; [change] is always an array; 
// db is the database name, so we can remove doc later
var processChange = function processChange(change, db) {
    change.forEach(function (c) {
        if (!c._deleted) {
            testForCompleted(c, db);
        }
    });
};

// Filter only completed records
var testForCompleted = function testForCompleted(doc, db) {
    if (doc.status && doc.status === 'completed') {
        moveRecord(doc, db);
    }
};

// Move record into completed queue
var moveRecord = function moveRecord(doc, db) {
    completedDatabase.add(doc).then(removeIfNoError(doc._id, db)).catch(function (err) {
        return console.log('Error: Completed record could not be added: ', doc._id, ' : ', (0, _stringify2.default)(err));
    });
};

// Ensure that record exists in completed database before removing
var removeIfNoError = function removeIfNoError(id, db) {
    completedDatabase.fetch(id).then(function (doc) {
        remove(id, db);
    }).catch(function (err) {
        return console.log('Error: Completed record could not be found: ', doc._id, ' : ', (0, _stringify2.default)(err));
    });
};

var remove = function remove(id, db) {
    watchedDatabaseList[db].remove(id).then(function (doc) {
        return console.log('resolved', doc);
    }) // NOT RESOLVING
    // .then(result => console.log('Assessment ' + id + ' was completed at ' + new Date().toISOString()))
    .catch(function (err) {
        return console.log('Error: Completed record', id, 'could not be removed from', db, (0, _stringify2.default)(err));
    });
};

var handleError = function handleError(error) {
    console.log(error);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsImNvbXBsZXRlZERhdGFiYXNlIiwiZ2V0VXNlckRhdGFiYXNlTGlzdCIsInRoZW4iLCJzdGFydCIsImxpc3QiLCJjYXRjaCIsImNvbnNvbGUiLCJsb2ciLCJlcnIiLCJ3YXRjaExpc3QiLCJmb3JFYWNoIiwiZCIsInN1YnNjcmliZSIsInByb2Nlc3NDaGFuZ2UiLCJoYW5kbGVFcnJvciIsImNoYW5nZSIsImRiIiwiYyIsIl9kZWxldGVkIiwidGVzdEZvckNvbXBsZXRlZCIsImRvYyIsInN0YXR1cyIsIm1vdmVSZWNvcmQiLCJhZGQiLCJyZW1vdmVJZk5vRXJyb3IiLCJfaWQiLCJpZCIsImZldGNoIiwicmVtb3ZlIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOztBQUdBOzs7Ozs7QUFGQTtBQUNBLElBQU1BLFNBQVNDLFFBQVEsUUFBUixDQUFmOzs7QUFHQSxJQUFJQyxzQkFBc0IsRUFBMUI7O0FBRUE7QUFDQSxJQUFJQyxvQkFBb0IsMkJBQWlCLGtCQUFqQixDQUF4QjtBQUNBQSxrQkFBa0JDLG1CQUFsQixHQUNLQyxJQURMLENBQ1UsZ0JBQVE7QUFBRUMsVUFBTUMsSUFBTjtBQUFhLENBRGpDLEVBRUtDLEtBRkwsQ0FFVztBQUFBLFdBQU9DLFFBQVFDLEdBQVIsQ0FBWSwrQ0FBWixFQUE2REMsR0FBN0QsQ0FBUDtBQUFBLENBRlg7O0FBSUE7QUFDQSxJQUFNTCxRQUFRLFNBQVJBLEtBQVEsQ0FBQ00sU0FBRCxFQUFlO0FBQ3pCQSxjQUFVQyxPQUFWLENBQWtCLGFBQUs7QUFDbkJYLDRCQUFvQlksQ0FBcEIsSUFBeUIsMkJBQWlCQSxDQUFqQixDQUF6QjtBQUNBWiw0QkFBb0JZLENBQXBCLEVBQXVCQyxTQUF2QixDQUFpQ0MsYUFBakMsRUFBZ0RDLFdBQWhEO0FBQ0gsS0FIRDtBQUlBUixZQUFRQyxHQUFSLENBQVksbUNBQVo7QUFDSCxDQU5EOztBQVFBO0FBQ0E7QUFDQSxJQUFNTSxnQkFBZ0IsU0FBaEJBLGFBQWdCLENBQUNFLE1BQUQsRUFBU0MsRUFBVCxFQUFnQjtBQUNsQ0QsV0FBT0wsT0FBUCxDQUFlLGFBQUs7QUFDaEIsWUFBSSxDQUFDTyxFQUFFQyxRQUFQLEVBQWlCO0FBQUVDLDZCQUFpQkYsQ0FBakIsRUFBb0JELEVBQXBCO0FBQXlCO0FBQy9DLEtBRkQ7QUFHSCxDQUpEOztBQU1BO0FBQ0EsSUFBTUcsbUJBQW1CLFNBQW5CQSxnQkFBbUIsQ0FBQ0MsR0FBRCxFQUFNSixFQUFOLEVBQWE7QUFDbEMsUUFBSUksSUFBSUMsTUFBSixJQUFlRCxJQUFJQyxNQUFKLEtBQWUsV0FBbEMsRUFBZ0Q7QUFBRUMsbUJBQVdGLEdBQVgsRUFBZ0JKLEVBQWhCO0FBQXFCO0FBQzFFLENBRkQ7O0FBSUE7QUFDQSxJQUFNTSxhQUFhLFNBQWJBLFVBQWEsQ0FBQ0YsR0FBRCxFQUFNSixFQUFOLEVBQWE7QUFDNUJoQixzQkFBa0J1QixHQUFsQixDQUFzQkgsR0FBdEIsRUFDS2xCLElBREwsQ0FDVXNCLGdCQUFnQkosSUFBSUssR0FBcEIsRUFBeUJULEVBQXpCLENBRFYsRUFFS1gsS0FGTCxDQUVXO0FBQUEsZUFBT0MsUUFBUUMsR0FBUixDQUFZLDhDQUFaLEVBQTREYSxJQUFJSyxHQUFoRSxFQUFxRSxLQUFyRSxFQUE0RSx5QkFBZWpCLEdBQWYsQ0FBNUUsQ0FBUDtBQUFBLEtBRlg7QUFHSCxDQUpEOztBQU1BO0FBQ0EsSUFBTWdCLGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBQ0UsRUFBRCxFQUFLVixFQUFMLEVBQVk7QUFDaENoQixzQkFBa0IyQixLQUFsQixDQUF3QkQsRUFBeEIsRUFDS3hCLElBREwsQ0FDVSxlQUFPO0FBQUUwQixlQUFPRixFQUFQLEVBQVdWLEVBQVg7QUFBZ0IsS0FEbkMsRUFFS1gsS0FGTCxDQUVXO0FBQUEsZUFBT0MsUUFBUUMsR0FBUixDQUFZLDhDQUFaLEVBQTREYSxJQUFJSyxHQUFoRSxFQUFxRSxLQUFyRSxFQUE0RSx5QkFBZWpCLEdBQWYsQ0FBNUUsQ0FBUDtBQUFBLEtBRlg7QUFHSCxDQUpEOztBQU1BLElBQU1vQixTQUFTLFNBQVRBLE1BQVMsQ0FBQ0YsRUFBRCxFQUFLVixFQUFMLEVBQVk7QUFDdkJqQix3QkFBb0JpQixFQUFwQixFQUF3QlksTUFBeEIsQ0FBK0JGLEVBQS9CLEVBQ0t4QixJQURMLENBQ1U7QUFBQSxlQUFPSSxRQUFRQyxHQUFSLENBQVksVUFBWixFQUF3QmEsR0FBeEIsQ0FBUDtBQUFBLEtBRFYsRUFDb0Q7QUFDaEQ7QUFGSixLQUdLZixLQUhMLENBR1c7QUFBQSxlQUFPQyxRQUFRQyxHQUFSLENBQVkseUJBQVosRUFBdUNtQixFQUF2QyxFQUEyQywyQkFBM0MsRUFBd0VWLEVBQXhFLEVBQTRFLHlCQUFlUixHQUFmLENBQTVFLENBQVA7QUFBQSxLQUhYO0FBSUgsQ0FMRDs7QUFPQSxJQUFNTSxjQUFjLFNBQWRBLFdBQWMsQ0FBQ2UsS0FBRCxFQUFXO0FBQUV2QixZQUFRQyxHQUFSLENBQVlzQixLQUFaO0FBQW9CLENBQXJEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7IGluc3RhbGwgfSBmcm9tICdzb3VyY2UtbWFwLXN1cHBvcnQnO1xyXG5pbnN0YWxsKCk7XHJcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2NvbmZpZycpO1xyXG5pbXBvcnQgQ291Y2hTZXJ2aWNlIGZyb20gJy4vY291Y2hTZXJ2aWNlJ1xyXG5cclxubGV0IHdhdGNoZWREYXRhYmFzZUxpc3QgPSBbXVxyXG5cclxuLy8gR2V0IHRoZSBjb2xsZWN0aW9uIG9mIGRhdGFiYXNlcyB0byB3YXRjaFxyXG5sZXQgY29tcGxldGVkRGF0YWJhc2UgPSBuZXcgQ291Y2hTZXJ2aWNlKCdjb21wbGV0ZWQtdmlzaXRzJylcclxuY29tcGxldGVkRGF0YWJhc2UuZ2V0VXNlckRhdGFiYXNlTGlzdCgpXHJcbiAgICAudGhlbihsaXN0ID0+IHsgc3RhcnQobGlzdCkgfSlcclxuICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coJ0Vycm9yOiBVbmFibGUgdG8gZmV0Y2ggbGlzdCBvZiB1c2VyIGRhdGFiYXNlcycsIGVycikpXHJcblxyXG4vLyBTdG9yZSB1c2VyZGIgaW5zdGFuY2VzIGluIGNvbGxlY3Rpb24gZS5nLiB3YXRjaGVkRGF0YUJhc2VMaXN0WyAndXNlcmRiLXh4eHh4eCcsIC4uLiBdXHJcbmNvbnN0IHN0YXJ0ID0gKHdhdGNoTGlzdCkgPT4ge1xyXG4gICAgd2F0Y2hMaXN0LmZvckVhY2goZCA9PiB7XHJcbiAgICAgICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtkXSA9IG5ldyBDb3VjaFNlcnZpY2UoZClcclxuICAgICAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RdLnN1YnNjcmliZShwcm9jZXNzQ2hhbmdlLCBoYW5kbGVFcnJvcilcclxuICAgIH0pXHJcbiAgICBjb25zb2xlLmxvZygnTUZBIFByb2Nlc3NpbmcgU2VydmljZSBSdW5uaW5nLi4uJylcclxufVxyXG5cclxuLy8gSWdub3JlIGRlbGV0ZWQgcmVjb3JkczsgW2NoYW5nZV0gaXMgYWx3YXlzIGFuIGFycmF5OyBcclxuLy8gZGIgaXMgdGhlIGRhdGFiYXNlIG5hbWUsIHNvIHdlIGNhbiByZW1vdmUgZG9jIGxhdGVyXHJcbmNvbnN0IHByb2Nlc3NDaGFuZ2UgPSAoY2hhbmdlLCBkYikgPT4ge1xyXG4gICAgY2hhbmdlLmZvckVhY2goYyA9PiB7XHJcbiAgICAgICAgaWYgKCFjLl9kZWxldGVkKSB7IHRlc3RGb3JDb21wbGV0ZWQoYywgZGIpIH1cclxuICAgIH0pXHJcbn1cclxuXHJcbi8vIEZpbHRlciBvbmx5IGNvbXBsZXRlZCByZWNvcmRzXHJcbmNvbnN0IHRlc3RGb3JDb21wbGV0ZWQgPSAoZG9jLCBkYikgPT4ge1xyXG4gICAgaWYgKGRvYy5zdGF0dXMgJiYgKGRvYy5zdGF0dXMgPT09ICdjb21wbGV0ZWQnKSkgeyBtb3ZlUmVjb3JkKGRvYywgZGIpIH1cclxufVxyXG5cclxuLy8gTW92ZSByZWNvcmQgaW50byBjb21wbGV0ZWQgcXVldWVcclxuY29uc3QgbW92ZVJlY29yZCA9IChkb2MsIGRiKSA9PiB7XHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5hZGQoZG9jKVxyXG4gICAgICAgIC50aGVuKHJlbW92ZUlmTm9FcnJvcihkb2MuX2lkLCBkYikpXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6IENvbXBsZXRlZCByZWNvcmQgY291bGQgbm90IGJlIGFkZGVkOiAnLCBkb2MuX2lkLCAnIDogJywgSlNPTi5zdHJpbmdpZnkoZXJyKSkpXHJcbn1cclxuXHJcbi8vIEVuc3VyZSB0aGF0IHJlY29yZCBleGlzdHMgaW4gY29tcGxldGVkIGRhdGFiYXNlIGJlZm9yZSByZW1vdmluZ1xyXG5jb25zdCByZW1vdmVJZk5vRXJyb3IgPSAoaWQsIGRiKSA9PiB7XHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5mZXRjaChpZClcclxuICAgICAgICAudGhlbihkb2MgPT4geyByZW1vdmUoaWQsIGRiKSB9KVxyXG4gICAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkIGNvdWxkIG5vdCBiZSBmb3VuZDogJywgZG9jLl9pZCwgJyA6ICcsIEpTT04uc3RyaW5naWZ5KGVycikpKVxyXG59XHJcblxyXG5jb25zdCByZW1vdmUgPSAoaWQsIGRiKSA9PiB7XHJcbiAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RiXS5yZW1vdmUoaWQpXHJcbiAgICAgICAgLnRoZW4oZG9jID0+IGNvbnNvbGUubG9nKCdyZXNvbHZlZCcsIGRvYykpICAgICAgLy8gTk9UIFJFU09MVklOR1xyXG4gICAgICAgIC8vIC50aGVuKHJlc3VsdCA9PiBjb25zb2xlLmxvZygnQXNzZXNzbWVudCAnICsgaWQgKyAnIHdhcyBjb21wbGV0ZWQgYXQgJyArIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSkpXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6IENvbXBsZXRlZCByZWNvcmQnLCBpZCwgJ2NvdWxkIG5vdCBiZSByZW1vdmVkIGZyb20nLCBkYiwgSlNPTi5zdHJpbmdpZnkoZXJyKSkpXHJcbn1cclxuXHJcbmNvbnN0IGhhbmRsZUVycm9yID0gKGVycm9yKSA9PiB7IGNvbnNvbGUubG9nKGVycm9yKSB9XHJcbiJdfQ==