import { hexEncode, hexDecode } from './hexEncoder'
var config = require('config');

var user = config.get('gmail.user');
var pass = config.get('gmail.pass');

module.exports = {

    getUserDbs: function() {
        // GET http://processor:MFAProcessorApp@localhost:5986/_dbs/_design/userDbList/_view/userDbView
    }

}