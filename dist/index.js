#!/usr/bin/env node
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _sourceMapSupport = require('source-map-support');

var _couchService = require('./couchService');

var _couchService2 = _interopRequireDefault(_couchService);

var _hexEncoder = require('./hexEncoder');

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
        addWatchToDatabase(d);
    });
    watchForNewUsers();
    console.log('MFA Processing Service Running...');
};

var addWatchToDatabase = function addWatchToDatabase(d) {
    watchedDatabaseList[d] = new _couchService2.default(d);
    watchedDatabaseList[d].subscribe(processChange, generalError);
};

// Add newly created user dbs to the watch list
var watchForNewUsers = function watchForNewUsers() {
    var success = function success(change) {
        change.forEach(function (c) {
            if (c._id.indexOf('org.couchdb.user') > -1) {
                checkNameAgainstWatchList(c.name);
            }
        });
    };
    var error = function error(err) {
        console.log('Error: Could not watch _users', (0, _stringify2.default)(err));
    };
    var users = new _couchService2.default('_users');
    users.subscribe(success, error, 'admin');
};

var checkNameAgainstWatchList = function checkNameAgainstWatchList(name) {
    var dbName = 'userdb-' + (0, _hexEncoder.hexEncode)(name);
    if (watchedDatabaseList[dbName] === undefined) {
        addWatchToDatabase(dbName);
    }
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

var generalError = function generalError(err) {
    console.log(err);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInByb2Nlc3MiLCJvbiIsInJlYXNvbiIsImNvbnNvbGUiLCJsb2ciLCJjb21wbGV0ZWREYXRhYmFzZSIsImdldFVzZXJEYXRhYmFzZUxpc3QiLCJ0aGVuIiwic3RhcnQiLCJsaXN0IiwiY2F0Y2giLCJlcnIiLCJ3YXRjaExpc3QiLCJmb3JFYWNoIiwiYWRkV2F0Y2hUb0RhdGFiYXNlIiwiZCIsIndhdGNoRm9yTmV3VXNlcnMiLCJzdWJzY3JpYmUiLCJwcm9jZXNzQ2hhbmdlIiwiZ2VuZXJhbEVycm9yIiwic3VjY2VzcyIsImNoYW5nZSIsImMiLCJfaWQiLCJpbmRleE9mIiwiY2hlY2tOYW1lQWdhaW5zdFdhdGNoTGlzdCIsIm5hbWUiLCJlcnJvciIsInVzZXJzIiwiZGJOYW1lIiwidW5kZWZpbmVkIiwiZGIiLCJfZGVsZXRlZCIsInRlc3RGb3JDb21wbGV0ZWQiLCJkb2MiLCJzdGF0dXMiLCJtb3ZlUmVjb3JkIiwicmVtb3ZlSWZOb0Vycm9yIiwiaWQiLCJhZGQiLCJyZW1vdmUiLCJmZXRjaCIsInJlc3VsdCIsIkRhdGUiLCJ0b0lTT1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7O0FBR0E7Ozs7QUFDQTs7OztBQUhBO0FBQ0EsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7OztBQUlBLElBQUlDLHNCQUFzQixFQUExQjs7QUFFQUMsUUFBUUMsRUFBUixDQUFXLG9CQUFYLEVBQWlDLFVBQUNDLE1BQUQsRUFBWTtBQUN6Q0MsWUFBUUMsR0FBUixDQUFZLHdDQUF3Q0YsTUFBcEQ7QUFDSCxDQUZEOztBQUlBO0FBQ0EsSUFBSUcsb0JBQW9CLDJCQUFpQixrQkFBakIsQ0FBeEI7QUFDQUEsa0JBQWtCQyxtQkFBbEIsR0FDS0MsSUFETCxDQUNVLGdCQUFRO0FBQUVDLFVBQU1DLElBQU47QUFBYSxDQURqQyxFQUVLQyxLQUZMLENB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QUFDaEMsUUFBTVgsVUFBVSxTQUFWQSxPQUFVLENBQUNjLEdBQUQsRUFBUztBQUNyQjtBQUNBTSxlQUFPRixFQUFQLEVBQVdQLEVBQVg7QUFDSCxLQUhEO0FBSUEsUUFBTUosUUFBUSxTQUFSQSxLQUFRLENBQUNoQixHQUFELEVBQVM7QUFBRVIsZ0JBQVFDLEdBQVIsQ0FBWSw4Q0FBWixFQUE0RDhCLElBQUlYLEdBQWhFLEVBQXFFLEtBQXJFLEVBQTRFLHlCQUFlWixHQUFmLENBQTVFO0FBQWtHLEtBQTNIO0FBQ0FOLHNCQUFrQm9DLEtBQWxCLENBQXdCSCxFQUF4QixFQUE0QmxCLE9BQTVCLEVBQXFDTyxLQUFyQztBQUNILENBUEQ7O0FBU0EsSUFBTWEsU0FBUyxTQUFUQSxNQUFTLENBQUNGLEVBQUQsRUFBS1AsRUFBTCxFQUFZO0FBQ3ZCLFFBQU1YLFVBQVUsU0FBVkEsT0FBVSxDQUFDc0IsTUFBRCxFQUFZO0FBQUV2QyxnQkFBUUMsR0FBUixDQUFZLGdCQUFnQmtDLEVBQWhCLEdBQXFCLG9CQUFyQixHQUE0QyxJQUFJSyxJQUFKLEdBQVdDLFdBQVgsRUFBeEQ7QUFBbUYsS0FBakg7QUFDQSxRQUFNakIsUUFBUSxTQUFSQSxLQUFRLENBQUNoQixHQUFELEVBQVM7QUFBRVIsZ0JBQVFDLEdBQVIsQ0FBWSx5QkFBWixFQUF1Q2tDLEVBQXZDLEVBQTJDLDJCQUEzQyxFQUF3RVAsRUFBeEUsRUFBNEUseUJBQWVwQixHQUFmLENBQTVFO0FBQWtHLEtBQTNIO0FBQ0FaLHdCQUFvQmdDLEVBQXBCLEVBQXdCUyxNQUF4QixDQUErQkYsRUFBL0IsRUFBbUNsQixPQUFuQyxFQUE0Q08sS0FBNUM7QUFDSCxDQUpEOztBQU1BLElBQU1SLGVBQWUsU0FBZkEsWUFBZSxDQUFDUixHQUFELEVBQVM7QUFBRVIsWUFBUUMsR0FBUixDQUFZTyxHQUFaO0FBQWtCLENBQWxEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7IGluc3RhbGwgfSBmcm9tICdzb3VyY2UtbWFwLXN1cHBvcnQnO1xyXG5pbnN0YWxsKCk7XHJcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2NvbmZpZycpO1xyXG5pbXBvcnQgQ291Y2hTZXJ2aWNlIGZyb20gJy4vY291Y2hTZXJ2aWNlJ1xyXG5pbXBvcnQgeyBoZXhFbmNvZGUsIGhleERlY29kZSB9IGZyb20gJy4vaGV4RW5jb2RlcidcclxuXHJcbmxldCB3YXRjaGVkRGF0YWJhc2VMaXN0ID0gW11cclxuXHJcbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChyZWFzb24pID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdERUJVRzogVW5oYW5kbGVkIFJlamVjdGlvbiBSZWFzb246ICcgKyByZWFzb24pO1xyXG59KTtcclxuXHJcbi8vIEdldCB0aGUgY29sbGVjdGlvbiBvZiBkYXRhYmFzZXMgdG8gd2F0Y2hcclxubGV0IGNvbXBsZXRlZERhdGFiYXNlID0gbmV3IENvdWNoU2VydmljZSgnY29tcGxldGVkLXZpc2l0cycpXHJcbmNvbXBsZXRlZERhdGFiYXNlLmdldFVzZXJEYXRhYmFzZUxpc3QoKVxyXG4gICAgLnRoZW4obGlzdCA9PiB7IHN0YXJ0KGxpc3QpIH0pXHJcbiAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKCdFcnJvcjogVW5hYmxlIHRvIGZldGNoIGxpc3Qgb2YgdXNlciBkYXRhYmFzZXMnLCBlcnIpKVxyXG5cclxuLy8gU3RvcmUgdXNlcmRiIGluc3RhbmNlcyBpbiBjb2xsZWN0aW9uIGUuZy4gd2F0Y2hlZERhdGFCYXNlTGlzdFsgJ3VzZXJkYi14eHh4eHgnLCAuLi4gXVxyXG5jb25zdCBzdGFydCA9ICh3YXRjaExpc3QpID0+IHtcclxuICAgIHdhdGNoTGlzdC5mb3JFYWNoKGQgPT4geyBhZGRXYXRjaFRvRGF0YWJhc2UoZCkgfSlcclxuICAgIHdhdGNoRm9yTmV3VXNlcnMoKVxyXG4gICAgY29uc29sZS5sb2coJ01GQSBQcm9jZXNzaW5nIFNlcnZpY2UgUnVubmluZy4uLicpXHJcbn1cclxuXHJcbmNvbnN0IGFkZFdhdGNoVG9EYXRhYmFzZSA9IChkKSA9PiB7XHJcbiAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RdID0gbmV3IENvdWNoU2VydmljZShkKVxyXG4gICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtkXS5zdWJzY3JpYmUocHJvY2Vzc0NoYW5nZSwgZ2VuZXJhbEVycm9yKVxyXG59XHJcblxyXG4vLyBBZGQgbmV3bHkgY3JlYXRlZCB1c2VyIGRicyB0byB0aGUgd2F0Y2ggbGlzdFxyXG5jb25zdCB3YXRjaEZvck5ld1VzZXJzID0gKCkgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChjaGFuZ2UpID0+IHtcclxuICAgICAgICBjaGFuZ2UuZm9yRWFjaChjID0+IHtcclxuICAgICAgICAgICAgaWYgKGMuX2lkLmluZGV4T2YoJ29yZy5jb3VjaGRiLnVzZXInKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBjaGVja05hbWVBZ2FpbnN0V2F0Y2hMaXN0KGMubmFtZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgY29uc29sZS5sb2coJ0Vycm9yOiBDb3VsZCBub3Qgd2F0Y2ggX3VzZXJzJywgSlNPTi5zdHJpbmdpZnkoZXJyKSkgfVxyXG4gICAgY29uc3QgdXNlcnMgPSBuZXcgQ291Y2hTZXJ2aWNlKCdfdXNlcnMnKVxyXG4gICAgdXNlcnMuc3Vic2NyaWJlKHN1Y2Nlc3MsIGVycm9yLCAnYWRtaW4nKVxyXG59XHJcblxyXG5jb25zdCBjaGVja05hbWVBZ2FpbnN0V2F0Y2hMaXN0ID0gKG5hbWUpID0+IHtcclxuICAgIGxldCBkYk5hbWUgPSAndXNlcmRiLScgKyBoZXhFbmNvZGUobmFtZSlcclxuICAgIGlmICh3YXRjaGVkRGF0YWJhc2VMaXN0W2RiTmFtZV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGFkZFdhdGNoVG9EYXRhYmFzZShkYk5hbWUpXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIElnbm9yZSBkZWxldGVkIHJlY29yZHM7IFtjaGFuZ2VdIGlzIGFsd2F5cyBhbiBhcnJheTsgXHJcbi8vIGRiIGlzIHRoZSBkYXRhYmFzZSBuYW1lLCBzbyB3ZSBjYW4gcmVtb3ZlIGRvYyBsYXRlclxyXG5jb25zdCBwcm9jZXNzQ2hhbmdlID0gKGNoYW5nZSwgZGIpID0+IHtcclxuICAgIGNoYW5nZS5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICAgIGlmICghYy5fZGVsZXRlZCkgeyB0ZXN0Rm9yQ29tcGxldGVkKGMsIGRiKSB9XHJcbiAgICB9KVxyXG59XHJcblxyXG4vLyBGaWx0ZXIgb25seSBjb21wbGV0ZWQgcmVjb3Jkc1xyXG5jb25zdCB0ZXN0Rm9yQ29tcGxldGVkID0gKGRvYywgZGIpID0+IHtcclxuICAgIGlmIChkb2Muc3RhdHVzICYmIChkb2Muc3RhdHVzID09PSAnY29tcGxldGVkJykpIHsgbW92ZVJlY29yZChkb2MsIGRiKSB9XHJcbn1cclxuXHJcbi8vIE1vdmUgcmVjb3JkIGludG8gY29tcGxldGVkIHF1ZXVlXHJcbmNvbnN0IG1vdmVSZWNvcmQgPSAoZG9jLCBkYikgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChkb2MpID0+IHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnREVCVUc6IEFkZGVkIGRvYyB0byBjb21wbGV0ZWQtdmlzaXRzJywgZG9jKVxyXG4gICAgICAgIHJlbW92ZUlmTm9FcnJvcihkb2MuaWQsIGRiKVxyXG4gICAgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7IGNvbnNvbGUubG9nKCdFcnJvcjogQ29tcGxldGVkIHJlY29yZCBjb3VsZCBub3QgYmUgYWRkZWQ6ICcsIGRvYy5faWQsICcgOiAnLCBKU09OLnN0cmluZ2lmeShlcnIpKSB9XHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5hZGQoZG9jLCBzdWNjZXNzLCBlcnJvcilcclxufVxyXG5cclxuLy8gRW5zdXJlIHRoYXQgcmVjb3JkIGV4aXN0cyBpbiBjb21wbGV0ZWQgZGF0YWJhc2UgYmVmb3JlIHJlbW92aW5nXHJcbmNvbnN0IHJlbW92ZUlmTm9FcnJvciA9IChpZCwgZGIpID0+IHtcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSAoZG9jKSA9PiB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ0RFQlVHOiBGZXRjaGVkIGRvYyBmcm9tIGNvbXBsZXRlZC12aXNpdHMnLCBkb2MpXHJcbiAgICAgICAgcmVtb3ZlKGlkLCBkYilcclxuICAgIH1cclxuICAgIGNvbnN0IGVycm9yID0gKGVycikgPT4geyBjb25zb2xlLmxvZygnRXJyb3I6IENvbXBsZXRlZCByZWNvcmQgY291bGQgbm90IGJlIGZvdW5kOiAnLCBkb2MuX2lkLCAnIDogJywgSlNPTi5zdHJpbmdpZnkoZXJyKSkgfVxyXG4gICAgY29tcGxldGVkRGF0YWJhc2UuZmV0Y2goaWQsIHN1Y2Nlc3MsIGVycm9yKVxyXG59XHJcblxyXG5jb25zdCByZW1vdmUgPSAoaWQsIGRiKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKHJlc3VsdCkgPT4geyBjb25zb2xlLmxvZygnQXNzZXNzbWVudCAnICsgaWQgKyAnIHdhcyBjb21wbGV0ZWQgYXQgJyArIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSkgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7IGNvbnNvbGUubG9nKCdFcnJvcjogQ29tcGxldGVkIHJlY29yZCcsIGlkLCAnY291bGQgbm90IGJlIHJlbW92ZWQgZnJvbScsIGRiLCBKU09OLnN0cmluZ2lmeShlcnIpKSB9XHJcbiAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RiXS5yZW1vdmUoaWQsIHN1Y2Nlc3MsIGVycm9yKVxyXG59XHJcblxyXG5jb25zdCBnZW5lcmFsRXJyb3IgPSAoZXJyKSA9PiB7IGNvbnNvbGUubG9nKGVycikgfVxyXG4iXX0=