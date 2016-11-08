#!/usr/bin/env node
import { install } from 'source-map-support';
install();
const config = require('config');
import CouchService from './couchService'

let watchedDatabaseList = []

// Get the collection of databases to watch
let completedDatabase = new CouchService('completed-visits')
completedDatabase.getUserDatabaseList()
    .then(list => { start(list) })
    .catch(err => console.log('Error: Unable to fetch list of user databases', err))

// Store userdb instances in collection e.g. watchedDataBaseList[ 'userdb-xxxxxx', ... ]
const start = (watchList) => {
    watchList.forEach(d => {
        watchedDatabaseList[d] = new CouchService(d)
        watchedDatabaseList[d].subscribe(processChange, handleError)
    })
    console.log('MFA Processing Service Running...')
}

// Ignore deleted records; [change] is always an array; 
// db is the database name, so we can remove doc later
const processChange = (change, db) => {
    change.forEach(c => {
        if (!c._deleted) { testForCompleted(c, db) }
    })
}

// Filter only completed records
const testForCompleted = (doc, db) => {
    if (doc.status && (doc.status === 'completed')) { moveRecord(doc, db) }
}

// Move record into completed queue
const moveRecord = (doc, db) => {
    completedDatabase.add(doc)
        .then(removeIfNoError(doc._id, db))
        .catch(err => console.log('Error: Completed record could not be added: ', doc._id, ' : ', JSON.stringify(err)))
}

// Ensure that record exists in completed database before removing
const removeIfNoError = (id, db) => {
    completedDatabase.fetch(id)
        .then(doc => { remove(id, db) })
        .catch(err => console.log('Error: Completed record could not be found: ', doc._id, ' : ', JSON.stringify(err)))
}

const remove = (id, db) => {
    watchedDatabaseList[db].remove(id)
        .then(doc => console.log('resolved', doc))      // NOT RESOLVING
        // .then(result => console.log('Assessment ' + id + ' was completed at ' + new Date().toISOString()))
        .catch(err => console.log('Error: Completed record', id, 'could not be removed from', db, JSON.stringify(err)))
}

const handleError = (error) => { console.log(error) }
