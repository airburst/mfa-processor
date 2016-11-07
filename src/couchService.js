import { hexEncode, hexDecode } from './hexEncoder'
const config = require('config');
const fetch = require('node-fetch');

const user = config.get('couchdb.user');
const pass = config.get('couchdb.password');
const remote = config.get('couchdb.remoteAdmin');

module.exports = {

    getUserDatabaseList: function (handleResponse) {
        let url = `http://${user}:${pass}@${remote}/_dbs/_design/userDbList/_view/userDbView`
        fetch(url, { method: 'get' })
            .then(function (res) { return res.json() })
            .then(function (doc) { handleResponse(doc.rows) })
            .catch(function (err) { console.log('Error listing user databases:', err) });
    }

}