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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInN0YXJ0Iiwid2F0Y2hMaXN0IiwiY29tcGxldGVkRGIiLCJnZXRVc2VyRGF0YWJhc2VMaXN0IiwidGhlbiIsImNvbnNvbGUiLCJsb2ciLCJsaXN0Iiwid2F0Y2hlZERCIiwic3Vic2NyaWJlIiwicHJvY2Vzc0NoYW5nZSIsImNoYW5nZSIsImRiIiwiZG9jIiwiX2RlbGV0ZWQiLCJ0ZXN0Rm9yQ29tcGxldGVkIiwic3RhdHVzIiwibW92ZVJlY29yZCIsImFkZERvYyIsIl9yZXYiLCJ1bmRlZmluZWQiLCJjb21wbGV0ZWREYXRhYmFzZSIsImFkZCIsInJlbW92ZUlmTm9FcnJvciIsIl9pZCIsImNhdGNoIiwiZXJyIiwiaWQiLCJpbmRleCIsImluZGV4T2YiLCJmZXRjaCIsInJlbW92ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBOztBQUdBOzs7Ozs7QUFGQTtBQUNBLElBQU1BLFNBQVNDLFFBQVEsUUFBUixDQUFmOzs7QUFHQSxJQUFJQyxzQkFBc0IsRUFBMUI7O0FBRUE7QUFDQSxJQUFNQyxRQUFRLFNBQVJBLEtBQVEsQ0FBQ0MsU0FBRCxFQUFlO0FBQ3pCLFFBQUlDLGNBQWMsMkJBQWlCLGtCQUFqQixDQUFsQjs7QUFFQUEsZ0JBQVlDLG1CQUFaLEdBQ0tDLElBREwsQ0FDVSxnQkFBUTtBQUFFQyxnQkFBUUMsR0FBUixDQUFZQyxJQUFaO0FBQW1CLEtBRHZDOztBQUdBLFFBQUlDLFlBQVksMkJBQWlCLGVBQWpCLENBQWhCO0FBQ0FBLGNBQVVDLFNBQVYsQ0FBb0JDLGFBQXBCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBTCxZQUFRQyxHQUFSLENBQVksbUNBQVo7QUFDSCxDQWxCRDs7QUFvQkFOOztBQUVBO0FBQ0EsSUFBTVUsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFDQyxNQUFELEVBQVNDLEVBQVQsRUFBZ0I7QUFDbEMsUUFBSUQsT0FBT0UsR0FBUCxJQUFjLENBQUNGLE9BQU9FLEdBQVAsQ0FBV0MsUUFBOUIsRUFBd0M7QUFBRUMseUJBQWlCSixPQUFPRSxHQUF4QixFQUE2QkQsRUFBN0I7QUFBa0M7QUFDL0UsQ0FGRDs7QUFJQTtBQUNBLElBQU1HLG1CQUFtQixTQUFuQkEsZ0JBQW1CLENBQUNGLEdBQUQsRUFBTUQsRUFBTixFQUFhO0FBQ2xDLFFBQUlDLElBQUlHLE1BQUosSUFBZUgsSUFBSUcsTUFBSixLQUFlLFdBQWxDLEVBQWdEO0FBQUVYLGdCQUFRQyxHQUFSLENBQVksWUFBWixFQUEwQix5QkFBZU8sR0FBZixDQUExQixFQUFGLENBQWdEO0FBQXlCO0FBQzVILENBRkQ7O0FBSUE7QUFDQSxJQUFNSSxhQUFhLFNBQWJBLFVBQWEsQ0FBQ0osR0FBRCxFQUFNRCxFQUFOLEVBQWE7QUFDNUIsUUFBSU0sU0FBUyxzQkFBYyxFQUFkLEVBQWtCTCxHQUFsQixFQUF1QixFQUFFTSxNQUFNQyxTQUFSLEVBQXZCLENBQWI7QUFDQUMsc0JBQWtCQyxHQUFsQixDQUFzQkosTUFBdEIsRUFDS2QsSUFETCxDQUNVbUIsZ0JBQWdCVixJQUFJVyxHQUFwQixFQUF5QlosRUFBekIsQ0FEVixFQUVLYSxLQUZMLENBRVc7QUFBQSxlQUFPcEIsUUFBUUMsR0FBUixDQUFZLDhDQUFaLEVBQTRETyxJQUFJVyxHQUFoRSxFQUFxRSxLQUFyRSxFQUE0RSx5QkFBZUUsR0FBZixDQUE1RSxDQUFQO0FBQUEsS0FGWDtBQUdILENBTEQ7O0FBT0E7QUFDQSxJQUFNSCxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQUNJLEVBQUQsRUFBS2YsRUFBTCxFQUFZO0FBQ2hDZ0IsWUFBUTdCLG9CQUFvQjhCLE9BQXBCLENBQTRCakIsRUFBNUIsQ0FBUjtBQUNBUyxzQkFBa0JTLEtBQWxCLENBQXdCSCxFQUF4QixFQUNLdkIsSUFETCxDQUNVLGVBQU87QUFDVEwsNEJBQW9CNkIsS0FBcEIsRUFBMkJHLE1BQTNCLENBQWtDbEIsSUFBSVcsR0FBdEMsRUFDS3BCLElBREwsQ0FDVUMsUUFBUUMsR0FBUixDQUFZLGdCQUFnQk8sSUFBSVcsR0FBcEIsR0FBMEIsb0JBQTFCLEdBQWlELElBQUlRLElBQUosR0FBV0MsV0FBWCxFQUE3RCxDQURWO0FBRUgsS0FKTCxFQUtLUixLQUxMLENBS1c7QUFBQSxlQUFPcEIsUUFBUUMsR0FBUixDQUFZLGdEQUFaLEVBQThEcUIsRUFBOUQsRUFBa0UsS0FBbEUsRUFBeUUseUJBQWVELEdBQWYsQ0FBekUsQ0FBUDtBQUFBLEtBTFg7QUFNSCxDQVJEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBpbnN0YWxsIH0gZnJvbSAnc291cmNlLW1hcC1zdXBwb3J0Jztcbmluc3RhbGwoKTtcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2NvbmZpZycpO1xuaW1wb3J0IENvdWNoU2VydmljZSBmcm9tICcuL2NvdWNoU2VydmljZSdcblxubGV0IHdhdGNoZWREYXRhYmFzZUxpc3QgPSBbXVxuXG4vLyBHZXQgdGhlIGNvbGxlY3Rpb24gb2YgZGF0YWJhc2VzIHRvIHdhdGNoXG5jb25zdCBzdGFydCA9ICh3YXRjaExpc3QpID0+IHtcbiAgICBsZXQgY29tcGxldGVkRGIgPSBuZXcgQ291Y2hTZXJ2aWNlKCdjb21wbGV0ZWQtdmlzaXRzJylcblxuICAgIGNvbXBsZXRlZERiLmdldFVzZXJEYXRhYmFzZUxpc3QoKVxuICAgICAgICAudGhlbihsaXN0ID0+IHsgY29uc29sZS5sb2cobGlzdCkgfSlcbiAgICBcbiAgICBsZXQgd2F0Y2hlZERCID0gbmV3IENvdWNoU2VydmljZSgndXNlcmRiLTYyNmY2MicpXG4gICAgd2F0Y2hlZERCLnN1YnNjcmliZShwcm9jZXNzQ2hhbmdlKVxuICAgIC8vIGNvbnN0IGNvbXBsZXRlZERhdGFiYXNlID0gbmV3IFBvdWNoU2VydmljZShjb21wbGV0ZWREYiwgcmVtb3RlU2VydmVyKVxuICAgIC8vIGNvbXBsZXRlZERhdGFiYXNlLnN5bmMoKVxuXG4gICAgLy8gd2F0Y2hlZERhdGFiYXNlTGlzdCA9IHdhdGNoTGlzdC5tYXAoZCA9PiBuZXcgUG91Y2hTZXJ2aWNlKGQsIHJlbW90ZVNlcnZlcikpXG4gICAgLy8gd2F0Y2hlZERhdGFiYXNlTGlzdC5mb3JFYWNoKHcgPT4ge1xuICAgIC8vICAgICB3LnN1YnNjcmliZShwcm9jZXNzQ2hhbmdlKVxuICAgIC8vICAgICB3LnN5bmMoKVxuICAgIC8vIH0pXG5cbiAgICBjb25zb2xlLmxvZygnTUZBIFByb2Nlc3NpbmcgU2VydmljZSBSdW5uaW5nLi4uJylcbn1cblxuc3RhcnQoKVxuXG4vLyBJZ25vcmUgZGVsZXRlZCByZWNvcmRzXG5jb25zdCBwcm9jZXNzQ2hhbmdlID0gKGNoYW5nZSwgZGIpID0+IHtcbiAgICBpZiAoY2hhbmdlLmRvYyAmJiAhY2hhbmdlLmRvYy5fZGVsZXRlZCkgeyB0ZXN0Rm9yQ29tcGxldGVkKGNoYW5nZS5kb2MsIGRiKSB9XG59XG5cbi8vIEZpbHRlciBjb21wbGV0ZWQgcmVjb3Jkc1xuY29uc3QgdGVzdEZvckNvbXBsZXRlZCA9IChkb2MsIGRiKSA9PiB7XG4gICAgaWYgKGRvYy5zdGF0dXMgJiYgKGRvYy5zdGF0dXMgPT09ICdjb21wbGV0ZWQnKSkgeyBjb25zb2xlLmxvZygnV2lsbCBtb3ZlOicsIEpTT04uc3RyaW5naWZ5KGRvYykpLyptb3ZlUmVjb3JkKGRvYywgZGIpKi8gfVxufVxuXG4vLyBNb3ZlIHJlY29yZCBpbnRvIGNvbXBsZXRlZCBxdWV1ZVxuY29uc3QgbW92ZVJlY29yZCA9IChkb2MsIGRiKSA9PiB7XG4gICAgbGV0IGFkZERvYyA9IE9iamVjdC5hc3NpZ24oe30sIGRvYywgeyBfcmV2OiB1bmRlZmluZWQgfSlcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5hZGQoYWRkRG9jKVxuICAgICAgICAudGhlbihyZW1vdmVJZk5vRXJyb3IoZG9jLl9pZCwgZGIpKVxuICAgICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKCdFcnJvcjogQ29tcGxldGVkIHJlY29yZCBjb3VsZCBub3QgYmUgYWRkZWQ6ICcsIGRvYy5faWQsICcgOiAnLCBKU09OLnN0cmluZ2lmeShlcnIpKSlcbn1cblxuLy8gRW5zdXJlIHRoYXQgcmVjb3JkIGV4aXN0cyBpbiBjb21wbGV0ZWQgZGF0YWJhc2UgYmVmb3JlIHJlbW92aW5nXG5jb25zdCByZW1vdmVJZk5vRXJyb3IgPSAoaWQsIGRiKSA9PiB7XG4gICAgaW5kZXggPSB3YXRjaGVkRGF0YWJhc2VMaXN0LmluZGV4T2YoZGIpXG4gICAgY29tcGxldGVkRGF0YWJhc2UuZmV0Y2goaWQpXG4gICAgICAgIC50aGVuKGRvYyA9PiB7XG4gICAgICAgICAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2luZGV4XS5yZW1vdmUoZG9jLl9pZClcbiAgICAgICAgICAgICAgICAudGhlbihjb25zb2xlLmxvZygnQXNzZXNzbWVudCAnICsgZG9jLl9pZCArICcgd2FzIGNvbXBsZXRlZCBhdCAnICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKSlcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6IENvbXBsZXRlZCByZWNvcmQgY291bGQgbm90IGJlIHJlbW92ZWQ6ICcsIGlkLCAnIDogJywgSlNPTi5zdHJpbmdpZnkoZXJyKSkpXG59XG4iXX0=