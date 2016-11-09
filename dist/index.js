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

process.on('unhandledRejection', function (reason) {
    console.log('DEBUG: Unhandled Rejection Reason: ' + reason);
});

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
        watchedDatabaseList[d].subscribe(processChange, generalError);
    });
    console.log('MFA Processing Service Running...');
};

// Ignore deleted records; [change] is always an array; 
// db is the database name, so we can remove doc later
var processChange = function processChange(change, db) {
    console.log('DEBUG: Change data in', db, (0, _stringify2.default)(change)); //
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
    var success = function success(doc) {
        // console.log('DEBUG: Added doc to completed-visits', doc)
        removeIfNoError(doc.id, db);
    };
    var error = function error(err) {
        console.log('Error: Completed record could not be added: ', doc._id, ' : ', (0, _stringify2.default)(err));
    };
    completedDatabase.add(doc, success, error);
};

// Ensure that record exists in completed database before removing
var removeIfNoError = function removeIfNoError(id, db) {
    var success = function success(doc) {
        // console.log('DEBUG: Fetched doc from completed-visits', doc)
        remove(id, db);
    };
    var error = function error(err) {
        console.log('Error: Completed record could not be found: ', doc._id, ' : ', (0, _stringify2.default)(err));
    };
    completedDatabase.fetch(id, success, error);
};

var remove = function remove(id, db) {
    var success = function success(result) {
        console.log('Assessment ' + id + ' was completed at ' + new Date().toISOString());
    };
    var error = function error(err) {
        console.log('Error: Completed record', id, 'could not be removed from', db, (0, _stringify2.default)(err));
    };
    watchedDatabaseList[db].remove(id, success, error);
};

