
# basic-nodejs-acapy-demo

  Most basic demo leveraging hyperledger aries cloud agent python (acapy) using nodejs and express.

## Status: functional

- Works for me on my Windows 11 setup that includes Windows Subsystem for Linux
- Works for me on MacOS 12.6

## Before you start

- Go to

      https://github.com/hyperledger/aries-cloudagent-python

- Run the following demos a couple of times until you are comfortable repeating them:

      https://vonx.io/how_to/iiwbook
      https://github.com/hyperledger/aries-cloudagent-python/blob/main/demo/AriesOpenAPIDemo.md#running-in-docker

## Outline of how this basic demo app currently "works"

## Requirements

- ngrok for creating a publicly accessible route to localhost port that provides the service endpoint of the acapy docker container
- docker such as docker desktop for windows or mac for running an instance of acapy in a docker container on your local machine
- nodejs and npm for running the basic nodejs/express controller app (webhook server) on your local machine

## Wallet and Credential

- Get a wallet app on your smartphone that can work with credentials of issuers that use the CANdy-dev ledger.

      https://apps.apple.com/us/app/bc-wallet/id1587380443
      https://play.google.com/store/apps/details?id=ca.bc.gov.BCWallet

- Get a non-verified person credential that is intended for developers (like you) to test with. Get one from

      https://openvp-candy-dev.vonx.io/

- Note: the openvp-candy-dev.vonx.io is an issuer using the CANdy-dev ledger intended for developers to work with.

      https://candyscan.idlab.org/home/CANDY_DEV

## Expose the service endpoint so you (the holder) can interact

- Open a new terminal window and use Ngrok to expose port 8020

      ngrok http 8020

  Copy the public route url that ngrok generates and paste it into the **endpoint:** of the confguration options below.

## Run acapy in a docker container on your local machine

### Clone hyperledger aries cloudagent python

      git clone https://github.com/hyperledger/aries-cloudagent-python.git

### Run acapy in a docker container

- Run an instance of acapy in docker that enables the admin api
- **Assumes** : ports 8020 for service endpoint, 8021 for admin apis and api console, port 9090 for the localhost nodejs controller app (webhook-url)

- From a bash terminal goto the aries-cloudagent-python folder and run the following commands:

      export PORTS="8020:8020 8021:8021"
      ./scripts/run_docker start \
            --endpoint https://<your ngrok url goes here>  \
            --label pdub1 \
            --inbound-transport http 0.0.0.0 8020 \
            --outbound-transport http \
            --admin 0.0.0.0 8021 \
            --admin-insecure-mode \
            --webhook-url http://host.docker.internal:9090 \
            --wallet-type indy \
            --wallet-name pdubwallet \
            --wallet-key notagreatwalletkey \
            --wallet-local-did \
            --wallet-storage-type default \
            --auto-provision \
            --genesis-url https://candy-dev.idlab.org/genesis \
            --log-level DEBUG \
            --auto-accept-requests \
            --auto-verify-presentation

- The PORTS environment variable needs to be set correctly so that it is available to the run_docker script. If your container starts but you cannot browse to

      http://localhost:8021

  then check to see which ports the container has exposed. It should expose 8020, 8021. If these are not exposed check how you are setting the PORTS envionment variable before you run the run_docker script.

## Get and run the basic-nodejs-acapy-demo app

### Clone the nodejs controller app (webhook server)

      git clone https://github.com/watkinspd/basic-nodejs-acapy-demo.git
      cd ./basic-nodejs-acapy-demo
      npm install
  Review the app.js file to see how it works if you have not already done so.

### Start the controller app (webhook server)

- Start the basic demo app (controller) on your local machine

      npm start
  should start running and listening on port 9090

### Generate a connection request and receive a proof request

- Open another terminal window (we'll call it TERM1) and

      curl http://localhost:9090/start/using/consolelog

- Grab your wallet on your smartphone and scan the QR code that shows up in TERM1
- Watch your wallet for a proof request
- Watch the magic in TERM1 to see if your proof name and province code is received
