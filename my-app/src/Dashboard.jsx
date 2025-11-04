import React, { useState, useEffect } from "react";
import CategoryList from "./CategoryList";
import AddCategoryForm from "./AddCategoryForm";
import EmailsList from "./EmailsList";

// Be sure to include Bootstrap CSS in your index.html or import it at the top of your App:
// import 'bootstrap/dist/css/bootstrap.min.css';

export default function Dashboard({ user, token, onAddCategory }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [toggleForm, setToggleForm] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch(
        "https://jump-mcmg.vercel.app/api/categories-all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setCategories(data);
    }
    fetchCategories();
  }, [token]);

  const handleSelectCategory = (category) => {
    console.log("category", category);
    setSelectedCategory(category);
  };

  const connectAccount = () => {
    window.location.href = "https://jump-mcmg.vercel.app/auth/google";
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row py-2 px-3 bg-primary text-white align-items-center">
        <div className="col-auto">
          <button className="btn btn-light" onClick={connectAccount}>
            Connect Multiple Gmail Accounts
          </button>
        </div>
        <div className="col text-end">
          <span className="me-3">{user?.email}</span>
          <button className="btn btn-outline-light">Logout</button>
        </div>
      </div>
      <div className="row" style={{ minHeight: "90vh" }}>
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 border-end pt-3 bg-white">
          <button
            className="btn btn-primary w-100 mb-3"
            onClick={() => setToggleForm(!toggleForm)}
          >
            Add New Category
          </button>
          {toggleForm && (
            <AddCategoryForm onSubmit={onAddCategory} token={token} />
          )}
          <CategoryList
            categories={categories}
            onSelectCategory={handleSelectCategory}
          />
        </div>
        {/* Main Content */}
        <div className="col-md-9 col-lg-10 pt-3">
          {selectedCategory ? (
            <>
              <h4>Showing emails for: {selectedCategory.name}</h4>
              <EmailsList
                user={user}
                token={token}
                categoryId={selectedCategory._id}
                categoryName={selectedCategory.name}
              />
            </>
          ) : (
            <div className="alert alert-info">
              Please select a category to view emails.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
