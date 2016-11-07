const PouchDB = require('pouchdb')

module.exports = class PouchService {

    constructor(database, remoteServer) {
        this.localDb = database
        this.db = new PouchDB(this.localDb)
        this.syncToken = {}
        this.willSync = (remoteServer) ? true : false
        this.remoteDb = (this.willSync) ? remoteServer + '/' + database : null
    }

    makeDoc(doc) {
        const id = (doc._id && (doc._id !== "")) ? doc._id : new Date().toISOString()
        return Object.assign({}, doc, { _id: id })
    }

    fetchAll() {
        return new Promise((resolve, reject) => {
            this.db.allDocs({
                include_docs: true,
                attachments: true
            })
                .then((docs) => { resolve(docs.rows) })
                .catch((err) => { reject(err) })
        })
    }

    fetch(id) {
        return new Promise((resolve, reject) => {
            this.db.get(id)
                .then((doc) => { return doc })
                .then((result) => { resolve(result) })
                .catch((err) => { reject(err) })
        })
    }

    add(details) {
        let payload = this.makeDoc(details)
        return new Promise((resolve, reject) => {
            this.db.put(payload)
                .then((result) => { resolve(result) })
                .catch((err) => { reject(err) })
        })
    }

    update(details) {
        return new Promise((resolve, reject) => {
            if (!details._id) { reject({ err: 'No id provided - cannot complete update' })}
            this.db.get(details._id)
                .then((doc) => { return this.db.put(details) })
                .then((result) => { resolve(result) })
                .catch((err) => { reject(err) })
        })
    }

    remove(id) {
        return new Promise((resolve, reject) => {
            this.db.get(id)
                .then((doc) => { return this.db.remove(doc) })
                .then((result) => { resolve(result) })
                .catch((err) => { reject(err) })
        })
    }

    subscribe(handleUpdate) {
        this.syncToken = this.db.changes({
            since: 'now',
            live: true,
            include_docs: true
        })
            .on('change', (change) => { console.log(change); handleUpdate(change, this.localDb) })
            .on('complete', (info) => { console.log('Subscription ended', info) })
            .on('error', function (err) { console.log('Subscription error', err) })
        console.log('Subscribed to ' + this.localDb)
    }

    unsubscribe() {
        this.syncToken.cancel()
    }

    sync() {
        if (this.willSync) {
            this.db.sync(this.remoteDb, { live: true, retry: true })
                .on('error', console.log.bind(console));
            console.log('Syncing with ' + this.remoteDb)
        }
    }
}
