#!/usr/bin/env node
import { install } from 'source-map-support';
install();

const Visits = require('./visits')
const couchServer = 'http://couchdb.fairhursts.net/'       // TODO: move into config
const db = 'visits'

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
Visits.subscribe(processChange)

// Calling Sync() will grab a full dataset from the server
// and create an open event listener that keeps this app alive
Visits.sync()

console.log('MFA Processing Service Running...')