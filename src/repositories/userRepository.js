const { User, Client, Department } = require("../models");
const handleError = require('../monitor/errorHandler');

const getByUserName = async (username) => {
    try {
        return await User.findOne({
            // attributes: ['id', 'name', 'username', 'email', 'hospital_code'],
            where: { username },
            include: [
                {
                  model: Department,
                  as: 'department'
                },
                {
                    model: Client,
                    attributes: ['id', 'hospital_code', 'name', 'address'],
                    as: 'hospital'
                }
            ]
        });
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });
        
        throw error
    }
}

const save = async (data) => {
    try {
        return await User.create(data);
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });

        throw error
    }
}

const updatePassword = async (id, data) => {
    try {
        return await User.update(
            {
                password: data
            },
            {
                where: { id }
            }
        );
    } catch (error) {
        handleError('error', {
            type: error.name,
            message: error.message,
            stack: error.stack
        });

        throw error
    }
}

module.exports = {
    getByUserName,
    save,
    updatePassword
}