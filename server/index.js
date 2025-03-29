const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://PNR-Rule-Book:PNR-Rule-Book@pnr-rule-book.etp85vs.mongodb.net/");

// Book Schema
const bookSchema = new mongoose.Schema({
  name: String,
  category: String,
  fileUrl: String,
  createdAt: {
    type: String,
    default: () => {
      const now = new Date();
      return now.toLocaleDateString("en-GB"); // Format: dd-mm-yyyy
    },
  },
});
const Book = mongoose.model("Book", bookSchema);

// Category Schema
const categorySchema = new mongoose.Schema({ name: String });
const Category = mongoose.model("Category", categorySchema);

// Routes

// Get all books
app.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

// Add a book
app.post("/books", async (req, res) => {
  const { name, category, fileUrl } = req.body;
  const newBook = new Book({ name, category, fileUrl });
  await newBook.save();
  res.json(newBook);
});

// Update a book
app.put("/books/:id", async (req, res) => {
  const { name, category, fileUrl } = req.body;
  const updatedBook = await Book.findByIdAndUpdate(req.params.id, { name, category, fileUrl }, { new: true });
  res.json(updatedBook);
});

// Delete a book
app.delete("/books/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Book deleted" });
});

// Get all categories
app.get("/categories", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// Add a category
app.post("/categories", async (req, res) => {
  const { name } = req.body;
  const newCategory = new Category({ name });
  await newCategory.save();
  res.json(newCategory);
});

// Delete a category
app.delete("/categories/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
