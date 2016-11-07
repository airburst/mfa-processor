import { hexEncode, hexDecode } from './hexEncoder'
var config = require('config');

var user = config.get('couchdb.user');
var pass = config.get('couchdb.password');
var remote = config.get('couchdb.remoteAdmin');

module.exports = {

    getUserDbs: function() {
        let url = `http://${user}:${pass}@${remote}/_dbs/_design/userDbList/_view/userDbView`

    }

}