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
    logger.log('debug', '[%s] DEBUG: Unhandled Rejection Reason: %s', now(), reason);
});

// Get the collection of databases to watch
var completedDatabase = new _couchService2.default('completed-visits');
completedDatabase.getUserDatabaseList().then(function (list) {
    start(list);
}).catch(function (err) {
    return logger.log('error', '[%s] Error: Unable to fetch list of user databases: %s', now(), err);
});

// Store userdb instances in collection e.g. watchedDataBaseList[ 'userdb-xxxxxx', ... ]
var start = function start(watchList) {
    watchList.forEach(function (d) {
        addWatchToDatabase(d);
    });
    watchForNewUsers();
    logger.log('info', '[%s] MFA Processing Service Running...', now());
};

var addWatchToDatabase = function addWatchToDatabase(d) {
    watchedDatabaseList[d] = new _couchService2.default(d);
    watchedDatabaseList[d].subscribe(processChange, generalError);
    logger.log('info', '[%s] Subscribed to %s', now(), d);
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
        logger.log('error', '[%s] Error: Could not watch _users: %s', now(), (0, _stringify2.default)(err));
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
        logger.log('debug', '[%s] DEBUG: Added doc to completed-visits: %s', now(), doc); //
        removeIfNoError(doc.id, db);
    };
    var error = function error(err) {
        logger.log(now(), 'error', 'Error: Completed record could not be added: ', doc._id, ' : ', (0, _stringify2.default)(err));
    };
    completedDatabase.add(doc, success, error);
};

// Ensure that record exists in completed database before removing
var removeIfNoError = function removeIfNoError(id, db) {
    var success = function success(doc) {
        logger.log('debug', '[%s] DEBUG: Fetched doc from completed-visits: %s', now(), doc); //
        remove(id, db);
    };
    var error = function error(err) {
        logger.log('error', '[%s] Error: Completed record [%s] could not be found: %s', now(), doc._id, (0, _stringify2.default)(err));
    };
    completedDatabase.fetch(id, success, error);
};

var remove = function remove(id, db) {
    var success = function success(result) {
        logger.log('info', '[%s] Assessment [%s] was completed', now(), id);
    };
    var error = function error(err) {
        logger.log('error', '[%s] Error: Completed record [%s] could not be removed from %s: %s', now(), id, db, (0, _stringify2.default)(err));
    };
    watchedDatabaseList[db].remove(id, success, error);
};

