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