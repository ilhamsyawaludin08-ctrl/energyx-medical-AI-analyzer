const { ApiResponse } = require('../utils/apiResponse');
const clientService = require("../services/clientService")
const crypto = require('crypto')

exports.save = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({
                status: 400,
                error: 'Field name wajib diisi'
            });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const key = crypto.randomBytes(32).toString('hex')
        
        const data = {
            hospital_code: code,
            name: req.body.name,
            address: req.body.address ? req.body.address : null,
            key: key
        }
        
        const result = await clientService.save(data)
        
        return new ApiResponse(res)
            .success('Rumah Sakit berhasil ditambahkan')
            .data(result)
            .send();
    } catch (error) {
        return new ApiResponse(res)
            .status(error.statusCode || 500)
            .error(error.message || 'Terjadi kesalahan pada server')
            .send();
    }
}