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
var winston = require('winston');


// Set up logging transports
var logger = new winston.Logger({
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: './logs/mfa-processor.log' })]
});

var watchedDatabaseList = [];

process.on('unhandledRejection', function (reason) {
    logger.log('debug', 'DEBUG: Unhandled Rejection Reason: ' + reason);
});

// Get the collection of databases to watch
var completedDatabase = new _couchService2.default('completed-visits');
completedDatabase.getUserDatabaseList().then(function (list) {
    start(list);
}).catch(function (err) {
    return logger.log('error', 'Error: Unable to fetch list of user databases', err);
});

// Store userdb instances in collection e.g. watchedDataBaseList[ 'userdb-xxxxxx', ... ]
var start = function start(watchList) {
    watchList.forEach(function (d) {
        addWatchToDatabase(d);
    });
    watchForNewUsers();
    logger.log('info', 'MFA Processing Service Running...');
};

var addWatchToDatabase = function addWatchToDatabase(d) {
    watchedDatabaseList[d] = new _couchService2.default(d);
    watchedDatabaseList[d].subscribe(processChange, generalError);
    logger.log('info', 'Subscribed to %s', d);
};

// Add newly created user dbs to the watch list
var watchForNewUsers = function watchForNewUsers() {
    var success = function success(change) {
        console.log('=================================================================');
        console.log(change);
        console.log('=================================================================');
        change.forEach(function (c) {
            if (c._id.indexOf('org.couchdb.user:') > -1) {
                checkNameAgainstWatchList(c._id.replace('org.couchdb.user:', ''));
            }
        });
    };
    var error = function error(err) {
        logger.log('error', 'Error: Could not watch _users', (0, _stringify2.default)(err));
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
    if (change) {
        change.forEach(function (c) {
            if (!c._deleted) {
                testForCompleted(c, db);
            }
        });
    }
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
        // logger.log('info', 'DEBUG: Added doc to completed-visits', doc)
        removeIfNoError(doc.id, db);
    };
    var error = function error(err) {
        logger.log('error', 'Error: Completed record could not be added: ', doc._id, ' : ', (0, _stringify2.default)(err));
    };
    completedDatabase.add(doc, success, error);
};

// Ensure that record exists in completed database before removing
var removeIfNoError = function removeIfNoError(id, db) {
    var success = function success(doc) {
        // logger.log('info', 'DEBUG: Fetched doc from completed-visits', doc)
        remove(id, db);
    };
    var error = function error(err) {
        logger.log('error', 'Error: Completed record could not be found: ', doc._id, ' : ', (0, _stringify2.default)(err));
    };
    completedDatabase.fetch(id, success, error);
};

var remove = function remove(id, db) {
    var success = function success(result) {
        logger.log('info', 'Assessment ' + id + ' was completed at ' + new Date().toISOString());
    };
    var error = function error(err) {
        logger.log('error', 'Error: Completed record', id, 'could not be removed from', db, (0, _stringify2.default)(err));
    };
    watchedDatabaseList[db].remove(id, success, error);
};

