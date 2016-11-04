#!/usr/bin/env node
import { install } from 'source-map-support';
install();

const PouchService = require('./pouchService')
const remoteServer = 'http://couchdb.fairhursts.net:5984'
const db = 'visits'

const pouch = new PouchService(db, remoteServer)

// Ignore deleted records
const processChange = (change) => {
    if (change.doc && !change.doc._deleted) { testForCompleted(change.doc) }
}

// Filter completed records
const testForCompleted = (doc) => {
    if (doc.status && (doc.status === 'completed')) { moveDoc(doc) }
}

// Move record into completed queue
const moveDoc = (doc) => {
    console.log('Moving ' + doc._id + ' to completed queue')
}

// Subcribe to any changes in the local database
pouch.subscribe(processChange)

// Calling Sync() will grab a full dataset from the server
// and create an open event listener that keeps this app alive
pouch.sync()

console.log('MFA Processing Service Running...')