const TronWeb = require('tronweb')
const tronWeb = new TronWeb({
    fullHost: process.env.TRONGRID_API_ENDPOINT,
    privateKey: process.env.PRIVATE_KEY
})

module.exports = tronWeb;