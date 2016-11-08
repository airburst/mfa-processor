const config = require('config');
//const request = require('request');
var curl = require('curlrequest');
const fetch = require('node-fetch');
import { hexEncode, hexDecode } from './hexEncoder'

module.exports = class CouchService {

    constructor(dbName) {
        this.setConfig(dbName)
        // this.initialise(dbName)
    }

    setConfig(dbName) {
        this.databaseName = dbName
        this.user = config.get('couchdb.user')
        this.pass = config.get('couchdb.password')
        this.remoteServer = config.get('couchdb.remoteServer')
        this.port = config.get('couchdb.port')
        this.adminPort = config.get('couchdb.adminPort')
        this.adminUrl = `http://${this.user}:${this.pass}@${this.remoteServer}:${this.adminPort}/`
    }

    initialise(db) {
        // this.c = new (cradle.Connection)
        // this.database = this.c.database(db)
    }

    getUserDatabaseList(handleResponse) {
        const url = this.adminUrl + '_dbs/_all_docs'
        return new Promise((resolve, reject) => {
            curl.request(url, (err, data) => {
                if (err) { reject(err) }
                resolve(JSON.parse(data).rows
                    .map(d => d.id)
                    .filter(a => a.indexOf('userdb') > -1)
                )
            })
        })
    }

    // add() {}

    // remove() {}

    // subscribe(changeHandler) {
    //     let feed = this.database.changes({
    //         since: 0,
    //         live: true,
    //         include_docs: true
    //     });
    //     feed.on('change', (change) => {
    //         changeHandler(change, this.databaseName);
    //     });
    // }

}