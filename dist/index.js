#!/usr/bin/env node
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _couchService = require('./couchService');

var _couchService2 = _interopRequireDefault(_couchService);

var _hexEncoder = require('./hexEncoder');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { install } from 'source-map-support';
// install();
var winston = require('winston');
//import RestService from './restService'


// const restService = new RestService()
var logFile = './logs/mfa-processor.log';

// Set up logging transports
var logger = new winston.Logger({
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: logFile })]
});
var watchedDatabaseList = [];

process.on('unhandledRejection', function (reason) {
    logger.log('error', 'DEBUG: Unhandled Rejection Reason', reason);
});
logger.log('info', 'START');

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
    // restService.start()
};

var addWatchToDatabase = function addWatchToDatabase(d) {
    watchedDatabaseList[d] = new _couchService2.default(d);
    watchedDatabaseList[d].subscribe(processChange, generalError);
    logger.log('info', 'Subscribed to', d);
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
        logger.log('error', 'Error: Could not watch _users: ', (0, _stringify2.default)(err));
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
        logger.log('error', 'Completed record could not be added:', (0, _stringify2.default)(err));
    };
    completedDatabase.add(doc, success, error);
};

// Ensure that record exists in completed database before removing
var removeIfNoError = function removeIfNoError(id, db) {
    var success = function success(doc) {
        remove(id, db);
    };
    var error = function error(err) {
        logger.log('error', 'Completed record ' + id + ' could not be found:', (0, _stringify2.default)(err));
    };
    completedDatabase.fetch(id, success, error);
};

var remove = function remove(id, db) {
    var success = function success(result) {
        logger.log('info', 'Assessment [' + id + '] was completed');
    };
    var error = function error(err) {
        logger.log('error', 'Completed record [' + id + '] could not be removed from', db, (0, _stringify2.default)(err));
    };
    watchedDatabaseList[db].remove(id, success, error);
};

