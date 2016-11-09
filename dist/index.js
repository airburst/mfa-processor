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

var handleError = function handleError(err) {
    console.log(err);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInByb2Nlc3MiLCJvbiIsInJlYXNvbiIsImNvbnNvbGUiLCJsb2ciLCJjb21wbGV0ZWREYXRhYmFzZSIsImdldFVzZXJEYXRhYmFzZUxpc3QiLCJ0aGVuIiwic3RhcnQiLCJsaXN0IiwiY2F0Y2giLCJlcnIiLCJ3YXRjaExpc3QiLCJmb3JFYWNoIiwiZCIsInN1YnNjcmliZSIsInByb2Nlc3NDaGFuZ2UiLCJoYW5kbGVFcnJvciIsImNoYW5nZSIsImRiIiwiYyIsIl9kZWxldGVkIiwidGVzdEZvckNvbXBsZXRlZCIsImRvYyIsInN0YXR1cyIsIm1vdmVSZWNvcmQiLCJzdWNjZXNzIiwicmVtb3ZlSWZOb0Vycm9yIiwiaWQiLCJlcnJvciIsIl9pZCIsImFkZCIsInJlbW92ZSIsImZldGNoIiwicmVzdWx0IiwiRGF0ZSIsInRvSVNPU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7QUFHQTs7Ozs7O0FBRkE7QUFDQSxJQUFNQSxTQUFTQyxRQUFRLFFBQVIsQ0FBZjs7O0FBR0EsSUFBSUMsc0JBQXNCLEVBQTFCOztBQUVBQyxRQUFRQyxFQUFSLENBQVcsb0JBQVgsRUFBaUMsVUFBQ0MsTUFBRCxFQUFZO0FBQzVDQyxZQUFRQyxHQUFSLENBQVksd0NBQXdDRixNQUFwRDtBQUNBLENBRkQ7O0FBSUE7QUFDQSxJQUFJRyxvQkFBb0IsMkJBQWlCLGtCQUFqQixDQUF4QjtBQUNBQSxrQkFBa0JDLG1CQUFsQixHQUNLQyxJQURMLENBQ1UsZ0JBQVE7QUFBRUMsVUFBTUMsSUFBTjtBQUFhLENBRGpDLEVBRUtDLEtBRkwsQ0FFVztBQUFBLFdBQU9QLFFBQVFDLEdBQVIsQ0FBWSwrQ0FBWixFQUE2RE8sR0FBN0QsQ0FBUDtBQUFBLENBRlg7O0FBSUE7QUFDQSxJQUFNSCxRQUFRLFNBQVJBLEtBQVEsQ0FBQ0ksU0FBRCxFQUFlO0FBQ3pCQSxj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anMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IHsgaW5zdGFsbCB9IGZyb20gJ3NvdXJjZS1tYXAtc3VwcG9ydCc7XHJcbmluc3RhbGwoKTtcclxuY29uc3QgY29uZmlnID0gcmVxdWlyZSgnY29uZmlnJyk7XHJcbmltcG9ydCBDb3VjaFNlcnZpY2UgZnJvbSAnLi9jb3VjaFNlcnZpY2UnXHJcblxyXG5sZXQgd2F0Y2hlZERhdGFiYXNlTGlzdCA9IFtdXHJcblxyXG5wcm9jZXNzLm9uKCd1bmhhbmRsZWRSZWplY3Rpb24nLCAocmVhc29uKSA9PiB7XHJcblx0Y29uc29sZS5sb2coJ0RFQlVHOiBVbmhhbmRsZWQgUmVqZWN0aW9uIFJlYXNvbjogJyArIHJlYXNvbik7XHJcbn0pO1xyXG5cclxuLy8gR2V0IHRoZSBjb2xsZWN0aW9uIG9mIGRhdGFiYXNlcyB0byB3YXRjaFxyXG5sZXQgY29tcGxldGVkRGF0YWJhc2UgPSBuZXcgQ291Y2hTZXJ2aWNlKCdjb21wbGV0ZWQtdmlzaXRzJylcclxuY29tcGxldGVkRGF0YWJhc2UuZ2V0VXNlckRhdGFiYXNlTGlzdCgpXHJcbiAgICAudGhlbihsaXN0ID0+IHsgc3RhcnQobGlzdCkgfSlcclxuICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coJ0Vycm9yOiBVbmFibGUgdG8gZmV0Y2ggbGlzdCBvZiB1c2VyIGRhdGFiYXNlcycsIGVycikpXHJcblxyXG4vLyBTdG9yZSB1c2VyZGIgaW5zdGFuY2VzIGluIGNvbGxlY3Rpb24gZS5nLiB3YXRjaGVkRGF0YUJhc2VMaXN0WyAndXNlcmRiLXh4eHh4eCcsIC4uLiBdXHJcbmNvbnN0IHN0YXJ0ID0gKHdhdGNoTGlzdCkgPT4ge1xyXG4gICAgd2F0Y2hMaXN0LmZvckVhY2goZCA9PiB7XHJcbiAgICAgICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtkXSA9IG5ldyBDb3VjaFNlcnZpY2UoZClcclxuICAgICAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RdLnN1YnNjcmliZShwcm9jZXNzQ2hhbmdlLCBoYW5kbGVFcnJvcilcclxuICAgIH0pXHJcbiAgICBjb25zb2xlLmxvZygnTUZBIFByb2Nlc3NpbmcgU2VydmljZSBSdW5uaW5nLi4uJylcclxufVxyXG5cclxuLy8gSWdub3JlIGRlbGV0ZWQgcmVjb3JkczsgW2NoYW5nZV0gaXMgYWx3YXlzIGFuIGFycmF5OyBcclxuLy8gZGIgaXMgdGhlIGRhdGFiYXNlIG5hbWUsIHNvIHdlIGNhbiByZW1vdmUgZG9jIGxhdGVyXHJcbmNvbnN0IHByb2Nlc3NDaGFuZ2UgPSAoY2hhbmdlLCBkYikgPT4ge1xyXG4gICAgY2hhbmdlLmZvckVhY2goYyA9PiB7XHJcbiAgICAgICAgaWYgKCFjLl9kZWxldGVkKSB7IHRlc3RGb3JDb21wbGV0ZWQoYywgZGIpIH1cclxuICAgIH0pXHJcbn1cclxuXHJcbi8vIEZpbHRlciBvbmx5IGNvbXBsZXRlZCByZWNvcmRzXHJcbmNvbnN0IHRlc3RGb3JDb21wbGV0ZWQgPSAoZG9jLCBkYikgPT4ge1xyXG4gICAgaWYgKGRvYy5zdGF0dXMgJiYgKGRvYy5zdGF0dXMgPT09ICdjb21wbGV0ZWQnKSkgeyBtb3ZlUmVjb3JkKGRvYywgZGIpIH1cclxufVxyXG5cclxuLy8gTW92ZSByZWNvcmQgaW50byBjb21wbGV0ZWQgcXVldWVcclxuY29uc3QgbW92ZVJlY29yZCA9IChkb2MsIGRiKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKGRvYykgPT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdERUJVRzogQWRkZWQgZG9jIHRvIGNvbXBsZXRlZC12aXNpdHMnLCBkb2MpXHJcbiAgICAgICAgcmVtb3ZlSWZOb0Vycm9yKGRvYy5pZCwgZGIpXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgY29uc29sZS5sb2coJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkIGNvdWxkIG5vdCBiZSBhZGRlZDogJywgZG9jLl9pZCwgJyA6ICcsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIGNvbXBsZXRlZERhdGFiYXNlLmFkZChkb2MsIHN1Y2Nlc3MsIGVycm9yKVxyXG59XHJcblxyXG4vLyBFbnN1cmUgdGhhdCByZWNvcmQgZXhpc3RzIGluIGNvbXBsZXRlZCBkYXRhYmFzZSBiZWZvcmUgcmVtb3ZpbmdcclxuY29uc3QgcmVtb3ZlSWZOb0Vycm9yID0gKGlkLCBkYikgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChkb2MpID0+IHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnREVCVUc6IEZldGNoZWQgZG9jIGZyb20gY29tcGxldGVkLXZpc2l0cycsIGRvYylcclxuICAgICAgICByZW1vdmUoaWQsIGRiKVxyXG4gICAgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7IGNvbnNvbGUubG9nKCdFcnJvcjogQ29tcGxldGVkIHJlY29yZCBjb3VsZCBub3QgYmUgZm91bmQ6ICcsIGRvYy5faWQsICcgOiAnLCBKU09OLnN0cmluZ2lmeShlcnIpKSB9XHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5mZXRjaChpZCwgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbmNvbnN0IHJlbW92ZSA9IChpZCwgZGIpID0+IHtcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSAocmVzdWx0KSA9PiB7IGNvbnNvbGUubG9nKCdBc3Nlc3NtZW50ICcgKyBpZCArICcgd2FzIGNvbXBsZXRlZCBhdCAnICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKSB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgY29uc29sZS5sb2coJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkJywgaWQsICdjb3VsZCBub3QgYmUgcmVtb3ZlZCBmcm9tJywgZGIsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIHdhdGNoZWREYXRhYmFzZUxpc3RbZGJdLnJlbW92ZShpZCwgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbmNvbnN0IGhhbmRsZUVycm9yID0gKGVycikgPT4geyBjb25zb2xlLmxvZyhlcnIpIH1cclxuIl19