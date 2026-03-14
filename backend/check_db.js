
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Extract DB config from config file
const config = require('./src/config/database');

const sequelize = new Sequelize(config.development); // Use development config

async function check() {
  try {
    const [plans] = await sequelize.query("SELECT * FROM \"Plans\"");
    console.log("PLANS:", JSON.stringify(plans, null, 2));
    
    const [companies] = await sequelize.query("SELECT * FROM \"Companies\"");
    console.log("COMPANIES:", JSON.stringify(companies, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
