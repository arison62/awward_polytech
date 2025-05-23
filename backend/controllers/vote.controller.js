import { Op } from "sequelize";
import models from "../models/index.js";
import e from "express";

const VOTE_STATUS = {
  pending: "pending",
  active: "active",
  completed: "completed",
  cancelled: "cancelled",
};
export const createVote = async (req, res) => {
  const admin = req.user;
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      status,
      groupId,
      categories,
    } = req.body;
    console.log(categories)
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!startDate) {
      return res.status(400).json({ message: "Start date is required" });
    }
    const startDateConverted = new Date(startDate);
    const endDateConverted = new Date(endDate);

    if (startDateConverted > endDateConverted && Date.now() <= startDateConverted) {
      return res
        .status(400)
        .json({ message: "Start date must be before end date" });
    }
    if(!categories || categories.length === 0) {
      models.Vote.create({
        title,
        description,
        startDate,
        endDate,
        status,
        groupId,
        adminId: admin.id,
      })
        .then((vote) => {
          res.status(201).json({ message: "Vote created successfully", vote });
        })
        .catch((error) => {
          console.log("Error creating vote:", error);
          res.status(500).json({ message: "Error creating vote", error });
        });
    }else{
      models.Vote.create({
        title,
        description,
        startDate,
        endDate,
        status,
        groupId,
        adminId: admin.id,
      })
        .then(async (vote) => {
          for (const category of categories) {
            await models.Category.create({
              name: category.name,
              description: category.description,
              voteId: vote.id,
            });
          }
          res.status(201).json({ message: "Vote created successfully", vote });
        })
        .catch((error) => {
          console.log("Error creating vote:", error);
          res.status(500).json({ message: "Error creating vote", error });
        });
    }
   
  } catch (error) {
    console.log("Error creating vote:", error);
    res.status(500).json({ message: "Error creating vote", error });
  }
};

export const updateVote = async (req, res) => {
  const admin = req.user;
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id } = req.params;
  const { title, description, startDate, endDate, status } = req.body;
  try {
    const vote = await models.Vote.findByPk(id);
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    vote.title = title || vote.title;
    vote.description = description || vote.description;
    vote.startDate = startDate || vote.startDate;
    vote.endDate = endDate || vote.endDate;
    vote.status = status || vote.status;
    await vote.save();
    res.status(200).json({ message: "Vote updated successfully", vote });
  } catch (error) {
    res.status(500).json({ message: "Error updating vote", error });
  }
};

export const getVote = async (req, res) => {
  const admin = req.user;
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id } = req.params;
  try {
    const vote = await models.Vote.findByPk(id, { include: { all: true } });
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    res.status(200).json({ message: "Vote found successfully", vote });
  } catch (error) {
    res.status(500).json({ message: "Error getting vote", error });
  }
};

export const getAllVotes = async (req, res) => {
  try {
    const votes = await models.Vote.findAll({ include: { all: true } });
    if (!votes) {
      return res.status(404).json({ message: "Votes not found" });
    }
    res.status(200).json({ message: "Votes found successfully", votes });
  } catch (error) {
    res.status(500).json({ message: "Error getting votes", error });
  }
};

export const deleteVote = async (req, res) => {
  const admin = req.user;
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id } = req.params;
  try {
    const vote = await models.Vote.findByPk(id);
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    await vote.destroy();
    res.status(200).json({ message: "Vote deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting vote", error });
  }
};

export const getVotesByUserGroup = async (req, res) => {
  const user = req.user;
  const { status } = req.query;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const votes = await models.Vote.findAll({
      where: { status, groupId: user.groupId },
    });
    if (!votes) {
      return res.status(404).json({ message: "Votes not found" });
    }
    res.status(200).json({ message: "Votes found successfully", votes });
  } catch (error) {
    res.status(500).json({ message: "Error getting votes", error });
  }
};

// status: "pending" or "active"
export const getUpTodateVotesByUserGroup = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const votes = await models.Vote.findAll(
      {
        where: {
          [Op.or]: [
            { status: VOTE_STATUS.pending },
            { status: VOTE_STATUS.active },
          ],
          groupId: user.groupId,
        },
      },
      { include: { all: true } }
    );
    if (!votes) {
      return res.status(404).json({ message: "Votes not found" });
    }
    res.status(200).json({ message: "Votes found successfully", votes });
  } catch (error) {
    res.status(500).json({ message: "Error getting votes", error });
  }
};

export const getUpToDateVotes = async (req, res)=>{
  console.log("getUpToDateVotes")
  try {
    const {by_user_group} = req.query;
    if(by_user_group){
      req.user.groupId = by_user_group
      return getUpTodateVotesByUserGroup(req, res);
    }
    const votes = await models.Vote.findAll(
      {
        where: {
          [Op.or]: [
            { status: VOTE_STATUS.pending },
            { status: VOTE_STATUS.active },
          ],
        },
      },
      { include: { all: true } }
    );
    if (!votes) {
      return res.status(404).json({ message: "Votes not found" });
    }
    res.status(200).json({ message: "Votes found successfully", votes });
  } catch (error) {
    console.error("Error getting up-to-date votes:", error);
    res.status(500).json({ message: "Error getting up-to-date votes", error });
  }
}

const updateVoteStatus = async (voteId, status) =>{
  return await models.Vote.update({status}, {where: {id: voteId}});
}

export const updateVoteStatusWithJob = async ()=>{
  try {
    const votes = await models.Vote.findAll({
      where: {
        [Op.or]: [
          { status: VOTE_STATUS.pending },
          { status: VOTE_STATUS.active },
        ],
        startDate: {
          [Op.lte]: new Date(),
        },
        endDate: {
          [Op.gte]: new Date(),
        },
      },
    });

    for (const vote of votes) {
      if (vote.status === VOTE_STATUS.pending && vote.startDate <= new Date() && vote.endDate >= new Date()) {
        await updateVoteStatus(vote.id, VOTE_STATUS.active);
      }else if(vote.status === VOTE_STATUS.active && vote.endDate <= new Date()){
        await updateVoteStatus(vote.id, VOTE_STATUS.completed);
      }
    }
  }
  catch (error) {
    console.error("Error getting up-to-date votes:", error);
  }
}
