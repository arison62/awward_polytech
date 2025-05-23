import models from "../models/index.js";

export const createGroup = async (req, res) => {
    const adminId = req.user.id;
    try {
        const { name, description } = req.body;
        const newGroup = await models.Group.create({ adminId, name, description });
        res.status(201).json({ message: "Group created successfully", group: newGroup });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteGroup = async (req, res) => {
    const adminId = req.user.id;
    try {
        const { groupId } = req.params;
        const group = await models.Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        if (group.adminId !== adminId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await group.destroy();
        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getGroups = async (req, res) => {
    const {id} = req.params;
    try {
        if(id){
            const group = await models.Group.findByPk(id, {include: {all: true}});
            return res.status(200).json({group});
        }
        const groups = await models.Group.findAll({include: {all: true}});
        res.status(200).json({ groups });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};


