#!/usr/bin/env node
import { install } from 'source-map-support';
install();
const config = require('config');
import { getUserDbs } from './couchService'

const user = config.get('couchdb.user');
const pass = config.get('couchdb.password');
const remoteServer = config.get('couchdb.remoteServer');

// Get the collection of databases to watch
getUserDbs()

const PouchService = require('./pouchService'),
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
	let addDoc = Object.assign({}, doc, { _rev: undefined })
    completedDatabase.add(addDoc)
        .then(removeIfNoError(doc._id))
        .catch(err => console.log('Error: Completed record could not be added: ', doc._id, ' : ', JSON.stringify(err)))
}

// Ensure that record exists in completed database before removing
const removeIfNoError = (id) => {
    completedDatabase.fetch(id)
        .then(doc => { 
            watchedDatabase.remove(doc._id)
                .then(console.log('Assessment ' + doc._id + ' was completed at ' + new Date().toISOString()))
        })
        .catch(err => console.log('Error: Completed record could not be removed: ', id, ' : ', JSON.stringify(err)))
}

// Subcribe to any changes in the local database
watchedDatabase.subscribe(processChange)

// Calling Sync() will grab a full dataset from the server
// and create an open event listener that keeps this app alive
watchedDatabase.sync()
completedDatabase.sync()

console.log('MFA Processing Service Running...')
