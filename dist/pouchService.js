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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wb3VjaFNlcnZpY2UuanMiXSwibmFtZXMiOlsiUG91Y2hEQiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiZGF0YWJhc2UiLCJyZW1vdGVTZXJ2ZXIiLCJsb2NhbERiIiwiZGIiLCJzeW5jVG9rZW4iLCJ3aWxsU3luYyIsInJlbW90ZURiIiwiZG9jIiwiaWQiLCJfaWQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJyZXNvbHZlIiwicmVqZWN0IiwiYWxsRG9jcyIsImluY2x1ZGVfZG9jcyIsImF0dGFjaG1lbnRzIiwidGhlbiIsImRvY3MiLCJyb3dzIiwiY2F0Y2giLCJlcnIiLCJiaW5kIiwiZGV0YWlscyIsInBheWxvYWQiLCJtYWtlRG9jIiwiY29uc29sZSIsImxvZyIsInB1dCIsInJlc3VsdCIsImdldCIsInJlbW92ZSIsImhhbmRsZVVwZGF0ZSIsImNoYW5nZXMiLCJzaW5jZSIsImxpdmUiLCJvbiIsImNoYW5nZSIsImluZm8iLCJjYW5jZWwiLCJzeW5jIiwicmV0cnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsVUFBVUMsUUFBUSxTQUFSLENBQWhCOztBQUVBQyxPQUFPQyxPQUFQO0FBRUksMEJBQVlDLFFBQVosRUFBc0JDLFlBQXRCLEVBQW9DO0FBQUE7O0FBQ2hDLGFBQUtDLE9BQUwsR0FBZUYsUUFBZjtBQUNBLGFBQUtHLEVBQUwsR0FBVSxJQUFJUCxPQUFKLENBQVksS0FBS00sT0FBakIsQ0FBVjtBQUNBLGFBQUtFLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxhQUFLQyxRQUFMLEdBQWlCSixZQUFELEdBQWlCLElBQWpCLEdBQXdCLEtBQXhDO0FBQ0EsYUFBS0ssUUFBTCxHQUFpQixLQUFLRCxRQUFOLEdBQWtCSixlQUFlLEdBQWYsR0FBcUJELFFBQXZDLEdBQWtELElBQWxFO0FBQ0g7O0FBUkw7QUFBQTtBQUFBLGdDQVVZTyxHQVZaLEVBVWlCO0FBQ1QsZ0JBQU1DLEtBQU1ELElBQUlFLEdB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b3VjaGRiJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUG91Y2hTZXJ2aWNlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhYmFzZSwgcmVtb3RlU2VydmVyKSB7XHJcbiAgICAgICAgdGhpcy5sb2NhbERiID0gZGF0YWJhc2VcclxuICAgICAgICB0aGlzLmRiID0gbmV3IFBvdWNoREIodGhpcy5sb2NhbERiKVxyXG4gICAgICAgIHRoaXMuc3luY1Rva2VuID0ge31cclxuICAgICAgICB0aGlzLndpbGxTeW5jID0gKHJlbW90ZVNlcnZlcikgPyB0cnVlIDogZmFsc2VcclxuICAgICAgICB0aGlzLnJlbW90ZURiID0gKHRoaXMud2lsbFN5bmMpID8gcmVtb3RlU2VydmVyICsgJy8nICsgZGF0YWJhc2UgOiBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgbWFrZURvYyhkb2MpIHtcclxuICAgICAgICBjb25zdCBpZCA9IChkb2MuX2lkICYmIChkb2MuX2lkICE9PSBcIlwiKSkgPyBkb2MuX2lkIDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGRvYywgeyBfaWQ6IGlkIH0pXHJcbiAgICB9XHJcblxyXG4gICAgZmV0Y2hBbGwoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kYi5hbGxEb2NzKHtcclxuICAgICAgICAgICAgICAgIGluY2x1ZGVfZG9jczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGF0dGFjaG1lbnRzOiB0cnVlXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigoZG9jcykgPT4geyByZXNvbHZlKGRvY3Mucm93cykgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSkuYmluZCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIGFkZChkZXRhaWxzKSB7XHJcbiAgICAgICAgbGV0IHBheWxvYWQgPSB0aGlzLm1ha2VEb2MoZGV0YWlscylcclxuICAgICAgICBjb25zb2xlLmxvZygnQWJvdXQgdG8gYWRkJywgcGF5bG9hZCkgICAgICAgICAgICAgICAgLy9cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRiLnB1dChwYXlsb2FkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4geyByZXNvbHZlKHJlc3VsdCkgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSkuYmluZCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShkZXRhaWxzKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Fib3V0IHRvIENoYW5nZScsIGRldGFpbHMpICAgICAgICAgICAgLy9cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWRldGFpbHMuX2lkKSB7IHJlamVjdCh7IGVycjogJ05vIGlkIHByb3ZpZGVkIC0gY2Fubm90IGNvbXBsZXRlIHVwZGF0ZScgfSl9XHJcbiAgICAgICAgICAgIHRoaXMuZGIuZ2V0KGRldGFpbHMuX2lkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRvYykgPT4geyByZXR1cm4gdGhpcy5kYi5wdXQodGhpcy5tYWtlRG9jKGRldGFpbHMpKSB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4geyByZXNvbHZlKHJlc3VsdCkgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSkuYmluZCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZShpZCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGIuZ2V0KGlkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRvYykgPT4geyByZXR1cm4gdGhpcy5kYi5yZW1vdmUoZG9jKSB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4geyByZXNvbHZlKHJlc3VsdCkgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSkuYmluZCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIHN1YnNjcmliZShoYW5kbGVVcGRhdGUpIHtcclxuICAgICAgICB0aGlzLnN5bmNUb2tlbiA9IHRoaXMuZGIuY2hhbmdlcyh7XHJcbiAgICAgICAgICAgIHNpbmNlOiAnbm93JyxcclxuICAgICAgICAgICAgbGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCAoY2hhbmdlKSA9PiB7IGhhbmRsZVVwZGF0ZShjaGFuZ2UpIH0pXHJcbiAgICAgICAgICAgIC5vbignY29tcGxldGUnLCAoaW5mbykgPT4geyBjb25zb2xlLmxvZygnU3Vic2NyaXB0aW9uIGVuZGVkJywgaW5mbykgfSlcclxuICAgICAgICAgICAgLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHsgY29uc29sZS5sb2coJ1N1YnNjcmlwdGlvbiBlcnJvcicsIGVycikgfSlcclxuICAgICAgICBjb25zb2xlLmxvZygnU3Vic2NyaWJlZCB0byAnICsgdGhpcy5sb2NhbERiKVxyXG4gICAgfVxyXG5cclxuICAgIHVuc3Vic2NyaWJlKCkge1xyXG4gICAgICAgIHRoaXMuc3luY1Rva2VuLmNhbmNlbCgpXHJcbiAgICB9XHJcblxyXG4gICAgc3luYygpIHtcclxuICAgICAgICBpZiAodGhpcy53aWxsU3luYykge1xyXG4gICAgICAgICAgICB0aGlzLmRiLnN5bmModGhpcy5yZW1vdGVEYiwgeyBsaXZlOiB0cnVlLCByZXRyeTogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgLm9uKCdlcnJvcicsIGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSkpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU3luY2luZyB3aXRoICcgKyB0aGlzLnJlbW90ZURiKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=