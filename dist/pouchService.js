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

        this.localDb = database;
        this.db = new PouchDB(this.localDb);
        this.syncToken = {};
        this.willSync = remoteServer ? true : false;
        this.remoteDb = this.willSync ? remoteServer + '/' + database : null;
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
            var _this = this;

            return new _promise2.default(function (resolve, reject) {
                _this.db.allDocs({
                    include_docs: true,
                    attachments: true
                }).then(function (docs) {
                    resolve(docs.rows);
                }).catch(function (err) {
                    reject(err);
                });
            }).bind(this);
        }
    }, {
        key: 'add',
        value: function add(details) {
            var _this2 = this;

            var payload = this.makeDoc(details);
            console.log('About to add', payload); //
            return new _promise2.default(function (resolve, reject) {
                _this2.db.put(payload).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });
            }).bind(this);
        }
    }, {
        key: 'update',
        value: function update(details) {
            var _this3 = this;

            console.log('About to Change', details); //
            return new _promise2.default(function (resolve, reject) {
                if (!details._id) {
                    reject({ err: 'No id provided - cannot complete update' });
                }
                _this3.db.get(details._id).then(function (doc) {
                    return _this3.db.put(_this3.makeDoc(details));
                }).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });
            }).bind(this);
        }
    }, {
        key: 'remove',
        value: function remove(id) {
            var _this4 = this;

            return new _promise2.default(function (resolve, reject) {
                _this4.db.get(id).then(function (doc) {
                    return _this4.db.remove(doc);
                }).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });
            }).bind(this);
        }
    }, {
        key: 'subscribe',
        value: function subscribe(handleUpdate) {
            this.syncToken = this.db.changes({
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
            console.log('Stopped syncing with ' + this.remoteDb + ' db');
        }
    }, {
        key: 'sync',
        value: function sync() {
            if (this.willSync) {
                this.db.sync(this.remoteDb, { live: true, retry: true }).on('error', console.log.bind(console));
                console.log('Syncing with ' + this.remoteDb + ' db');
            }
        }
    }]);
    return PouchService;
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wb3VjaFNlcnZpY2UuanMiXSwibmFtZXMiOlsiUG91Y2hEQiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiZGF0YWJhc2UiLCJyZW1vdGVTZXJ2ZXIiLCJsb2NhbERiIiwiZGIiLCJzeW5jVG9rZW4iLCJ3aWxsU3luYyIsInJlbW90ZURiIiwiZG9jIiwiaWQiLCJfaWQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJyZXNvbHZlIiwicmVqZWN0IiwiYWxsRG9jcyIsImluY2x1ZGVfZG9jcyIsImF0dGFjaG1lbnRzIiwidGhlbiIsImRvY3MiLCJyb3dzIiwiY2F0Y2giLCJlcnIiLCJiaW5kIiwiZGV0YWlscyIsInBheWxvYWQiLCJtYWtlRG9jIiwiY29uc29sZSIsImxvZyIsInB1dCIsInJlc3VsdCIsImdldCIsInJlbW92ZSIsImhhbmRsZVVwZGF0ZSIsImNoYW5nZXMiLCJzaW5jZSIsImxpdmUiLCJvbiIsImNoYW5nZSIsImluZm8iLCJjYW5jZWwiLCJzeW5jIiwicmV0cnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsVUFBVUMsUUFBUSxTQUFSLENBQWhCOztBQUVBQyxPQUFPQyxPQUFQO0FBRUksMEJBQVlDLFFBQVosRUFBc0JDLFlBQXRCLEVBQW9DO0FBQUE7O0FBQ2hDLGFBQUtDLE9BQUwsR0FBZUYsUUFBZjtBQUNBLGFBQUtHLEVBQUwsR0FBVSxJQUFJUCxPQUFKLENBQVksS0FBS00sT0FBakIsQ0FBVjtBQUNBLGFBQUtFLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxhQUFLQyxRQUFMLEdBQWlCSixZQUFELEdBQWlCLElBQWpCLEdBQXdCLEtBQXhDO0FBQ0EsYUFBS0ssUUFBTCxHQUFpQixLQUFLRCxRQUFOLEdBQWtCSixlQUFlLEdBQWYsR0FBcUJELFFBQXZDLEdBQWtELElBQWxFO0FBQ0g7O0FBUkw7QUFBQTtBQUFBLGdDQVVZTyxHQVZaLEVBVWlCO0FBQ1QsZ0JBQU1DLEtBQU1ELElBQUlFLEdB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dCBQb3VjaERCID0gcmVxdWlyZSgncG91Y2hkYicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBvdWNoU2VydmljZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YWJhc2UsIHJlbW90ZVNlcnZlcikge1xyXG4gICAgICAgIHRoaXMubG9jYWxEYiA9IGRhdGFiYXNlXHJcbiAgICAgICAgdGhpcy5kYiA9IG5ldyBQb3VjaERCKHRoaXMubG9jYWxEYilcclxuICAgICAgICB0aGlzLnN5bmNUb2tlbiA9IHt9XHJcbiAgICAgICAgdGhpcy53aWxsU3luYyA9IChyZW1vdGVTZXJ2ZXIpID8gdHJ1ZSA6IGZhbHNlXHJcbiAgICAgICAgdGhpcy5yZW1vdGVEYiA9ICh0aGlzLndpbGxTeW5jKSA/IHJlbW90ZVNlcnZlciArICcvJyArIGRhdGFiYXNlIDogbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIG1ha2VEb2MoZG9jKSB7XHJcbiAgICAgICAgY29uc3QgaWQgPSAoZG9jLl9pZCAmJiAoZG9jLl9pZCAhPT0gXCJcIikpID8gZG9jLl9pZCA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKFxyXG4gICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgZG9jLFxyXG4gICAgICAgICAgICB7IF9pZDogaWQgfVxyXG4gICAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaEFsbCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRiLmFsbERvY3Moe1xyXG4gICAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXR0YWNobWVudHM6IHRydWVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChkb2NzKSA9PiB7IHJlc29sdmUoZG9jcy5yb3dzKSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KS5iaW5kKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgYWRkKGRldGFpbHMpIHtcclxuICAgICAgICBsZXQgcGF5bG9hZCA9IHRoaXMubWFrZURvYyhkZXRhaWxzKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdBYm91dCB0byBhZGQnLCBwYXlsb2FkKSAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGIucHV0KHBheWxvYWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7IHJlc29sdmUocmVzdWx0KSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KS5iaW5kKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGRldGFpbHMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnQWJvdXQgdG8gQ2hhbmdlJywgZGV0YWlscykgICAgICAgICAgICAvL1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghZGV0YWlscy5faWQpIHsgcmVqZWN0KHsgZXJyOiAnTm8gaWQgcHJvdmlkZWQgLSBjYW5ub3QgY29tcGxldGUgdXBkYXRlJyB9KX1cclxuICAgICAgICAgICAgdGhpcy5kYi5nZXQoZGV0YWlscy5faWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoZG9jKSA9PiB7IHJldHVybiB0aGlzLmRiLnB1dCh0aGlzLm1ha2VEb2MoZGV0YWlscykpIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7IHJlc29sdmUocmVzdWx0KSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KS5iaW5kKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kYi5nZXQoaWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoZG9jKSA9PiB7IHJldHVybiB0aGlzLmRiLnJlbW92ZShkb2MpIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7IHJlc29sdmUocmVzdWx0KSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KS5iaW5kKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgc3Vic2NyaWJlKGhhbmRsZVVwZGF0ZSkge1xyXG4gICAgICAgIHRoaXMuc3luY1Rva2VuID0gdGhpcy5kYi5jaGFuZ2VzKHtcclxuICAgICAgICAgICAgc2luY2U6ICdub3cnLFxyXG4gICAgICAgICAgICBsaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICBpbmNsdWRlX2RvY3M6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NoYW5nZScsIChjaGFuZ2UpID0+IHsgaGFuZGxlVXBkYXRlKGNoYW5nZSkgfSlcclxuICAgICAgICAgICAgLm9uKCdjb21wbGV0ZScsIChpbmZvKSA9PiB7IGNvbnNvbGUubG9nKCdTdWJzY3JpcHRpb24gZW5kZWQnLCBpbmZvKSB9KVxyXG4gICAgICAgICAgICAub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycikgeyBjb25zb2xlLmxvZygnU3Vic2NyaXB0aW9uIGVycm9yJywgZXJyKSB9KVxyXG4gICAgfVxyXG5cclxuICAgIHVuc3Vic2NyaWJlKCkge1xyXG4gICAgICAgIHRoaXMuc3luY1Rva2VuLmNhbmNlbCgpXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1N0b3BwZWQgc3luY2luZyB3aXRoICcgKyB0aGlzLnJlbW90ZURiICsgJyBkYicpXHJcbiAgICB9XHJcblxyXG4gICAgc3luYygpIHtcclxuICAgICAgICBpZiAodGhpcy53aWxsU3luYykge1xyXG4gICAgICAgICAgICB0aGlzLmRiLnN5bmModGhpcy5yZW1vdGVEYiwgeyBsaXZlOiB0cnVlLCByZXRyeTogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgLm9uKCdlcnJvcicsIGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSkpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU3luY2luZyB3aXRoICcgKyB0aGlzLnJlbW90ZURiICsgJyBkYicpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==