#!/usr/bin/env node
import { install } from 'source-map-support';
install();
const config = require('config');
const winston = require('winston')
import CouchService from './couchService'
import { hexEncode, hexDecode } from './hexEncoder'

// Set up logging transports
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './logs/mfa-processor.log' })
    ]
});

const now = () => { return new Date().toISOString() }

let watchedDatabaseList = []

process.on('unhandledRejection', (reason) => {
    logger.log('debug', '[%s] DEBUG: Unhandled Rejection Reason: %s', now(), reason);
});

// Get the collection of databases to watch
let completedDatabase = new CouchService('completed-visits')
completedDatabase.getUserDatabaseList()
    .then(list => { start(list) })
    .catch(err => logger.log('error', '[%s] Error: Unable to fetch list of user databases: %s', now(), err))

// Store userdb instances in collection e.g. watchedDataBaseList[ 'userdb-xxxxxx', ... ]
const start = (watchList) => {
    watchList.forEach(d => { addWatchToDatabase(d) })
    watchForNewUsers()
    logger.log('info', '[%s] MFA Processing Service Running...', now())
}

const addWatchToDatabase = (d) => {
    watchedDatabaseList[d] = new CouchService(d)
    watchedDatabaseList[d].subscribe(processChange, generalError)
    logger.log('info', '[%s] Subscribed to %s', now(), d)
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
    const error = (err) => { logger.log('error', '[%s] Error: Could not watch _users: %s', now(), JSON.stringify(err)) }
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
        logger.log('debug', '[%s] DEBUG: Added doc to completed-visits: %s', now(), doc)      //
        removeIfNoError(doc.id, db)
    }
    const error = (err) => { logger.log(now(), 'error', 'Error: Completed record could not be added: ', doc._id, ' : ', JSON.stringify(err)) }
    completedDatabase.add(doc, success, error)
}

// Ensure that record exists in completed database before removing
const removeIfNoError = (id, db) => {
    const success = (doc) => {
        logger.log('debug', '[%s] DEBUG: Fetched doc from completed-visits: %s', now(), doc)     //
        remove(id, db)
    }
    const error = (err) => { logger.log('error', '[%s] Error: Completed record [%s] could not be found: %s', now(), doc._id, JSON.stringify(err)) }
    completedDatabase.fetch(id, success, error)
}

const remove = (id, db) => {
    const success = (result) => { logger.log('info', '[%s] Assessment [%s] was completed', now(), id) }
    const error = (err) => { logger.log('error', '[%s] Error: Completed record [%s] could not be removed from %s: %s', now(), id, db, JSON.stringify(err)) }
    watchedDatabaseList[db].remove(id, success, error)
}

const generalError = (err) => { logger.log('[%s] Error: %s', now(), err) }
