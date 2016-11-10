#!/usr/bin/env node
import { install } from 'source-map-support';
install();
const config = require('config');
import CouchService from './couchService'
import { hexEncode, hexDecode } from './hexEncoder'

let watchedDatabaseList = []

process.on('unhandledRejection', (reason) => {
    console.log('DEBUG: Unhandled Rejection Reason: ' + reason);
});

// Get the collection of databases to watch
let completedDatabase = new CouchService('completed-visits')
completedDatabase.getUserDatabaseList()
    .then(list => { start(list) })
    .catch(err => console.log('Error: Unable to fetch list of user databases', err))

// Store userdb instances in collection e.g. watchedDataBaseList[ 'userdb-xxxxxx', ... ]
const start = (watchList) => {
    watchList.forEach(d => { addWatchToDatabase(d) })
    watchForNewUsers()
    console.log('MFA Processing Service Running...')
}

const addWatchToDatabase = (d) => {
    watchedDatabaseList[d] = new CouchService(d)
    watchedDatabaseList[d].subscribe(processChange, generalError)
}

// Add newly created user dbs to the watch list
const watchForNewUsers = () => {
    const success = (change) => {
        change.forEach(c => {
            if (c._id.indexOf('org.couchdb.user') > -1) {
                checkNameAgainstWatchList(c.name)
            }
        })
    }
    const error = (err) => { console.log('Error: Could not watch _users', JSON.stringify(err)) }
    const users = new CouchService('_users')
    users.subscribe(success, error, 'admin')
}

const checkNameAgainstWatchList = (name) => {
    let dbName = 'userdb-' + hexEncode(name)
    if (watchedDatabaseList[dbName] === undefined) {
        addWatchToDatabase(dbName)
    }
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
    const success = (doc) => {
        // console.log('DEBUG: Added doc to completed-visits', doc)
        removeIfNoError(doc.id, db)
    }
    const error = (err) => { console.log('Error: Completed record could not be added: ', doc._id, ' : ', JSON.stringify(err)) }
    completedDatabase.add(doc, success, error)
}

// Ensure that record exists in completed database before removing
const removeIfNoError = (id, db) => {
    const success = (doc) => {
        // console.log('DEBUG: Fetched doc from completed-visits', doc)
        remove(id, db)
    }
    const error = (err) => { console.log('Error: Completed record could not be found: ', doc._id, ' : ', JSON.stringify(err)) }
    completedDatabase.fetch(id, success, error)
}

const remove = (id, db) => {
    const success = (result) => { console.log('Assessment ' + id + ' was completed at ' + new Date().toISOString()) }
    const error = (err) => { console.log('Error: Completed record', id, 'could not be removed from', db, JSON.stringify(err)) }
    watchedDatabaseList[db].remove(id, success, error)
}

const generalError = (err) => { console.log(err) }
