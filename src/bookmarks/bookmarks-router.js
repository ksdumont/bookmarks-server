const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const {bookmarks} = require('../store')
const BookmarksService = require('./bookmarks-service')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    rating: Number(bookmark.rating)
})

bookmarkRouter.route('/bookmarks')
.get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
    .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark))
    })
    .catch(next)
}) 
.post(bodyParser, (req, res) => {
    const {title, url, description, rating} = req.body;

    if (!title || !url || !description || !rating) {
        logger.error(`Must include title, url, description, and rating`);
        return res.status(400).send('Invalid data');
    }
    const id = uuid();
    const bookmark = {
        id,
        title,
        url,
        description,
        rating
    };
    bookmarks.push(bookmark);
    logger.info(`Bookmark with id ${id} created`);
    res.status(201).location(`http://localhost:8000/bookmarks/${id}`).json(bookmark);
})
bookmarkRouter.route('/bookmarks/:id')
.get((req, res, next) => {
    const {id} = req.params;
    BookmarksService.getById(req.app.get('db'), id)
    .then(bookmark => {
        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found`)
            return res.status(404).json({
                error: {message: 'Bookmark not found'}
            })
        }
        res.json(serializeBookmark(bookmark))
    })
    .catch(next)
})
.delete((req, res) => {
    const {id} = req.params;
    const bookmarkIndex = bookmarks.findIndex(b => b.id === id);

    if (bookmarkIndex === -1) {
        logger.error(`Bookmark with id ${id} not found.`)
        return res.status(404).send('Not found')
    }
    bookmarks.splice(bookmarkIndex, 1)
    logger.info(`Bookmark with id ${id} deleted.`)
    res.status(204).end()
})

module.exports = bookmarkRouter;