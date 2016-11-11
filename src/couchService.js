const config = require('config')
const EventEmitter = require('events')
const curl = require('curlrequest')
const request = require('request')
const buffer = require('buffer').Buffer
import { hexEncode, hexDecode } from './hexEncoder'

const btoa = (str) => {
    return new Buffer(str).toString('base64');
};

const atob = (b64Encoded) => {
    return new Buffer(b64Encoded, 'base64').toString();
}

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
        this.remoteUrl = `${this.user}:${this.pass}@${this.remoteServer}:${this.port}/`
        this.adminUrl = `${this.user}:${this.pass}@${this.remoteServer}:${this.adminPort}/`
        this.pollingInterval = parseInt(config.get('couchdb.pollingInterval'), 10) * 1000
        this.newUserPollingInterval = parseInt(config.get('couchdb.newUserPollingInterval'), 10) * 1000
        this.seq = 0
        this.auth = 'Basic ' + btoa(this.user + ':' + this.pass)
    }

    getUserDatabaseList() {
        const url = this.adminUrl + '_dbs/_all_docs'
        return new Promise((resolve, reject) => {
            curl.request({
                url: url,
                headers: { authorization: this.auth }
            },
                (err, data) => {
                    if (err) { reject(err) }
                    if (!data || (data === "")) { reject(data) }
                    resolve(JSON.parse(data).rows
                        .map(d => d.id)
                        .filter(a => a.indexOf('userdb') > -1)
                    )
                })
        })
    }

    fetch(id, handleSuccess, handleError) {
        const url = this.remoteUrl + this.databaseName + '/' + id
        curl.request(url, (err, data) => {
            if (err) { handleError(err) }
            handleSuccess(JSON.parse(data))
        })
    }

    fetchAll(handleSuccess, handleError) {
        const url = this.remoteUrl + this.databaseName + '/_all_docs'
        curl.request(url, (err, data) => {
            if (err) { handleError(err) }
            handleSuccess(JSON.parse(data))
        })
    }

    add(doc, handleSuccess, handleError) {
        if (!doc._id) { doc._id = new Date().toISOString() }
        doc._rev = undefined
        const options = {
            url: this.remoteUrl + this.databaseName + '/' + doc._id,
            method: 'PUT',
            data: JSON.stringify(doc),
            headers: { 'content-type': 'application/json' }
        }
        curl.request(options, (err, data) => {
            if (err) { handleError(err) }
            handleSuccess(JSON.parse(data))
        })
    }

    remove(id, handleSuccess, handleError) {
        const fetchSuccess = (doc) => {
            const options = {
                url: this.remoteUrl + this.databaseName + '/' + id,
                method: 'PUT',
                data: this.deleteDoc(doc),
                headers: { 'content-type': 'application/json' }
            }
            curl.request(options, (err, data) => {
                if (err) { handleError(err) }
                handleSuccess(data)
            })
        }
        const fetchError = (err) => { handleError(err) }
        this.fetch(id, fetchSuccess, fetchError)
    }

    deleteDoc(doc) {
        return JSON.stringify({
            _id: (doc._id) ? doc._id : doc.id,
            _rev: (doc._rev) ? doc._rev : doc.rev,
            _deleted: true
        })
    }

    subscribe(handleResponse, handleError, admin) {
        const pollRequest = () => {
            let url = (admin)
                ? this.adminUrl + this.databaseName + '/_changes?since=' + this.seq
                : this.remoteUrl + this.databaseName + '/_changes?since=' + this.seq
            curl.request({
                url: url,
                headers: { authorization: this.auth }
            }, (err, data) => {
                if (err) { handleError('Problem with changes feed on', this.databaseName, ':', err) }
                let d = JSON.parse(data)
                this.seq = d.last_seq
                if (d && d.results) {
                    handleResponse(d.results.map(r => r.doc), this.databaseName)
                } else {
                    handleError(data)
                }
            })
        }
        this.poll = setInterval(pollRequest, this.pollingInterval)
    }

    unsubscribe() {
        clearInterval(this.poll)
    }

    // TODO: refactor subscribe to use this function    
    // getChanges(start, handleResponse, handleError) {
    //     let url = this.remoteUrl + this.databaseName + '/_changes?include_docs=true&since=' + start
    //     curl.request(url, (err, data) => {
    //         if (err) { handleError('Problem with changes feed on', this.databaseName, ':', err) }
    //         let d = JSON.parse(data)
    //         handleResponse(d.results.map(r => r.doc), this.databaseName, d.last_seq)
    //     })
    // }

}