var generalError = function generalError(err) {
    logger.log('[%s] Error: %s', now(), err);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJyZXF1aXJlIiwid2luc3RvbiIsImxvZ2dlciIsIkxvZ2dlciIsInRyYW5zcG9ydHMiLCJDb25zb2xlIiwiRmlsZSIsImZpbGVuYW1lIiwibm93IiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwid2F0Y2hlZERhdGFiYXNlTGlzdCIsInByb2Nlc3MiLCJvbiIsInJlYXNvbiIsImxvZyIsImNvbXBsZXRlZERhdGFiYXNlIiwiZ2V0VXNlckRhdGFiYXNlTGlzdCIsInRoZW4iLCJzdGFydCIsImxpc3QiLCJjYXRjaCIsImVyciIsIndhdGNoTGlzdCIsImZvckVhY2giLCJhZGRXYXRjaFRvRGF0YWJhc2UiLCJkIiwid2F0Y2hGb3JOZXdVc2VycyIsInN1YnNjcmliZSIsInByb2Nlc3NDaGFuZ2UiLCJnZW5lcmFsRXJyb3IiLCJzdWNjZXNzIiwiY2hhbmdlIiwiYyIsImlkIiwiaW5kZXhPZiIsImNoZWNrTmFtZUFnYWluc3RXYXRjaExpc3QiLCJyZXBsYWNlIiwiZXJyb3IiLCJ1c2VycyIsIm5hbWUiLCJkYk5hbWUiLCJ1bmRlZmluZWQiLCJkYiIsIl9kZWxldGVkIiwidGVzdEZvckNvbXBsZXRlZCIsImRvYyIsInN0YXR1cyIsIm1vdmVSZWNvcmQiLCJyZW1vdmVJZk5vRXJyb3IiLCJfaWQiLCJhZGQiLCJyZW1vdmUiLCJmZXRjaCIsInJlc3VsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7O0FBSUE7Ozs7QUFDQTs7OztBQUpBO0FBQ0EsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNQyxVQUFVRCxRQUFRLFNBQVIsQ0FBaEI7OztBQUlBO0FBQ0EsSUFBTUUsU0FBUyxJQUFLRCxRQUFRRSxNQUFiLENBQXFCO0FBQ2hDQyxnQkFBWSxDQUNSLElBQUtILFFBQVFHLFVBQVIsQ0FBbUJDLE9BQXhCLEVBRFEsRUFFUixJQUFLSixRQUFRRyxVQUFSLENBQW1CRSxJQUF4QixDQUE4QixFQUFFQyxVQUFVLDBCQUFaLEVBQTlCLENBRlE7QUFEb0IsQ0FBckIsQ0FBZjs7QUFPQSxJQUFNQyxNQUFNLFNBQU5BLEdBQU0sR0FBTTtBQUFFLFdBQU8sSUFBSUMsSUFBSixHQUFXQyxXQUFYLEVBQVA7QUFBaUMsQ0FBckQ7O0FBRUEsSUFBSUMsc0JBQXNCLEVBQTFCOztBQUVBQyxRQUFRQyxFQUFSLENBQVcsb0JBQVgsRUFBaUMsVUFBQ0MsTUFBRCxFQUFZO0FBQ3pDWixXQUFPYSxHQUFQLENBQVcsT0FBWCxFQUFvQiw0Q0FBcEIsRUFBa0VQLEtBQWxFLEVBQXlFTSxNQUF6RTtBQUNILENBRkQ7O0FBSUE7QUFDQSxJQUFJRSxvQkFBb0IsMkJBQWlCLGtCQUFqQixDQUF4QjtBQUNBQSxrQkFBa0JDLG1CQUFsQixHQUNLQyxJQURMLENBQ1UsZ0JBQVE7QUFBRUMsVUFBTUMsSUFBTjtBQUFhLENBRGpDLEVBRUtDLEtBRkwsQ0FFVztBQUFBLFdBQU9uQixPQUFPYSxHQUFQLENBQVcsT0FBWCxFQUFvQix3REFBcEIsRUFBOEVQLEtBQTlFLEVBQXFGYyxHQUFyRixDQUFQO0FBQUEsQ0FGWDs7QUFJQTtBQUNBLElBQU1ILFFBQVEsU0FBUkEsS0FBUSxDQUFDSSxTQUFELEVBQWU7QUFDekJBLGNBQVVDLE9BQVYsQ0FBa0IsYUFBSztBQUFFQywyQkFBbUJDLENBQW5CO0FBQXVCLEtBQWhEO0FBQ0FDO0FBQ0F6QixXQUFPYSxHQUFQLENBQVcsTUFBWCxFQUFtQix3Q0FBbkIsRUFBNkRQLEtBQTdEO0FBQ0gsQ0FKRDs7QUFNQSxJQUFNaUIscUJBQXFCLFNBQXJCQSxrQkFBcUIsQ0FBQ0MsQ0FBRCxFQUFPO0FBQzlCZix3QkFBb0JlLENBQXBCLElBQXlCLDJCQUFpQkEsQ0FBakIsQ0FBekI7QUFDQWYsd0JBQW9CZSxDQUFwQixFQUF1QkUsU0FBdkIsQ0FBaUNDLGFBQWpDLEVBQWdEQyxZQUFoRDtBQUNBNUIsV0FBT2EsR0FBUCxDQUFXLE1BQVgsRUFBbUIsdUJBQW5CLEVBQTRDUCxLQUE1QyxFQUFtRGtCLENBQW5EO0FBQ0gsQ0FKRDs7QUFNQTtBQUNBLElBQU1DLG1CQUFtQixTQUFuQkEsZ0JBQW1CLEdBQU07QUFDM0IsUUFBTUksVUFBVSxTQUFWQSxPQUFVLENBQUNDLE1BQUQsRUFBWTtBQUN4QkEsZUFBT1IsT0FBUCxDQUFlLGFBQUs7QUFDaEIsZ0JBQUlTLEVBQUVDLEVBQUYsQ0FBS0MsT0FBTCxDQUFhLG1CQUFiLElBQW9DLENBQUMsQ0FBekMsRUFBNEM7QUFDeENDLDBDQUEwQkgsRUFBRUMsRUFBRixDQUFLRyxPQUFMLENBQWEsbUJBQWIsRUFBa0MsRUFBbEMsQ0FBMUI7QUFDSDtBQUNKLFNBSkQ7QUFLSCxLQU5EO0FBT0EsUUFBTUMsUUFBUSxTQUFSQSxLQUFRLENBQUNoQixHQUFELEVBQVM7QUFBRXBCLGVBQU9hLEdBQVAsQ0FBVyxPQUFYLEVBQW9CLHdDQUFwQixFQUE4RFAsS0FBOUQsRUFBcUUseUJBQWVjLEdBQWYsQ0FBckU7QUFBMkYsS0FBcEg7QUFDQSxRQUFNaUIsUUFBUSwyQkFBaUIsUUFBakIsQ0FBZDtBQUNBQSxVQUFNWCxTQUFOLENBQWdCRyxPQUFoQixFQUF5Qk8sS0FBekIsRUFBZ0MsT0FBaEM7QUFDSCxDQVhEOztBQWFBLElBQU1GLDRCQUE0QixTQUE1QkEseUJBQTRCLENBQUNJLElBQUQsRUFBVTtBQUN4QyxRQUFJQyxTQUFTLFlBQVksMkJBQVVELElBQVYsQ0FBekI7QUFDQSxRQUFJN0Isb0JBQW9COEIsTUFBcEIsTUFBZ0NDLFNBQXBDLEVBQStDO0FBQzNDakIsMkJBQW1CZ0IsTUFBbkI7QUFDSDtBQUNKLENBTEQ7O0FBT0E7QUFDQTtBQUNBLElBQU1aLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBQ0csTUFBRCxFQUFTVyxFQUFULEVBQWdCO0FBQ2xDLFFBQUlYLE1BQUosRUFBWTtBQUNSQSxlQUFPUixPQUFQLENBQWUsYUFBSztBQUNoQixnQkFBSSxDQUFDUyxFQUFFVyxRQUFQLEVBQWlCO0FBQUVDLGlDQUFpQlosQ0FBakIsRUFBb0JVLEVBQXBCO0FBQXlCO0FBQy9DLFNBRkQ7QUFHSDtBQUNKLENBTkQ7O0FBUUE7QUFDQSxJQUFNRSxtQkFBbUIsU0FBbkJBLGdCQUFtQixDQUFDQyxHQUFELEVBQU1ILEVBQU4sRUFBYTtBQUNsQyxRQUFJRyxJQUFJQyxNQUFKLElBQWVELElBQUlDLE1BQUosS0FBZSxXQUFsQyxFQUFnRDtBQUFFQyxtQkFBV0YsR0FBWCxFQUFnQkgsRUFBaEI7QUFBcUI7QUFDMUUsQ0FGRDs7QUFJQTtBQUNBLElBQU1LLGFBQWEsU0FBYkEsVUFBYSxDQUFDRixHQUFELEVBQU1ILEVBQU4sRUFBYTtBQUM1QixRQUFNWixVQUFVLFNBQVZBLE9BQVUsQ0FBQ2UsR0FBRCxFQUFTO0FBQ3JCNUMsZUFBT2EsR0FBUCxDQUFXLE9BQVgsRUFBb0IsK0NBQXBCLEVBQXFFUCxLQUFyRSxFQUE0RXNDLEdBQTVFLEVBRHFCLENBQ2lFO0FBQ3RGRyx3QkFBZ0JILElBQUlaLEVBQXBCLEVBQXdCUyxFQUF4QjtBQUNILEtBSEQ7QUFJQSxRQUFNTCxRQUFRLFNBQVJBLEtBQVEsQ0FBQ2hCLEdBQUQsRUFBUztBQUFFcEIsZUFBT2EsR0FBUCxDQUFXUCxLQUFYLEVBQWtCLE9BQWxCLEVBQTJCLDhDQUEzQixFQUEyRXNDLElBQUlJLEdBQS9FLEVBQW9GLEtBQXBGLEVBQTJGLHlCQUFlNUIsR0FBZixDQUEzRjtBQUFpSCxLQUExSTtBQUNBTixzQkFBa0JtQyxHQUFsQixDQUFzQkwsR0FBdEIsRUFBMkJmLE9BQTNCLEVBQW9DTyxLQUFwQztBQUNILENBUEQ7O0FBU0E7QUFDQSxJQUFNVyxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQUNmLEVBQUQsRUFBS1MsRUFBTCxFQUFZO0FBQ2hDLFFBQU1aLFVBQVUsU0FBVkEsT0FBVSxDQUFDZSxHQUFELEVBQVM7QUFDckI1QyxlQUFPYSxHQUFQLENBQVcsT0FBWCxFQUFvQixtREFBcEIsRUFBeUVQLEtBQXpFLEVBQWdGc0MsR0FBaEYsRUFEcUIsQ0FDb0U7QUFDekZNLGVBQU9sQixFQUFQLEVBQVdTLEVBQVg7QUFDSCxLQUhEO0FBSUEsUUFBTUwsUUFBUSxTQUFSQSxLQUFRLENBQUNoQixHQUFELEVBQVM7QUFBRXBCLGVBQU9hLEdBQVAsQ0FBVyxPQUFYLEVBQW9CLDBEQUFwQixFQUFnRlAsS0FBaEYsRUFBdUZzQyxJQUFJSSxHQUEzRixFQUFnRyx5QkFBZTVCLEdBQWYsQ0FBaEc7QUFBc0gsS0FBL0k7QUFDQU4sc0JBQWtCcUMsS0FBbEIsQ0FBd0JuQixFQUF4QixFQUE0QkgsT0FBNUIsRUFBcUNPLEtBQXJDO0FBQ0gsQ0FQRDs7QUFTQSxJQUFNYyxTQUFTLFNBQVRBLE1BQVMsQ0FBQ2xCLEVBQUQsRUFBS1MsRUFBTCxFQUFZO0FBQ3ZCLFFBQU1aLFVBQVUsU0FBVkEsT0FBVSxDQUFDdUIsTUFBRCxFQUFZO0FBQUVwRCxlQUFPYSxHQUFQLENBQVcsTUFBWCxFQUFtQixvQ0FBbkIsRUFBeURQLEtBQXpELEVBQWdFMEIsRUFBaEU7QUFBcUUsS0FBbkc7QUFDQSxRQUFNSSxRQUFRLFNBQVJBLEtBQVEsQ0FBQ2hCLEdBQUQsRUFBUztBQUFFcEIsZUFBT2EsR0FBUCxDQUFXLE9BQVgsRUFBb0Isb0VBQXBCLEVBQTBGUCxLQUExRixFQUFpRzBCLEVBQWpHLEVBQXFHUyxFQUFyRyxFQUF5Ryx5QkFBZXJCLEdBQWYsQ0FBekc7QUFBK0gsS0FBeEo7QUFDQVgsd0JBQW9CZ0MsRUFBcEIsRUFBd0JTLE1BQXhCLENBQStCbEIsRUFBL0IsRUFBbUNILE9BQW5DLEVBQTRDTyxLQUE1QztBQUNILENBSkQ7O0FBTUEsSUFBTVIsZUFBZSxTQUFmQSxZQUFlLENBQUNSLEdBQUQsRUFBUztBQUFFcEIsV0FBT2EsR0FBUCxDQUFXLGdCQUFYLEVBQTZCUCxLQUE3QixFQUFvQ2MsR0FBcEM7QUFBMEMsQ0FBMUUiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IHsgaW5zdGFsbCB9IGZyb20gJ3NvdXJjZS1tYXAtc3VwcG9ydCc7XHJcbmluc3RhbGwoKTtcclxuY29uc3QgY29uZmlnID0gcmVxdWlyZSgnY29uZmlnJyk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCd3aW5zdG9uJylcclxuaW1wb3J0IENvdWNoU2VydmljZSBmcm9tICcuL2NvdWNoU2VydmljZSdcclxuaW1wb3J0IHsgaGV4RW5jb2RlLCBoZXhEZWNvZGUgfSBmcm9tICcuL2hleEVuY29kZXInXHJcblxyXG4vLyBTZXQgdXAgbG9nZ2luZyB0cmFuc3BvcnRzXHJcbmNvbnN0IGxvZ2dlciA9IG5ldyAod2luc3Rvbi5Mb2dnZXIpKHtcclxuICAgIHRyYW5zcG9ydHM6IFtcclxuICAgICAgICBuZXcgKHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKSgpLFxyXG4gICAgICAgIG5ldyAod2luc3Rvbi50cmFuc3BvcnRzLkZpbGUpKHsgZmlsZW5hbWU6ICcuL2xvZ3MvbWZhLXByb2Nlc3Nvci5sb2cnIH0pXHJcbiAgICBdXHJcbn0pO1xyXG5cclxuY29uc3Qgbm93ID0gKCkgPT4geyByZXR1cm4gbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH1cclxuXHJcbmxldCB3YXRjaGVkRGF0YWJhc2VMaXN0ID0gW11cclxuXHJcbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChyZWFzb24pID0+IHtcclxuICAgIGxvZ2dlci5sb2coJ2RlYnVnJywgJ1slc10gREVCVUc6IFVuaGFuZGxlZCBSZWplY3Rpb24gUmVhc29uOiAlcycsIG5vdygpLCByZWFzb24pO1xyXG59KTtcclxuXHJcbi8vIEdldCB0aGUgY29sbGVjdGlvbiBvZiBkYXRhYmFzZXMgdG8gd2F0Y2hcclxubGV0IGNvbXBsZXRlZERhdGFiYXNlID0gbmV3IENvdWNoU2VydmljZSgnY29tcGxldGVkLXZpc2l0cycpXHJcbmNvbXBsZXRlZERhdGFiYXNlLmdldFVzZXJEYXRhYmFzZUxpc3QoKVxyXG4gICAgLnRoZW4obGlzdCA9PiB7IHN0YXJ0KGxpc3QpIH0pXHJcbiAgICAuY2F0Y2goZXJyID0+IGxvZ2dlci5sb2coJ2Vycm9yJywgJ1slc10gRXJyb3I6IFVuYWJsZSB0byBmZXRjaCBsaXN0IG9mIHVzZXIgZGF0YWJhc2VzOiAlcycsIG5vdygpLCBlcnIpKVxyXG5cclxuLy8gU3RvcmUgdXNlcmRiIGluc3RhbmNlcyBpbiBjb2xsZWN0aW9uIGUuZy4gd2F0Y2hlZERhdGFCYXNlTGlzdFsgJ3VzZXJkYi14eHh4eHgnLCAuLi4gXVxyXG5jb25zdCBzdGFydCA9ICh3YXRjaExpc3QpID0+IHtcclxuICAgIHdhdGNoTGlzdC5mb3JFYWNoKGQgPT4geyBhZGRXYXRjaFRvRGF0YWJhc2UoZCkgfSlcclxuICAgIHdhdGNoRm9yTmV3VXNlcnMoKVxyXG4gICAgbG9nZ2VyLmxvZygnaW5mbycsICdbJXNdIE1GQSBQcm9jZXNzaW5nIFNlcnZpY2UgUnVubmluZy4uLicsIG5vdygpKVxyXG59XHJcblxyXG5jb25zdCBhZGRXYXRjaFRvRGF0YWJhc2UgPSAoZCkgPT4ge1xyXG4gICAgd2F0Y2hlZERhdGFiYXNlTGlzdFtkXSA9IG5ldyBDb3VjaFNlcnZpY2UoZClcclxuICAgIHdhdGNoZWREYXRhYmFzZUxpc3RbZF0uc3Vic2NyaWJlKHByb2Nlc3NDaGFuZ2UsIGdlbmVyYWxFcnJvcilcclxuICAgIGxvZ2dlci5sb2coJ2luZm8nLCAnWyVzXSBTdWJzY3JpYmVkIHRvICVzJywgbm93KCksIGQpXHJcbn1cclxuXHJcbi8vIEFkZCBuZXdseSBjcmVhdGVkIHVzZXIgZGJzIHRvIHRoZSB3YXRjaCBsaXN0XHJcbmNvbnN0IHdhdGNoRm9yTmV3VXNlcnMgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBzdWNjZXNzID0gKGNoYW5nZSkgPT4ge1xyXG4gICAgICAgIGNoYW5nZS5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYy5pZC5pbmRleE9mKCdvcmcuY291Y2hkYi51c2VyOicpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrTmFtZUFnYWluc3RXYXRjaExpc3QoYy5pZC5yZXBsYWNlKCdvcmcuY291Y2hkYi51c2VyOicsICcnKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgbG9nZ2VyLmxvZygnZXJyb3InLCAnWyVzXSBFcnJvcjogQ291bGQgbm90IHdhdGNoIF91c2VyczogJXMnLCBub3coKSwgSlNPTi5zdHJpbmdpZnkoZXJyKSkgfVxyXG4gICAgY29uc3QgdXNlcnMgPSBuZXcgQ291Y2hTZXJ2aWNlKCdfdXNlcnMnKVxyXG4gICAgdXNlcnMuc3Vic2NyaWJlKHN1Y2Nlc3MsIGVycm9yLCAnYWRtaW4nKVxyXG59XHJcblxyXG5jb25zdCBjaGVja05hbWVBZ2FpbnN0V2F0Y2hMaXN0ID0gKG5hbWUpID0+IHtcclxuICAgIGxldCBkYk5hbWUgPSAndXNlcmRiLScgKyBoZXhFbmNvZGUobmFtZSlcclxuICAgIGlmICh3YXRjaGVkRGF0YWJhc2VMaXN0W2RiTmFtZV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGFkZFdhdGNoVG9EYXRhYmFzZShkYk5hbWUpXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIElnbm9yZSBkZWxldGVkIHJlY29yZHM7IFtjaGFuZ2VdIGlzIGFsd2F5cyBhbiBhcnJheTsgXHJcbi8vIGRiIGlzIHRoZSBkYXRhYmFzZSBuYW1lLCBzbyB3ZSBjYW4gcmVtb3ZlIGRvYyBsYXRlclxyXG5jb25zdCBwcm9jZXNzQ2hhbmdlID0gKGNoYW5nZSwgZGIpID0+IHtcclxuICAgIGlmIChjaGFuZ2UpIHtcclxuICAgICAgICBjaGFuZ2UuZm9yRWFjaChjID0+IHtcclxuICAgICAgICAgICAgaWYgKCFjLl9kZWxldGVkKSB7IHRlc3RGb3JDb21wbGV0ZWQoYywgZGIpIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBGaWx0ZXIgb25seSBjb21wbGV0ZWQgcmVjb3Jkc1xyXG5jb25zdCB0ZXN0Rm9yQ29tcGxldGVkID0gKGRvYywgZGIpID0+IHtcclxuICAgIGlmIChkb2Muc3RhdHVzICYmIChkb2Muc3RhdHVzID09PSAnY29tcGxldGVkJykpIHsgbW92ZVJlY29yZChkb2MsIGRiKSB9XHJcbn1cclxuXHJcbi8vIE1vdmUgcmVjb3JkIGludG8gY29tcGxldGVkIHF1ZXVlXHJcbmNvbnN0IG1vdmVSZWNvcmQgPSAoZG9jLCBkYikgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChkb2MpID0+IHtcclxuICAgICAgICBsb2dnZXIubG9nKCdkZWJ1ZycsICdbJXNdIERFQlVHOiBBZGRlZCBkb2MgdG8gY29tcGxldGVkLXZpc2l0czogJXMnLCBub3coKSwgZG9jKSAgICAgIC8vXHJcbiAgICAgICAgcmVtb3ZlSWZOb0Vycm9yKGRvYy5pZCwgZGIpXHJcbiAgICB9XHJcbiAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHsgbG9nZ2VyLmxvZyhub3coKSwgJ2Vycm9yJywgJ0Vycm9yOiBDb21wbGV0ZWQgcmVjb3JkIGNvdWxkIG5vdCBiZSBhZGRlZDogJywgZG9jLl9pZCwgJyA6ICcsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIGNvbXBsZXRlZERhdGFiYXNlLmFkZChkb2MsIHN1Y2Nlc3MsIGVycm9yKVxyXG59XHJcblxyXG4vLyBFbnN1cmUgdGhhdCByZWNvcmQgZXhpc3RzIGluIGNvbXBsZXRlZCBkYXRhYmFzZSBiZWZvcmUgcmVtb3ZpbmdcclxuY29uc3QgcmVtb3ZlSWZOb0Vycm9yID0gKGlkLCBkYikgPT4ge1xyXG4gICAgY29uc3Qgc3VjY2VzcyA9IChkb2MpID0+IHtcclxuICAgICAgICBsb2dnZXIubG9nKCdkZWJ1ZycsICdbJXNdIERFQlVHOiBGZXRjaGVkIGRvYyBmcm9tIGNvbXBsZXRlZC12aXNpdHM6ICVzJywgbm93KCksIGRvYykgICAgIC8vXHJcbiAgICAgICAgcmVtb3ZlKGlkLCBkYilcclxuICAgIH1cclxuICAgIGNvbnN0IGVycm9yID0gKGVycikgPT4geyBsb2dnZXIubG9nKCdlcnJvcicsICdbJXNdIEVycm9yOiBDb21wbGV0ZWQgcmVjb3JkIFslc10gY291bGQgbm90IGJlIGZvdW5kOiAlcycsIG5vdygpLCBkb2MuX2lkLCBKU09OLnN0cmluZ2lmeShlcnIpKSB9XHJcbiAgICBjb21wbGV0ZWREYXRhYmFzZS5mZXRjaChpZCwgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbmNvbnN0IHJlbW92ZSA9IChpZCwgZGIpID0+IHtcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSAocmVzdWx0KSA9PiB7IGxvZ2dlci5sb2coJ2luZm8nLCAnWyVzXSBBc3Nlc3NtZW50IFslc10gd2FzIGNvbXBsZXRlZCcsIG5vdygpLCBpZCkgfVxyXG4gICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7IGxvZ2dlci5sb2coJ2Vycm9yJywgJ1slc10gRXJyb3I6IENvbXBsZXRlZCByZWNvcmQgWyVzXSBjb3VsZCBub3QgYmUgcmVtb3ZlZCBmcm9tICVzOiAlcycsIG5vdygpLCBpZCwgZGIsIEpTT04uc3RyaW5naWZ5KGVycikpIH1cclxuICAgIHdhdGNoZWREYXRhYmFzZUxpc3RbZGJdLnJlbW92ZShpZCwgc3VjY2VzcywgZXJyb3IpXHJcbn1cclxuXHJcbmNvbnN0IGdlbmVyYWxFcnJvciA9IChlcnIpID0+IHsgbG9nZ2VyLmxvZygnWyVzXSBFcnJvcjogJXMnLCBub3coKSwgZXJyKSB9XHJcbiJdfQ==