var generalError = function generalError(err) {
    logger.log('error', err);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2luc3RvbiIsImxvZ2dlciIsIkxvZ2dlciIsInRyYW5zcG9ydHMiLCJDb25zb2xlIiwiRmlsZSIsImZpbGVuYW1lIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInByb2Nlc3MiLCJvbiIsInJlYXNvbiIsImxvZyIsImNvbXBsZXRlZERhdGFiYXNlIiwiZ2V0VXNlckRhdGFiYXNlTGlzdCIsInRoZW4iLCJzdGFydCIsImxpc3QiLCJjYXRjaCIsImVyciIsIndhdGNoTGlzdCIsImZvckVhY2giLCJhZGRXYXRjaFRvRGF0YWJhc2UiLCJkIiwid2F0Y2hGb3JOZXdVc2VycyIsInN1YnNjcmliZSIsInByb2Nlc3NDaGFuZ2UiLCJnZW5lcmFsRXJyb3IiLCJzdWNjZXNzIiwiY2hhbmdlIiwiY29uc29sZSIsImMiLCJfaWQiLCJpbmRleE9mIiwiY2hlY2tOYW1lQWdhaW5zdFdhdGNoTGlzdCIsInJlcGxhY2UiLCJlcnJvciIsInVzZXJzIiwibmFtZSIsImRiTmFtZSIsInVuZGVmaW5lZCIsImRiIiwiX2RlbGV0ZWQiLCJ0ZXN0Rm9yQ29tcGxldGVkIiwiZG9jIiwic3RhdHVzIiwibW92ZVJlY29yZCIsInJlbW92ZUlmTm9FcnJvciIsImlkIiwiYWRkIiwicmVtb3ZlIiwiZmV0Y2giLCJyZXN1bHQiLCJEYXRlIiwidG9JU09TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOztBQUlBOzs7O0FBQ0E7Ozs7QUFKQTtBQUNBLElBQU1BLFNBQVNDLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTUMsVUFBVUQsUUFBUSxTQUFSLENBQWhCOzs7QUFJQTtBQUNBLElBQUlFLFNBQVMsSUFBS0QsUUFBUUUsTUFBYixDQUFxQjtBQUM5QkMsZ0JBQVksQ0FDUixJQUFLSCxRQUFRRyxVQUFSLENBQW1CQyxPQUF4QixFQURRLEVBRVIsSUFBS0osUUFBUUcsVUFBUixDQUFtQkUsSUFBeEIsQ0FBOEIs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U0FBVEEsTUFBUyxDQUFDRixFQUFELEVBQUtQLEVBQUwsRUFBWTtBQUN2QixRQUFNYixVQUFVLFNBQVZBLE9BQVUsQ0FBQ3dCLE1BQUQsRUFBWTtBQUFFbEQsZUFBT1UsR0FBUCxDQUFXLE1BQVgsRUFBbUIsZ0JBQWdCb0MsRUFBaEIsR0FBcUIsb0JBQXJCLEdBQTRDLElBQUlLLElBQUosR0FBV0MsV0FBWCxFQUEvRDtBQUEwRixLQUF4SDtBQUNBLFFBQU1sQixRQUFRLFNBQVJBLEtBQVEsQ0FBQ2pCLEdBQUQsRUFBUztBQUFFakIsZUFBT1UsR0FBUCxDQUFXLE9BQVgsRUFBb0IseUJBQXBCLEVBQStDb0MsRUFBL0MsRUFBbUQsMkJBQW5ELEVBQWdGUCxFQUFoRixFQUFvRix5QkFBZXRCLEdBQWYsQ0FBcEY7QUFBMEcsS0FBbkk7QUFDQVgsd0JBQW9CaUMsRUFBcEIsRUFBd0JTLE1BQXhCLENBQStCRixFQUEvQixFQUFtQ3BCLE9BQW5DLEVBQTRDUSxLQUE1QztBQUNILENBSkQ7O0FBTUEsSUFBTVQsZUFBZSxTQUFmQSxZQUFlLENBQUNSLEdBQUQsRUFBUztBQUFFakIsV0FBT1UsR0FBUCxDQUFXLE9BQVgsRUFBb0JPLEdBQXBCO0FBQTBCLENBQTFEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7IGluc3RhbGwgfSBmcm9tICdzb3VyY2UtbWFwLXN1cHBvcnQnO1xyXG5pbnN0YWxsKCk7XHJcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2NvbmZpZycpO1xyXG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSgnd2luc3RvbicpXHJcbmltcG9ydCBDb3VjaFNlcnZpY2UgZnJvbSAnLi9jb3VjaFNlcnZpY2UnXHJcbmltcG9ydCB7IGhleEVuY29kZSwgaGV4RGVjb2RlIH0gZnJvbSAnLi9oZXhFbmNvZGVyJ1xyXG5cclxuLy8gU2V0IHVwIGxvZ2dpbmcgdHJhbnNwb3J0c1xyXG52YXIgbG9nZ2VyID0gbmV3ICh3aW5zdG9uLkxvZ2dlcikoe1xyXG4gICAgdHJhbnNwb3J0czogW1xyXG4gICAgICAgIG5ldyAod2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUpKCksXHJcbiAgICAgICAgbmV3ICh3aW5zdG9uLnRyYW5zcG9ydHMuRmlsZSkoeyBmaWxlbmFtZTogJy4vbG9ncy9tZmEtcHJvY2Vzc29yLmxvZycgfSlcclxuICAgIF1cclxufSk7XHJcblxyXG5sZXQgd2F0Y2hlZERhdGFiYXNlTGlzdCA9IFtdXHJcblxyXG5wcm9jZXNzLm9uKCd1bmhhbmRsZWRSZWplY3Rpb24nLCAocmVhc29uKSA9PiB7XHJcbiAgICBsb2dnZXIubG9nKCdkZWJ1ZycsICdERUJVRzogVW5oYW5kbGVkIFJlamVjdGlvbiBSZWFzb246ICcgKyByZWFzb24pO1xyXG59KTtcclxuXHJcbi8vIEdldCB0aGUgY29sbGVjdGlvbiBvZiBkYXRhYmFzZXMgdG8gd2F0Y2hcclxubGV0IGNvbXBsZXRlZERhdGFiYXNlID0gbmV3IENvdWNoU2VydmljZSgnY29tcGxldGVkLXZpc2l0cycpXHJcbmNvbXBsZXRlZERhdGFiYXNlLmdldFVzZXJEYXRhYmFzZUxpc3QoKVxyXG4gICAgLnRoZW4obGlzdCA9PiB7IHN0YXJ0KGxpc3QpIH0pXHJcbiAgICAuY2F0Y2goZXJyID0+IGxvZ2dlci5sb2coJ2Vycm9yJywgJ0Vycm9yOiBVbmFibGUgdG8gZmV0Y2ggbGlzdCBvZiB1c2VyIGRhdGFiYXNlcycsIGVycikpXHJcblxyXG4vLyBTdG9yZSB1c2VyZGIgaW5zdGFuY2VzIGluIGNvbGxlY3Rpb24gZS5nLiB3YXRjaGVkRGF0YUJhc2VMaXN0WyAndXNlcmRiLXh4eHh4eCcsIC4uLiBdXHJcbmNvbnN0IHN0YXJ0ID0gKHdhdGNoTGlzdCkgPT4ge1xyXG4gICAgd2F0Y2hMaXN0LmZvckVhY2goZCA9PiB7IGFkZFdhdGNoVG9EYXRhYmFzZShkKSB9KVxyXG4gICAgd2F0Y2hGb3JOZXdVc2VycygpXHJcbiAgICBsb2dnZXIubG9nKCdpbmZvJywgJ01GQSBQcm9jZXNzaW5nIFNlcnZpY2UgUnVubmluZy4uLicpXHJcbn1cclxuXHJcbmNvbnN0IGFkZFdhdGNoVG9EYXRhYmFzZSA9IChkKSA9PiB7XHJcbiAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RdID0gbmV3IENvdWNoU2VydmljZShkKVxyXG4gICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtkXS5zdWJzY3JpYmUocHJvY2Vzc0NoYW5nZSwgZ2VuZXJhbEVycm9yKVxyXG4gICAgbG9nZ2VyLmxvZygnaW5mbycsICdTdWJzY3JpYmVkIHRvICVzJywgZClcclxufVxyXG5cclxuLy8gQWRkIG5ld2x5IGNyZWF0ZWQgdXNlciBkYnMgdG8gdGhlIHdhdGNoIGxpc3RcclxuY29uc3Qgd2F0Y2hGb3JOZXdVc2VycyA9ICgpID0+IHtcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSAoY2hhbmdlKSA9PiB7XHJcbmNvbnNvbGUubG9nKCc9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PScpXHJcbmNvbnNvbGUubG9nKGNoYW5nZSlcclxuY29uc29sZS5sb2coJz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09JylcclxuICAgICAgICBjaGFuZ2UuZm9yRWFjaChjID0+IHtcclxuICAgICAgICAgICAgaWYgKGMuX2lkLmluZGV4T2YoJ29yZy5jb3VjaGRiLnVzZXI6JykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tOYW1lQWdhaW5zdFdhdGNoTGlzdChjLl9pZC5yZXBsYWNlKCdvcmcuY291Y2hkYi51c2VyOicsICcnKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgbG9nZ2VyLmxvZygnZXJyb3InLCAnRXJyb3I6IENvdWxkIG5vdCB3YXRjaCBfdXNlcnMnLCBKU09OLnN0cmluZ2lmeShlcnIpKSB9XHJcbiAgICBjb25zdCB1c2VycyA9IG5ldyBDb3VjaFNlcnZpY2UoJ191c2VycycpXHJcbiAgICB1c2Vycy5zdWJzY3JpYmUoc3VjY2VzcywgZXJyb3IsICdhZG1pbicpXHJcbn1cclxuXHJcbmNvbnN0IGNoZWNrTmFtZUFnYWluc3RXYXRjaExpc3QgPSAobmFtZSkgPT4ge1xyXG4gICAgbGV0IGRiTmFtZSA9ICd1c2VyZGItJyArIGhleEVuY29kZShuYW1lKVxyXG4gICAgaWYgKHdhdGNoZWREYXRhYmFzZUxpc3RbZGJOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgYWRkV2F0Y2hUb0RhdGFiYXNlKGRiTmFtZSlcclxuICAgIH1cclxufVxyXG5cclxuLy8gSWdub3JlIGRlbGV0ZWQgcmVjb3JkczsgW2NoYW5nZV0gaXMgYWx3YXlzIGFuIGFycmF5OyBcclxuLy8gZGIgaXMgdGhlIGRhdGFiYXNlIG5hbWUsIHNvIHdlIGNhbiByZW1vdmUgZG9jIGxhdGVyXHJcbmNvbnN0IHByb2Nlc3NDaGFuZ2UgPSAoY2hhbmdlLCBkYikgPT4ge1xyXG4gICAgaWYgKGNoYW5nZSkge1xyXG4gICAgICAgIGNoYW5nZS5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWMuX2RlbGV0ZWQpIHsgdGVzdEZvckNvbXBsZXRlZChjLCBkYikgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIEZpbHRlciBvbmx5IGNvbXBsZXRlZCByZWNvcmRzXHJcbmNvbnN0IHRlc3RGb3JDb21wbGV0ZWQgPSAoZG9jLCBkYikgPT4ge1xyXG4gICAgaWYgKGRvYy5zdGF0dXMgJiYgKGRvYy5zdGF0dXMgPT09ICdjb21wbGV0ZWQnKSkgeyBtb3ZlUmVjb3JkKGRvYywgZGIpIH1cclxufVxyXG5cclxuLy8gTW92ZSByZWNvcmQgaW50byBjb21wbGV0ZWQgcXVldWVcclxuY29uc3QgbW92ZVJlY29yZCA9IChkb2MsIGRiKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKGRvYykgPT4ge1xyXG4gICAgICAgIC8vIGxvZ2dlci5sb2coJ2luZm8nLCAnREVCVUc6IEFkZGVkIGRvYyB0byBjb21wbGV0ZWQtdmlzaXRzJywgZG9jKVxyXG4gICAgICAgIHJlbW92ZUlmTm9FcnJvcihkb2MuaWQsIGRiKVxyXG4gICAgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7IGxvZ2dlci5sb2coJ2Vycm9yJywgJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkIGNvdWxkIG5vdCBiZSBhZGRlZDogJywgZG9jLl9pZCwgJyA6ICcsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIGNvbXBsZXRlZERhdGFiYXNlLmFkZChkb2MsIHN1Y2Nlc3MsIGVycm9yKVxyXG59XHJcblxyXG4vLyBFbnN1cmUgdGhhdCByZWNvcmQgZXhpc3RzIGluIGNvbXBsZXRlZCBkYXRhYmFzZSBiZWZvcmUgcmVtb3ZpbmdcclxuY29uc3QgcmVtb3ZlSWZOb0Vycm9yID0gKGlkLCBkYikgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChkb2MpID0+IHtcclxuICAgICAgICAvLyBsb2dnZXIubG9nKCdpbmZvJywgJ0RFQlVHOiBGZXRjaGVkIGRvYyBmcm9tIGNvbXBsZXRlZC12aXNpdHMnLCBkb2MpXHJcbiAgICAgICAgcmVtb3ZlKGlkLCBkYilcclxuICAgIH1cclxuICAgIGNvbnN0IGVycm9yID0gKGVycikgPT4geyBsb2dnZXIubG9nKCdlcnJvcicsICdFcnJvcjogQ29tcGxldGVkIHJlY29yZCBjb3VsZCBub3QgYmUgZm91bmQ6ICcsIGRvYy5faWQsICcgOiAnLCBKU09OLnN0cmluZ2lmeShlcnIpKSB9XHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5mZXRjaChpZCwgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbmNvbnN0IHJlbW92ZSA9IChpZCwgZGIpID0+IHtcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSAocmVzdWx0KSA9PiB7IGxvZ2dlci5sb2coJ2luZm8nLCAnQXNzZXNzbWVudCAnICsgaWQgKyAnIHdhcyBjb21wbGV0ZWQgYXQgJyArIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSkgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7IGxvZ2dlci5sb2coJ2Vycm9yJywgJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkJywgaWQsICdjb3VsZCBub3QgYmUgcmVtb3ZlZCBmcm9tJywgZGIsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIHdhdGNoZWREYXRhYmFzZUxpc3RbZGJdLnJlbW92ZShpZCwgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbmNvbnN0IGdlbmVyYWxFcnJvciA9IChlcnIpID0+IHsgbG9nZ2VyLmxvZygnZXJyb3InLCBlcnIpIH1cclxuIl19