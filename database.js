// database.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const Config = sequelize.define('Config', {
    month: {
        type: DataTypes.STRING,
        allowNull: false
    },
    postings: {
        type: DataTypes.JSON,
        allowNull: false
    },
    allposting: {
        type: DataTypes.JSON,
        allowNull: false
    }
});

const initializeDatabase = async () => {
    await sequelize.sync();
};

module.exports = { Config, initializeDatabase, sequelize };
