import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
// import Documentation from "./Documentation";
import "./App.css";

function App() {
  const savedTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(savedTheme);
  // const [selectedFile, setSelectedFile] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newBook, setNewBook] = useState({ name: "", category: "", fileUrl: "" });
  const [editBook, setEditBook] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("Newest-Oldest");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    fetchBooks();
    fetchCategories();
  }, [theme]);

  const fetchBooks = async () => {
    const res = await axios.get("https://pnr-rule-book-server.vercel.app/books");
    setBooks(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get("https://pnr-rule-book-server.vercel.app/categories");
    setCategories(res.data);
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // const formatGoogleDriveLink = (originalLink) => {
  //   const match = originalLink.match(/(?:\/d\/|id=)([\w-]+)/);
  //   if (match) {
  //     const fileId = match[1];

  //     if (originalLink.includes("docs.google.com/document")) {
  //       return `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
  //     } else if (originalLink.includes("docs.google.com/spreadsheets")) {
  //       return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
  //     } else if (originalLink.includes("docs.google.com/presentation")) {
  //       return `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
  //     } else {
  //       return `https://drive.google.com/uc?export=download&id=${fileId}`;
  //     }
  //   }
  //   return originalLink;
  // };

  // const openBook = (fileUrl) => setSelectedFile(formatGoogleDriveLink(fileUrl));

  const handleAddBook = async () => {
    await axios.post("https://pnr-rule-book-server.vercel.app/books", newBook);
    fetchBooks();
    setNewBook({ name: "", category: "", fileUrl: "" });
    closeModal("addBookModal");
    window.location.reload();
  };

  const handleEditBook = async () => {
    await axios.put(`https://pnr-rule-book-server.vercel.app/books/${editBook._id}`, editBook);
    fetchBooks();
    setEditBook(null);
    closeModal("editBookModal");
  };

  const handleDeleteBook = async (id) => {
    await axios.delete(`https://pnr-rule-book-server.vercel.app/books/${id}`);
    fetchBooks();
  };

  const handleAddCategory = async () => {
    await axios.post("https://pnr-rule-book-server.vercel.app/categories", { name: newCategory });
    fetchCategories();
    setNewCategory("");
    closeModal("addCategoryModal");
  };

  // const handleDeleteCategory = async (id) => {
  //   await axios.delete(`https://pnr-rule-book-server.vercel.app/categories/${id}`);
  //   fetchCategories();
  // };

  const openModal = (id) => new window.bootstrap.Modal(document.getElementById(id)).show();
  const closeModal = (id) => new window.bootstrap.Modal(document.getElementById(id)).hide();

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.includes("-") 
      ? dateString.split("-").map(Number)  // Handle "dd-mm-yyyy"
      : dateString.split("/").map(Number); // Handle "dd/mm/yyyy"
    
    return new Date(year, month - 1, day).getTime(); // Convert to timestamp
  };
  
  const filteredBooks = [...books]
  .filter(book =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "" || book.category === selectedCategory)
  )
  .sort((a, b) => {
    if (sortOption === "A-Z") return a.name.localeCompare(b.name);
    if (sortOption === "Z-A") return b.name.localeCompare(a.name);
    if (sortOption === "Newest-Oldest") return parseDate(b.createdAt) - parseDate(a.createdAt);
    if (sortOption === "Oldest-Newest") return parseDate(a.createdAt) - parseDate(b.createdAt);
    return 0;
  });

  return (
    <div className={`App ${theme}-theme`}>
      <div className="navbar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="https://cdn-icons-png.flaticon.com/512/107/107799.png" alt="..."/>
          </button>
          <ul class="dropdown-menu">
            <li>
              <button className="dropdown-item" onClick={() => setSelectedCategory("")}>
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <button
                  className="dropdown-item"
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="d-flex align-items-center">
          <select className="form-select mx-2" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="A-Z">A → Z</option>
            <option value="Z-A">Z → A</option>
            <option value="Newest-Oldest">Newest → Oldest</option>
            <option value="Oldest-Newest">Oldest → Newest</option>
          </select>
        </div>


        <button className="btn" onClick={() => openModal("addBookModal")}>Add Book</button>
        <button className="btn" onClick={() => openModal("addCategoryModal")}>Add Category</button>
        <button className="btn" onClick={toggleTheme}><img className="me-1" src="https://icons.veryicon.com/png/o/object/life-icon-2/theme-8.png" alt="..." />Theme</button>
      </div>


      <div className="books-grid">
        {filteredBooks.map((book) => {
          // const collapseId = `collapse-${book._id}`; 

          return (
            <div key={book._id} className="book">
              <div className="options">
                <a href={book.fileUrl} className="book-name" rel="noreferrer" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/5402/5402751.png"/>{book.name} - {book.createdAt}</a>
                {/* <button className="book-name btn-info btn btn-sm" onClick={() => openBook(book.fileUrl)} data-bs-toggle="collapse" data-bs-target={`#${collapseId}`} aria-expanded="false" aria-controls={collapseId}>{book.name} - {book.createdAt}</button> */}
                {/* <button className="btn btn-warning btn-sm" onClick={() => { setEditBook(book); openModal("editBookModal"); }}><img src="https://cdn-icons-png.flaticon.com/512/4226/4226577.png"/>Edit</button> */}
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBook(book._id)}><img src="https://cdn-icons-png.flaticon.com/512/3159/3159218.png" alt="..."/>Delete</button>
              </div>
              <p className="book-category">{book.category}</p>
              {/* <div className="collapse" id={collapseId}>
                <div className="card card-body">
                  <Documentation file={selectedFile} />
                </div>
              </div> */}
            </div>
          );
        })}
      </div>


      {/* Add Book Modal */}
      <div className="modal fade" id="addBookModal" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Book</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <input type="text" placeholder="Book Name" className="form-control mb-2" value={newBook.name} onChange={(e) => setNewBook({ ...newBook, name: e.target.value })} />
              <select className="form-control mb-2" value={newBook.category} onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}>
                <option value="">Select Category</option>
                {categories.map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
              <input type="text" placeholder="File URL" className="form-control" value={newBook.fileUrl} onChange={(e) => setNewBook({ ...newBook, fileUrl: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAddBook}>Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Book Modal */}
      {editBook && (
        <div className="modal fade" id="editBookModal" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Book</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <input type="text" placeholder="Book Name" className="form-control mb-2" value={editBook.name} onChange={(e) => setEditBook({ ...editBook, name: e.target.value })} />
                <select className="form-control mb-2" value={editBook.category} onChange={(e) => setEditBook({ ...editBook, category: e.target.value })}>
                  <option value="">Select Category</option>
                  {categories.map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
                <input type="text" placeholder="File URL" className="form-control" value={editBook.fileUrl} onChange={(e) => setEditBook({ ...editBook, fileUrl: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleEditBook}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <div className="modal fade" id="addCategoryModal" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Category</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <input type="text" placeholder="Category Name" className="form-control" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAddCategory}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
