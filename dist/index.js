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
var start = function start(watchList) {
    var completedDb = new _couchService2.default('completed-visits');

    completedDb.getUserDatabaseList().then(function (list) {
        console.log(list);
    });

    var watchedDB = new _couchService2.default('userdb-626f62');
    watchedDB.subscribe(processChange);
    // const completedDatabase = new PouchService(completedDb, remoteServer)
    // completedDatabase.sync()

    // watchedDatabaseList = watchList.map(d => new PouchService(d, remoteServer))
    // watchedDatabaseList.forEach(w => {
    //     w.subscribe(processChange)
    //     w.sync()
    // })

    console.log('MFA Processing Service Running...');
};

start();

// Ignore deleted records
var processChange = function processChange(change, db) {
    if (change.doc && !change.doc._deleted) {
        testForCompleted(change.doc, db);
    }
};

// Filter completed records
var testForCompleted = function testForCompleted(doc, db) {
    if (doc.status && doc.status === 'completed') {
        console.log('Will move:', (0, _stringify2.default)(doc)); /*moveRecord(doc, db)*/
    }
};

// Move record into completed queue
var moveRecord = function moveRecord(doc, db) {
    var addDoc = (0, _assign2.default)({}, doc, { _rev: undefined });
    completedDatabase.add(addDoc).then(removeIfNoError(doc._id, db)).catch(function (err) {
        return console.log('Error: Completed record could not be added: ', doc._id, ' : ', (0, _stringify2.default)(err));
    });
};

