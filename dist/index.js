#!/usr/bin/env node
'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _sourceMapSupport = require('source-map-support');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _sourceMapSupport.install)();
var config = require('config');
var cradle = require('cradle');
// import { getUserDatabaseList } from './couchService'

var user = config.get('couchdb.user');
var pass = config.get('couchdb.password');
var completedDb = config.get('couchdb.completedDb');
var remoteServer = config.get('couchdb.remoteServer');
var port = config.get('couchdb.port');

cradle.setup({
    host: remoteServer,
    cache: true,
    raw: false,
    forceSave: true
});
var c = new cradle.Connection();
var completed = c.database(completedDb);
var watchedDatabaseList = [];

// Get the collection of databases to watch
var feed = completed.changes({
    since: 0,
    live: true,
    include_docs: true
});
feed.on('change', function (change) {
    processChange(change);
});

// const makeCollection = (docs) => {
//     let userDbList = []
//     userDbList = docs.map(d => d.id)
//     if (userDbList.length > 0) { start(userDbList) }
// }
//getUserDatabaseList(makeCollection)

// const start = (watchList) => {
//     const completedDatabase = new PouchService(completedDb, remoteServer)
//     completedDatabase.sync()

//     watchedDatabaseList = watchList.map(d => new PouchService(d, remoteServer))
//     watchedDatabaseList.forEach(w => {
//         w.subscribe(processChange)
//         w.sync()
//     })

