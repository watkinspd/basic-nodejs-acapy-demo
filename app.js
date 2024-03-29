const express = require('express')
const app = express()
const qrCode = require('qrcode')
const lib = require('./lib')  // pushed some helper functions to a library to reduce code size here
const postToAcapy = lib.postToAcapy
const app_js_runs_localhost = 'localhost:8021'  
const app_js_runs_in_docker = 'host.docker.internal:8021'   
const acapy_hostname = app_js_runs_localhost //change the reference to relect decision to run localhost or in docker container

const proofReq = { "trace": false,
                  "comment": "string",
                  "connection_id": "", // populated on a per-inviation basis
                  "proof_request": {
                      "name": "candy-dev-demo",
                      "version": "0.0.1",
                      "requested_attributes": { // from https://openvp-candy-dev.vonx.io/
                        "Given Names": { "name": "given_names",
                                          "restrictions": [{ "schema_name": "unverified_person",
                                                              "schema_version": "0.1.0",
                                                              "issuer_did": "9wVuYYDEDtpZ6CYMqSiWop" } ] },
                        "Family Name": { "name": "family_name",
                                          "restrictions": [{ "schema_name": "unverified_person",
                                                              "schema_version": "0.1.0",
                                                              "issuer_did": "9wVuYYDEDtpZ6CYMqSiWop" } ] },
                        "Region": { "name": "region",
                                      "restrictions": [{ "schema_name": "unverified_person",
                                                          "schema_version": "0.1.0",
                                                          "issuer_did": "9wVuYYDEDtpZ6CYMqSiWop" } ] } },
                      "requested_predicates": {}
                    } }

app.use( express.json() )

// makes a new connection invitation
// use curl or browser to http://localhost:9090/start/using/consolelog
// then check the terminal window running this app for the QR code
app.get( '/start/using/consolelog', async ( req, res ) => {
    console.log( '-------received /start/using/consolelog --------')
    console.log('Scan the QR Code with your wallet')
    console.log('You may need to change font, line spacing, resize or adjust the terminal window in order for the QR code to render')

    // create a connection invitation
    const acapyRes = await postToAcapy(
    'http://' + acapy_hostname + '/out-of-band/create-invitation?alias=pdub&auto_accept=true&multi_use=false',
        {
            "accept": [
              "didcomm/aip1",
              "didcomm/aip2;env=rfc19"
            ],
            "handshake_protocols": [
              "https://didcomm.org/connections/1.0"
            ]
          })    
         const acapyResult = JSON.parse(acapyRes)
    qrCode.toString(acapyResult.invitation_url, {type:'terminal', 'small': true, 'scale': 1}, function (err, url) {
        console.log(url) })
    // when a user scans this QR code it kicks off a connection
    // the connection is handled through the app.post that follows below
        console.log( '----------------------------------------')
    res.sendStatus( 200 )
} )

// make a proof request when a connection becomes active
app.post( '/topic/connections', async ( req, res ) => {
    console.log( '-------received /topic/connection  --------')
    // we started acapy with the autoconnection option
    // so in this simple demo app we just wait for the connection invitation to go active
    console.log(req.body.state)
    switch (req.body.state) {
        case "response":  // ping the connection 2.5 and 5 seconds from now and hope it goes active
            console.log('got connection response - set to ping in 5seconds in case does not go active')
            console.log(req.body.connection_id)
            var acapyRes = setTimeout(postToAcapy, 2500, 'http://' + acapy_hostname + '/connections/' + req.body.connection_id + '/send-ping',
                { "comment": "ping" } )
            var acapyRes = setTimeout(postToAcapy, 5000, 'http://' + acapy_hostname + '/connections/' + req.body.connection_id + '/send-ping',
                { "comment": "ping" } )
            break

        case "active":  // now we can send proof request
            console.log('sending proof request')
            console.log(req.body.connection_id)
            proofReq.connection_id = req.body.connection_id
            var acapyRes = await postToAcapy('http://' + acapy_hostname + '/present-proof/send-request', proofReq)
            break
        }
    console.log( '----------------------------------------------')
    res.sendStatus( 200 )
} )

// process receipt of proof request
app.post( '/topic/present_proof', async ( req, res ) => {
    console.log( '-------received /topic/present_proof  --------')
    console.log(req.body.state)
    switch (req.body.state) {
        case "presentation_received":
            console.log('Presentation of proof received')
            break

        case "verified":  // we started acapy with autoverify option so we just wait to be called here
            console.log('<><><><><><>< Success! Verified  ><><><><><><><><>')
            console.log(req.body.presentation.requested_proof.revealed_attrs['Given Names'].raw)
            console.log(req.body.presentation.requested_proof.revealed_attrs['Family Name'].raw)
            console.log(req.body.presentation.requested_proof.revealed_attrs['Region'].raw)
            console.log('<><><><><><><><><><><><><><><><><><><><><><><><><>')
            break
    }
    console.log( '----------------------------------------------')
    res.sendStatus( 200 )
} )

// Do not bother processing anything else that is received or requested.
app.post( '/*', async ( req, res ) => {
    console.log( '-------received post -------')
    console.log(req.originalUrl )
    console.log( '----------------------------')
    res.sendStatus( 200 )
} )

app.listen( 9090, () => console.log( 'app.js server started on port 9090.' ) )