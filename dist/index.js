#!/usr/bin/env node
'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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
var completedDb = new _couchService2.default('completed-visits');
completedDb.getUserDatabaseList().then(function (list) {
    start(list);
}).catch(function (err) {
    return console.log('Error: Unable to fetch list of user databases', err);
});

var start = function start(watchList) {
    console.log('Create listeners for user databases:', watchList);

    // const completedDatabase = new PouchService(completedDb, remoteServer)
    // completedDatabase.sync()

    watchList.forEach(function (d) {
        watchedDatabaseList[d] = new _couchService2.default(d);
        watchedDatabaseList[d].subscribe(processChange, handleError);
    });

    console.log('MFA Processing Service Running...');
};

// Ignore deleted records
// change is always an array
var processChange = function processChange(change) {
    change.forEach(function (c) {
        console.log(c);
        if (!c._deleted) {
            testForCompleted(c);
        }
    });
};

// Filter completed records
var testForCompleted = function testForCompleted(doc) {
    if (doc.status && doc.status === 'completed') {
        console.log('Will move:', (0, _stringify2.default)(doc)); /*moveRecord(doc)*/
    }
};

// Move record into completed queue
var moveRecord = function moveRecord(doc) {
    var addDoc = (0, _assign2.default)({}, doc, { _rev: undefined });
    completedDatabase.add(addDoc).then(removeIfNoError(doc._id)).catch(function (err) {
        return console.log('Error: Completed record could not be added: ', doc._id, ' : ', (0, _stringify2.default)(err));
    });
};

// Ensure that record exists in completed database before removing
var removeIfNoError = function removeIfNoError(id) {
    // index = watchedDatabaseList.indexOf(db)
    completedDatabase.fetch(id).then(function (doc) {
        watchedDatabaseList[index].remove(doc._id).then(console.log('Assessment ' + doc._id + ' was completed at ' + new Date().toISOString()));
    }).catch(function (err) {
        return console.log('Error: Completed record could not be removed: ', id, ' : ', (0, _stringify2.default)(err));
    });
};