//     console.log('MFA Processing Service Running...')
// }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwiY3JhZGxlIiwidXNlciIsImdldCIsInBhc3MiLCJjb21wbGV0ZWREYiIsInJlbW90ZVNlcnZlciIsInBvcnQiLCJzZXR1cCIsImhvc3QiLCJjYWNoZSIsInJhdyIsImZvcmNlU2F2ZSIsImMiLCJDb25uZWN0aW9uIiwiY29tcGxldGVkIiwiZGF0YWJhc2UiLCJ3YXRjaGVkRGF0YWJhc2VMaXN0IiwiZmVlZCIsImNoYW5nZXMiLCJzaW5jZSIsImxpdmUiLCJpbmNsdWRlX2RvY3MiLCJvbiIsImNoYW5nZSIsInByb2Nlc3NDaGFuZ2UiLCJkYiIsImRvYyIsIl9kZWxldGVkIiwidGVzdEZvckNvbXBsZXRlZCIsInN0YXR1cyIsImNvbnNvbGUiLCJsb2ciLCJtb3ZlUmVjb3JkIiwiYWRkRG9jIiwiX3JldiIsInVuZGVmaW5lZCIsImNvbXBsZXRlZERhdGFiYXNlIiwiYWRkIiwidGhlbiIsInJlbW92ZUlmTm9FcnJvciIsIl9pZCIsImNhdGNoIiwiZXJyIiwiaWQiLCJpbmRleCIsImluZGV4T2YiLCJmZXRjaCIsInJlbW92ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBOzs7O0FBQ0E7QUFDQSxJQUFNQSxTQUFTQyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsUUFBUixDQUFmO0FBQ0E7O0FBRUEsSUFBTUUsT0FBT0gsT0FBT0ksR0FBUCxDQUFXLGNBQVgsQ0FBYjtBQUNBLElBQU1DLE9BQU9MLE9BQU9JLEdBQVAsQ0FBVyxrQkFBWCxDQUFiO0FBQ0EsSUFBTUUsY0FBY04sT0FBT0ksR0FBUCxDQUFXLHFCQUFYLENBQXBCO0FBQ0EsSUFBTUcsZUFBZVAsT0FBT0ksR0FBUCxDQUFXLHNCQUFYLENBQXJCO0FBQ0EsSUFBTUksT0FBT1IsT0FBT0ksR0FBUCxDQUFXLGNBQVgsQ0FBYjs7QUFFQUYsT0FBT08sS0FBUCxDQUFhO0FBQ1RDLFVBQU1ILFlBREc7QUFFVEksV0FBTyxJQUZFO0FBR1RDLFNBQUssS0FISTtBQUlUQyxlQUFXO0FBSkYsQ0FBYjtBQU1BLElBQU1DLElBQUksSUFBS1osT0FBT2EsVUFBWixFQUFWO0FBQ0EsSUFBTUMsWUFBWUYsRUFBRUcsUUFBRixDQUFXWCxXQUFYLENBQWxCO0FBQ0EsSUFBSVksc0JBQXNCLEVBQTFCOztBQUVBO0FBQ0EsSUFBSUMsT0FBT0gsVUFBVUksT0FBVixDQUFrQjtBQUN6QkMsV0FBTyxDQURrQjtBQUV6QkMsVUFBTSxJQUZtQjtBQUd6QkMsa0JBQWM7QUFIVyxDQUFsQixDQUFYO0FBS0FKLEtBQUtLLEVBQUwsQ0FBUSxRQUFSLEVBQWtCLFVBQUNDLE1BQUQsRUFBWTtBQUMxQkMsa0JBQWNELE1BQWQ7QUFDSCxDQUZEOztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsSUFBTUMsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFDRCxNQUFELEVBQVNFLEVBQVQsRUFBZ0I7QUFDbEMsUUFBSUYsT0FBT0csR0FBUCxJQUFjLENBQUNILE9BQU9HLEdBQVAsQ0FBV0MsUUFBOUIsRUFBd0M7QUFBRUMseUJBQWlCTCxPQUFPRyxHQUF4QixFQUE2QkQsRUFBN0I7QUFBa0M7QUFDL0UsQ0FGRDs7QUFJQTtBQUNBLElBQU1HLG1CQUFtQixTQUFuQkEsZ0JBQW1CLENBQUNGLEdBQUQsRUFBTUQsRUFBTixFQUFhO0FBQ2xDLFFBQUlDLElBQUlHLE1BQUosSUFBZUgsSUFBSUcsTUFBSixLQUFlLFdBQWxDLEVBQWdEO0FBQUVDLGdCQUFRQyxHQUFSLENBQVksWUFBWixFQUEwQix5QkFBZUwsR0FBZixDQUExQixFQUFGLENBQWdEO0FBQXlCO0FBQzVILENBRkQ7O0FBSUE7QUFDQSxJQUFNTSxhQUFhLFNBQWJBLFVBQWEsQ0FBQ04sR0FBRCxFQUFNRCxFQUFOLEVBQWE7QUFDNUIsUUFBSVEsU0FBUyxzQkFBYyxFQUFkLEVBQWtCUCxHQUFsQixFQUF1QixFQUFFUSxNQUFNQyxTQUFSLEVBQXZCLENBQWI7QUFDQUMsc0JBQWtCQyxHQUFsQixDQUFzQkosTUFBdEIsRUFDS0ssSUFETCxDQUNVQyxnQkFBZ0JiLElBQUljLEdBQXBCLEVBQXlCZixFQUF6QixDQURWLEVBRUtnQixLQUZMLENBRVc7QUFBQSxlQUFPWCxRQUFRQyxHQUFSLENBQVksOENBQVosRUFBNERMLElBQUljLEdBQWhFLEVBQXFFLEtBQXJFLEVBQTRFLHlCQUFlRSxHQUFmLENBQTVFLENBQVA7QUFBQSxLQUZYO0FBR0gsQ0FMRDs7QUFPQTtBQUNBLElBQU1ILGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBQ0ksRUFBRCxFQUFLbEIsRUFBTCxFQUFZO0FBQ2hDbUIsWUFBUTVCLG9CQUFvQjZCLE9BQXBCLENBQTRCcEIsRUFBNUIsQ0FBUjtBQUNBVyxzQkFBa0JVLEtBQWxCLENBQXdCSCxFQUF4QixFQUNLTCxJQURMLENBQ1UsZUFBTztBQUNUdEIsNEJBQW9CNEIsS0FBcEIsRUFBMkJHLE1BQTNCLENBQWtDckIsSUFBSWMsR0FBdEMsRUFDS0YsSUFETCxDQUNVUixRQUFRQyxHQUFSLENBQVksZ0JBQWdCTCxJQUFJYyxHQUFwQixHQUEwQixvQkFBMUIsR0FBaUQsSUFBSVEsSUFBSixHQUFXQyxXQUFYLEVBQTdELENBRFY7QUFFSCxLQUpMLEVBS0tSLEtBTEwsQ0FLVztBQUFBLGVBQU9YLFFBQVFDLEdBQVIsQ0FBWSxnREFBWixFQUE4RFksRUFBOUQsRUFBa0UsS0FBbEUsRUFBeUUseUJBQWVELEdBQWYsQ0FBekUsQ0FBUDtBQUFBLEtBTFg7QUFNSCxDQVJEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBpbnN0YWxsIH0gZnJvbSAnc291cmNlLW1hcC1zdXBwb3J0Jztcbmluc3RhbGwoKTtcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2NvbmZpZycpO1xuY29uc3QgY3JhZGxlID0gcmVxdWlyZSgnY3JhZGxlJylcbi8vIGltcG9ydCB7IGdldFVzZXJEYXRhYmFzZUxpc3QgfSBmcm9tICcuL2NvdWNoU2VydmljZSdcblxuY29uc3QgdXNlciA9IGNvbmZpZy5nZXQoJ2NvdWNoZGIudXNlcicpXG5jb25zdCBwYXNzID0gY29uZmlnLmdldCgnY291Y2hkYi5wYXNzd29yZCcpXG5jb25zdCBjb21wbGV0ZWREYiA9IGNvbmZpZy5nZXQoJ2NvdWNoZGIuY29tcGxldGVkRGInKVxuY29uc3QgcmVtb3RlU2VydmVyID0gY29uZmlnLmdldCgnY291Y2hkYi5yZW1vdGVTZXJ2ZXInKVxuY29uc3QgcG9ydCA9IGNvbmZpZy5nZXQoJ2NvdWNoZGIucG9ydCcpXG5cbmNyYWRsZS5zZXR1cCh7XG4gICAgaG9zdDogcmVtb3RlU2VydmVyLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHJhdzogZmFsc2UsXG4gICAgZm9yY2VTYXZlOiB0cnVlXG59KVxuY29uc3QgYyA9IG5ldyAoY3JhZGxlLkNvbm5lY3Rpb24pXG5jb25zdCBjb21wbGV0ZWQgPSBjLmRhdGFiYXNlKGNvbXBsZXRlZERiKVxubGV0IHdhdGNoZWREYXRhYmFzZUxpc3QgPSBbXVxuXG4vLyBHZXQgdGhlIGNvbGxlY3Rpb24gb2YgZGF0YWJhc2VzIHRvIHdhdGNoXG5sZXQgZmVlZCA9IGNvbXBsZXRlZC5jaGFuZ2VzKHtcbiAgICBzaW5jZTogMCxcbiAgICBsaXZlOiB0cnVlLFxuICAgIGluY2x1ZGVfZG9jczogdHJ1ZVxufSk7XG5mZWVkLm9uKCdjaGFuZ2UnLCAoY2hhbmdlKSA9PiB7XG4gICAgcHJvY2Vzc0NoYW5nZShjaGFuZ2UpO1xufSk7XG5cbi8vIGNvbnN0IG1ha2VDb2xsZWN0aW9uID0gKGRvY3MpID0+IHtcbi8vICAgICBsZXQgdXNlckRiTGlzdCA9IFtdXG4vLyAgICAgdXNlckRiTGlzdCA9IGRvY3MubWFwKGQgPT4gZC5pZClcbi8vICAgICBpZiAodXNlckRiTGlzdC5sZW5ndGggPiAwKSB7IHN0YXJ0KHVzZXJEYkxpc3QpIH1cbi8vIH1cbi8vZ2V0VXNlckRhdGFiYXNlTGlzdChtYWtlQ29sbGVjdGlvbilcblxuLy8gY29uc3Qgc3RhcnQgPSAod2F0Y2hMaXN0KSA9PiB7XG4vLyAgICAgY29uc3QgY29tcGxldGVkRGF0YWJhc2UgPSBuZXcgUG91Y2hTZXJ2aWNlKGNvbXBsZXRlZERiLCByZW1vdGVTZXJ2ZXIpXG4vLyAgICAgY29tcGxldGVkRGF0YWJhc2Uuc3luYygpXG5cbi8vICAgICB3YXRjaGVkRGF0YWJhc2VMaXN0ID0gd2F0Y2hMaXN0Lm1hcChkID0+IG5ldyBQb3VjaFNlcnZpY2UoZCwgcmVtb3RlU2VydmVyKSlcbi8vICAgICB3YXRjaGVkRGF0YWJhc2VMaXN0LmZvckVhY2godyA9PiB7XG4vLyAgICAgICAgIHcuc3Vic2NyaWJlKHByb2Nlc3NDaGFuZ2UpXG4vLyAgICAgICAgIHcuc3luYygpXG4vLyAgICAgfSlcblxuLy8gICAgIGNvbnNvbGUubG9nKCdNRkEgUHJvY2Vzc2luZyBTZXJ2aWNlIFJ1bm5pbmcuLi4nKVxuLy8gfVxuXG4vLyBJZ25vcmUgZGVsZXRlZCByZWNvcmRzXG5jb25zdCBwcm9jZXNzQ2hhbmdlID0gKGNoYW5nZSwgZGIpID0+IHtcbiAgICBpZiAoY2hhbmdlLmRvYyAmJiAhY2hhbmdlLmRvYy5fZGVsZXRlZCkgeyB0ZXN0Rm9yQ29tcGxldGVkKGNoYW5nZS5kb2MsIGRiKSB9XG59XG5cbi8vIEZpbHRlciBjb21wbGV0ZWQgcmVjb3Jkc1xuY29uc3QgdGVzdEZvckNvbXBsZXRlZCA9IChkb2MsIGRiKSA9PiB7XG4gICAgaWYgKGRvYy5zdGF0dXMgJiYgKGRvYy5zdGF0dXMgPT09ICdjb21wbGV0ZWQnKSkgeyBjb25zb2xlLmxvZygnV2lsbCBtb3ZlOicsIEpTT04uc3RyaW5naWZ5KGRvYykpLyptb3ZlUmVjb3JkKGRvYywgZGIpKi8gfVxufVxuXG4vLyBNb3ZlIHJlY29yZCBpbnRvIGNvbXBsZXRlZCBxdWV1ZVxuY29uc3QgbW92ZVJlY29yZCA9IChkb2MsIGRiKSA9PiB7XG4gICAgbGV0IGFkZERvYyA9IE9iamVjdC5hc3NpZ24oe30sIGRvYywgeyBfcmV2OiB1bmRlZmluZWQgfSlcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5hZGQoYWRkRG9jKVxuICAgICAgICAudGhlbihyZW1vdmVJZk5vRXJyb3IoZG9jLl9pZCwgZGIpKVxuICAgICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKCdFcnJvcjogQ29tcGxldGVkIHJlY29yZCBjb3VsZCBub3QgYmUgYWRkZWQ6ICcsIGRvYy5faWQsICcgOiAnLCBKU09OLnN0cmluZ2lmeShlcnIpKSlcbn1cblxuLy8gRW5zdXJlIHRoYXQgcmVjb3JkIGV4aXN0cyBpbiBjb21wbGV0ZWQgZGF0YWJhc2UgYmVmb3JlIHJlbW92aW5nXG5jb25zdCByZW1vdmVJZk5vRXJyb3IgPSAoaWQsIGRiKSA9PiB7XG4gICAgaW5kZXggPSB3YXRjaGVkRGF0YWJhc2VMaXN0LmluZGV4T2YoZGIpXG4gICAgY29tcGxldGVkRGF0YWJhc2UuZmV0Y2goaWQpXG4gICAgICAgIC50aGVuKGRvYyA9PiB7XG4gICAgICAgICAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2luZGV4XS5yZW1vdmUoZG9jLl9pZClcbiAgICAgICAgICAgICAgICAudGhlbihjb25zb2xlLmxvZygnQXNzZXNzbWVudCAnICsgZG9jLl9pZCArICcgd2FzIGNvbXBsZXRlZCBhdCAnICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKSlcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZygnRXJyb3I6IENvbXBsZXRlZCByZWNvcmQgY291bGQgbm90IGJlIHJlbW92ZWQ6ICcsIGlkLCAnIDogJywgSlNPTi5zdHJpbmdpZnkoZXJyKSkpXG59XG4iXX0=