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

    //let watchedDB = new CouchService('userdb-626f62')
    //watchedDB.subscribe(processChange)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInN0YXJ0Iiwid2F0Y2hMaXN0IiwiY29tcGxldGVkRGIiLCJnZXRVc2VyRGF0YWJhc2VMaXN0IiwidGhlbiIsImNvbnNvbGUiLCJsb2ciLCJsaXN0IiwicHJvY2Vzc0NoYW5nZSIsImNoYW5nZSIsImRiIiwiZG9jIiwiX2RlbGV0ZWQiLCJ0ZXN0Rm9yQ29tcGxldGVkIiwic3RhdHVzIiwibW92ZVJlY29yZCIsImFkZERvYyIsIl9yZXYiLCJ1bmRlZmluZWQiLCJjb21wbGV0ZWREYXRhYmFzZSIsImFkZCIsInJlbW92ZUlmTm9FcnJvciIsIl9pZCIsImNhdGNoIiwiZXJyIiwiaWQiLCJpbmRleCIsImluZGV4T2YiLCJmZXRjaCIsInJlbW92ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBOztBQUdBOzs7Ozs7QUFGQTtBQUNBLElBQU1BLFNBQVNDLFFBQVEsUUFBUixDQUFmOzs7QUFHQSxJQUFJQyxzQkFBc0IsRUFBMUI7O0FBRUE7QUFDQSxJQUFNQyxRQUFRLFNBQVJBLEtBQVEsQ0FBQ0MsU0FBRCxFQUFlO0FBQ3pCLFFBQUlDLGNBQWMsMkJBQWlCLGtCQUFqQixDQUFsQjtBQUNBQSxnQkFBWUMsbUJBQVosR0FDS0MsSUFETCxDQUNVLGdCQUFRO0FBQUVDLGdCQUFRQyxHQUFSLENBQVlDLElBQVo7QUFBbUIsS0FEdkM7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUYsWUFBUUMsR0FBUixDQUFZLG1DQUFaO0FBQ0gsQ0FqQkQ7O0FBbUJBTjs7QUFFQTtBQUNBLElBQU1RLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBQ0MsTUFBRCxFQUFTQyxFQUFULEVBQWdCO0FBQ2xDLFFBQUlELE9BQU9FLEdBQVAsSUFBYyxDQUFDRixPQUFPRSxHQUFQLENBQVdDLFFBQTlCLEVBQXdDO0FBQUVDLHlCQUFpQkosT0FBT0UsR0FBeEIsRUFBNkJELEVBQTdCO0FBQWtDO0FBQy9FLENBRkQ7O0FBSUE7QUFDQSxJQUFNRyxtQkFBbUIsU0FBbkJBLGdCQUFtQixDQUFDRixHQUFELEVBQU1ELEVBQU4sRUFBYTtBQUNsQyxRQUFJQyxJQUFJRyxNQUFKLElBQWVILElBQUlHLE1BQUosS0FBZSxXQUFsQyxFQUFnRDtBQUFFVCxnQkFBUUMsR0FBUixDQUFZLFlBQVosRUFBMEIseUJBQWVLLEdBQWYsQ0FBMUIsRUFBRixDQUFnRDtBQUF5QjtBQUM1SCxDQUZEOztBQUlBO0FBQ0EsSUFBTUksYUFBYSxTQUFiQSxVQUFhLENBQUNKLEdBQUQsRUFBTUQsRUFBTixFQUFhO0FBQzVCLFFBQUlNLFNBQVMsc0JBQWMsRUFBZCxFQUFrQkwsR0FBbEIsRUFBdUIsRUFBRU0sTUFBTUMsU0FBUixFQUF2QixDQUFiO0FBQ0FDLHNCQUFrQkMsR0FBbEIsQ0FBc0JKLE1BQXRCLEVBQ0taLElBREwsQ0FDVWlCLGdCQUFnQlYsSUFBSVcsR0FBcEIsRUFBeUJaLEVBQXpCLENBRFYsRUFFS2EsS0FGTCxDQUVXO0FBQUEsZUFBT2xCLFFBQVFDLEdBQVIsQ0FBWSw4Q0FBWixFQUE0REssSUFBSVcsR0FBaEUsRUFBcUUsS0FBckUsRUFBNEUseUJBQWVFLEdBQWYsQ0FBNUUsQ0FBUDtBQUFBLEtBRlg7QUFHSCxDQUxEOztBQU9BO0FBQ0EsSUFBTUgsa0JBQWtCLFNBQWxCQSxlQUFrQixDQUFDSSxFQUFELEVBQUtmLEVBQUwsRUFBWTtBQUNoQ2dCLFlBQVEzQixvQkFBb0I0QixPQUFwQixDQUE0QmpCLEVBQTVCLENBQVI7QUFDQVMsc0JBQWtCUyxLQUFsQixDQUF3QkgsRUFBeEIsRUFDS3JCLElBREwsQ0FDVSxlQUFPO0FBQ1RMLDRCQUFvQjJCLEtBQXBCLEVBQTJCRyxNQUEzQixDQUFrQ2xCLElBQUlXLEdBQXRDLEVBQ0tsQixJQURMLENBQ1VDLFFBQVFDLEdBQVIsQ0FBWSxnQkFBZ0JLLElBQUlXLEdBQXBCLEdBQTBCLG9CQUExQixHQUFpRCxJQUFJUSxJQUFKLEdBQVdDLFdBQVgsRUFBN0QsQ0FEVjtBQUVILEtBSkwsRUFLS1IsS0FMTCxDQUtXO0FBQUEsZUFBT2xCLFFBQVFDLEdBQVIsQ0FBWSxnREFBWixFQUE4RG1CLEVBQTlELEVBQWtFLEtBQWxFLEVBQXlFLHlCQUFlRCxHQUFmLENBQXpFLENBQVA7QUFBQSxLQUxYO0FBTUgsQ0FSRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQgeyBpbnN0YWxsIH0gZnJvbSAnc291cmNlLW1hcC1zdXBwb3J0JztcclxuaW5zdGFsbCgpO1xyXG5jb25zdCBjb25maWcgPSByZXF1aXJlKCdjb25maWcnKTtcclxuaW1wb3J0IENvdWNoU2VydmljZSBmcm9tICcuL2NvdWNoU2VydmljZSdcclxuXHJcbmxldCB3YXRjaGVkRGF0YWJhc2VMaXN0ID0gW11cclxuXHJcbi8vIEdldCB0aGUgY29sbGVjdGlvbiBvZiBkYXRhYmFzZXMgdG8gd2F0Y2hcclxuY29uc3Qgc3RhcnQgPSAod2F0Y2hMaXN0KSA9PiB7XHJcbiAgICBsZXQgY29tcGxldGVkRGIgPSBuZXcgQ291Y2hTZXJ2aWNlKCdjb21wbGV0ZWQtdmlzaXRzJylcclxuICAgIGNvbXBsZXRlZERiLmdldFVzZXJEYXRhYmFzZUxpc3QoKVxyXG4gICAgICAgIC50aGVuKGxpc3QgPT4geyBjb25zb2xlLmxvZyhsaXN0KSB9KVxyXG4gICAgXHJcbiAgICAvL2xldCB3YXRjaGVkREIgPSBuZXcgQ291Y2hTZXJ2aWNlKCd1c2VyZGItNjI2ZjYyJylcclxuICAgIC8vd2F0Y2hlZERCLnN1YnNjcmliZShwcm9jZXNzQ2hhbmdlKVxyXG4gICAgLy8gY29uc3QgY29tcGxldGVkRGF0YWJhc2UgPSBuZXcgUG91Y2hTZXJ2aWNlKGNvbXBsZXRlZERiLCByZW1vdGVTZXJ2ZXIpXHJcbiAgICAvLyBjb21wbGV0ZWREYXRhYmFzZS5zeW5jKClcclxuXHJcbiAgICAvLyB3YXRjaGVkRGF0YWJhc2VMaXN0ID0gd2F0Y2hMaXN0Lm1hcChkID0+IG5ldyBQb3VjaFNlcnZpY2UoZCwgcmVtb3RlU2VydmVyKSlcclxuICAgIC8vIHdhdGNoZWREYXRhYmFzZUxpc3QuZm9yRWFjaCh3ID0+IHtcclxuICAgIC8vICAgICB3LnN1YnNjcmliZShwcm9jZXNzQ2hhbmdlKVxyXG4gICAgLy8gICAgIHcuc3luYygpXHJcbiAgICAvLyB9KVxyXG5cclxuICAgIGNvbnNvbGUubG9nKCdNRkEgUHJvY2Vzc2luZyBTZXJ2aWNlIFJ1bm5pbmcuLi4nKVxyXG59XHJcblxyXG5zdGFydCgpXHJcblxyXG4vLyBJZ25vcmUgZGVsZXRlZCByZWNvcmRzXHJcbmNvbnN0IHByb2Nlc3NDaGFuZ2UgPSAoY2hhbmdlLCBkYikgPT4ge1xyXG4gICAgaWYgKGNoYW5nZS5kb2MgJiYgIWNoYW5nZS5kb2MuX2RlbGV0ZWQpIHsgdGVzdEZvckNvbXBsZXRlZChjaGFuZ2UuZG9jLCBkYikgfVxyXG59XHJcblxyXG4vLyBGaWx0ZXIgY29tcGxldGVkIHJlY29yZHNcclxuY29uc3QgdGVzdEZvckNvbXBsZXRlZCA9IChkb2MsIGRiKSA9PiB7XHJcbiAgICBpZiAoZG9jLnN0YXR1cyAmJiAoZG9jLnN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcpKSB7IGNvbnNvbGUubG9nKCdXaWxsIG1vdmU6JywgSlNPTi5zdHJpbmdpZnkoZG9jKSkvKm1vdmVSZWNvcmQoZG9jLCBkYikqLyB9XHJcbn1cclxuXHJcbi8vIE1vdmUgcmVjb3JkIGludG8gY29tcGxldGVkIHF1ZXVlXHJcbmNvbnN0IG1vdmVSZWNvcmQgPSAoZG9jLCBkYikgPT4ge1xyXG4gICAgbGV0IGFkZERvYyA9IE9iamVjdC5hc3NpZ24oe30sIGRvYywgeyBfcmV2OiB1bmRlZmluZWQgfSlcclxuICAgIGNvbXBsZXRlZERhdGFiYXNlLmFkZChhZGREb2MpXHJcbiAgICAgICAgLnRoZW4ocmVtb3ZlSWZOb0Vycm9yKGRvYy5faWQsIGRiKSlcclxuICAgICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKCdFcnJvcjogQ29tcGxldGVkIHJlY29yZCBjb3VsZCBub3QgYmUgYWRkZWQ6ICcsIGRvYy5faWQsICcgOiAnLCBKU09OLnN0cmluZ2lmeShlcnIpKSlcclxufVxyXG5cclxuLy8gRW5zdXJlIHRoYXQgcmVjb3JkIGV4aXN0cyBpbiBjb21wbGV0ZWQgZGF0YWJhc2UgYmVmb3JlIHJlbW92aW5nXHJcbmNvbnN0IHJlbW92ZUlmTm9FcnJvciA9IChpZCwgZGIpID0+IHtcclxuICAgIGluZGV4ID0gd2F0Y2hlZERhdGFiYXNlTGlzdC5pbmRleE9mKGRiKVxyXG4gICAgY29tcGxldGVkRGF0YWJhc2UuZmV0Y2goaWQpXHJcbiAgICAgICAgLnRoZW4oZG9jID0+IHtcclxuICAgICAgICAgICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtpbmRleF0ucmVtb3ZlKGRvYy5faWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihjb25zb2xlLmxvZygnQXNzZXNzbWVudCAnICsgZG9jLl9pZCArICcgd2FzIGNvbXBsZXRlZCBhdCAnICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkIGNvdWxkIG5vdCBiZSByZW1vdmVkOiAnLCBpZCwgJyA6ICcsIEpTT04uc3RyaW5naWZ5KGVycikpKVxyXG59XHJcbiJdfQ==