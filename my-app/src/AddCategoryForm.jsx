// AddCategoryForm.jsx
import { useState } from "react";

export default function AddCategoryForm({ onCategoryAdded, token }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/api/categories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" /* Authorization here if JWT */,
      },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    setName("");
    setDescription("");
    onCategoryAdded(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category Name"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <button type="submit">Add Category</button>
    </form>
  );
}
