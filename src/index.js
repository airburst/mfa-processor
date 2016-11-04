#!/usr/bin/env node
import { install } from 'source-map-support';
install();

const PouchService = require('./pouchService'),
    remoteServer = 'http://couchdb.fairhursts.net:5984',
    watchedDb = 'visits',
    completedDb = 'completed-visits'

const watchedDatabase = new PouchService(watchedDb, remoteServer)       //TODO: handle as array
const completedDatabase = new PouchService(completedDb, remoteServer)

// Ignore deleted records
const processChange = (change) => {
    if (change.doc && !change.doc._deleted) { testForCompleted(change.doc) }
}

// Filter completed records
const testForCompleted = (doc) => {
    if (doc.status && (doc.status === 'completed')) { moveRecord(doc) }
}

// Move record into completed queue
const moveRecord = (doc) => {
    completedDatabase.add(doc)
        .then(removeIfNoError(doc._id))
        .then(watchedDatabase.remove(doc._id))
        .then(console.log('Assessment ' + doc._id + ' was completed at ' + new Date().toISOString()))
        .catch((err) => console.log('Completed record was not moved: ', doc._id, ' : ', err))
}

// Ensure that record exists in completed database before removing
const removeIfNoError = (id) => {
    return new Promise((resolve, reject) => {
        completedDatabase.fetch(id)
            .then(doc => { return doc })
            .then(result => { resolve(result) })
            .catch((err) => { reject(err) })
    })
}

// Subcribe to any changes in the local database
watchedDatabase.subscribe(processChange)

// Calling Sync() will grab a full dataset from the server
// and create an open event listener that keeps this app alive
watchedDatabase.sync()
completedDatabase.sync()

console.log('MFA Processing Service Running...')
