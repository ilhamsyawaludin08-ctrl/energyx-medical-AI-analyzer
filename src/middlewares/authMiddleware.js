const { Client } = require('../models')
const crypto = require('crypto')

module.exports = async (req, res, next) => {
    const apiKeyHeader = req.headers['x-api-key'];
    const hospitalCodeHeader = req.headers['x-hospital-code']
    const timestamp = req.headers['x-timestamp']
    const max_time_diff = process.env.MAX_TIME_DIFF * 1000
    const signatureHeader = req.headers['x-signature']
    
    if (!apiKeyHeader) {
        return res.status(401).json({
            code: 401,
            success: false,
            message: 'Missing API Key'
        });
    }

    if (!hospitalCodeHeader) {
        return res.status(401).json({
            code: 401,
            success: false,
            message: 'Missing Hospital Code'
        });
    }

    if (!timestamp) {
        return res.status(401).json({
            code: 401,
            success: false,
            message: 'Missing Timestamp'
        });
    }

    if (!signatureHeader) {
        return res.status(401).json({
            code: 401,
            success: false,
            message: 'Missing Signature'
        });
    }

    const now = Date.now();

    if (isNaN(timestamp)) {
        return res.status(400).json({
            code: 400, 
            success: false, 
            message: 'Invalid timestamp format' 
        });
    }
    
    if (Math.abs(now - timestamp) > max_time_diff) {
        return res.status(401).json({
            code: 401,
            success: false,
            message: 'Request expired'
        });
    }

    const validHeader = await Client.findOne({
        where: {
            key: apiKeyHeader,
            hospital_code: hospitalCodeHeader,
        }
    })

    if (!validHeader) {
        return res.status(401).json({
            code: 401,
            success: false,
            message: 'Invalid API key or hospital code'
        });
    }

    const rawData = hospitalCodeHeader + apiKeyHeader + timestamp;
    const signature = crypto.createHmac('sha256', apiKeyHeader).update(rawData).digest('hex');
    
    if (signatureHeader !== signature) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: 'Invalid signature'
        });
    }

    req.user = validHeader

    next();
};
