const { Op } = require('sequelize');
const { Client } = require("../models")

const save = async (data) => {
    return Client.create(data);
}

module.exports = {
    save,
}