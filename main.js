require('dotenv').config();
const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
const { KmsAuthorizer } = require("fcl-kms-authorizer");
const { fromEnv } = require("@aws-sdk/credential-providers");

const region = "us-east-1";
const keyIds = ["PUT YOUR KEYID HERE"];

// NOTE: REMEMBER TO CONFIGURE YOUR .env FILE

fcl.config()
  .put("accessNode.api", "https://testnet.onflow.org");

async function doStuff() {
  const authorizer = new KmsAuthorizer(
    {
      credentials: fromEnv(),
      region
    },
    keyIds
  )

  // const publicKey = await authorizer.getPublicKey();
  // console.log({publicKey});

  const address = "0xdd74b5113f0ac890";
  const keyIndexes = [0];

  const authorization = authorizer.authorize(address, keyIndexes);

  const txId = await fcl.send([
    fcl.transaction`
    import HelloWorld from 0xe37a242dfff69bbc

    transaction(newGreeting: String) {
      prepare(signer: AuthAccount) {

      }

      execute {
        HelloWorld.changeGreeting(newGreeting: newGreeting)
      }
    }
    `,
    fcl.args([
      fcl.arg("Jacob rocks oh my god", t.String)
    ]),
    fcl.payer(authorization),
    fcl.proposer(authorization),
    fcl.authorizations([authorization]),
    fcl.limit(999)
  ]).then(fcl.decode);

  console.log({txId})
}

doStuff();