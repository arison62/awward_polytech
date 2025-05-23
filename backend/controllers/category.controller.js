import models from "../models/index.js";

export const createCategory = async (req, res) => {

    const { name, description, voteId } = req.body;
    try {
        const category = await models.Category.create({ name, voteId, description });
        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await models.Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        await category.destroy();
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
};

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const category = await models.Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        category.name = name || category.name;
        category.description = description || category.description;
        await category.save();
        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error });
    }
};
