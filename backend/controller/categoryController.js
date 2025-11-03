// controllers/categoryController.js
import Category from "./../models/category.js";

export async function getCategories(req, res) {
  try {
    const userId = req.user.sub; // Retrieved from JWT middleware

    const categories = await Category.find({ userId }).sort({ createdAt: -1 });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}
