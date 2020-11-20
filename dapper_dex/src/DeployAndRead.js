import React from 'react';
import * as fcl from '@onflow/fcl';
import { Button } from  'react-bootstrap'
import hello from './contracts/build/HelloWorld.js'
import script from './contracts/build/Script.js'
import { template as setCode } from "@onflow/six-set-code"

class DeployAndRead extends React.Component {
  constructor() {
    super();
    this.state = {}
    this.sendTransaction = this.sendTransaction.bind(this)
    this.deployContract = this.deployContract.bind(this)
    this.sendScript = this.sendScript.bind(this)
    this.authenticate = this.authenticate.bind(this)
    this.unauthenticate = this.unauthenticate.bind(this)
  }

  componentDidMount() {
    this.unauthenticate()
  }

  authenticate(){
    fcl.authenticate().then((response) => {
      this.setState({account: response.addr});
    })
  }
  
  unauthenticate(){
    this.setState({account: undefined})
    fcl.unauthenticate()
  }

  sendScript(){
    this.setState({
      script: undefined
    });
    sendScript(script).then((resolve, reject) => {
      this.setState({
        script: resolve
      });
      console.log("SCRIPTT: ", resolve)
    }).catch(err => {
      console.log("Error running script: ", err)
    })
  }

  deployContract() {
    this.setState({
      contract: undefined,
      address: undefined
    });
    deployContract(hello).then((resolve, reject) => {
          this.setState({
            contract: resolve,
            address: resolve.events[0].data.address
          });
          console.log(resolve)
      }).catch(err => {
        console.log("error during deployment:", err)
      })
  }

  sendTransaction() {
    let code = `import HelloWorld from ` + this.state.address + `
    transaction {
    
      prepare(acct: AuthAccount) {
        log("Hello from prepare")
      }
    
      execute {
        log(HelloWorld.hello())
      }
    }`

    this.setState({
      transaction: undefined
    });
    sendTransaction(code).then((resolve, reject) => {
      this.setState({
        transaction: resolve
      });
      console.log("TRANSACTION: ", resolve)
    }).catch(err => {
      console.log("Error sending transactions: ", err)
    }) 
  }

  render() {
   return (
      <div>
        <h1> Account: {this.state.account} </h1>
        <Button variant = "primary" onClick={this.authenticate} disabled={this.state.account !== undefined}>
          authenticate
        </Button>

        <Button variant = "primary" onClick={this.unauthenticate} disabled={this.state.account === undefined}>
          unauthenticate
        </Button>

        <pre className="textBox">
          {JSON.stringify(this.state.script, null, 2)}
        </pre>

        <Button variant = "primary" onClick={this.sendScript}>
          send script
        </Button>


        <pre className="textBox"> 
          {JSON.stringify(this.state.contract, null, 2)}
        </pre>

        <div style = {{display: 'inline-block'}}> 
        <Button variant = "primary" onClick={this.deployContract} disabled={this.state.account === undefined}>
          deploy  BABToken contract
        </Button>

        <Button variant = "primary" onClick={this.deployContract} disabled={this.state.account === undefined}>
          deploy FLOWToken contract
        </Button>

        <Button variant = "primary" onClick={this.deployContract} disabled={this.state.account === undefined}>
          deploy LPtoken contract
        </Button>
        </div>

        <pre className="textBox">
          {JSON.stringify(this.state.transaction, null, 2)}
        </pre>

        <Button variant = "primary" onClick={this.sendTransaction} >
          send transaction
        </Button>

      </div>
   );
  }
}
export default DeployAndRead;

const sendScript = async (code) => {
      const response = await fcl.send([
              fcl.script(code)
          ]);
      return await fcl.decode(response);
  };

const deployContract = async (code) => {
  
  const response = await fcl.send([
      setCode({
          proposer: fcl.currentUser().authorization,
          authorization: fcl.currentUser().authorization,     
          payer: fcl.currentUser().authorization,             
          code: code,
          limit: fcl.limit(999)
      })
  ])

try {
  return await fcl.tx(response).onceExecuted()
} catch (error) {
  return error;
}
}

const sendTransaction = async (code) => {
const authz = fcl.currentUser().authorization
const response = await fcl.send([
  fcl.transaction(code),
  fcl.proposer(authz),
  fcl.payer(authz),
  fcl.authorizations([ authz]),
  fcl.limit(999),
])

try {
  return await fcl.tx(response).onceExecuted()
} catch (error) {
  return error;
}
}