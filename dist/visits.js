'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PouchDB = require('pouchdb');

module.exports = function () {
    function PouchService(database, remoteServer) {
        (0, _classCallCheck3.default)(this, PouchService);

        this.remoteServer = '';
        this.visitsDB = 'visits';
        this.db = new PouchDB(this.visitsDB);
        this.syncToken = {};
    }

    (0, _createClass3.default)(PouchService, [{
        key: 'makeDoc',
        value: function makeDoc(doc) {
            var id = doc._id && doc._id !== "" ? doc._id : new Date().toISOString();
            return (0, _assign2.default)({}, doc, { _id: id });
        }
    }, {
        key: 'fetchAll',
        value: function fetchAll() {
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
        }
    }, {
        key: 'add',
        value: function add(details) {
            var payload = this.makeDoc(details);
            console.log('About to add', payload); //
            return new _promise2.default(function (resolve, reject) {
                db.put(payload).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'update',
        value: function update(details) {
            var _this = this;

            console.log('About to Change', details); //
            return new _promise2.default(function (resolve, reject) {
                if (!details._id) {
                    reject({ err: 'No id provided - cannot complete update' });
                }
                db.get(details._id).then(function (doc) {
                    return db.put(_this.makeDoc(details));
                }).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'remove',
        value: function remove(id) {
            return new _promise2.default(function (resolve, reject) {
                db.get(id).then(function (doc) {
                    return db.remove(doc);
                }).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'sync',
        value: function sync() {
            db.sync(remoteServer + '/' + visitsDB, { live: true, retry: true }).on('error', console.log.bind(console));
            // console.log('Syncing with ' + visitsDB + ' db')
        }
    }, {
        key: 'subscribe',
        value: function subscribe(handleUpdate) {
            this.syncToken = db.changes({
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
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            this.syncToken.cancel();
            console.log('Stopped syncing with ' + visitsDB + ' db');
        }
    }]);
    return PouchService;
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aXNpdHMuanMiXSwibmFtZXMiOlsiUG91Y2hEQiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiZGF0YWJhc2UiLCJyZW1vdGVTZXJ2ZXIiLCJ2aXNpdHNEQiIsImRiIiwic3luY1Rva2VuIiwiZG9jIiwiaWQiLCJfaWQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJyZXNvbHZlIiwicmVqZWN0IiwiYWxsRG9jcyIsImluY2x1ZGVfZG9jcyIsImF0dGFjaG1lbnRzIiwidGhlbiIsImRvY3MiLCJyb3dzIiwiY2F0Y2giLCJlcnIiLCJkZXRhaWxzIiwicGF5bG9hZCIsIm1ha2VEb2MiLCJjb25zb2xlIiwibG9nIiwicHV0IiwicmVzdWx0IiwiZ2V0IiwicmVtb3ZlIiwic3luYyIsImxpdmUiLCJyZXRyeSIsIm9uIiwiYmluZCIsImhhbmRsZVVwZGF0ZSIsImNoYW5nZXMiLCJzaW5jZSIsImNoYW5nZSIsImluZm8iLCJjYW5jZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsVUFBVUMsUUFBUSxTQUFSLENBQWhCOztBQUVBQyxPQUFPQyxPQUFQO0FBRUksMEJBQ0lDLFFBREosRUFFSUMsWUFGSixFQUdFO0FBQUE7O0FBQ0UsYUFBS0EsWUFBTCxHQUFvQixFQUFwQjtBQUNBLGFBQUtDLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxhQUFLQyxFQUFMLEdBQVUsSUFBSVAsT0FBSixDQUFZLEtBQUtNLFFBQWpCLENBQVY7QUFDQSxhQUFLRSxTQUFMLEdBQWlCLEVBQWpCO0FBQ0g7O0FBVkw7QUFBQTtBQUFBLGdDQVlZQyxHQVpaLEVBWWlCO0FBQ1QsZ0JBQU1DLEtBQU1ELElBQUlFLEdBQUosSUFBWUYsSUFBSUUsR0FBSixLQUFZLEVBQXpCLEdBQWdDRixJQUFJRSxHQUFwQyxHQUEwQyxJQUFJQyxJQUFKLEdBQVdDLFdBQVgsRUFBckQ7QUFDQSxtQkFBTyxzQkFDSCxFQURHLEVBRUhKLEdBRkcsRUFHSCxFQUFFRSxL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QkMsdUJBQU8sS0FEaUI7QUFFeEJOLHNCQUFNLElBRmtCO0FBR3hCakIsOEJBQWM7QUFIVSxhQUFYLEVBS1ptQixFQUxZLENBS1QsUUFMUyxFQUtDLFVBQUNLLE1BQUQsRUFBWTtBQUFFSCw2QkFBYUcsTUFBYjtBQUFzQixhQUxyQyxFQU1aTCxFQU5ZLENBTVQsVUFOUyxFQU1HLFVBQUNNLElBQUQsRUFBVTtBQUFFZix3QkFBUUMsR0FBUixDQUFZLG9CQUFaLEVBQWtDYyxJQUFsQztBQUF5QyxhQU54RCxFQU9aTixFQVBZLENBT1QsT0FQUyxFQU9BLFVBQVViLEdBQVYsRUFBZTtBQUFFSSx3QkFBUUMsR0FBUixDQUFZLG9CQUFaLEVBQWtDTCxHQUFsQztBQUF3QyxhQVB6RCxDQUFqQjtBQVFIO0FBN0VMO0FBQUE7QUFBQSxzQ0ErRWtCO0FBQ1YsaUJBQUtmLFNBQUwsQ0FBZW1DLE1BQWY7QUFDQWhCLG9CQUFRQyxHQUFSLENBQVksMEJBQTBCdEIsUUFBMUIsR0FBcUMsS0FBakQ7QUFDSDtBQWxGTDtBQUFBO0FBQUEiLCJmaWxlIjoidmlzaXRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUG91Y2hEQiA9IHJlcXVpcmUoJ3BvdWNoZGInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQb3VjaFNlcnZpY2Uge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGRhdGFiYXNlLFxyXG4gICAgICAgIHJlbW90ZVNlcnZlclxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdGVTZXJ2ZXIgPSAnJ1xyXG4gICAgICAgIHRoaXMudmlzaXRzREIgPSAndmlzaXRzJ1xyXG4gICAgICAgIHRoaXMuZGIgPSBuZXcgUG91Y2hEQih0aGlzLnZpc2l0c0RCKVxyXG4gICAgICAgIHRoaXMuc3luY1Rva2VuID0ge31cclxuICAgIH1cclxuXHJcbiAgICBtYWtlRG9jKGRvYykge1xyXG4gICAgICAgIGNvbnN0IGlkID0gKGRvYy5faWQgJiYgKGRvYy5faWQgIT09IFwiXCIpKSA/IGRvYy5faWQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihcclxuICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgIGRvYyxcclxuICAgICAgICAgICAgeyBfaWQ6IGlkIH1cclxuICAgICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgZmV0Y2hBbGwoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZGIuYWxsRG9jcyh7XHJcbiAgICAgICAgICAgICAgICBpbmNsdWRlX2RvY3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhdHRhY2htZW50czogdHJ1ZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRvY3MpID0+IHsgcmVzb2x2ZShkb2NzLnJvd3MpIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4geyByZWplY3QoZXJyKSB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgYWRkKGRldGFpbHMpIHtcclxuICAgICAgICBsZXQgcGF5bG9hZCA9IHRoaXMubWFrZURvYyhkZXRhaWxzKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdBYm91dCB0byBhZGQnLCBwYXlsb2FkKSAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGRiLnB1dChwYXlsb2FkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4geyByZXNvbHZlKHJlc3VsdCkgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZGV0YWlscykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdBYm91dCB0byBDaGFuZ2UnLCBkZXRhaWxzKSAgICAgICAgICAgIC8vXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFkZXRhaWxzLl9pZCkgeyByZWplY3QoeyBlcnI6ICdObyBpZCBwcm92aWRlZCAtIGNhbm5vdCBjb21wbGV0ZSB1cGRhdGUnIH0pfVxyXG4gICAgICAgICAgICBkYi5nZXQoZGV0YWlscy5faWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoZG9jKSA9PiB7IHJldHVybiBkYi5wdXQodGhpcy5tYWtlRG9jKGRldGFpbHMpKSB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4geyByZXNvbHZlKHJlc3VsdCkgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmUoaWQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBkYi5nZXQoaWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoZG9jKSA9PiB7IHJldHVybiBkYi5yZW1vdmUoZG9jKSB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4geyByZXNvbHZlKHJlc3VsdCkgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBzeW5jKCkge1xyXG4gICAgICAgIGRiLnN5bmMocmVtb3RlU2VydmVyICsgJy8nICsgdmlzaXRzREIsIHsgbGl2ZTogdHJ1ZSwgcmV0cnk6IHRydWUgfSlcclxuICAgICAgICAgICAgLm9uKCdlcnJvcicsIGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSkpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdTeW5jaW5nIHdpdGggJyArIHZpc2l0c0RCICsgJyBkYicpXHJcbiAgICB9XHJcblxyXG4gICAgc3Vic2NyaWJlKGhhbmRsZVVwZGF0ZSkge1xyXG4gICAgICAgIHRoaXMuc3luY1Rva2VuID0gZGIuY2hhbmdlcyh7XHJcbiAgICAgICAgICAgIHNpbmNlOiAnbm93JyxcclxuICAgICAgICAgICAgbGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCAoY2hhbmdlKSA9PiB7IGhhbmRsZVVwZGF0ZShjaGFuZ2UpIH0pXHJcbiAgICAgICAgICAgIC5vbignY29tcGxldGUnLCAoaW5mbykgPT4geyBjb25zb2xlLmxvZygnU3Vic2NyaXB0aW9uIGVuZGVkJywgaW5mbykgfSlcclxuICAgICAgICAgICAgLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHsgY29uc29sZS5sb2coJ1N1YnNjcmlwdGlvbiBlcnJvcicsIGVycikgfSlcclxuICAgIH1cclxuXHJcbiAgICB1bnN1YnNjcmliZSgpIHtcclxuICAgICAgICB0aGlzLnN5bmNUb2tlbi5jYW5jZWwoKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdTdG9wcGVkIHN5bmNpbmcgd2l0aCAnICsgdmlzaXRzREIgKyAnIGRiJylcclxuICAgIH1cclxufVxyXG4iXX0=