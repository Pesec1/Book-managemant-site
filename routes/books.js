const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Book = require("../models/book");
const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

//ALl Books
router.get("/", async (req, res) => {
  let query = Book.find()
  if (req.query.title) {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore) {
    query = query.lte('publishDate', req.query.publishedBefore) 
  }
  
  if (req.query.publishedAfter) {
    query = query.gte('publishDate', req.query.publishedAfter) 
  }
  try {
    const books = await query.exec()
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
router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    description: req.body.description,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    author: req.body.author.trim(),
    coverImageName: fileName,
  });
  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect("books");
  } catch (e) {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
      console.log(e);
    }
    renderNewPage(res, book, true);
  }
});

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), (err) => {
    if (err) console.error(err);
  });
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
