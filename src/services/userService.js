const userRepository = require("../repositories/userRepository");
const handleError = require('../monitor/errorHandler');

const getByUserName = async (username) => {
    try {
        const res = await userRepository.getByUserName(username);
        return res;
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
        const res = await userRepository.save(data);
        return res;
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
        const res = await userRepository.updatePassword(id, data);
        return res;
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
    updatePassword,
};