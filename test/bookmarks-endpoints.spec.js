const knex = require('knex')
const fixtures = require('./bookmarks-fixtures')
const app = require('../src/app')
//TODO: remove when updating POST and DELETE
const store = require('../src/store')

describe('Bookmarks Endpoints', () => {
    let bookmarksCopy, db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())

    before('cleanup', () => db('bookmarks').truncate())

    //TODO: refactor to use db when updating POST and DELETE
    beforeEach('copy the bookmarks', () => {
        //copy the bookmarks so we can restore them after testing
        bookmarksCopy = store.bookmarks.slice()
    })

    //TODO: refactor to use db when updating POST and DELETE
    afterEach('restore the bookmarks', () => {
        //restore the bookmarks back to originial
        store.bookmarks = bookmarksCopy
    })
})