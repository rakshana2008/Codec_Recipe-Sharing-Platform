const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/recipeSharing")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    ingredients: { type: String, required: true },
    instructions: { type: String, required: true },
    category: { type: String, default: "General" }
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// Add a new recipe
app.post("/api/recipes", async (req, res) => {
    try {
        const recipe = await Recipe.create(req.body);
        res.status(201).json(recipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all recipes and search by title
app.get("/api/recipes", async (req, res) => {
    try {
        const filter = {};

        if (req.query.search) {
            filter.title = {
                $regex: req.query.search,
                $options: "i"
            };
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        const recipes = await Recipe.find(filter);
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a recipe by ID
app.get("/api/recipes/:id", async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.json(recipe);
    } catch (error) {
        res.status(400).json({ message: "Invalid recipe ID" });
    }
});

// Delete a recipe
app.delete("/api/recipes/:id", async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.json({ message: "Recipe deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Invalid recipe ID" });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Recipe Sharing Platform running on port ${PORT}`);
});
