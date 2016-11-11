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
        change.forEach(function (c) {
            if (c._id.indexOf('org.couchdb.user') > -1) {
                checkNameAgainstWatchList(c.name);
            }
        });
    };
    var error = function error(err) {
        logger.log('info', 'Error: Could not watch _users', (0, _stringify2.default)(err));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2luc3RvbiIsImxvZ2dlciIsIkxvZ2dlciIsInRyYW5zcG9ydHMiLCJDb25zb2xlIiwiRmlsZSIsImZpbGVuYW1lIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInByb2Nlc3MiLCJvbiIsInJlYXNvbiIsImxvZyIsImNvbXBsZXRlZERhdGFiYXNlIiwiZ2V0VXNlckRhdGFiYXNlTGlzdCIsInRoZW4iLCJzdGFydCIsImxpc3QiLCJjYXRjaCIsImVyciIsIndhdGNoTGlzdCIsImZvckVhY2giLCJhZGRXYXRjaFRvRGF0YWJhc2UiLCJkIiwid2F0Y2hGb3JOZXdVc2VycyIsInN1YnNjcmliZSIsInByb2Nlc3NDaGFuZ2UiLCJnZW5lcmFsRXJyb3IiLCJzdWNjZXNzIiwiY2hhbmdlIiwiYyIsIl9pZCIsImluZGV4T2YiLCJjaGVja05hbWVBZ2FpbnN0V2F0Y2hMaXN0IiwibmFtZSIsImVycm9yIiwidXNlcnMiLCJkYk5hbWUiLCJ1bmRlZmluZWQiLCJkYiIsIl9kZWxldGVkIiwidGVzdEZvckNvbXBsZXRlZCIsImRvYyIsInN0YXR1cyIsIm1vdmVSZWNvcmQiLCJyZW1vdmVJZk5vRXJyb3IiLCJpZCIsImFkZCIsInJlbW92ZSIsImZldGNoIiwicmVzdWx0IiwiRGF0ZSIsInRvSVNPU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7QUFJQTs7OztBQUNBOzs7O0FBSkE7QUFDQSxJQUFNQSxTQUFTQyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU1DLFVBQVVELFFBQVEsU0FBUixDQUFoQjs7O0FBSUE7QUFDQSxJQUFJRSxTQUFTLElBQUtELFFBQVFFLE1BQWIsQ0FBcUI7QUFDOUJDLGdCQUFZLENBQ1IsSUFBS0gsUUFBUUcsVUFBUixDQUFtQkMsT0FBeEIsRUFEUSxFQUVSLElBQUtKLFFBQVFHLFVBQVIsQ0FBbUJFLElBQXhCLENBQThCLEVBQUVDLFVBQVUsMEJBQVosRUFB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SUFBSixHQUFXQyxXQUFYLEVBQS9EO0FBQTBGLEtBQXhIO0FBQ0EsUUFBTWpCLFFBQVEsU0FBUkEsS0FBUSxDQUFDaEIsR0FBRCxFQUFTO0FBQUVqQixlQUFPVSxHQUFQLENBQVcsT0FBWCxFQUFvQix5QkFBcEIsRUFBK0NrQyxFQUEvQyxFQUFtRCwyQkFBbkQsRUFBZ0ZQLEVBQWhGLEVBQW9GLHlCQUFlcEIsR0FBZixDQUFwRjtBQUEwRyxLQUFuSTtBQUNBWCx3QkFBb0IrQixFQUFwQixFQUF3QlMsTUFBeEIsQ0FBK0JGLEVBQS9CLEVBQW1DbEIsT0FBbkMsRUFBNENPLEtBQTVDO0FBQ0gsQ0FKRDs7QUFNQSxJQUFNUixlQUFlLFNBQWZBLFlBQWUsQ0FBQ1IsR0FBRCxFQUFTO0FBQUVqQixXQUFPVSxHQUFQLENBQVcsT0FBWCxFQUFvQk8sR0FBcEI7QUFBMEIsQ0FBMUQiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IHsgaW5zdGFsbCB9IGZyb20gJ3NvdXJjZS1tYXAtc3VwcG9ydCc7XHJcbmluc3RhbGwoKTtcclxuY29uc3QgY29uZmlnID0gcmVxdWlyZSgnY29uZmlnJyk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCd3aW5zdG9uJylcclxuaW1wb3J0IENvdWNoU2VydmljZSBmcm9tICcuL2NvdWNoU2VydmljZSdcclxuaW1wb3J0IHsgaGV4RW5jb2RlLCBoZXhEZWNvZGUgfSBmcm9tICcuL2hleEVuY29kZXInXHJcblxyXG4vLyBTZXQgdXAgbG9nZ2luZyB0cmFuc3BvcnRzXHJcbnZhciBsb2dnZXIgPSBuZXcgKHdpbnN0b24uTG9nZ2VyKSh7XHJcbiAgICB0cmFuc3BvcnRzOiBbXHJcbiAgICAgICAgbmV3ICh3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSkoKSxcclxuICAgICAgICBuZXcgKHdpbnN0b24udHJhbnNwb3J0cy5GaWxlKSh7IGZpbGVuYW1lOiAnLi9sb2dzL21mYS1wcm9jZXNzb3IubG9nJyB9KVxyXG4gICAgXVxyXG59KTtcclxuXHJcbmxldCB3YXRjaGVkRGF0YWJhc2VMaXN0ID0gW11cclxuXHJcbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChyZWFzb24pID0+IHtcclxuICAgIGxvZ2dlci5sb2coJ2RlYnVnJywgJ0RFQlVHOiBVbmhhbmRsZWQgUmVqZWN0aW9uIFJlYXNvbjogJyArIHJlYXNvbik7XHJcbn0pO1xyXG5cclxuLy8gR2V0IHRoZSBjb2xsZWN0aW9uIG9mIGRhdGFiYXNlcyB0byB3YXRjaFxyXG5sZXQgY29tcGxldGVkRGF0YWJhc2UgPSBuZXcgQ291Y2hTZXJ2aWNlKCdjb21wbGV0ZWQtdmlzaXRzJylcclxuY29tcGxldGVkRGF0YWJhc2UuZ2V0VXNlckRhdGFiYXNlTGlzdCgpXHJcbiAgICAudGhlbihsaXN0ID0+IHsgc3RhcnQobGlzdCkgfSlcclxuICAgIC5jYXRjaChlcnIgPT4gbG9nZ2VyLmxvZygnZXJyb3InLCAnRXJyb3I6IFVuYWJsZSB0byBmZXRjaCBsaXN0IG9mIHVzZXIgZGF0YWJhc2VzJywgZXJyKSlcclxuXHJcbi8vIFN0b3JlIHVzZXJkYiBpbnN0YW5jZXMgaW4gY29sbGVjdGlvbiBlLmcuIHdhdGNoZWREYXRhQmFzZUxpc3RbICd1c2VyZGIteHh4eHh4JywgLi4uIF1cclxuY29uc3Qgc3RhcnQgPSAod2F0Y2hMaXN0KSA9PiB7XHJcbiAgICB3YXRjaExpc3QuZm9yRWFjaChkID0+IHsgYWRkV2F0Y2hUb0RhdGFiYXNlKGQpIH0pXHJcbiAgICB3YXRjaEZvck5ld1VzZXJzKClcclxuICAgIGxvZ2dlci5sb2coJ2luZm8nLCAnTUZBIFByb2Nlc3NpbmcgU2VydmljZSBSdW5uaW5nLi4uJylcclxufVxyXG5cclxuY29uc3QgYWRkV2F0Y2hUb0RhdGFiYXNlID0gKGQpID0+IHtcclxuICAgIHdhdGNoZWREYXRhYmFzZUxpc3RbZF0gPSBuZXcgQ291Y2hTZXJ2aWNlKGQpXHJcbiAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RdLnN1YnNjcmliZShwcm9jZXNzQ2hhbmdlLCBnZW5lcmFsRXJyb3IpXHJcbiAgICBsb2dnZXIubG9nKCdpbmZvJywgJ1N1YnNjcmliZWQgdG8gJXMnLCBkKVxyXG59XHJcblxyXG4vLyBBZGQgbmV3bHkgY3JlYXRlZCB1c2VyIGRicyB0byB0aGUgd2F0Y2ggbGlzdFxyXG5jb25zdCB3YXRjaEZvck5ld1VzZXJzID0gKCkgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChjaGFuZ2UpID0+IHtcclxuICAgICAgICBjaGFuZ2UuZm9yRWFjaChjID0+IHtcclxuICAgICAgICAgICAgaWYgKGMuX2lkLmluZGV4T2YoJ29yZy5jb3VjaGRiLnVzZXInKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBjaGVja05hbWVBZ2FpbnN0V2F0Y2hMaXN0KGMubmFtZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgbG9nZ2VyLmxvZygnaW5mbycsICdFcnJvcjogQ291bGQgbm90IHdhdGNoIF91c2VycycsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIGNvbnN0IHVzZXJzID0gbmV3IENvdWNoU2VydmljZSgnX3VzZXJzJylcclxuICAgIHVzZXJzLnN1YnNjcmliZShzdWNjZXNzLCBlcnJvciwgJ2FkbWluJylcclxufVxyXG5cclxuY29uc3QgY2hlY2tOYW1lQWdhaW5zdFdhdGNoTGlzdCA9IChuYW1lKSA9PiB7XHJcbiAgICBsZXQgZGJOYW1lID0gJ3VzZXJkYi0nICsgaGV4RW5jb2RlKG5hbWUpXHJcbiAgICBpZiAod2F0Y2hlZERhdGFiYXNlTGlzdFtkYk5hbWVdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBhZGRXYXRjaFRvRGF0YWJhc2UoZGJOYW1lKVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBJZ25vcmUgZGVsZXRlZCByZWNvcmRzOyBbY2hhbmdlXSBpcyBhbHdheXMgYW4gYXJyYXk7IFxyXG4vLyBkYiBpcyB0aGUgZGF0YWJhc2UgbmFtZSwgc28gd2UgY2FuIHJlbW92ZSBkb2MgbGF0ZXJcclxuY29uc3QgcHJvY2Vzc0NoYW5nZSA9IChjaGFuZ2UsIGRiKSA9PiB7XHJcbiAgICBpZiAoY2hhbmdlKSB7XHJcbiAgICAgICAgY2hhbmdlLmZvckVhY2goYyA9PiB7XHJcbiAgICAgICAgICAgIGlmICghYy5fZGVsZXRlZCkgeyB0ZXN0Rm9yQ29tcGxldGVkKGMsIGRiKSB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG5cclxuLy8gRmlsdGVyIG9ubHkgY29tcGxldGVkIHJlY29yZHNcclxuY29uc3QgdGVzdEZvckNvbXBsZXRlZCA9IChkb2MsIGRiKSA9PiB7XHJcbiAgICBpZiAoZG9jLnN0YXR1cyAmJiAoZG9jLnN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcpKSB7IG1vdmVSZWNvcmQoZG9jLCBkYikgfVxyXG59XHJcblxyXG4vLyBNb3ZlIHJlY29yZCBpbnRvIGNvbXBsZXRlZCBxdWV1ZVxyXG5jb25zdCBtb3ZlUmVjb3JkID0gKGRvYywgZGIpID0+IHtcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSAoZG9jKSA9PiB7XHJcbiAgICAgICAgLy8gbG9nZ2VyLmxvZygnaW5mbycsICdERUJVRzogQWRkZWQgZG9jIHRvIGNvbXBsZXRlZC12aXNpdHMnLCBkb2MpXHJcbiAgICAgICAgcmVtb3ZlSWZOb0Vycm9yKGRvYy5pZCwgZGIpXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgbG9nZ2VyLmxvZygnZXJyb3InLCAnRXJyb3I6IENvbXBsZXRlZCByZWNvcmQgY291bGQgbm90IGJlIGFkZGVkOiAnLCBkb2MuX2lkLCAnIDogJywgSlNPTi5zdHJpbmdpZnkoZXJyKSkgfVxyXG4gICAgY29tcGxldGVkRGF0YWJhc2UuYWRkKGRvYywgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbi8vIEVuc3VyZSB0aGF0IHJlY29yZCBleGlzdHMgaW4gY29tcGxldGVkIGRhdGFiYXNlIGJlZm9yZSByZW1vdmluZ1xyXG5jb25zdCByZW1vdmVJZk5vRXJyb3IgPSAoaWQsIGRiKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKGRvYykgPT4ge1xyXG4gICAgICAgIC8vIGxvZ2dlci5sb2coJ2luZm8nLCAnREVCVUc6IEZldGNoZWQgZG9jIGZyb20gY29tcGxldGVkLXZpc2l0cycsIGRvYylcclxuICAgICAgICByZW1vdmUoaWQsIGRiKVxyXG4gICAgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7IGxvZ2dlci5sb2coJ2Vycm9yJywgJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkIGNvdWxkIG5vdCBiZSBmb3VuZDogJywgZG9jLl9pZCwgJyA6ICcsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIGNvbXBsZXRlZERhdGFiYXNlLmZldGNoKGlkLCBzdWNjZXNzLCBlcnJvcilcclxufVxyXG5cclxuY29uc3QgcmVtb3ZlID0gKGlkLCBkYikgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChyZXN1bHQpID0+IHsgbG9nZ2VyLmxvZygnaW5mbycsICdBc3Nlc3NtZW50ICcgKyBpZCArICcgd2FzIGNvbXBsZXRlZCBhdCAnICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKSB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgbG9nZ2VyLmxvZygnZXJyb3InLCAnRXJyb3I6IENvbXBsZXRlZCByZWNvcmQnLCBpZCwgJ2NvdWxkIG5vdCBiZSByZW1vdmVkIGZyb20nLCBkYiwgSlNPTi5zdHJpbmdpZnkoZXJyKSkgfVxyXG4gICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtkYl0ucmVtb3ZlKGlkLCBzdWNjZXNzLCBlcnJvcilcclxufVxyXG5cclxuY29uc3QgZ2VuZXJhbEVycm9yID0gKGVycikgPT4geyBsb2dnZXIubG9nKCdlcnJvcicsIGVycikgfVxyXG4iXX0=