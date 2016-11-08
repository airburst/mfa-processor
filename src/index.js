#!/usr/bin/env node
import { install } from 'source-map-support';
install();
const config = require('config');
import CouchService from './couchService'

let watchedDatabaseList = []

// Get the collection of databases to watch
let completedDb = new CouchService('completed-visits')
completedDb.getUserDatabaseList()
    .then(list => { start(list) })
    .catch(err => console.log('Error: Unable to fetch list of user databases', err))
        
const start = (watchList) => {
    console.log('Create listeners for user databases:', watchList)

    // const completedDatabase = new PouchService(completedDb, remoteServer)
    // completedDatabase.sync()

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
    let addDoc = Object.assign({}, doc, { _rev: undefined })
    completedDatabase.add(addDoc)
        .then(removeIfNoError(doc._id))
        .catch(err => console.log('Error: Completed record could not be added: ', doc._id, ' : ', JSON.stringify(err)))
}

// Ensure that record exists in completed database before removing
const removeIfNoError = (id) => {
    // index = watchedDatabaseList.indexOf(db)
    completedDatabase.fetch(id)
        .then(doc => {
            watchedDatabaseList[index].remove(doc._id)
                .then(console.log('Assessment ' + doc._id + ' was completed at ' + new Date().toISOString()))
        })
        .catch(err => console.log('Error: Completed record could not be removed: ', id, ' : ', JSON.stringify(err)))
}

const handleError = (error) => { console.log(error) }
