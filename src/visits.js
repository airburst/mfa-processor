const PouchDB = require('pouchdb')

const dbServer = 'http://51.254.135.229:5984'
const visitsDB = 'visits'
const db = new PouchDB(visitsDB)
const makeDoc = (doc) => {
    console.log('makeDoc', doc)
    let id = (doc._id && (doc._id !== "")) ? doc._id : new Date().toISOString()
    console.log('id', id)
    return Object.assign(
        {},
        doc,
        { _id: id }
    )
}
let syncToken = {}

module.exports = {

    fetchAll: () => {
        return new Promise((resolve, reject) => {
            db.allDocs({
                include_docs: true,
                attachments: true
            })
                .then((docs) => { resolve(docs.rows) })
                .catch((err) => { reject(err) })
        })
    },

    add: (details) => {
        let payload = makeDoc(details)
        console.log('About to add', payload)                //
        return new Promise((resolve, reject) => {
            db.put(payload)
                .then((result) => { resolve(result) })
                .catch((err) => { reject(err) })
        })
    },

    update: (details) => {
        console.log('About to Change', details)            //
        return new Promise((resolve, reject) => {
            if (!details._id) { reject({ err: 'No id provided - cannot complete update' })}
            db.get(details._id)
                .then((doc) => { return db.put(makeDoc(details)) })
                .then((result) => { resolve(result) })
                .catch((err) => { reject(err) })
        })
    },

    remove: (id) => {
        return new Promise((resolve, reject) => {
            db.get(id)
                .then((doc) => { return db.remove(doc) })
                .then((result) => { resolve(result) })
                .catch((err) => { reject(err) })
        })
    },

    sync: () => {
        db.sync(dbServer + '/' + visitsDB, { live: true, retry: true })
            .on('error', console.log.bind(console));
        // console.log('Syncing with ' + visitsDB + ' db')
    },

    subscribe: (handleUpdate) => {
        syncToken = db.changes({
            since: 'now',
            live: true,
            include_docs: true
        })
            .on('change', (change) => { handleUpdate(change) })
            .on('complete', (info) => { console.log('Subscription ended', info) })
            .on('error', function (err) { console.log('Subscription error', err) })
    },

    unsubscribe: () => {
        syncToken.cancel()
        console.log('Stopped syncing with ' + visitsDB + ' db')
    }
}