var handleError = function handleError(error) {
    console.log(error);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsImNvbXBsZXRlZERiIiwiZ2V0VXNlckRhdGFiYXNlTGlzdCIsInRoZW4iLCJzdGFydCIsImxpc3QiLCJjYXRjaCIsImNvbnNvbGUiLCJsb2ciLCJlcnIiLCJ3YXRjaExpc3QiLCJmb3JFYWNoIiwiZCIsInN1YnNjcmliZSIsInByb2Nlc3NDaGFuZ2UiLCJoYW5kbGVFcnJvciIsImNoYW5nZSIsImMiLCJfZGVsZXRlZCIsInRlc3RGb3JDb21wbGV0ZWQiLCJkb2MiLCJzdGF0dXMiLCJtb3ZlUmVjb3JkIiwiYWRkRG9jIiwiX3JldiIsInVuZGVmaW5lZCIsImNvbXBsZXRlZERhdGFiYXNlIiwiYWRkIiwicmVtb3ZlSWZOb0Vycm9yIiwiX2lkIiwiaWQiLCJmZXRjaCIsImluZGV4IiwicmVtb3ZlIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQTs7QUFHQTs7Ozs7O0FBRkE7QUFDQSxJQUFNQSxTQUFTQyxRQUFRLFFBQVIsQ0FBZjs7O0FBR0EsSUFBSUMsc0JBQXNCLEVBQTFCOztBQUVBO0FBQ0EsSUFBSUMsY0FBYywyQkFBaUIsa0JBQWpCLENBQWxCO0FBQ0FBLFlBQVlDLG1CQUFaLEdBQ0tDLElBREwsQ0FDVSxnQkFBUTtBQUFFQyxVQUFNQyxJQUFOO0FBQWEsQ0FEakMsRUFFS0MsS0FGTCxDQUVXO0FBQUEsV0FBT0MsUUFBUUMsR0FBUixDQUFZLCtDQUFaLEVBQTZEQyxHQUE3RCxDQUFQO0FBQUEsQ0FGWDs7QUFJQSxJQUFNTCxRQUFRLFNBQVJBLEtBQVEsQ0FBQ00sU0FBRCxFQUFlO0FBQ3pCSCxZQUFRQyxHQUFSLENBQVksc0NBQVosRUFBb0RFLFNBQXBEOztBQUVBO0FBQ0E7O0FBRUFBLGNBQVVDLE9BQVYsQ0FBa0IsYUFBSztBQUNuQlgsNEJBQW9CWSxDQUFwQixJQUF5QiwyQkFBaUJBLENBQWpCLENBQXpCO0FBQ0FaLDRCQUFvQlksQ0FBcEIsRUFBdUJDLFNBQXZCLENBQWlDQyxhQUFqQyxFQUFnREMsV0FBaEQ7QUFDSCxLQUhEOztBQUtBUixZQUFRQyxHQUFSLENBQVksbUNBQVo7QUFDSCxDQVpEOztBQWNBO0FBQ0E7QUFDQSxJQUFNTSxnQkFBZ0IsU0FBaEJBLGFBQWdCLENBQUNFLE1BQUQsRUFBWTtBQUM5QkEsV0FBT0wsT0FBUCxDQUFlLGFBQUs7QUFDaEJKLGdCQUFRQyxHQUFSLENBQVlTLENBQVo7QUFDQSxZQUFJLENBQUNBLEVBQUVDLFFBQVAsRUFBaUI7QUFBRUMsNkJBQWlCRixDQUFqQjtBQUFxQjtBQUMzQyxLQUhEO0FBSUgsQ0FMRDs7QUFPQTtBQUNBLElBQU1FLG1CQUFtQixTQUFuQkEsZ0JBQW1CLENBQUNDLEdBQUQsRUFBUztBQUM5QixRQUFJQSxJQUFJQyxNQUFKLElBQWVELElBQUlDLE1BQUosS0FBZSxXQUFsQyxFQUFnRDtBQUFFZCxnQkFBUUMsR0FBUixDQUFZLFlBQVosRUFBMEIseUJBQWVZLEdBQWYsQ0FBMUIsRUFBRixDQUFnRDtBQUFxQjtBQUN4SCxDQUZEOztBQUlBO0FBQ0EsSUFBTUUsYUFBYSxTQUFiQSxVQUFhLENBQUNGLEdBQUQsRUFBUztBQUN4QixRQUFJRyxTQUFTLHNCQUFjLEVBQWQsRUFBa0JILEdBQWxCLEVBQXVCLEVBQUVJLE1BQU1DLFNBQVIsRUFBdkIsQ0FBYjtBQUNBQyxzQkFBa0JDLEdBQWxCLENBQXNCSixNQUF0QixFQUNLcEIsSUFETCxDQUNVeUIsZ0JBQWdCUixJQUFJUyxHQUFwQixDQURWLEVBRUt2QixLQUZMLENBRVc7QUFBQSxlQUFPQyxRQUFRQyxHQUFSLENBQVksOENBQVosRUFBNERZLElBQUlTLEdBQWhFLEVBQXFFLEtBQXJFLEVBQTRFLHlCQUFlcEIsR0FBZixDQUE1RSxDQUFQO0FBQUEsS0FGWDtBQUdILENBTEQ7O0FBT0E7QUFDQSxJQUFNbUIsa0JBQWtCLFNBQWxCQSxlQUFrQixDQUFDRSxFQUFELEVBQVE7QUFDNUI7QUFDQUosc0JBQWtCSyxLQUFsQixDQUF3QkQsRUFBeEIsRUFDSzNCLElBREwsQ0FDVSxlQUFPO0FBQ1RILDRCQUFvQmdDLEtBQXBCLEVBQTJCQyxNQUEzQixDQUFrQ2IsSUFBSVMsR0FBdEMsRUFDSzFCLElBREwsQ0FDVUksUUFBUUMsR0FBUixDQUFZLGdCQUFnQlksSUFBSVMsR0FBcEIsR0FBMEIsb0JBQTFCLEdBQWlELElBQUlLLElBQUosR0FBV0MsV0FBWCxFQUE3RCxDQURWO0FBRUgsS0FKTCxFQUtLN0IsS0FMTCxDQUtXO0FBQUEsZUFBT0MsUUFBUUMsR0FBUixDQUFZLGdEQUFaLEVBQThEc0IsRUFBOUQsRUFBa0UsS0FBbEUsRUFBeUUseUJBQWVyQixHQUFmLENBQXpFLENBQVA7QUFBQSxLQUxYO0FBTUgsQ0FSRDs7QUFVQSxJQUFNTSxjQUFjLFNBQWRBLFdBQWMsQ0FBQ3FCLEtBQUQsRUFBVztBQUFFN0IsWUFBUUMsR0FBUixDQUFZNEIsS0FBWjtBQUFvQixDQUFyRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQgeyBpbnN0YWxsIH0gZnJvbSAnc291cmNlLW1hcC1zdXBwb3J0JztcclxuaW5zdGFsbCgpO1xyXG5jb25zdCBjb25maWcgPSByZXF1aXJlKCdjb25maWcnKTtcclxuaW1wb3J0IENvdWNoU2VydmljZSBmcm9tICcuL2NvdWNoU2VydmljZSdcclxuXHJcbmxldCB3YXRjaGVkRGF0YWJhc2VMaXN0ID0gW11cclxuXHJcbi8vIEdldCB0aGUgY29sbGVjdGlvbiBvZiBkYXRhYmFzZXMgdG8gd2F0Y2hcclxubGV0IGNvbXBsZXRlZERiID0gbmV3IENvdWNoU2VydmljZSgnY29tcGxldGVkLXZpc2l0cycpXHJcbmNvbXBsZXRlZERiLmdldFVzZXJEYXRhYmFzZUxpc3QoKVxyXG4gICAgLnRoZW4obGlzdCA9PiB7IHN0YXJ0KGxpc3QpIH0pXHJcbiAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKCdFcnJvcjogVW5hYmxlIHRvIGZldGNoIGxpc3Qgb2YgdXNlciBkYXRhYmFzZXMnLCBlcnIpKVxyXG4gICAgICAgIFxyXG5jb25zdCBzdGFydCA9ICh3YXRjaExpc3QpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdDcmVhdGUgbGlzdGVuZXJzIGZvciB1c2VyIGRhdGFiYXNlczonLCB3YXRjaExpc3QpXHJcblxyXG4gICAgLy8gY29uc3QgY29tcGxldGVkRGF0YWJhc2UgPSBuZXcgUG91Y2hTZXJ2aWNlKGNvbXBsZXRlZERiLCByZW1vdGVTZXJ2ZXIpXHJcbiAgICAvLyBjb21wbGV0ZWREYXRhYmFzZS5zeW5jKClcclxuXHJcbiAgICB3YXRjaExpc3QuZm9yRWFjaChkID0+IHtcclxuICAgICAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RdID0gbmV3IENvdWNoU2VydmljZShkKVxyXG4gICAgICAgIHdhdGNoZWREYXRhYmFzZUxpc3RbZF0uc3Vic2NyaWJlKHByb2Nlc3NDaGFuZ2UsIGhhbmRsZUVycm9yKVxyXG4gICAgfSlcclxuXHJcbiAgICBjb25zb2xlLmxvZygnTUZBIFByb2Nlc3NpbmcgU2VydmljZSBSdW5uaW5nLi4uJylcclxufVxyXG5cclxuLy8gSWdub3JlIGRlbGV0ZWQgcmVjb3Jkc1xyXG4vLyBjaGFuZ2UgaXMgYWx3YXlzIGFuIGFycmF5XHJcbmNvbnN0IHByb2Nlc3NDaGFuZ2UgPSAoY2hhbmdlKSA9PiB7XHJcbiAgICBjaGFuZ2UuZm9yRWFjaChjID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhjKVxyXG4gICAgICAgIGlmICghYy5fZGVsZXRlZCkgeyB0ZXN0Rm9yQ29tcGxldGVkKGMpIH1cclxuICAgIH0pXHJcbn1cclxuXHJcbi8vIEZpbHRlciBjb21wbGV0ZWQgcmVjb3Jkc1xyXG5jb25zdCB0ZXN0Rm9yQ29tcGxldGVkID0gKGRvYykgPT4ge1xyXG4gICAgaWYgKGRvYy5zdGF0dXMgJiYgKGRvYy5zdGF0dXMgPT09ICdjb21wbGV0ZWQnKSkgeyBjb25zb2xlLmxvZygnV2lsbCBtb3ZlOicsIEpTT04uc3RyaW5naWZ5KGRvYykpLyptb3ZlUmVjb3JkKGRvYykqLyB9XHJcbn1cclxuXHJcbi8vIE1vdmUgcmVjb3JkIGludG8gY29tcGxldGVkIHF1ZXVlXHJcbmNvbnN0IG1vdmVSZWNvcmQgPSAoZG9jKSA9PiB7XHJcbiAgICBsZXQgYWRkRG9jID0gT2JqZWN0LmFzc2lnbih7fSwgZG9jLCB7IF9yZXY6IHVuZGVmaW5lZCB9KVxyXG4gICAgY29tcGxldGVkRGF0YWJhc2UuYWRkKGFkZERvYylcclxuICAgICAgICAudGhlbihyZW1vdmVJZk5vRXJyb3IoZG9jLl9pZCkpXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6IENvbXBsZXRlZCByZWNvcmQgY291bGQgbm90IGJlIGFkZGVkOiAnLCBkb2MuX2lkLCAnIDogJywgSlNPTi5zdHJpbmdpZnkoZXJyKSkpXHJcbn1cclxuXHJcbi8vIEVuc3VyZSB0aGF0IHJlY29yZCBleGlzdHMgaW4gY29tcGxldGVkIGRhdGFiYXNlIGJlZm9yZSByZW1vdmluZ1xyXG5jb25zdCByZW1vdmVJZk5vRXJyb3IgPSAoaWQpID0+IHtcclxuICAgIC8vIGluZGV4ID0gd2F0Y2hlZERhdGFiYXNlTGlzdC5pbmRleE9mKGRiKVxyXG4gICAgY29tcGxldGVkRGF0YWJhc2UuZmV0Y2goaWQpXHJcbiAgICAgICAgLnRoZW4oZG9jID0+IHtcclxuICAgICAgICAgICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtpbmRleF0ucmVtb3ZlKGRvYy5faWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihjb25zb2xlLmxvZygnQXNzZXNzbWVudCAnICsgZG9jLl9pZCArICcgd2FzIGNvbXBsZXRlZCBhdCAnICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkIGNvdWxkIG5vdCBiZSByZW1vdmVkOiAnLCBpZCwgJyA6ICcsIEpTT04uc3RyaW5naWZ5KGVycikpKVxyXG59XHJcblxyXG5jb25zdCBoYW5kbGVFcnJvciA9IChlcnJvcikgPT4geyBjb25zb2xlLmxvZyhlcnJvcikgfVxyXG4iXX0=