import React from 'react';
import * as fcl from '@onflow/fcl';
import hello from './contracts/build/HelloWorld.js'
import script from './contracts/build/Script.js'
import { template as setCode } from "@onflow/six-set-code"
import './DappExample.css'
// Dapper imports 
import BabToken from './contracts/build/BabToken'
import FlowToken from './contracts/build/FlowToken'
import LPToken from './contracts/build/LPToken'
import DapperDex from './contracts/build/DapperDex'
// Transaction imports 
import CreateEmptyFlowVault from './contracts/build/CreateEmptyVault_flow'
import CreateEmptyBabVault from './contracts/build/CreateEmptyVault_bab'
import FundEmptyFlowVault from './contracts/build/FundEmptyVault_flow'
import FundEmptyBabVault from './contracts/build/FundEmptyVault_bab'


class DappExample extends React.Component {
    constructor() {
      super();
      this.state = {
        authUsers: []
      }
      this.sendTransaction = this.sendTransaction.bind(this)
      this.deployContract = this.deployContract.bind(this)
      this.sendScript = this.sendScript.bind(this)
      this.authenticate = this.authenticate.bind(this)
      this.unauthenticate = this.unauthenticate.bind(this)
      this.getAuth = this.getAuth.bind(this)
    }

    componentDidMount() {
      this.unauthenticate()
    }

    authenticate(){
      fcl.authenticate().then((response) => {
        console.log(response)
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
    })
    }

    deployContract(contractName) {   
      var cName;
      this.setState({
        contract: undefined,
        address: undefined
      });

     if(contractName === "bab") {
        cName = BabToken
      } else if (contractName === "flow") {
        cName = FlowToken
      } else if (contractName === "lp") {
        cName = LPToken
      } else if (contractName === "dex") {
        cName = DapperDex
      } 
      else {
        return 0
      } 

      deployContract(cName).then((resolve, reject) => { 
            console.log(resolve)
            this.setState({
              contract: resolve,
              address: resolve.events[0].data.address
            }); 
        }).catch(err => {
          console.log("FAILURE", err)
        })
    }

    sendTransaction(vaultName) {
      var vName;
      if(vaultName === "cvflow") {
        vName = CreateEmptyFlowVault
      } else if (vaultName === "cvbab") {
        vName = CreateEmptyBabVault
      } else if (vaultName === "ftbab") {
        vName = FundEmptyBabVault
      } else if (vaultName === "ftflow") {
        vName = FundEmptyFlowVault
      } else {
        return 0
      }

      this.setState({
        transaction: undefined
      }); 

      sendTransaction(vName, this.state.authUsers).then((resolve, reject) => {
        this.setState({
          transaction: resolve
        });
      }).catch(err => {
        console.log(err)
      })
    }

    getAuth (){ 
      this.setState(previousState => ({
        authUsers: [...previousState.authUsers, fcl.currentUser().authorization]
    }));
    console.log(this.state.authUsers)
    }

    render() { 
     return (
        <React.Fragment>
            <h1> Current User: {this.state.account} </h1>
          <button onClick={this.authenticate} disabled={this.state.account !== undefined}>
            authenticate
          </button>

          <button onClick={this.unauthenticate} disabled={this.state.account === undefined}>
            unauthenticate
          </button>

          <pre className="textBox">
            {JSON.stringify(this.state.script, null, 2)}
          </pre>

          <button onClick={this.sendScript}>
            send script
          </button>


          <pre className="textBox">
            {JSON.stringify(this.state.contract, null, 2)}
          </pre> 

        <div style = {{display: 'inline-block'}}> 
          <button variant = "primary" onClick={() => this.deployContract("bab")} disabled={this.state.account === undefined}>
            deploy  BABToken contracts
          </button>
          &nbsp;
          <button variant = "primary" onClick={() => this.deployContract("flow")} disabled={this.state.account === undefined}>
            deploy FLOWToken contracts
          </button>
          &nbsp;
          <button variant = "primary" onClick={() => this.deployContract("lp")} disabled={this.state.account === undefined}>
            deploy LPtoken contracts
          </button>
          &nbsp;
          <button variant = "primary" onClick={() => this.deployContract("dex")} disabled={this.state.account === undefined}>
            deploy Dapper Dex contracts
          </button>
        </div>

          <pre className="textBox">
            {JSON.stringify(this.state.transaction, null, 2)}
          </pre>

          <button onClick={() => this.sendTransaction('cvflow')} >
            Create Empty Vault flow
          </button>

          <button onClick={() => this.sendTransaction('cvbab')} >
            Create Empty Vault bab
          </button>

          <br/> <br/>

          <button onClick={() => this.sendTransaction('ftflow')} >
            FUND Empty Vault flow
          </button>

          <button onClick={() => this.sendTransaction('ftbab')} >
            FUND Empty Vault bab
          </button>

          <button onClick = {this.getAuth}>
            Get Auth Z
          </button>

        </React.Fragment>
     );
    }
  }
export default DappExample;

const sendScript = async (code) => {
        const response = await fcl.send([
                fcl.script(code)
            ]);
        return await fcl.decode(response);
    };
 
const deployContract = async (code) => {
  const authz = fcl.currentUser().authorization
    const response = await fcl.send([
        setCode({
            proposer: authz,
            authorization: authz,     
            payer: authz,             
            code: code, 
        }),
       fcl.limit(1000),
    ])
  
  try { 
    return await fcl.tx(response).onceExecuted()
  } catch (error) { 
    return error;
  }
}

const sendTransaction = async (code, auth) => {
  const authz = fcl.currentUser().authorization
  const response = await fcl.send([
    fcl.transaction(code),
    fcl.proposer(authz),
    fcl.payer(authz),
    fcl.authorizations([
      authz
    ]),
    fcl.limit(1000)
  ])

  try {
    return await fcl.tx(response).onceExecuted()
  } catch (error) {
    return error;
  }
}
 