var generalError = function generalError(err) {
    console.log(err);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInByb2Nlc3MiLCJvbiIsInJlYXNvbiIsImNvbnNvbGUiLCJsb2ciLCJjb21wbGV0ZWREYXRhYmFzZSIsImdldFVzZXJEYXRhYmFzZUxpc3QiLCJ0aGVuIiwic3RhcnQiLCJsaXN0IiwiY2F0Y2giLCJlcnIiLCJ3YXRjaExpc3QiLCJmb3JFYWNoIiwiZCIsInN1YnNjcmliZSIsInByb2Nlc3NDaGFuZ2UiLCJnZW5lcmFsRXJyb3IiLCJjaGFuZ2UiLCJkYiIsImMiLCJfZGVsZXRlZCIsInRlc3RGb3JDb21wbGV0ZWQiLCJkb2MiLCJzdGF0dXMiLCJtb3ZlUmVjb3JkIiwic3VjY2VzcyIsInJlbW92ZUlmTm9FcnJvciIsImlkIiwiZXJyb3IiLCJfaWQiLCJhZGQiLCJyZW1vdmUiLCJmZXRjaCIsInJlc3VsdCIsIkRhdGUiLCJ0b0lTT1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7O0FBR0E7Ozs7OztBQUZBO0FBQ0EsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7OztBQUdBLElBQUlDLHNCQUFzQixFQUExQjs7QUFFQUMsUUFBUUMsRUFBUixDQUFXLG9CQUFYLEVBQWlDLFVBQUNDLE1BQUQsRUFBWTtBQUM1Q0MsWUFBUUMsR0FBUixDQUFZLHdDQUF3Q0YsTUFBcEQ7QUFDQSxDQUZEOztBQUlBO0FBQ0EsSUFBSUcsb0JBQW9CLDJCQUFpQixrQkFBakIsQ0FBeEI7QUFDQUEsa0JBQWtCQyxtQkFBbEIsR0FDS0MsSUFETCxDQUNVLGdCQUFRO0FBQUVDLFVBQU1DLElBQU47QUFBYSxDQURqQyxFQUVLQyxLQUZMLENBRVc7QUFBQSxXQUFPUCxRQUFRQyxHQUFSLENBQVksK0NBQVosRUFBNkRPLEdBQTdELENBQVA7QUFBQSxDQUZYOztBQUlBO0FBQ0EsSUFBTUgsUUFBUSxTQUFSQSxLQUFRLENBQUNJLFNBQUQsRUFBZTtBQUN6QkEs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QWZBLFlBQWUsQ0FBQ04sR0FBRCxFQUFTO0FBQUVSLFlBQVFDLEdBQVIsQ0FBWU8sR0FBWjtBQUFrQixDQUFsRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQgeyBpbnN0YWxsIH0gZnJvbSAnc291cmNlLW1hcC1zdXBwb3J0JztcclxuaW5zdGFsbCgpO1xyXG5jb25zdCBjb25maWcgPSByZXF1aXJlKCdjb25maWcnKTtcclxuaW1wb3J0IENvdWNoU2VydmljZSBmcm9tICcuL2NvdWNoU2VydmljZSdcclxuXHJcbmxldCB3YXRjaGVkRGF0YWJhc2VMaXN0ID0gW11cclxuXHJcbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChyZWFzb24pID0+IHtcclxuXHRjb25zb2xlLmxvZygnREVCVUc6IFVuaGFuZGxlZCBSZWplY3Rpb24gUmVhc29uOiAnICsgcmVhc29uKTtcclxufSk7XHJcblxyXG4vLyBHZXQgdGhlIGNvbGxlY3Rpb24gb2YgZGF0YWJhc2VzIHRvIHdhdGNoXHJcbmxldCBjb21wbGV0ZWREYXRhYmFzZSA9IG5ldyBDb3VjaFNlcnZpY2UoJ2NvbXBsZXRlZC12aXNpdHMnKVxyXG5jb21wbGV0ZWREYXRhYmFzZS5nZXRVc2VyRGF0YWJhc2VMaXN0KClcclxuICAgIC50aGVuKGxpc3QgPT4geyBzdGFydChsaXN0KSB9KVxyXG4gICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6IFVuYWJsZSB0byBmZXRjaCBsaXN0IG9mIHVzZXIgZGF0YWJhc2VzJywgZXJyKSlcclxuXHJcbi8vIFN0b3JlIHVzZXJkYiBpbnN0YW5jZXMgaW4gY29sbGVjdGlvbiBlLmcuIHdhdGNoZWREYXRhQmFzZUxpc3RbICd1c2VyZGIteHh4eHh4JywgLi4uIF1cclxuY29uc3Qgc3RhcnQgPSAod2F0Y2hMaXN0KSA9PiB7XHJcbiAgICB3YXRjaExpc3QuZm9yRWFjaChkID0+IHtcclxuICAgICAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RdID0gbmV3IENvdWNoU2VydmljZShkKVxyXG4gICAgICAgIHdhdGNoZWREYXRhYmFzZUxpc3RbZF0uc3Vic2NyaWJlKHByb2Nlc3NDaGFuZ2UsIGdlbmVyYWxFcnJvcilcclxuICAgIH0pXHJcbiAgICBjb25zb2xlLmxvZygnTUZBIFByb2Nlc3NpbmcgU2VydmljZSBSdW5uaW5nLi4uJylcclxufVxyXG5cclxuLy8gSWdub3JlIGRlbGV0ZWQgcmVjb3JkczsgW2NoYW5nZV0gaXMgYWx3YXlzIGFuIGFycmF5OyBcclxuLy8gZGIgaXMgdGhlIGRhdGFiYXNlIG5hbWUsIHNvIHdlIGNhbiByZW1vdmUgZG9jIGxhdGVyXHJcbmNvbnN0IHByb2Nlc3NDaGFuZ2UgPSAoY2hhbmdlLCBkYikgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ0RFQlVHOiBDaGFuZ2UgZGF0YSBpbicsIGRiLCBKU09OLnN0cmluZ2lmeShjaGFuZ2UpKSAvL1xyXG4gICAgY2hhbmdlLmZvckVhY2goYyA9PiB7XHJcbiAgICAgICAgaWYgKCFjLl9kZWxldGVkKSB7IHRlc3RGb3JDb21wbGV0ZWQoYywgZGIpIH1cclxuICAgIH0pXHJcbn1cclxuXHJcbi8vIEZpbHRlciBvbmx5IGNvbXBsZXRlZCByZWNvcmRzXHJcbmNvbnN0IHRlc3RGb3JDb21wbGV0ZWQgPSAoZG9jLCBkYikgPT4ge1xyXG4gICAgaWYgKGRvYy5zdGF0dXMgJiYgKGRvYy5zdGF0dXMgPT09ICdjb21wbGV0ZWQnKSkgeyBtb3ZlUmVjb3JkKGRvYywgZGIpIH1cclxufVxyXG5cclxuLy8gTW92ZSByZWNvcmQgaW50byBjb21wbGV0ZWQgcXVldWVcclxuY29uc3QgbW92ZVJlY29yZCA9IChkb2MsIGRiKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKGRvYykgPT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdERUJVRzogQWRkZWQgZG9jIHRvIGNvbXBsZXRlZC12aXNpdHMnLCBkb2MpXHJcbiAgICAgICAgcmVtb3ZlSWZOb0Vycm9yKGRvYy5pZCwgZGIpXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgY29uc29sZS5sb2coJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkIGNvdWxkIG5vdCBiZSBhZGRlZDogJywgZG9jLl9pZCwgJyA6ICcsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIGNvbXBsZXRlZERhdGFiYXNlLmFkZChkb2MsIHN1Y2Nlc3MsIGVycm9yKVxyXG59XHJcblxyXG4vLyBFbnN1cmUgdGhhdCByZWNvcmQgZXhpc3RzIGluIGNvbXBsZXRlZCBkYXRhYmFzZSBiZWZvcmUgcmVtb3ZpbmdcclxuY29uc3QgcmVtb3ZlSWZOb0Vycm9yID0gKGlkLCBkYikgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChkb2MpID0+IHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnREVCVUc6IEZldGNoZWQgZG9jIGZyb20gY29tcGxldGVkLXZpc2l0cycsIGRvYylcclxuICAgICAgICByZW1vdmUoaWQsIGRiKVxyXG4gICAgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7IGNvbnNvbGUubG9nKCdFcnJvcjogQ29tcGxldGVkIHJlY29yZCBjb3VsZCBub3QgYmUgZm91bmQ6ICcsIGRvYy5faWQsICcgOiAnLCBKU09OLnN0cmluZ2lmeShlcnIpKSB9XHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5mZXRjaChpZCwgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbmNvbnN0IHJlbW92ZSA9IChpZCwgZGIpID0+IHtcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSAocmVzdWx0KSA9PiB7IGNvbnNvbGUubG9nKCdBc3Nlc3NtZW50ICcgKyBpZCArICcgd2FzIGNvbXBsZXRlZCBhdCAnICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKSB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgY29uc29sZS5sb2coJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkJywgaWQsICdjb3VsZCBub3QgYmUgcmVtb3ZlZCBmcm9tJywgZGIsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIHdhdGNoZWREYXRhYmFzZUxpc3RbZGJdLnJlbW92ZShpZCwgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbmNvbnN0IGdlbmVyYWxFcnJvciA9IChlcnIpID0+IHsgY29uc29sZS5sb2coZXJyKSB9XHJcbiJdfQ==