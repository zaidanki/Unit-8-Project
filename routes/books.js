var express = require('express');
var router = express.Router();
const sqlite = require('sqlite3');
const Book = require('../models').Book

const db = new sqlite.Database('./library.db', err => console.log(err));


// this is where i get the values for the db
router.get('/', function(req, res, next) {
  db.all('SELECT * FROM Books ORDER BY title', (err, results) => {
    res.render('index', { title: 'Books!', results: results, message: err });
})
});

//render form to create new books
router.get('/new', function(req, res, next){
  res.render('new-book', {book: {}, title:"Add Book"})
});

// Add book
router.post('/new', (req, res, next) => {
  Book.create(req.body).then(() => {
    res.redirect('/books');
}).catch(error => {
  if(error.name === "SequelizeValidationError") {
  res.render("new-book", {book: Book.build(req.body), errors: error.errors, title: "Error"});
} else {
  throw error;
};
}).catch(error => {
  res.send(500, error);
});
});


// Display Book
router.get("/:id", (req, res, next) => {
  Book.findByPk(req.params.id).then( book => {
    if(book){
      res.render('update-book', {book, title:"Update Book"})
    } else {
      res.render('page-not-found')
    }
  }).catch(error => {
  res.send(500, error);
});
})

// Edit Book
router.post("/:id", (req, res, next) => {
  Book.findByPk(req.params.id).then(book => {
    if(book) {
      return book.update(req.body);
    } else {
      res.send(404);
}
}).then(() => {
  res.redirect("/books");
}).catch(error => {
  if(error.name === "SequelizeValidationError") {
  let book = Book.build(req.body);
  book.id = req.params.id;
  res.render('update-book', {book, errors: error.errors, title:"New Book"});
} else {
  throw error;
};
}).catch(error => {
  res.send(500, error);
});
});

// Delete Book

router.post("/:id/delete", (req, res) => {
  Book.findByPk(req.params.id).then( book => {
    if(book){
      return book.destroy();
    }
}).then( () => res.redirect('/books')).catch(error => {
  res.send(500, error);
});
})

module.exports = router;