// Ensure that record exists in completed database before removing
var removeIfNoError = function removeIfNoError(id, db) {
    index = watchedDatabaseList.indexOf(db);
    completedDatabase.fetch(id).then(function (doc) {
        watchedDatabaseList[index].remove(doc._id).then(console.log('Assessment ' + doc._id + ' was completed at ' + new Date().toISOString()));
    }).catch(function (err) {
        return console.log('Error: Completed record could not be removed: ', id, ' : ', (0, _stringify2.default)(err));
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInN0YXJ0Iiwid2F0Y2hMaXN0IiwiY29tcGxldGVkRGIiLCJnZXRVc2VyRGF0YWJhc2VMaXN0IiwidGhlbiIsImNvbnNvbGUiLCJsb2ciLCJsaXN0Iiwid2F0Y2hlZERCIiwic3Vic2NyaWJlIiwicHJvY2Vzc0NoYW5nZSIsImNoYW5nZSIsImRiIiwiZG9jIiwiX2RlbGV0ZWQiLCJ0ZXN0Rm9yQ29tcGxldGVkIiwic3RhdHVzIiwibW92ZVJlY29yZCIsImFkZERvYyIsIl9yZXYiLCJ1bmRlZmluZWQiLCJjb21wbGV0ZWREYXRhYmFzZSIsImFkZCIsInJlbW92ZUlmTm9FcnJvciIsIl9pZCIsImNhdGNoIiwiZXJyIiwiaWQiLCJpbmRleCIsImluZGV4T2YiLCJmZXRjaCIsInJlbW92ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBOztBQUdBOzs7Ozs7QUFGQTtBQUNBLElBQU1BLFNBQVNDLFFBQVEsUUFBUixDQUFmOzs7QUFHQSxJQUFJQyxzQkFBc0IsRUFBMUI7O0FBRUE7QUFDQSxJQUFNQyxRQUFRLFNBQVJBLEtBQVEsQ0FBQ0MsU0FBRCxFQUFlO0FBQ3pCLFFBQUlDLGNBQWMsMkJBQWlCLGtCQUFqQixDQUFsQjs7QUFFQUEsZ0JBQVlDLG1CQUFaLEdBQ0tDLElBREwsQ0FDVSxnQkFBUTtBQUFFQyxnQkFBUUMsR0FBUixDQUFZQyxJQUFaO0FBQW1CLEtBRHZDOztBQUdBLFFBQUlDLFlBQVksMkJBQWlCLGVBQWpCLENBQWhCO0FBQ0FBLGNBQVVDLFNBQVYsQ0FBb0JDLGFBQXBCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBTCxZQUFRQyxHQUFSLENBQVksbUNBQVo7QUFDSCxDQWxCRDs7QUFvQkFOOztBQUVBO0FBQ0EsSUFBTVUsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFDQyxNQUFELEVBQVNDLEVBQVQsRUFBZ0I7QUFDbEMsUUFBSUQsT0FBT0UsR0FBUCxJQUFjLENBQUNGLE9BQU9FLEdBQVAsQ0FBV0MsUUFBOUIsRUFBd0M7QUFBRUMseUJBQWlCSixPQUFPRSxHQUF4QixFQUE2QkQsRUFBN0I7QUFBa0M7QUFDL0UsQ0FGRDs7QUFJQTtBQUNBLElBQU1HLG1CQUFtQixTQUFuQkEsZ0JBQW1CLENBQUNGLEdBQUQsRUFBTUQsRUFBTixFQUFhO0FBQ2xDLFFBQUlDLElBQUlHLE1BQUosSUFBZUgsSUFBSUcsTUFBSixLQUFlLFdBQWxDLEVBQWdEO0FBQUVYLGdCQUFRQyxHQUFSLENBQVksWUFBWixFQUEwQix5QkFBZU8sR0FBZixDQUExQixFQUFGLENBQWdEO0FBQXlCO0FBQzVILENBRkQ7O0FBSUE7QUFDQSxJQUFNSSxhQUFhLFNBQWJBLFVBQWEsQ0FBQ0osR0FBRCxFQUFNRCxFQUFOLEVBQWE7QUFDNUIsUUFBSU0sU0FBUyxzQkFBYyxFQUFkLEVBQWtCTCxHQUFsQixFQUF1QixFQUFFTSxNQUFNQyxTQUFSLEVBQXZCLENBQWI7QUFDQUMsc0JBQWtCQyxHQUFsQixDQUFzQkosTUFBdEIsRUFDS2QsSUFETCxDQUNVbUIsZ0JBQWdCVixJQUFJVyxHQUFwQixFQUF5QlosRUFBekIsQ0FEVixFQUVLYSxLQUZMLENBRVc7QUFBQSxlQUFPcEIsUUFBUUMsR0FBUixDQUFZLDhDQUFaLEVBQTRETyxJQUFJVyxHQUFoRSxFQUFxRSxLQUFyRSxFQUE0RSx5QkFBZUUsR0FBZixDQUE1RSxDQUFQO0FBQUEsS0FGWDtBQUdILENBTEQ7O0FBT0E7QUFDQSxJQUFNSCxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQUNJLEVBQUQsRUFBS2YsRUFBTCxFQUFZO0FBQ2hDZ0IsWUFBUTdCLG9CQUFvQjhCLE9BQXBCLENBQTRCakIsRUFBNUIsQ0FBUjtBQUNBUyxzQkFBa0JTLEtBQWxCLENBQXdCSCxFQUF4QixFQUNLdkIsSUFETCxDQUNVLGVBQU87QUFDVEwsNEJBQW9CNkIsS0FBcEIsRUFBMkJHLE1BQTNCLENBQWtDbEIsSUFBSVcsR0FBdEMsRUFDS3BCLElBREwsQ0FDVUMsUUFBUUMsR0FBUixDQUFZLGdCQUFnQk8sSUFBSVcsR0FBcEIsR0FBMEIsb0JBQTFCLEdBQWlELElBQUlRLElBQUosR0FBV0MsV0FBWCxFQUE3RCxDQURWO0FBRUgsS0FKTCxFQUtLUixLQUxMLENBS1c7QUFBQSxlQUFPcEIsUUFBUUMsR0FBUixDQUFZLGdEQUFaLEVBQThEcUIsRUFBOUQsRUFBa0UsS0FBbEUsRUFBeUUseUJBQWVELEdBQWYsQ0FBekUsQ0FBUDtBQUFBLEtBTFg7QUFNSCxDQVJEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7IGluc3RhbGwgfSBmcm9tICdzb3VyY2UtbWFwLXN1cHBvcnQnO1xyXG5pbnN0YWxsKCk7XHJcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2NvbmZpZycpO1xyXG5pbXBvcnQgQ291Y2hTZXJ2aWNlIGZyb20gJy4vY291Y2hTZXJ2aWNlJ1xyXG5cclxubGV0IHdhdGNoZWREYXRhYmFzZUxpc3QgPSBbXVxyXG5cclxuLy8gR2V0IHRoZSBjb2xsZWN0aW9uIG9mIGRhdGFiYXNlcyB0byB3YXRjaFxyXG5jb25zdCBzdGFydCA9ICh3YXRjaExpc3QpID0+IHtcclxuICAgIGxldCBjb21wbGV0ZWREYiA9IG5ldyBDb3VjaFNlcnZpY2UoJ2NvbXBsZXRlZC12aXNpdHMnKVxyXG5cclxuICAgIGNvbXBsZXRlZERiLmdldFVzZXJEYXRhYmFzZUxpc3QoKVxyXG4gICAgICAgIC50aGVuKGxpc3QgPT4geyBjb25zb2xlLmxvZyhsaXN0KSB9KVxyXG4gICAgXHJcbiAgICBsZXQgd2F0Y2hlZERCID0gbmV3IENvdWNoU2VydmljZSgndXNlcmRiLTYyNmY2MicpXHJcbiAgICB3YXRjaGVkREIuc3Vic2NyaWJlKHByb2Nlc3NDaGFuZ2UpXHJcbiAgICAvLyBjb25zdCBjb21wbGV0ZWREYXRhYmFzZSA9IG5ldyBQb3VjaFNlcnZpY2UoY29tcGxldGVkRGIsIHJlbW90ZVNlcnZlcilcclxuICAgIC8vIGNvbXBsZXRlZERhdGFiYXNlLnN5bmMoKVxyXG5cclxuICAgIC8vIHdhdGNoZWREYXRhYmFzZUxpc3QgPSB3YXRjaExpc3QubWFwKGQgPT4gbmV3IFBvdWNoU2VydmljZShkLCByZW1vdGVTZXJ2ZXIpKVxyXG4gICAgLy8gd2F0Y2hlZERhdGFiYXNlTGlzdC5mb3JFYWNoKHcgPT4ge1xyXG4gICAgLy8gICAgIHcuc3Vic2NyaWJlKHByb2Nlc3NDaGFuZ2UpXHJcbiAgICAvLyAgICAgdy5zeW5jKClcclxuICAgIC8vIH0pXHJcblxyXG4gICAgY29uc29sZS5sb2coJ01GQSBQcm9jZXNzaW5nIFNlcnZpY2UgUnVubmluZy4uLicpXHJcbn1cclxuXHJcbnN0YXJ0KClcclxuXHJcbi8vIElnbm9yZSBkZWxldGVkIHJlY29yZHNcclxuY29uc3QgcHJvY2Vzc0NoYW5nZSA9IChjaGFuZ2UsIGRiKSA9PiB7XHJcbiAgICBpZiAoY2hhbmdlLmRvYyAmJiAhY2hhbmdlLmRvYy5fZGVsZXRlZCkgeyB0ZXN0Rm9yQ29tcGxldGVkKGNoYW5nZS5kb2MsIGRiKSB9XHJcbn1cclxuXHJcbi8vIEZpbHRlciBjb21wbGV0ZWQgcmVjb3Jkc1xyXG5jb25zdCB0ZXN0Rm9yQ29tcGxldGVkID0gKGRvYywgZGIpID0+IHtcclxuICAgIGlmIChkb2Muc3RhdHVzICYmIChkb2Muc3RhdHVzID09PSAnY29tcGxldGVkJykpIHsgY29uc29sZS5sb2coJ1dpbGwgbW92ZTonLCBKU09OLnN0cmluZ2lmeShkb2MpKS8qbW92ZVJlY29yZChkb2MsIGRiKSovIH1cclxufVxyXG5cclxuLy8gTW92ZSByZWNvcmQgaW50byBjb21wbGV0ZWQgcXVldWVcclxuY29uc3QgbW92ZVJlY29yZCA9IChkb2MsIGRiKSA9PiB7XHJcbiAgICBsZXQgYWRkRG9jID0gT2JqZWN0LmFzc2lnbih7fSwgZG9jLCB7IF9yZXY6IHVuZGVmaW5lZCB9KVxyXG4gICAgY29tcGxldGVkRGF0YWJhc2UuYWRkKGFkZERvYylcclxuICAgICAgICAudGhlbihyZW1vdmVJZk5vRXJyb3IoZG9jLl9pZCwgZGIpKVxyXG4gICAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkIGNvdWxkIG5vdCBiZSBhZGRlZDogJywgZG9jLl9pZCwgJyA6ICcsIEpTT04uc3RyaW5naWZ5KGVycikpKVxyXG59XHJcblxyXG4vLyBFbnN1cmUgdGhhdCByZWNvcmQgZXhpc3RzIGluIGNvbXBsZXRlZCBkYXRhYmFzZSBiZWZvcmUgcmVtb3ZpbmdcclxuY29uc3QgcmVtb3ZlSWZOb0Vycm9yID0gKGlkLCBkYikgPT4ge1xyXG4gICAgaW5kZXggPSB3YXRjaGVkRGF0YWJhc2VMaXN0LmluZGV4T2YoZGIpXHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5mZXRjaChpZClcclxuICAgICAgICAudGhlbihkb2MgPT4ge1xyXG4gICAgICAgICAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2luZGV4XS5yZW1vdmUoZG9jLl9pZClcclxuICAgICAgICAgICAgICAgIC50aGVuKGNvbnNvbGUubG9nKCdBc3Nlc3NtZW50ICcgKyBkb2MuX2lkICsgJyB3YXMgY29tcGxldGVkIGF0ICcgKyBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6IENvbXBsZXRlZCByZWNvcmQgY291bGQgbm90IGJlIHJlbW92ZWQ6ICcsIGlkLCAnIDogJywgSlNPTi5zdHJpbmdpZnkoZXJyKSkpXHJcbn1cclxuIl19