const config = require('config')
const EventEmitter = require('events')
const curl = require('curlrequest')
const request = require('request')
import { hexEncode, hexDecode } from './hexEncoder'

module.exports = class CouchService {

    constructor(dbName) {
        this.setConfig(dbName)
        this.changes = new EventEmitter()
    }

    setConfig(dbName) {
        this.databaseName = dbName
        this.user = config.get('couchdb.user')
        this.pass = config.get('couchdb.password')
        this.remoteServer = config.get('couchdb.remoteServer')
        this.port = config.get('couchdb.port')
        this.adminPort = config.get('couchdb.adminPort')
        this.remoteUrl = `http://${this.user}:${this.pass}@${this.remoteServer}:${this.port}/`
        this.adminUrl = `http://${this.user}:${this.pass}@${this.remoteServer}:${this.adminPort}/`
        this.pollingInterval = parseInt(config.get('couchdb.pollingInterval'), 10) * 1000
        this.seq = 0
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

    fetch(id) {
        const url = this.remoteUrl + this.databaseName + '/' + id
        return new Promise((resolve, reject) => {
            curl.request(url, (err, data) => {
                if (err) { reject(err) }
                resolve(JSON.parse(data))
            })
        })
    }

    add(doc) {
        if (!doc._id) { doc._id = new Date().toISOString() }
        doc._rev = undefined
        const options = {
            url: this.remoteUrl + this.databaseName + '/' + doc._id,
            method: 'PUT',
            data: JSON.stringify(doc),
            headers: { 'content-type': 'application/json' }
        }
        return new Promise((resolve, reject) => {
            curl.request(options, (err, data) => {
                if (err) { reject(err) }
                resolve(JSON.parse(data))
            })
        })
    }

    remove(id) {
        const options = {
            url: this.remoteUrl + this.databaseName + '/' + id,
            method: 'DELETE'
        }
        return new Promise((resolve, reject) => {
            curl.request(options, (err, data) => {
                if (err) { reject(err) }
                resolve(JSON.parse(data))
            })
        })
    }

    subscribe(handleResponse, handleError) {
        console.log('Subscribed to', this.databaseName)
        const pollRequest = () => {
            let url = this.remoteUrl + this.databaseName + '/_changes?include_docs=true&since=' + this.seq
            curl.request(url, (err, data) => {
                if (err) { handleError('Problem with changes feed on', this.databaseName, ':', err) }
                let d = JSON.parse(data)
                this.seq = d.last_seq
                handleResponse(d.results.map(r => r.doc))
            })
        }
        this.poll = setInterval(pollRequest, this.pollingInterval)
    }   

    unsubscribe() {
        clearInterval(this.poll)
        console.log('Unsubscribed from', this.databaseName)
    }

}