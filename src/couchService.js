const config = require('config');
const cradle = require('cradle')
const fetch = require('node-fetch');
import { hexEncode, hexDecode } from './hexEncoder'

module.exports = class CouchService {

    constructor(dbName) {
        this.setConfig(dbName)
        this.initialise(dbName)
    }

    setConfig(dbName) {
        this.databaseName = dbName
        this.user = config.get('couchdb.user')
        this.pass = config.get('couchdb.password')
        this.remoteServer = config.get('couchdb.remoteServer')
        this.port = config.get('couchdb.port')
        this.adminPort = config.get('couchdb.adminPort')
        this.userDbView = `http://${this.user}:${this.pass}@${this.remoteServer}:${this.adminPort}/_dbs/_design/userDbList/_view/userDbView`
    }

    initialise(db) {
        cradle.setup({
            host: this.remoteServer,
            cache: true,
            raw: false,
            forceSave: true
        })
        this.c = new (cradle.Connection)
        this.database = this.c.database(db)
    }
    
    getUserDatabaseList(handleResponse) {
        console.log(this.userDbView)
        return new Promise((resolve, reject) => {
            fetch(this.userDbView, { method: 'get' })
                .then(function (res) { return res.json() })
                .then(function (doc) { resolve(doc.rows.map(d => d.id)) })
                .catch(function (err) { reject(err) });
        })
    }

    // add() {}

    // remove() {}

    subscribe(changeHandler) {
        let feed = this.database.changes({
            since: 0,
            live: true,
            include_docs: true
        });
        feed.on('change', (change) => {
            changeHandler(change, this.databaseName);
        });
    }
    
}