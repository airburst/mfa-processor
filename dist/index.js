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

var now = function now() {
    return new Date().toISOString();
};

var watchedDatabaseList = [];

process.on('unhandledRejection', function (reason) {
    logger.log('debug', now(), 'DEBUG: Unhandled Rejection Reason: %s', now(), reason);
});

// Get the collection of databases to watch
var completedDatabase = new _couchService2.default('completed-visits');
completedDatabase.getUserDatabaseList().then(function (list) {
    start(list);
}).catch(function (err) {
    return logger.log('error', now(), 'Error: Unable to fetch list of user databases: %s', now(), err);
});

// Store userdb instances in collection e.g. watchedDataBaseList[ 'userdb-xxxxxx', ... ]
var start = function start(watchList) {
    watchList.forEach(function (d) {
        addWatchToDatabase(d);
    });
    watchForNewUsers();
    logger.log('info', now(), 'MFA Processing Service Running...');
};

var addWatchToDatabase = function addWatchToDatabase(d) {
    watchedDatabaseList[d] = new _couchService2.default(d);
    watchedDatabaseList[d].subscribe(processChange, generalError);
    logger.log('info', now(), 'Subscribed to', d);
};

// Add newly created user dbs to the watch list
var watchForNewUsers = function watchForNewUsers() {
    var success = function success(change) {
        change.forEach(function (c) {
            if (c.id.indexOf('org.couchdb.user:') > -1) {
                checkNameAgainstWatchList(c.id.replace('org.couchdb.user:', ''));
            }
        });
    };
    var error = function error(err) {
        logger.log('error', now(), 'Error: Could not watch _users: ', (0, _stringify2.default)(err));
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
        removeIfNoError(doc.id, db);
    };
    var error = function error(err) {
        logger.log('error', now(), 'Completed record could not be added:', (0, _stringify2.default)(err));
    };
    completedDatabase.add(doc, success, error);
};

// Ensure that record exists in completed database before removing
var removeIfNoError = function removeIfNoError(id, db) {
    var success = function success(doc) {
        remove(id, db);
    };
    var error = function error(err) {
        logger.log('error', now(), 'Completed record ' + id + ' could not be found:', (0, _stringify2.default)(err));
    };
    completedDatabase.fetch(id, success, error);
};

var remove = function remove(id, db) {
    var success = function success(result) {
        logger.log('info', now(), 'Assessment [' + id + '] was completed');
    };
    var error = function error(err) {
        logger.log('error', now(), 'Completed record [' + id + '] could not be removed from', db, (0, _stringify2.default)(err));
    };
    watchedDatabaseList[db].remove(id, success, error);
};

