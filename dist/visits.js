'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PouchDB = require('pouchdb');

var dbServer = 'http://51.254.135.229:5984';
var visitsDB = 'visits';
var db = new PouchDB(visitsDB);
var makeDoc = function makeDoc(doc) {
    console.log('makeDoc', doc);
    var id = doc._id && doc._id !== "" ? doc._id : new Date().toISOString();
    console.log('id', id);
    return (0, _assign2.default)({}, doc, { _id: id });
};
var syncToken = {};

module.exports = {

    fetchAll: function fetchAll() {
        return new _promise2.default(function (resolve, reject) {
            db.allDocs({
                include_docs: true,
                attachments: true
            }).then(function (docs) {
                resolve(docs.rows);
            }).catch(function (err) {
                reject(err);
            });
        });
    },

    add: function add(details) {
        var payload = makeDoc(details);
        console.log('About to add', payload); //
        return new _promise2.default(function (resolve, reject) {
            db.put(payload).then(function (result) {
                resolve(result);
            }).catch(function (err) {
                reject(err);
            });
        });
    },

    update: function update(details) {
        console.log('About to Change', details); //
        return new _promise2.default(function (resolve, reject) {
            if (!details._id) {
                reject({ err: 'No id provided - cannot complete update' });
            }
            db.get(details._id).then(function (doc) {
                return db.put(makeDoc(details));
            }).then(function (result) {
                resolve(result);
            }).catch(function (err) {
                reject(err);
            });
        });
    },

    remove: function remove(id) {
        return new _promise2.default(function (resolve, reject) {
            db.get(id).then(function (doc) {
                return db.remove(doc);
            }).then(function (result) {
                resolve(result);
            }).catch(function (err) {
                reject(err);
            });
        });
    },

    sync: function sync() {
        db.sync(dbServer + '/' + visitsDB, { live: true, retry: true }).on('error', console.log.bind(console));
        // console.log('Syncing with ' + visitsDB + ' db')
    },

    subscribe: function subscribe(handleUpdate) {
        syncToken = db.changes({
            since: 'now',
            live: true,
            include_docs: true
        }).on('change', function (change) {
            handleUpdate(change);
        }).on('complete', function (info) {
            console.log('Subscription ended', info);
        }).on('error', function (err) {
            console.log('Subscription error', err);
        });
    },

    unsubscribe: function unsubscribe() {
        syncToken.cancel();
        console.log('Stopped syncing with ' + visitsDB + ' db');
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aXNpdHMuanMiXSwibmFtZXMiOlsiUG91Y2hEQiIsInJlcXVpcmUiLCJkYlNlcnZlciIsInZpc2l0c0RCIiwiZGIiLCJtYWtlRG9jIiwiZG9jIiwiY29uc29sZSIsImxvZyIsImlkIiwiX2lkIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwic3luY1Rva2VuIiwibW9kdWxlIiwiZXhwb3J0cyIsImZldGNoQWxsIiwicmVzb2x2ZSIsInJlamVjdCIsImFsbERvY3MiLCJpbmNsdWRlX2RvY3MiLCJhdHRhY2htZW50cyIsInRoZW4iLCJkb2NzIiwicm93cyIsImNhdGNoIiwiZXJyIiwiYWRkIiwiZGV0YWlscyIsInBheWxvYWQiLCJwdXQiLCJyZXN1bHQiLCJ1cGRhdGUiLCJnZXQiLCJyZW1vdmUiLCJzeW5jIiwibGl2ZSIsInJldHJ5Iiwib24iLCJiaW5kIiwic3Vic2NyaWJlIiwiaGFuZGxlVXBkYXRlIiwiY2hhbmdlcyIsInNpbmNlIiwiY2hhbmdlIiwiaW5mbyIsInVuc3Vic2NyaWJlIiwiY2FuY2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxVQUFVQyxRQUFRLFNBQVIsQ0FBaEI7O0FBRUEsSUFBTUMsV0FBVyw0QkFBakI7QUFDQSxJQUFNQyxXQUFXLFFBQWpCO0FBQ0EsSUFBTUMsS0FBSyxJQUFJSixPQUFKLENBQVlHLFFBQVosQ0FBWDtBQUNBLElBQU1FLFVBQVUsU0FBVkEsT0FBVSxDQUFDQyxHQUFELEVBQVM7QUFDckJDLFlBQVFDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCRixHQUF2QjtBQUNBLFFBQUlHLEtBQU1ILElBQUlJLEdBQUosSUFBWUosSUFBSUksR0FBSixLQUFZLEVBQXpCLEdBQWdDSixJQUFJSSxHQUFwQyxHQUEwQyxJQUFJQyxJQUFKLEdBQVdDLFdBQVgsRUFBbkQ7QUFDQUwsWUFBUUMsR0FBUixDQUFZLElBQVosRUFBa0JDLEVBQWxCO0FBQ0EsV0FBTyxzQkFDSCxFQURHLEVBRUhILEdBRkcsRUFHSCxF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VztBQUNuQkMsbUJBQU8sS0FEWTtBQUVuQlAsa0JBQU0sSUFGYTtBQUduQmhCLDBCQUFjO0FBSEssU0FBWCxFQUtQa0IsRUFMTyxDQUtKLFFBTEksRUFLTSxVQUFDTSxNQUFELEVBQVk7QUFBRUgseUJBQWFHLE1BQWI7QUFBc0IsU0FMMUMsRUFNUE4sRUFOTyxDQU1KLFVBTkksRUFNUSxVQUFDTyxJQUFELEVBQVU7QUFBRXRDLG9CQUFRQyxHQUFSLENBQVksb0JBQVosRUFBa0NxQyxJQUFsQztBQUF5QyxTQU43RCxFQU9QUCxFQVBPLENBT0osT0FQSSxFQU9LLFVBQVVaLEdBQVYsRUFBZTtBQUFFbkIsb0JBQVFDLEdBQVIsQ0FBWSxvQkFBWixFQUFrQ2tCLEdBQWxDO0FBQXdDLFNBUDlELENBQVo7QUFRSCxLQTFEWTs7QUE0RGJvQixpQkFBYSx1QkFBTTtBQUNmakMsa0JBQVVrQyxNQUFWO0FBQ0F4QyxnQkFBUUMsR0FBUixDQUFZLDBCQUEwQkwsUUFBMUIsR0FBcUMsS0FBakQ7QUFDSDtBQS9EWSxDQUFqQiIsImZpbGUiOiJ2aXNpdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQb3VjaERCID0gcmVxdWlyZSgncG91Y2hkYicpXHJcblxyXG5jb25zdCBkYlNlcnZlciA9ICdodHRwOi8vNTEuMjU0LjEzNS4yMjk6NTk4NCdcclxuY29uc3QgdmlzaXRzREIgPSAndmlzaXRzJ1xyXG5jb25zdCBkYiA9IG5ldyBQb3VjaERCKHZpc2l0c0RCKVxyXG5jb25zdCBtYWtlRG9jID0gKGRvYykgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ21ha2VEb2MnLCBkb2MpXHJcbiAgICBsZXQgaWQgPSAoZG9jLl9pZCAmJiAoZG9jLl9pZCAhPT0gXCJcIikpID8gZG9jLl9pZCA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gICAgY29uc29sZS5sb2coJ2lkJywgaWQpXHJcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihcclxuICAgICAgICB7fSxcclxuICAgICAgICBkb2MsXHJcbiAgICAgICAgeyBfaWQ6IGlkIH1cclxuICAgIClcclxufVxyXG5sZXQgc3luY1Rva2VuID0ge31cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICAgIGZldGNoQWxsOiAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZGIuYWxsRG9jcyh7XHJcbiAgICAgICAgICAgICAgICBpbmNsdWRlX2RvY3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhdHRhY2htZW50czogdHJ1ZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRvY3MpID0+IHsgcmVzb2x2ZShkb2NzLnJvd3MpIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4geyByZWplY3QoZXJyKSB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZDogKGRldGFpbHMpID0+IHtcclxuICAgICAgICBsZXQgcGF5bG9hZCA9IG1ha2VEb2MoZGV0YWlscylcclxuICAgICAgICBjb25zb2xlLmxvZygnQWJvdXQgdG8gYWRkJywgcGF5bG9hZCkgICAgICAgICAgICAgICAgLy9cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBkYi5wdXQocGF5bG9hZClcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHsgcmVzb2x2ZShyZXN1bHQpIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4geyByZWplY3QoZXJyKSB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogKGRldGFpbHMpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnQWJvdXQgdG8gQ2hhbmdlJywgZGV0YWlscykgICAgICAgICAgICAvL1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghZGV0YWlscy5faWQpIHsgcmVqZWN0KHsgZXJyOiAnTm8gaWQgcHJvdmlkZWQgLSBjYW5ub3QgY29tcGxldGUgdXBkYXRlJyB9KX1cclxuICAgICAgICAgICAgZGIuZ2V0KGRldGFpbHMuX2lkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRvYykgPT4geyByZXR1cm4gZGIucHV0KG1ha2VEb2MoZGV0YWlscykpIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7IHJlc29sdmUocmVzdWx0KSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmU6IChpZCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGRiLmdldChpZClcclxuICAgICAgICAgICAgICAgIC50aGVuKChkb2MpID0+IHsgcmV0dXJuIGRiLnJlbW92ZShkb2MpIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7IHJlc29sdmUocmVzdWx0KSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcbiAgICBzeW5jOiAoKSA9PiB7XHJcbiAgICAgICAgZGIuc3luYyhkYlNlcnZlciArICcvJyArIHZpc2l0c0RCLCB7IGxpdmU6IHRydWUsIHJldHJ5OiB0cnVlIH0pXHJcbiAgICAgICAgICAgIC5vbignZXJyb3InLCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnU3luY2luZyB3aXRoICcgKyB2aXNpdHNEQiArICcgZGInKVxyXG4gICAgfSxcclxuXHJcbiAgICBzdWJzY3JpYmU6IChoYW5kbGVVcGRhdGUpID0+IHtcclxuICAgICAgICBzeW5jVG9rZW4gPSBkYi5jaGFuZ2VzKHtcclxuICAgICAgICAgICAgc2luY2U6ICdub3cnLFxyXG4gICAgICAgICAgICBsaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICBpbmNsdWRlX2RvY3M6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NoYW5nZScsIChjaGFuZ2UpID0+IHsgaGFuZGxlVXBkYXRlKGNoYW5nZSkgfSlcclxuICAgICAgICAgICAgLm9uKCdjb21wbGV0ZScsIChpbmZvKSA9PiB7IGNvbnNvbGUubG9nKCdTdWJzY3JpcHRpb24gZW5kZWQnLCBpbmZvKSB9KVxyXG4gICAgICAgICAgICAub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycikgeyBjb25zb2xlLmxvZygnU3Vic2NyaXB0aW9uIGVycm9yJywgZXJyKSB9KVxyXG4gICAgfSxcclxuXHJcbiAgICB1bnN1YnNjcmliZTogKCkgPT4ge1xyXG4gICAgICAgIHN5bmNUb2tlbi5jYW5jZWwoKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdTdG9wcGVkIHN5bmNpbmcgd2l0aCAnICsgdmlzaXRzREIgKyAnIGRiJylcclxuICAgIH1cclxufSJdfQ==