var generalError = function generalError(err) {
    logger.log('error', err);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJ3aW5zdG9uIiwicmVxdWlyZSIsImxvZ0ZpbGUiLCJsb2dnZXIiLCJMb2dnZXIiLCJ0cmFuc3BvcnRzIiwiQ29uc29sZSIsIkZpbGUiLCJmaWxlbmFtZSIsIndhdGNoZWREYXRhYmFzZUxpc3QiLCJwcm9jZXNzIiwib24iLCJyZWFzb24iLCJsb2ciLCJjb21wbGV0ZWREYXRhYmFzZSIsImdldFVzZXJEYXRhYmFzZUxpc3QiLCJ0aGVuIiwic3RhcnQiLCJsaXN0IiwiY2F0Y2giLCJlcnIiLCJ3YXRjaExpc3QiLCJmb3JFYWNoIiwiYWRkV2F0Y2hUb0RhdGFiYXNlIiwiZCIsIndhdGNoRm9yTmV3VXNlcnMiLCJzdWJzY3JpYmUiLCJwcm9jZXNzQ2hhbmdlIiwiZ2VuZXJhbEVycm9yIiwic3VjY2VzcyIsImNoYW5nZSIsImMiLCJpZCIsImluZGV4T2YiLCJjaGVja05hbWVBZ2FpbnN0V2F0Y2hMaXN0IiwicmVwbGFjZSIsImVycm9yIiwidXNlcnMiLCJuYW1lIiwiZGJOYW1lIiwidW5kZWZpbmVkIiwiZGIiLCJfZGVsZXRlZCIsInRlc3RGb3JDb21wbGV0ZWQiLCJkb2MiLCJzdGF0dXMiLCJtb3ZlUmVjb3JkIiwicmVtb3ZlSWZOb0Vycm9yIiwiYWRkIiwicmVtb3ZlIiwiZmV0Y2giLCJyZXN1bHQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUlBOzs7O0FBRUE7Ozs7QUFMQTtBQUNBO0FBQ0EsSUFBTUEsVUFBVUMsUUFBUSxTQUFSLENBQWhCO0FBRUE7OztBQUdBO0FBQ0EsSUFBTUMsVUFBVSwwQkFBaEI7O0FBRUE7QUFDQSxJQUFNQyxTQUFTLElBQUtILFFBQVFJLE1BQWIsQ0FBcUI7QUFDaENDLGdCQUFZLENBQ1IsSUFBS0wsUUFBUUssVUFBUixDQUFtQkMsT0FBeEIsRUFEUSxFQUVSLElBQUtOLFFBQVFLLFVBQVIsQ0FBbUJFLElBQXhCLENBQThCLEVBQUVDLFVBQVVOLE9BQVosRUFBOUIsQ0FGUTtBQURvQixD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QXNCLGlCQUF6QztBQUNILEtBRkQ7QUFHQSxRQUFNSSxRQUFRLFNBQVJBLEtBQVEsQ0FBQ2hCLEdBQUQsRUFBUztBQUNuQmpCLGVBQU9VLEdBQVAsQ0FBVyxPQUFYLEVBQW9CLHVCQUF1Qm1CLEVBQXZCLEdBQTRCLDZCQUFoRCxFQUErRVMsRUFBL0UsRUFBbUYseUJBQWVyQixHQUFmLENBQW5GO0FBQ0gsS0FGRDtBQUdBWCx3QkFBb0JnQyxFQUFwQixFQUF3QlEsTUFBeEIsQ0FBK0JqQixFQUEvQixFQUFtQ0gsT0FBbkMsRUFBNENPLEtBQTVDO0FBQ0gsQ0FSRDs7QUFVQSxJQUFNUixlQUFlLFNBQWZBLFlBQWUsQ0FBQ1IsR0FBRCxFQUFTO0FBQUVqQixXQUFPVSxHQUFQLENBQVcsT0FBWCxFQUFvQk8sR0FBcEI7QUFBMEIsQ0FBMUQiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLy8gaW1wb3J0IHsgaW5zdGFsbCB9IGZyb20gJ3NvdXJjZS1tYXAtc3VwcG9ydCc7XHJcbi8vIGluc3RhbGwoKTtcclxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoJ3dpbnN0b24nKVxyXG5pbXBvcnQgQ291Y2hTZXJ2aWNlIGZyb20gJy4vY291Y2hTZXJ2aWNlJ1xyXG4vL2ltcG9ydCBSZXN0U2VydmljZSBmcm9tICcuL3Jlc3RTZXJ2aWNlJ1xyXG5pbXBvcnQgeyBoZXhFbmNvZGUsIGhleERlY29kZSB9IGZyb20gJy4vaGV4RW5jb2RlcidcclxuXHJcbi8vIGNvbnN0IHJlc3RTZXJ2aWNlID0gbmV3IFJlc3RTZXJ2aWNlKClcclxuY29uc3QgbG9nRmlsZSA9ICcuL2xvZ3MvbWZhLXByb2Nlc3Nvci5sb2cnXHJcblxyXG4vLyBTZXQgdXAgbG9nZ2luZyB0cmFuc3BvcnRzXHJcbmNvbnN0IGxvZ2dlciA9IG5ldyAod2luc3Rvbi5Mb2dnZXIpKHtcclxuICAgIHRyYW5zcG9ydHM6IFtcclxuICAgICAgICBuZXcgKHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKSgpLFxyXG4gICAgICAgIG5ldyAod2luc3Rvbi50cmFuc3BvcnRzLkZpbGUpKHsgZmlsZW5hbWU6IGxvZ0ZpbGUgfSlcclxuICAgIF1cclxufSlcclxubGV0IHdhdGNoZWREYXRhYmFzZUxpc3QgPSBbXVxyXG5cclxucHJvY2Vzcy5vbigndW5oYW5kbGVkUmVqZWN0aW9uJywgKHJlYXNvbikgPT4ge1xyXG4gICAgbG9nZ2VyLmxvZygnZXJyb3InLCAnREVCVUc6IFVuaGFuZGxlZCBSZWplY3Rpb24gUmVhc29uJywgcmVhc29uKTtcclxufSk7XHJcbmxvZ2dlci5sb2coJ2luZm8nLCAnU1RBUlQnKVxyXG5cclxuLy8gR2V0IHRoZSBjb2xsZWN0aW9uIG9mIGRhdGFiYXNlcyB0byB3YXRjaFxyXG5sZXQgY29tcGxldGVkRGF0YWJhc2UgPSBuZXcgQ291Y2hTZXJ2aWNlKCdjb21wbGV0ZWQtdmlzaXRzJylcclxuY29tcGxldGVkRGF0YWJhc2UuZ2V0VXNlckRhdGFiYXNlTGlzdCgpXHJcbiAgICAudGhlbihsaXN0ID0+IHsgc3RhcnQobGlzdCkgfSlcclxuICAgIC5jYXRjaChlcnIgPT4gbG9nZ2VyLmxvZygnZXJyb3InLCAnRXJyb3I6IFVuYWJsZSB0byBmZXRjaCBsaXN0IG9mIHVzZXIgZGF0YWJhc2VzJywgZXJyKSlcclxuXHJcbi8vIFN0b3JlIHVzZXJkYiBpbnN0YW5jZXMgaW4gY29sbGVjdGlvbiBlLmcuIHdhdGNoZWREYXRhQmFzZUxpc3RbICd1c2VyZGIteHh4eHh4JywgLi4uIF1cclxuY29uc3Qgc3RhcnQgPSAod2F0Y2hMaXN0KSA9PiB7XHJcbiAgICB3YXRjaExpc3QuZm9yRWFjaChkID0+IHsgYWRkV2F0Y2hUb0RhdGFiYXNlKGQpIH0pXHJcbiAgICB3YXRjaEZvck5ld1VzZXJzKClcclxuICAgIGxvZ2dlci5sb2coJ2luZm8nLCAnTUZBIFByb2Nlc3NpbmcgU2VydmljZSBSdW5uaW5nLi4uJylcclxuICAgIC8vIHJlc3RTZXJ2aWNlLnN0YXJ0KClcclxufVxyXG5cclxuY29uc3QgYWRkV2F0Y2hUb0RhdGFiYXNlID0gKGQpID0+IHtcclxuICAgIHdhdGNoZWREYXRhYmFzZUxpc3RbZF0gPSBuZXcgQ291Y2hTZXJ2aWNlKGQpXHJcbiAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RdLnN1YnNjcmliZShwcm9jZXNzQ2hhbmdlLCBnZW5lcmFsRXJyb3IpXHJcbiAgICBsb2dnZXIubG9nKCdpbmZvJywgJ1N1YnNjcmliZWQgdG8nLCBkKVxyXG59XHJcblxyXG4vLyBBZGQgbmV3bHkgY3JlYXRlZCB1c2VyIGRicyB0byB0aGUgd2F0Y2ggbGlzdFxyXG5jb25zdCB3YXRjaEZvck5ld1VzZXJzID0gKCkgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChjaGFuZ2UpID0+IHtcclxuICAgICAgICBjaGFuZ2UuZm9yRWFjaChjID0+IHtcclxuICAgICAgICAgICAgaWYgKGMuaWQuaW5kZXhPZignb3JnLmNvdWNoZGIudXNlcjonKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBjaGVja05hbWVBZ2FpbnN0V2F0Y2hMaXN0KGMuaWQucmVwbGFjZSgnb3JnLmNvdWNoZGIudXNlcjonLCAnJykpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7IGxvZ2dlci5sb2coJ2Vycm9yJywgJ0Vycm9yOiBDb3VsZCBub3Qgd2F0Y2ggX3VzZXJzOiAnLCBKU09OLnN0cmluZ2lmeShlcnIpKSB9XHJcbiAgICBjb25zdCB1c2VycyA9IG5ldyBDb3VjaFNlcnZpY2UoJ191c2VycycpXHJcbiAgICB1c2Vycy5zdWJzY3JpYmUoc3VjY2VzcywgZXJyb3IsICdhZG1pbicpXHJcbn1cclxuXHJcbmNvbnN0IGNoZWNrTmFtZUFnYWluc3RXYXRjaExpc3QgPSAobmFtZSkgPT4ge1xyXG4gICAgbGV0IGRiTmFtZSA9ICd1c2VyZGItJyArIGhleEVuY29kZShuYW1lKVxyXG4gICAgaWYgKHdhdGNoZWREYXRhYmFzZUxpc3RbZGJOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgYWRkV2F0Y2hUb0RhdGFiYXNlKGRiTmFtZSlcclxuICAgIH1cclxufVxyXG5cclxuLy8gSWdub3JlIGRlbGV0ZWQgcmVjb3JkczsgW2NoYW5nZV0gaXMgYWx3YXlzIGFuIGFycmF5OyBcclxuLy8gZGIgaXMgdGhlIGRhdGFiYXNlIG5hbWUsIHNvIHdlIGNhbiByZW1vdmUgZG9jIGxhdGVyXHJcbmNvbnN0IHByb2Nlc3NDaGFuZ2UgPSAoY2hhbmdlLCBkYikgPT4ge1xyXG4gICAgaWYgKGNoYW5nZSkge1xyXG4gICAgICAgIGNoYW5nZS5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWMuX2RlbGV0ZWQpIHsgdGVzdEZvckNvbXBsZXRlZChjLCBkYikgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIEZpbHRlciBvbmx5IGNvbXBsZXRlZCByZWNvcmRzXHJcbmNvbnN0IHRlc3RGb3JDb21wbGV0ZWQgPSAoZG9jLCBkYikgPT4ge1xyXG4gICAgaWYgKGRvYy5zdGF0dXMgJiYgKGRvYy5zdGF0dXMgPT09ICdjb21wbGV0ZWQnKSkgeyBtb3ZlUmVjb3JkKGRvYywgZGIpIH1cclxufVxyXG5cclxuLy8gTW92ZSByZWNvcmQgaW50byBjb21wbGV0ZWQgcXVldWVcclxuY29uc3QgbW92ZVJlY29yZCA9IChkb2MsIGRiKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKGRvYykgPT4geyByZW1vdmVJZk5vRXJyb3IoZG9jLmlkLCBkYikgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7XHJcbiAgICAgICAgbG9nZ2VyLmxvZygnZXJyb3InLCAnQ29tcGxldGVkIHJlY29yZCBjb3VsZCBub3QgYmUgYWRkZWQ6JywgSlNPTi5zdHJpbmdpZnkoZXJyKSlcclxuICAgIH1cclxuICAgIGNvbXBsZXRlZERhdGFiYXNlLmFkZChkb2MsIHN1Y2Nlc3MsIGVycm9yKVxyXG59XHJcblxyXG4vLyBFbnN1cmUgdGhhdCByZWNvcmQgZXhpc3RzIGluIGNvbXBsZXRlZCBkYXRhYmFzZSBiZWZvcmUgcmVtb3ZpbmdcclxuY29uc3QgcmVtb3ZlSWZOb0Vycm9yID0gKGlkLCBkYikgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChkb2MpID0+IHsgcmVtb3ZlKGlkLCBkYikgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7XHJcbiAgICAgICAgbG9nZ2VyLmxvZygnZXJyb3InLCAnQ29tcGxldGVkIHJlY29yZCAnICsgaWQgKyAnIGNvdWxkIG5vdCBiZSBmb3VuZDonLCBKU09OLnN0cmluZ2lmeShlcnIpKVxyXG4gICAgfVxyXG4gICAgY29tcGxldGVkRGF0YWJhc2UuZmV0Y2goaWQsIHN1Y2Nlc3MsIGVycm9yKVxyXG59XHJcblxyXG5jb25zdCByZW1vdmUgPSAoaWQsIGRiKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgIGxvZ2dlci5sb2coJ2luZm8nLCAnQXNzZXNzbWVudCBbJyArIGlkICsgJ10gd2FzIGNvbXBsZXRlZCcpXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHtcclxuICAgICAgICBsb2dnZXIubG9nKCdlcnJvcicsICdDb21wbGV0ZWQgcmVjb3JkIFsnICsgaWQgKyAnXSBjb3VsZCBub3QgYmUgcmVtb3ZlZCBmcm9tJywgZGIsIEpTT04uc3RyaW5naWZ5KGVycikpXHJcbiAgICB9XHJcbiAgICB3YXRjaGVkRGF0YWJhc2VMaXN0W2RiXS5yZW1vdmUoaWQsIHN1Y2Nlc3MsIGVycm9yKVxyXG59XHJcblxyXG5jb25zdCBnZW5lcmFsRXJyb3IgPSAoZXJyKSA9PiB7IGxvZ2dlci5sb2coJ2Vycm9yJywgZXJyKSB9XHJcbiJdfQ==