var generalError = function generalError(err) {
    logger.log('error', now(), err);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2luc3RvbiIsImxvZ2dlciIsIkxvZ2dlciIsInRyYW5zcG9ydHMiLCJDb25zb2xlIiwiRmlsZSIsImZpbGVuYW1lIiwibm93IiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInByb2Nlc3MiLCJvbiIsInJlYXNvbiIsImxvZyIsImNvbXBsZXRlZERhdGFiYXNlIiwiZ2V0VXNlckRhdGFiYXNlTGlzdCIsInRoZW4iLCJzdGFydCIsImxpc3QiLCJjYXRjaCIsImVyciIsIndhdGNoTGlzdCIsImZvckVhY2giLCJhZGRXYXRjaFRvRGF0YWJhc2UiLCJkIiwid2F0Y2hGb3JOZXdVc2VycyIsInN1YnNjcmliZSIsInByb2Nlc3NDaGFuZ2UiLCJnZW5lcmFsRXJyb3IiLCJzdWNjZXNzIiwiY2hhbmdlIiwiYyIsImlkIiwiaW5kZXhPZiIsImNoZWNrTmFtZUFnYWluc3RXYXRjaExpc3QiLCJyZXBsYWNlIiwiZXJyb3IiLCJ1c2VycyIsIm5hbWUiLCJkYk5hbWUiLCJ1bmRlZmluZWQiLCJkYiIsIl9kZWxldGVkIiwidGVzdEZvckNvbXBsZXRlZCIsImRvYyIsInN0YXR1cyIsIm1vdmVSZWNvcmQiLCJyZW1vdmVJZk5vRXJyb3IiLCJhZGQiLCJyZW1vdmUiLCJmZXRjaCIsInJlc3VsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7O0FBSUE7Ozs7QUFDQTs7OztBQUpBO0FBQ0EsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNQyxVQUFVRCxRQUFRLFNBQVIsQ0FBaEI7OztBQUlBO0FBQ0EsSUFBTUUsU0FBUyxJQUFLRCxRQUFRRSxNQUFiLENBQXFCO0FBQ2hDQyxnQkFBWSxDQUNSLElBQUtILFFBQVFHLFVBQVIsQ0FBbUJDLE9BQXhCLEVBRFEsRUFFUixJQUFLSixRQUFRRyxVQUFSLENBQW1CRSxJQUF4QixDQUE4QixFQUFFQyxVQUFV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LE9BQTVCLEVBQXFDTyxLQUFyQztBQUNILENBTkQ7O0FBUUEsSUFBTWEsU0FBUyxTQUFUQSxNQUFTLENBQUNqQixFQUFELEVBQUtTLEVBQUwsRUFBWTtBQUN2QixRQUFNWixVQUFVLFNBQVZBLE9BQVUsQ0FBQ3NCLE1BQUQsRUFBWTtBQUN4Qm5ELGVBQU9hLEdBQVAsQ0FBVyxNQUFYLEVBQW1CUCxLQUFuQixFQUEwQixpQkFBaUIwQixFQUFqQixHQUFzQixpQkFBaEQ7QUFDSCxLQUZEO0FBR0EsUUFBTUksUUFBUSxTQUFSQSxLQUFRLENBQUNoQixHQUFELEVBQVM7QUFDbkJwQixlQUFPYSxHQUFQLENBQVcsT0FBWCxFQUFvQlAsS0FBcEIsRUFBMkIsdUJBQXVCMEIsRUFBdkIsR0FBNEIsNkJBQXZELEVBQXNGUyxFQUF0RixFQUEwRix5QkFBZXJCLEdBQWYsQ0FBMUY7QUFDSCxLQUZEO0FBR0FYLHdCQUFvQmdDLEVBQXBCLEVBQXdCUSxNQUF4QixDQUErQmpCLEVBQS9CLEVBQW1DSCxPQUFuQyxFQUE0Q08sS0FBNUM7QUFDSCxDQVJEOztBQVVBLElBQU1SLGVBQWUsU0FBZkEsWUFBZSxDQUFDUixHQUFELEVBQVM7QUFBRXBCLFdBQU9hLEdBQVAsQ0FBVyxPQUFYLEVBQW9CUCxLQUFwQixFQUEyQmMsR0FBM0I7QUFBaUMsQ0FBakUiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IHsgaW5zdGFsbCB9IGZyb20gJ3NvdXJjZS1tYXAtc3VwcG9ydCc7XHJcbmluc3RhbGwoKTtcclxuY29uc3QgY29uZmlnID0gcmVxdWlyZSgnY29uZmlnJyk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCd3aW5zdG9uJylcclxuaW1wb3J0IENvdWNoU2VydmljZSBmcm9tICcuL2NvdWNoU2VydmljZSdcclxuaW1wb3J0IHsgaGV4RW5jb2RlLCBoZXhEZWNvZGUgfSBmcm9tICcuL2hleEVuY29kZXInXHJcblxyXG4vLyBTZXQgdXAgbG9nZ2luZyB0cmFuc3BvcnRzXHJcbmNvbnN0IGxvZ2dlciA9IG5ldyAod2luc3Rvbi5Mb2dnZXIpKHtcclxuICAgIHRyYW5zcG9ydHM6IFtcclxuICAgICAgICBuZXcgKHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKSgpLFxyXG4gICAgICAgIG5ldyAod2luc3Rvbi50cmFuc3BvcnRzLkZpbGUpKHsgZmlsZW5hbWU6ICcuL2xvZ3MvbWZhLXByb2Nlc3Nvci5sb2cnIH0pXHJcbiAgICBdXHJcbn0pO1xyXG5cclxuY29uc3Qgbm93ID0gKCkgPT4geyByZXR1cm4gbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH1cclxuXHJcbmxldCB3YXRjaGVkRGF0YWJhc2VMaXN0ID0gW11cclxuXHJcbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChyZWFzb24pID0+IHtcclxuICAgIGxvZ2dlci5sb2coJ2RlYnVnJywgbm93KCksICdERUJVRzogVW5oYW5kbGVkIFJlamVjdGlvbiBSZWFzb246ICVzJywgbm93KCksIHJlYXNvbik7XHJcbn0pO1xyXG5cclxuLy8gR2V0IHRoZSBjb2xsZWN0aW9uIG9mIGRhdGFiYXNlcyB0byB3YXRjaFxyXG5sZXQgY29tcGxldGVkRGF0YWJhc2UgPSBuZXcgQ291Y2hTZXJ2aWNlKCdjb21wbGV0ZWQtdmlzaXRzJylcclxuY29tcGxldGVkRGF0YWJhc2UuZ2V0VXNlckRhdGFiYXNlTGlzdCgpXHJcbiAgICAudGhlbihsaXN0ID0+IHsgc3RhcnQobGlzdCkgfSlcclxuICAgIC5jYXRjaChlcnIgPT4gbG9nZ2VyLmxvZygnZXJyb3InLCBub3coKSwgJ0Vycm9yOiBVbmFibGUgdG8gZmV0Y2ggbGlzdCBvZiB1c2VyIGRhdGFiYXNlczogJXMnLCBub3coKSwgZXJyKSlcclxuXHJcbi8vIFN0b3JlIHVzZXJkYiBpbnN0YW5jZXMgaW4gY29sbGVjdGlvbiBlLmcuIHdhdGNoZWREYXRhQmFzZUxpc3RbICd1c2VyZGIteHh4eHh4JywgLi4uIF1cclxuY29uc3Qgc3RhcnQgPSAod2F0Y2hMaXN0KSA9PiB7XHJcbiAgICB3YXRjaExpc3QuZm9yRWFjaChkID0+IHsgYWRkV2F0Y2hUb0RhdGFiYXNlKGQpIH0pXHJcbiAgICB3YXRjaEZvck5ld1VzZXJzKClcclxuICAgIGxvZ2dlci5sb2coJ2luZm8nLCBub3coKSwgJ01GQSBQcm9jZXNzaW5nIFNlcnZpY2UgUnVubmluZy4uLicpXHJcbn1cclxuXHJcbmNvbnN0IGFkZFdhdGNoVG9EYXRhYmFzZSA9IChkKSA9PiB7XHJcbiAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RdID0gbmV3IENvdWNoU2VydmljZShkKVxyXG4gICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtkXS5zdWJzY3JpYmUocHJvY2Vzc0NoYW5nZSwgZ2VuZXJhbEVycm9yKVxyXG4gICAgbG9nZ2VyLmxvZygnaW5mbycsIG5vdygpLCAnU3Vic2NyaWJlZCB0bycsIGQpXHJcbn1cclxuXHJcbi8vIEFkZCBuZXdseSBjcmVhdGVkIHVzZXIgZGJzIHRvIHRoZSB3YXRjaCBsaXN0XHJcbmNvbnN0IHdhdGNoRm9yTmV3VXNlcnMgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKGNoYW5nZSkgPT4ge1xyXG4gICAgICAgIGNoYW5nZS5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYy5pZC5pbmRleE9mKCdvcmcuY291Y2hkYi51c2VyOicpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrTmFtZUFnYWluc3RXYXRjaExpc3QoYy5pZC5yZXBsYWNlKCdvcmcuY291Y2hkYi51c2VyOicsICcnKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgbG9nZ2VyLmxvZygnZXJyb3InLCBub3coKSwgJ0Vycm9yOiBDb3VsZCBub3Qgd2F0Y2ggX3VzZXJzOiAnLCBKU09OLnN0cmluZ2lmeShlcnIpKSB9XHJcbiAgICBjb25zdCB1c2VycyA9IG5ldyBDb3VjaFNlcnZpY2UoJ191c2VycycpXHJcbiAgICB1c2Vycy5zdWJzY3JpYmUoc3VjY2VzcywgZXJyb3IsICdhZG1pbicpXHJcbn1cclxuXHJcbmNvbnN0IGNoZWNrTmFtZUFnYWluc3RXYXRjaExpc3QgPSAobmFtZSkgPT4ge1xyXG4gICAgbGV0IGRiTmFtZSA9ICd1c2VyZGItJyArIGhleEVuY29kZShuYW1lKVxyXG4gICAgaWYgKHdhdGNoZWREYXRhYmFzZUxpc3RbZGJOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgYWRkV2F0Y2hUb0RhdGFiYXNlKGRiTmFtZSlcclxuICAgIH1cclxufVxyXG5cclxuLy8gSWdub3JlIGRlbGV0ZWQgcmVjb3JkczsgW2NoYW5nZV0gaXMgYWx3YXlzIGFuIGFycmF5OyBcclxuLy8gZGIgaXMgdGhlIGRhdGFiYXNlIG5hbWUsIHNvIHdlIGNhbiByZW1vdmUgZG9jIGxhdGVyXHJcbmNvbnN0IHByb2Nlc3NDaGFuZ2UgPSAoY2hhbmdlLCBkYikgPT4ge1xyXG4gICAgaWYgKGNoYW5nZSkge1xyXG4gICAgICAgIGNoYW5nZS5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWMuX2RlbGV0ZWQpIHsgdGVzdEZvckNvbXBsZXRlZChjLCBkYikgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIEZpbHRlciBvbmx5IGNvbXBsZXRlZCByZWNvcmRzXHJcbmNvbnN0IHRlc3RGb3JDb21wbGV0ZWQgPSAoZG9jLCBkYikgPT4ge1xyXG4gICAgaWYgKGRvYy5zdGF0dXMgJiYgKGRvYy5zdGF0dXMgPT09ICdjb21wbGV0ZWQnKSkgeyBtb3ZlUmVjb3JkKGRvYywgZGIpIH1cclxufVxyXG5cclxuLy8gTW92ZSByZWNvcmQgaW50byBjb21wbGV0ZWQgcXVldWVcclxuY29uc3QgbW92ZVJlY29yZCA9IChkb2MsIGRiKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKGRvYykgPT4geyByZW1vdmVJZk5vRXJyb3IoZG9jLmlkLCBkYikgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7XHJcbiAgICAgICAgbG9nZ2VyLmxvZygnZXJyb3InLCBub3coKSwgJ0NvbXBsZXRlZCByZWNvcmQgY291bGQgbm90IGJlIGFkZGVkOicsIEpTT04uc3RyaW5naWZ5KGVycikpXHJcbiAgICB9XHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5hZGQoZG9jLCBzdWNjZXNzLCBlcnJvcilcclxufVxyXG5cclxuLy8gRW5zdXJlIHRoYXQgcmVjb3JkIGV4aXN0cyBpbiBjb21wbGV0ZWQgZGF0YWJhc2UgYmVmb3JlIHJlbW92aW5nXHJcbmNvbnN0IHJlbW92ZUlmTm9FcnJvciA9IChpZCwgZGIpID0+IHtcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSAoZG9jKSA9PiB7IHJlbW92ZShpZCwgZGIpIH1cclxuICAgIGNvbnN0IGVycm9yID0gKGVycikgPT4ge1xyXG4gICAgICAgIGxvZ2dlci5sb2coJ2Vycm9yJywgbm93KCksICdDb21wbGV0ZWQgcmVjb3JkICcgKyBpZCArICcgY291bGQgbm90IGJlIGZvdW5kOicsIEpTT04uc3RyaW5naWZ5KGVycikpXHJcbiAgICB9XHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5mZXRjaChpZCwgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbmNvbnN0IHJlbW92ZSA9IChpZCwgZGIpID0+IHtcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgbG9nZ2VyLmxvZygnaW5mbycsIG5vdygpLCAnQXNzZXNzbWVudCBbJyArIGlkICsgJ10gd2FzIGNvbXBsZXRlZCcpXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHtcclxuICAgICAgICBsb2dnZXIubG9nKCdlcnJvcicsIG5vdygpLCAnQ29tcGxldGVkIHJlY29yZCBbJyArIGlkICsgJ10gY291bGQgbm90IGJlIHJlbW92ZWQgZnJvbScsIGRiLCBKU09OLnN0cmluZ2lmeShlcnIpKVxyXG4gICAgfVxyXG4gICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtkYl0ucmVtb3ZlKGlkLCBzdWNjZXNzLCBlcnJvcilcclxufVxyXG5cclxuY29uc3QgZ2VuZXJhbEVycm9yID0gKGVycikgPT4geyBsb2dnZXIubG9nKCdlcnJvcicsIG5vdygpLCBlcnIpIH1cclxuIl19