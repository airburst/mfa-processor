#!/usr/bin/env node
import { install } from 'source-map-support';
install();
const config = require('config');
import { getUserDatabaseList } from './couchService'
import PouchService from './pouchService'

const user = config.get('couchdb.user')
const pass = config.get('couchdb.password')
const completedDb = config.get('couchdb.completedDb')
const remoteServer = config.get('couchdb.remoteServer')
//const remoteServerWithCreds = `http://${user}:${pass}@${remoteServer}`
let watchedDatabaseList = []

// Get the collection of databases to watch
const makeCollection = (docs) => {
    let userDbList = []
    userDbList = docs.map(d => d.id)
    if (userDbList.length > 0) { start(userDbList) }
}

getUserDatabaseList(makeCollection)

const start = (watchList) => {
    const completedDatabase = new PouchService(completedDb, remoteServer)
    completedDatabase.sync()
    
    watchedDatabaseList = watchList.map(d => new PouchService(d, remoteServer))
    watchedDatabaseList.forEach(w => {
        w.subscribe(processChange)
        w.sync()
    })

    console.log('MFA Processing Service Running...')
}

// Ignore deleted records
const processChange = (change, db) => {
    console.log('processing', change, db)       //
    if (change.doc && !change.doc._deleted) { testForCompleted(change.doc, db) }
}

// Filter completed records
const testForCompleted = (doc, db) => {
    if (doc.status && (doc.status === 'completed')) { moveRecord(doc, db) }
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
