#!/usr/bin/env node
import { install } from 'source-map-support';
install();
const config = require('config');
const winston = require('winston')
import CouchService from './couchService'
import { hexEncode, hexDecode } from './hexEncoder'

// Set up logging transports
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './logs/mfa-processor.log' })
    ]
});

let watchedDatabaseList = []

process.on('unhandledRejection', (reason) => {
    logger.log('debug', 'DEBUG: Unhandled Rejection Reason: ' + reason);
});

// Get the collection of databases to watch
let completedDatabase = new CouchService('completed-visits')
completedDatabase.getUserDatabaseList()
    .then(list => { start(list) })
    .catch(err => logger.log('error', 'Error: Unable to fetch list of user databases', err))

// Store userdb instances in collection e.g. watchedDataBaseList[ 'userdb-xxxxxx', ... ]
const start = (watchList) => {
    watchList.forEach(d => { addWatchToDatabase(d) })
    watchForNewUsers()
    logger.log('info', 'MFA Processing Service Running...')
}

const addWatchToDatabase = (d) => {
    watchedDatabaseList[d] = new CouchService(d)
    watchedDatabaseList[d].subscribe(processChange, generalError)
    logger.log('info', 'Subscribed to %s', d)
}

// Add newly created user dbs to the watch list
const watchForNewUsers = () => {
    const success = (change) => {
        change.forEach(c => {
            if (c.id.indexOf('org.couchdb.user:') > -1) {
                checkNameAgainstWatchList(c.id.replace('org.couchdb.user:', ''))
            }
        })
    }
    const error = (err) => { logger.log('error', 'Error: Could not watch _users', JSON.stringify(err)) }
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
    if (change) {
        change.forEach(c => {
            if (!c._deleted) { testForCompleted(c, db) }
        })
    }
}

// Filter only completed records
const testForCompleted = (doc, db) => {
    if (doc.status && (doc.status === 'completed')) { moveRecord(doc, db) }
}

// Move record into completed queue
const moveRecord = (doc, db) => {
    const success = (doc) => {
        // logger.log('info', 'DEBUG: Added doc to completed-visits', doc)
        removeIfNoError(doc.id, db)
    }
    const error = (err) => { logger.log('error', 'Error: Completed record could not be added: ', doc._id, ' : ', JSON.stringify(err)) }
    completedDatabase.add(doc, success, error)
}

// Ensure that record exists in completed database before removing
const removeIfNoError = (id, db) => {
    const success = (doc) => {
        // logger.log('info', 'DEBUG: Fetched doc from completed-visits', doc)
        remove(id, db)
    }
    const error = (err) => { logger.log('error', 'Error: Completed record could not be found: ', doc._id, ' : ', JSON.stringify(err)) }
    completedDatabase.fetch(id, success, error)
}

const remove = (id, db) => {
    const success = (result) => { logger.log('info', 'Assessment ' + id + ' was completed at ' + new Date().toISOString()) }
    const error = (err) => { logger.log('error', 'Error: Completed record', id, 'could not be removed from', db, JSON.stringify(err)) }
    watchedDatabaseList[db].remove(id, success, error)
}

const generalError = (err) => { logger.log('error', err) }
