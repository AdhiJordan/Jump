// CategoryList.jsx
import React from "react";

export default function CategoryList({ categories, onSelectCategory }) {
  if (!categories || categories.length === 0) {
    return <p>No categories available. Add some!</p>;
  }

  return (
    <div>
      <h3>Your Categories</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {categories.map((cat) => (
          <li
            key={cat._id || cat.id}
            onClick={() => onSelectCategory(cat)}
            style={{
              padding: "8px",
              margin: "5px 0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
            }}
          >
            <strong>{cat.name}</strong>

            <p style={{ margin: 0, fontSize: "small", color: "#555" }}>
              {cat.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
