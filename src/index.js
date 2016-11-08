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
    //let watchedDB = new CouchService('userdb-626f62')
    //watchedDB.subscribe(processChange)
    // const completedDatabase = new PouchService(completedDb, remoteServer)
    // completedDatabase.sync()

    // watchedDatabaseList = watchList.map(d => new PouchService(d, remoteServer))
    // watchedDatabaseList.forEach(w => {
    //     w.subscribe(processChange)
    //     w.sync()
    // })

    console.log('MFA Processing Service Running...')
}

// Ignore deleted records
const processChange = (change, db) => {
    if (change.doc && !change.doc._deleted) { testForCompleted(change.doc, db) }
}

// Filter completed records
const testForCompleted = (doc, db) => {
    if (doc.status && (doc.status === 'completed')) { console.log('Will move:', JSON.stringify(doc))/*moveRecord(doc, db)*/ }
}

// Move record into completed queue
const moveRecord = (doc, db) => {
    let addDoc = Object.assign({}, doc, { _rev: undefined })
    completedDatabase.add(addDoc)
        .then(removeIfNoError(doc._id, db))
        .catch(err => console.log('Error: Completed record could not be added: ', doc._id, ' : ', JSON.stringify(err)))
}

// Ensure that record exists in completed database before removing
const removeIfNoError = (id, db) => {
    index = watchedDatabaseList.indexOf(db)
    completedDatabase.fetch(id)
        .then(doc => {
            watchedDatabaseList[index].remove(doc._id)
                .then(console.log('Assessment ' + doc._id + ' was completed at ' + new Date().toISOString()))
        })
        .catch(err => console.log('Error: Completed record could not be removed: ', id, ' : ', JSON.stringify(err)))
}
