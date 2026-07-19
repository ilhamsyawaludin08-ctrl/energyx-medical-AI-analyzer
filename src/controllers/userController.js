const { ApiResponse } = require('../utils/apiResponse');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userService = require("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN

exports.save = async (req, res) => {
    try {
        const { 
            name, 
            username, 
            email, 
            password, 
            rs_id,
            department_id, 
            hospital_code 
        } = req.body;
        
        const hashedPassword = bcrypt.hashSync(password, 10)

        const data = {
            name: name,
            username: username,
            email: email,
            password: hashedPassword,
            rs_id: rs_id,
            department_id: department_id,
            hospital_code: hospital_code,
        }

        const userExist = await userService.getByUserName(username)
        
        if (userExist) {
            return new ApiResponse(res)
                .status(409)
                .error('Username already exists')
                .send();
        }

        const result = await userService.save(data)
        
        return new ApiResponse(res)
            .success('Berhasil registrasi user')
            .data(result)
            .send();
    } catch (error) {
        return new ApiResponse(res)
            .status(error.statusCode || 500)
            .error(error.message || 'Terjadi kesalahan pada server')
            .send();
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await userService.getByUserName(username)
        if (!user) return res.status(401).json({ message: 'User tidak ditemukan' });
        
        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Password salah' });


        console.log("=== LOGIN DEBUG ===");
        console.log("User:", user);
        console.log("Department:", user.department);
        console.log("Hospital:", user.hospital);
        console.log("JWT_SECRET:", JWT_SECRET);
        console.log("JWT_EXPIRES_IN:", JWT_EXPIRES_IN);
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.department?.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        res.json({
            token: token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                department: {
                    id: user.department.id,
                    name: user.department.name,
                },
                hospital: {
                    id: user.hospital.id,
                    name: user.hospital.name,
                    address: user.hospital.address,
                    hospital_code: user.hospital.hospital_code,
                },
            },
        })
    } catch (error) {
        return new ApiResponse(res)
            .status(error.statusCode || 500)
            .error(error.message || 'Terjadi kesalahan pada server')
            .send();
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const username = req.user.username
        const { password } = req.body;
        
        const hashedPassword = bcrypt.hashSync(password, 10)

        const userExist = await userService.getByUserName(username)
        
        if (!userExist) {
            return new ApiResponse(res)
                .status(404)
                .error('User not found')
                .send();
        }

        const result = await userService.updatePassword(req.user.id, hashedPassword)
        
        return new ApiResponse(res)
            .success('Berhasil update password')
            .data(result)
            .send();
    } catch (error) {
        return new ApiResponse(res)
            .status(error.statusCode || 500)
            .error(error.message || 'Terjadi kesalahan pada server')
            .send();
    }
}