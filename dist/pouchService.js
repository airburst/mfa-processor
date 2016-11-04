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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wb3VjaFNlcnZpY2UuanMiXSwibmFtZXMiOlsiUG91Y2hEQiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiZGF0YWJhc2UiLCJyZW1vdGVTZXJ2ZXIiLCJsb2NhbERiIiwiZGIiLCJzeW5jVG9rZW4iLCJ3aWxsU3luYyIsInJlbW90ZURiIiwiZG9jIiwiaWQiLCJfaWQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJyZXNvbHZlIiwicmVqZWN0IiwiYWxsRG9jcyIsImluY2x1ZGVfZG9jcyIsImF0dGFjaG1lbnRzIiwidGhlbiIsImRvY3MiLCJyb3dzIiwiY2F0Y2giLCJlcnIiLCJiaW5kIiwiZGV0YWlscyIsInBheWxvYWQiLCJtYWtlRG9jIiwicHV0IiwicmVzdWx0IiwiZ2V0IiwicmVtb3ZlIiwiaGFuZGxlVXBkYXRlIiwiY2hhbmdlcyIsInNpbmNlIiwibGl2ZSIsIm9uIiwiY2hhbmdlIiwiaW5mbyIsImNvbnNvbGUiLCJsb2ciLCJjYW5jZWwiLCJzeW5jIiwicmV0cnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsVUFBVUMsUUFBUSxTQUFSLENBQWhCOztBQUVBQyxPQUFPQyxPQUFQO0FBRUksMEJBQVlDLFFBQVosRUFBc0JDLFlBQXRCLEVBQW9DO0FBQUE7O0FBQ2hDLGFBQUtDLE9BQUwsR0FBZUYsUUFBZjtBQUNBLGFBQUtHLEVBQUwsR0FBVSxJQUFJUCxPQUFKLENBQVksS0FBS00sT0FBakIsQ0FBVjtBQUNBLGFBQUtFLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxhQUFLQyxRQUFMLEdBQWlCSixZQUFELEdBQWlCLElBQWpCLEdBQXdCLEtBQXhDO0FBQ0EsYUFBS0ssUUFBTCxHQUFpQixLQUFLRCxRQUFOLEdBQWtCSixlQUFlLEdBQWYsR0FBcUJELFFBQXZDLEdBQWtELElBQWxFO0FBQ0g7O0FBUkw7QUFBQTtBQUFBLGdDQVVZTyxHQVZaLEVBVWlCO0FBQ1QsZ0JBQU1DLEtBQU1ELElBQUlFLEdB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dUJBQU8sS0FEc0I7QUFFN0JDLHNCQUFNLElBRnVCO0FBRzdCbEIsOEJBQWM7QUFIZSxhQUFoQixFQUtabUIsRUFMWSxDQUtULFFBTFMsRUFLQyxVQUFDQyxNQUFELEVBQVk7QUFBRUwsNkJBQWFLLE1BQWI7QUFBc0IsYUFMckMsRUFNWkQsRUFOWSxDQU1ULFVBTlMsRUFNRyxVQUFDRSxJQUFELEVBQVU7QUFBRUMsd0JBQVFDLEdBQVIsQ0FBWSxvQkFBWixFQUFrQ0YsSUFBbEM7QUFBeUMsYUFOeEQsRUFPWkYsRUFQWSxDQU9ULE9BUFMsRUFPQSxVQUFVYixHQUFWLEVBQWU7QUFBRWdCLHdCQUFRQyxHQUFSLENBQVksb0JBQVosRUFBa0NqQixHQUFsQztBQUF3QyxhQVB6RCxDQUFqQjtBQVFBZ0Isb0JBQVFDLEdBQVIsQ0FBWSxtQkFBbUIsS0FBS3BDLE9BQXBDO0FBQ0g7QUFoRUw7QUFBQTtBQUFBLHNDQWtFa0I7QUFDVixpQkFBS0UsU0FBTCxDQUFlbUMsTUFBZjtBQUNIO0FBcEVMO0FBQUE7QUFBQSwrQkFzRVc7QUFDSCxnQkFBSSxLQUFLbEMsUUFBVCxFQUFtQjtBQUNmLHFCQUFLRixFQUFMLENBQVFxQyxJQUFSLENBQWEsS0FBS2xDLFFBQWxCLEVBQTRCLEVBQUUyQixNQUFNLElBQVIsRUFBY1EsT0FBTyxJQUFyQixFQUE1QixFQUNLUCxFQURMLENBQ1EsT0FEUixFQUNpQkcsUUFBUUMsR0FBUixDQUFZaEIsSUFBWixDQUFpQmUsT0FBakIsQ0FEakI7QUFFQUEsd0JBQVFDLEdBQVIsQ0FBWSxrQkFBa0IsS0FBS2hDLFFBQW5DO0FBQ0g7QUFDSjtBQTVFTDtBQUFBO0FBQUEiLCJmaWxlIjoicG91Y2hTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUG91Y2hEQiA9IHJlcXVpcmUoJ3BvdWNoZGInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQb3VjaFNlcnZpY2Uge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGFiYXNlLCByZW1vdGVTZXJ2ZXIpIHtcclxuICAgICAgICB0aGlzLmxvY2FsRGIgPSBkYXRhYmFzZVxyXG4gICAgICAgIHRoaXMuZGIgPSBuZXcgUG91Y2hEQih0aGlzLmxvY2FsRGIpXHJcbiAgICAgICAgdGhpcy5zeW5jVG9rZW4gPSB7fVxyXG4gICAgICAgIHRoaXMud2lsbFN5bmMgPSAocmVtb3RlU2VydmVyKSA/IHRydWUgOiBmYWxzZVxyXG4gICAgICAgIHRoaXMucmVtb3RlRGIgPSAodGhpcy53aWxsU3luYykgPyByZW1vdGVTZXJ2ZXIgKyAnLycgKyBkYXRhYmFzZSA6IG51bGxcclxuICAgIH1cclxuXHJcbiAgICBtYWtlRG9jKGRvYykge1xyXG4gICAgICAgIGNvbnN0IGlkID0gKGRvYy5faWQgJiYgKGRvYy5faWQgIT09IFwiXCIpKSA/IGRvYy5faWQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZG9jLCB7IF9pZDogaWQgfSlcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaEFsbCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRiLmFsbERvY3Moe1xyXG4gICAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXR0YWNobWVudHM6IHRydWVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChkb2NzKSA9PiB7IHJlc29sdmUoZG9jcy5yb3dzKSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KS5iaW5kKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgYWRkKGRldGFpbHMpIHtcclxuICAgICAgICBsZXQgcGF5bG9hZCA9IHRoaXMubWFrZURvYyhkZXRhaWxzKVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGIucHV0KHBheWxvYWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7IHJlc29sdmUocmVzdWx0KSB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHsgcmVqZWN0KGVycikgfSlcclxuICAgICAgICB9KS5iaW5kKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGRldGFpbHMpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWRldGFpbHMuX2lkKSB7IHJlamVjdCh7IGVycjogJ05vIGlkIHByb3ZpZGVkIC0gY2Fubm90IGNvbXBsZXRlIHVwZGF0ZScgfSl9XHJcbiAgICAgICAgICAgIHRoaXMuZGIuZ2V0KGRldGFpbHMuX2lkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRvYykgPT4geyByZXR1cm4gdGhpcy5kYi5wdXQodGhpcy5tYWtlRG9jKGRldGFpbHMpKSB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4geyByZXNvbHZlKHJlc3VsdCkgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSkuYmluZCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZShpZCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGIuZ2V0KGlkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRvYykgPT4geyByZXR1cm4gdGhpcy5kYi5yZW1vdmUoZG9jKSB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4geyByZXNvbHZlKHJlc3VsdCkgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHJlamVjdChlcnIpIH0pXHJcbiAgICAgICAgfSkuYmluZCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIHN1YnNjcmliZShoYW5kbGVVcGRhdGUpIHtcclxuICAgICAgICB0aGlzLnN5bmNUb2tlbiA9IHRoaXMuZGIuY2hhbmdlcyh7XHJcbiAgICAgICAgICAgIHNpbmNlOiAnbm93JyxcclxuICAgICAgICAgICAgbGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCAoY2hhbmdlKSA9PiB7IGhhbmRsZVVwZGF0ZShjaGFuZ2UpIH0pXHJcbiAgICAgICAgICAgIC5vbignY29tcGxldGUnLCAoaW5mbykgPT4geyBjb25zb2xlLmxvZygnU3Vic2NyaXB0aW9uIGVuZGVkJywgaW5mbykgfSlcclxuICAgICAgICAgICAgLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHsgY29uc29sZS5sb2coJ1N1YnNjcmlwdGlvbiBlcnJvcicsIGVycikgfSlcclxuICAgICAgICBjb25zb2xlLmxvZygnU3Vic2NyaWJlZCB0byAnICsgdGhpcy5sb2NhbERiKVxyXG4gICAgfVxyXG5cclxuICAgIHVuc3Vic2NyaWJlKCkge1xyXG4gICAgICAgIHRoaXMuc3luY1Rva2VuLmNhbmNlbCgpXHJcbiAgICB9XHJcblxyXG4gICAgc3luYygpIHtcclxuICAgICAgICBpZiAodGhpcy53aWxsU3luYykge1xyXG4gICAgICAgICAgICB0aGlzLmRiLnN5bmModGhpcy5yZW1vdGVEYiwgeyBsaXZlOiB0cnVlLCByZXRyeTogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgLm9uKCdlcnJvcicsIGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSkpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU3luY2luZyB3aXRoICcgKyB0aGlzLnJlbW90ZURiKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=