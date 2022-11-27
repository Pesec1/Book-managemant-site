const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

//ALl Books
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title) {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore) {
    query = query.lte("publishDate", req.query.publishedBefore);
  }

  if (req.query.publishedAfter) {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});
// New book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

//Create Book route
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    description: req.body.description,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    author: req.body.author.trim(),
  });
  saveCover(book, req.body.cover);
  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect("books");
  } catch (e) {
    if (book.coverImageName != null) {
      console.log(e);
    }
    renderNewPage(res, book, true);
  }
});

router.get("/:id", async(req, res) => {
  try{
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show', {book: book})
  }catch{
    res.redirect('/')
  }
});
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const authors = await Author.find({});
    res.render("books/edit", {
      book: book,
      authors: authors,
    });
  } catch {
    res.redirect("/books");
  }
});
router.put("/:id", async (req, res) => {
  let book;
  const authors = await Author.find({});
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if(req.body.cover != null && req.body.cover !== ''){
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);


    
  } catch{
    if (book == null) {
      res.redirect("/");
    } else {
      
      res.render("books/edit", {
        authors: authors,
        book: book,
        errorMessage: "Error Updating book",
      });
    }
  }
});
router.delete("/:id", async(req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id) 
    await book.remove();
    res.redirect("/books");
  } catch {
    if (book == null) {
      res.redirect("books/show", {
        book: book,
        errorMessage: 'Could not remove book'
      });
    } else {
      res.redirect(`/`);
    }
  }
});

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}
async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) params.errorMessage = "Error creating a book";
    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}

module.exports = router;


