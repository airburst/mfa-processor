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

// TESTS
const removeTest = (temp) => {
    console.log('removing', temp)
    completedDatabase.remove(temp)
        .then(doc => console.log(doc))
        .catch(err => console.log(err))
}

completedDatabase.add({ _id: new Date().toISOString(), name: 'Test', status: 'open' })
    .then(doc => { removeTest(doc) })
    .catch(err => console.log(err))

// END TESTS

const start = (watchList) => {
    watchList.forEach(d => {
        watchedDatabaseList[d] = new CouchService(d)
        watchedDatabaseList[d].subscribe(processChange, handleError)
    })
    console.log('MFA Processing Service Running...')
}

// Ignore deleted records
// change is always an array
const processChange = (change) => {
    change.forEach(c => {
        if (!c._deleted) { testForCompleted(c) }
    })
}

// Filter completed records
const testForCompleted = (doc) => {
    if (doc.status && (doc.status === 'completed')) { console.log('Will move:', JSON.stringify(doc))/*moveRecord(doc)*/ }
}

// Move record into completed queue
const moveRecord = (doc) => {
    completedDatabase.add(doc)
        .then(removeIfNoError(doc.id))
        .catch(err => console.log('Error: Completed record could not be added: ', doc.id, ' : ', JSON.stringify(err)))
}

// Ensure that record exists in completed database before removing
const removeIfNoError = (id) => {
    completedDatabase.fetch(id)
        .then(doc => {
            watchedDatabaseList['database'].remove(id)
                .then(console.log('Assessment ' + id + ' was completed at ' + new Date().toISOString()))
        })
        .catch(err => console.log('Error: Completed record could not be removed: ', id, ' : ', JSON.stringify(err)))
}

const handleError = (error) => { console.log(error) }
