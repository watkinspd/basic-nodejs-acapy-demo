const https = require('node:http') // https would be great but we need to easily handle localhost so http substituted for https

async function postToAcapy(url, data) {
    // Handles posting to the acapy admin api's
    // currently returns in string format NOT json

    const dataString = JSON.stringify(data)  
    const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length,
        },
        timeout: 1000, // in ms
    }

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
        if (res.statusCode < 200 || res.statusCode > 299) {
            return reject(new Error(`HTTP status code ${res.statusCode}`))
        }

        const body = []
        res.on('data', (chunk) => body.push(chunk))
        res.on('end', () => {
            const resString = Buffer.concat(body).toString()
            resolve(resString)
        })
        })

        req.on('error', (err) => {
        reject(err)
        })

        req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request time out'))
        })

        req.write(dataString)
        req.end()
    })
}

module.exports.postToAcapy = postToAcapy
