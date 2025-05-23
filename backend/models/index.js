// models/index.js
import { sequelize } from '../db/db.js';

// Importez tous vos modèles
import AdminModel from './Admin.js';
import VoteModel from './Vote.js';
import CategoryModel from './Category.js';
import StudentModel from './Student.js';
import CandidacyModel from './Candidacy.js';
import StudentVoteModel from './StudentVote.js';
import GroupModel from './Group.js';


const models = {
    Admin: AdminModel(sequelize),
    Vote: VoteModel(sequelize),
    Category: CategoryModel(sequelize),
    Student: StudentModel(sequelize),
    Candidacy: CandidacyModel(sequelize),
    Group: GroupModel(sequelize),
    StudentVote: StudentVoteModel(sequelize),
};

// Appliquez les associations
Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

export { sequelize };
export default models;