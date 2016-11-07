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
            });
        }
    }, {
        key: 'fetch',
        value: function fetch(id) {
            var _this2 = this;

            return new _promise2.default(function (resolve, reject) {
                _this2.db.get(id).then(function (doc) {
                    return doc;
                }).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'add',
        value: function add(details) {
            var _this3 = this;

            var payload = this.makeDoc(details);
            return new _promise2.default(function (resolve, reject) {
                _this3.db.put(payload).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'update',
        value: function update(details) {
            var _this4 = this;

            return new _promise2.default(function (resolve, reject) {
                if (!details._id) {
                    reject({ err: 'No id provided - cannot complete update' });
                }
                _this4.db.get(details._id).then(function (doc) {
                    return _this4.db.put(details);
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
            var _this5 = this;

            return new _promise2.default(function (resolve, reject) {
                _this5.db.get(id).then(function (doc) {
                    return _this5.db.remove(doc);
                }).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });
            });
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
            console.log('Subscribed to ' + this.localDb);
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            this.syncToken.cancel();
        }
    }, {
        key: 'sync',
        value: function sync() {
            if (this.willSync) {
                this.db.sync(this.remoteDb, { live: true, retry: true }).on('error', console.log.bind(console));
                console.log('Syncing with ' + this.remoteDb);
            }
        }
    }]);
    return PouchService;
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wb3VjaFNlcnZpY2UuanMiXSwibmFtZXMiOlsiUG91Y2hEQiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiZGF0YWJhc2UiLCJyZW1vdGVTZXJ2ZXIiLCJsb2NhbERiIiwiZGIiLCJzeW5jVG9rZW4iLCJ3aWxsU3luYyIsInJlbW90ZURiIiwiZG9jIiwiaWQiLCJfaWQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJyZXNvbHZlIiwicmVqZWN0IiwiYWxsRG9jcyIsImluY2x1ZGVfZG9jcyIsImF0dGFjaG1lbnRzIiwidGhlbiIsImRvY3MiLCJyb3dzIiwiY2F0Y2giLCJlcnIiLCJnZXQiLCJyZXN1bHQiLCJkZXRhaWxzIiwicGF5bG9hZCIsIm1ha2VEb2MiLCJwdXQiLCJyZW1vdmUiLCJoYW5kbGVVcGRhdGUiLCJjaGFuZ2VzIiwic2luY2UiLCJsaXZlIiwib24iLCJjaGFuZ2UiLCJpbmZvIiwiY29uc29sZSIsImxvZyIsImNhbmNlbCIsInN5bmMiLCJyZXRyeSIsImJpbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsVUFBVUMsUUFBUSxTQUFSLENBQWhCOztBQUVBQyxPQUFPQyxPQUFQO0FBRUksMEJBQVlDLFFBQVosRUFBc0JDLFlBQXRCLEVBQW9DO0FBQUE7O0FBQ2hDLGFBQUtDLE9BQUwsR0FBZUYsUUFBZjtBQUNBLGFBQUtHLEVBQUwsR0FBVSxJQUFJUCxPQUFKLENBQVksS0FBS00sT0FBakIsQ0FBVjtBQUNBLGFBQUtFLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxhQUFLQyxRQUFMLEdBQWlCSixZQUFELEdBQWlCLElBQWpCLEdBQXdCLEtBQXhDO0FBQ0EsYUFBS0ssUUFBTCxHQUFpQixLQUFLRCxRQUFOLEdBQWtCSixlQUFlLEdBQWYsR0FBcUJELFFBQXZDLEdBQWtELElBQWxFO0FBQ0g7O0FBUkw7QUFBQTtBQUFBLGdDQVVZTyxHQVZaLEVBVWlCO0FBQ1QsZ0JBQU1DLEtBQU1ELElBQUlFLEdB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QkFBa0IsS0FBSy9CLFFBQW5DO0FBQ0g7QUFDSjtBQXJGTDtBQUFBO0FBQUEiLCJmaWxlIjoicG91Y2hTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUG91Y2hEQiA9IHJlcXVpcmUoJ3BvdWNoZGInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQb3VjaFNlcnZpY2Uge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGFiYXNlLCByZW1vdGVTZXJ2ZXIpIHtcclxuICAgICAgICB0aGlzLmxvY2FsRGIgPSBkYXRhYmFzZVxyXG4gICAgICAgIHRoaXMuZGIgPSBuZXcgUG91Y2hEQih0aGlzLmxvY2FsRGIpXHJcbiAgICAgICAgdGhpcy5zeW5jVG9rZW4gPSB7fVxyXG4gICAgICAgIHRoaXMud2lsbFN5bmMgPSAocmVtb3RlU2VydmVyKSA/IHRydWUgOiBmYWxzZVxyXG4gICAgICAgIHRoaXMucmVtb3RlRGIgPSAodGhpcy53aWxsU3luYykgPyByZW1vdGVTZXJ2ZXIgKyAnLycgKyBkYXRhYmFzZSA6IG51bGxcclxuICAgIH1cclxuXHJcbiAgICBtYWtlRG9jKGRvYykge1xyXG4gICAgICAgIGNvbnN0IGlkID0gKGRvYy5faWQgJiYgKGRvYy5faWQgIT09IFwiXCIpKSA/IGRvYy5faWQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZG9jLCB7IF9pZDogaWQgfSlcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaEFsbCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRiLmFsbERvY3Moe1xyXG4gICAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXR0YWNobWVudHM6IHRydWVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChkb2NzKSA9PiB7IHJlc29sdmUoZG9jcy5yb3dzKSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGZldGNoKGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kYi5nZXQoaWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoZG9jKSA9PiB7IHJldHVybiBkb2MgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHsgcmVzb2x2ZShyZXN1bHQpIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4geyByZWplY3QoZXJyKSB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgYWRkKGRldGFpbHMpIHtcclxuICAgICAgICBsZXQgcGF5bG9hZCA9IHRoaXMubWFrZURvYyhkZXRhaWxzKVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGIucHV0KHBheWxvYWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7IHJlc29sdmUocmVzdWx0KSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShkZXRhaWxzKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFkZXRhaWxzLl9pZCkgeyByZWplY3QoeyBlcnI6ICdObyBpZCBwcm92aWRlZCAtIGNhbm5vdCBjb21wbGV0ZSB1cGRhdGUnIH0pfVxyXG4gICAgICAgICAgICB0aGlzLmRiLmdldChkZXRhaWxzLl9pZClcclxuICAgICAgICAgICAgICAgIC50aGVuKChkb2MpID0+IHsgcmV0dXJuIHRoaXMuZGIucHV0KGRldGFpbHMpIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7IHJlc29sdmUocmVzdWx0KSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZShpZCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGIuZ2V0KGlkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRvYykgPT4geyByZXR1cm4gdGhpcy5kYi5yZW1vdmUoZG9jKSB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4geyByZXNvbHZlKHJlc3VsdCkgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBzdWJzY3JpYmUoaGFuZGxlVXBkYXRlKSB7XHJcbiAgICAgICAgdGhpcy5zeW5jVG9rZW4gPSB0aGlzLmRiLmNoYW5nZXMoe1xyXG4gICAgICAgICAgICBzaW5jZTogJ25vdycsXHJcbiAgICAgICAgICAgIGxpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGluY2x1ZGVfZG9jczogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbignY2hhbmdlJywgKGNoYW5nZSkgPT4geyBoYW5kbGVVcGRhdGUoY2hhbmdlKSB9KVxyXG4gICAgICAgICAgICAub24oJ2NvbXBsZXRlJywgKGluZm8pID0+IHsgY29uc29sZS5sb2coJ1N1YnNjcmlwdGlvbiBlbmRlZCcsIGluZm8pIH0pXHJcbiAgICAgICAgICAgIC5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7IGNvbnNvbGUubG9nKCdTdWJzY3JpcHRpb24gZXJyb3InLCBlcnIpIH0pXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1N1YnNjcmliZWQgdG8gJyArIHRoaXMubG9jYWxEYilcclxuICAgIH1cclxuXHJcbiAgICB1bnN1YnNjcmliZSgpIHtcclxuICAgICAgICB0aGlzLnN5bmNUb2tlbi5jYW5jZWwoKVxyXG4gICAgfVxyXG5cclxuICAgIHN5bmMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2lsbFN5bmMpIHtcclxuICAgICAgICAgICAgdGhpcy5kYi5zeW5jKHRoaXMucmVtb3RlRGIsIHsgbGl2ZTogdHJ1ZSwgcmV0cnk6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgIC5vbignZXJyb3InLCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1N5bmNpbmcgd2l0aCAnICsgdGhpcy5yZW1vdGVEYilcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19