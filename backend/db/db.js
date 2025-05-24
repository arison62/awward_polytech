import { Sequelize } from "sequelize"

const ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL

let sequelize;
if(ENV === 'development'){
    sequelize = new Sequelize( {
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: true
    });
}else{
    sequelize = new Sequelize(DATABASE_URL);
}


const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
export { connectDB, sequelize }