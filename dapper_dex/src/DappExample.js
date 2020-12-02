import React from 'react';
import * as fcl from '@onflow/fcl';
import hello from './contracts/build/HelloWorld.js'
import script from './contracts/build/Script.js'
import { template as setCode } from "@onflow/six-set-code"
import * as t from "@onflow/types"
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
import CheckFlowBabBalance from './contracts/build/CheckBalance'
import CreatePeacockDex from './contracts/build/CreateDex'
import SwapXtoY from './contracts/build/SwapXtoY'

class DappExample extends React.Component {
    constructor() {
      super();
      this.state = {
        authUsers: [],
        babBalance: 0,
        flowBalance: 0,
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

    depositLiquidity = async () => {
      const authz = fcl.currentUser().authorization
      const response = await fcl.send([
        fcl.transaction(` 
        import FlowToken from 0x179b6b1cb6755e31
        import BabToken from 0x01cf0e2f2f715450
        import LPToken from 0xf3fcd2c1a78f5eee
        import DapperDex from 0xe03daebed8ca0615
        
        transaction {
          prepare(acct: AuthAccount) { 
            
            let LPAccount = getAccount(0xf3fcd2c1a78f5eee)
            var xAmount = UFix64(25)
            let dexCap = LPAccount.getCapability<&DapperDex.Pool{DapperDex.PoolPublic}>(/public/DexPool)
            let dexRef = dexCap!.borrow()!
        
            let flowVault = acct.borrow<&{FlowToken.Receiver, FlowToken.Provider, FlowToken.Balance}>(from: /storage/FlowVault)
                    ?? panic("Could not borrow a reference to 0x03's Flow Vault")
            let babVault = acct.borrow<&{BabToken.Receiver, BabToken.Provider, BabToken.Balance}>(from: /storage/BabVault)
                    ?? panic("Could not borrow a reference to 0x03's BabVault")
                    var lpVaultOptional = acct.borrow<&{LPToken.Receiver, LPToken.Provider, LPToken.Balance}>(from: /storage/LPVault)
                    ?? nil
        
            //   element.save<@LPToken.Vault>(<-vault, to: /storage/LPVault)
            if(lpVaultOptional == nil){
                let empty_lpVault <- LPToken.createEmptyVault()
                acct.save<@LPToken.Vault>(<-empty_lpVault, to: /storage/LPVault)
                acct.link<&LPToken.Vault{LPToken.Receiver, LPToken.Balance}>(/public/LPReceiver, target: /storage/LPVault)
            }  
        
            let lpVault = acct.borrow<&{LPToken.Receiver, LPToken.Provider, LPToken.Balance}>(from: /storage/LPVault)
                    ?? panic("Could not borrow a reference to 0x03's LPVault")
            
            log("BEFORE")
            log(babVault.balance)
            log(flowVault.balance)
            dexRef.depositLiquidity(from1: <- flowVault.withdraw(amount: UFix64(25)), 
                from2: <- babVault.withdraw(amount: UFix64(25)), 
                to: lpVault, 
                x_amount: xAmount
            )
            log("AFTER")
            log(babVault.balance)
            log(flowVault.balance)
        
            }
        
          execute {
                log("SUCCESS") 
            }
            
        }
        `),
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

    checkBalance = () => {
      this.sendScript(CheckFlowBabBalance).then((resolve, reject) => {
        console.log(resolve)
        this.setState({
          flowBalance: resolve.flowBalance,
          babBalance: resolve.babBalance
        });
      }).catch(err => {
        console.log(err)
      })
    }

    createDex = () => {
      this.sendTransaction(CreatePeacockDex, this.state.authUsers).then((resolve, reject) => {
        console.log(resolve)
        this.setState({
          transaction: resolve
        });
      }).catch(err => {
        console.log(err)
      })
    }

    swapTokens = () => {
      this.sendTransaction(SwapXtoY, this.state.authUsers).then((resolve, reject) => {
        console.log(resolve)
        this.setState({
          transaction: resolve
        });
      }).catch(err => {
        console.log(err)
      })
    }

    authenticate(){
      fcl.authenticate().then((response) => {
        console.log(response)
        this.setState({account: response.addr}, () => {
          //this.checkBalance()
        });
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
      this.sendScript(script).then((resolve, reject) => {
        this.setState({
          script: resolve
        });
    })
    }

    deployContractCall(contractName) {   
      var cName;
      
      this.setState({
        contract: undefined,
        address: undefined
      })

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

      this.deployContract(cName).then((resolve, reject) => { 
            console.log(resolve)
            this.setState({
              contract: resolve,
              address: resolve.events[0].data.address
            }); 
        }).catch(err => {
          console.log("FAILURE", err)
        })
    }

    createVaultTransaction(vaultName) {
      var vName;
      if(vaultName === "cvflow") {
        vName = CreateEmptyFlowVault
      } else if (vaultName === "cvbab") {
        vName = CreateEmptyBabVault
      } else {
        return 0
      }

      this.setState({
        transaction: undefined
      }); 

      this.sendTransaction(vName, this.state.authUsers).then((resolve, reject) => {
        this.setState({
          transaction: resolve
        });
      }).catch(err => {
        console.log(err)
      })
    }

    fundVaultTransaction(vaultName) {
      var vName;
       if (vaultName === "ftbab") {
        vName = FundEmptyBabVault
      } else if (vaultName === "ftflow") {
        vName = FundEmptyFlowVault
      } else {
        return 0
      }

      this.setState({
        transaction: undefined
      }); 

      this.sendTransaction(vName, this.state.authUsers).then((resolve, reject) => {
        this.setState({
          transaction: resolve
        }, () => {
          //this.checkBalance()
        })
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

    /**
     * FLOW CORE FUNCTIONS  
     **/
    sendScript = async (code) => { 
      console.log(this.state.account)
      return fcl.send([
              fcl.script(code), 
              fcl.args([
                fcl.arg(this.state.account, t.Address),
              ])
      ]).then(fcl.decode);

      //return response;
    };

    deployContract = async (code) => {
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

    sendTransaction = async (code, auth) => {
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


    render() { 
     return (
        <React.Fragment>
            <h1> Current User: {this.state.account} </h1>
            <p> Flow balance: {this.state.flowBalance} </p>
            <p> Bab Balance: {this.state.babBalance} </p>
          <button onClick={this.authenticate} disabled={this.state.account !== undefined}>
            authenticate
          </button>

          <button onClick={this.unauthenticate} disabled={this.state.account === undefined}>
            unauthenticate
          </button>

          <pre className="textBox">
            {JSON.stringify(this.state.contract, null, 2)}
          </pre> 

        <div style = {{display: 'inline-block'}}> 
          <button variant = "primary" onClick={() => this.deployContractCall("bab")} disabled={this.state.account === undefined}>
            deploy  BABToken contracts
          </button>
          &nbsp;
          <button variant = "primary" onClick={() => this.deployContractCall("flow")} disabled={this.state.account === undefined}>
            deploy FLOWToken contracts
          </button>
          &nbsp;
          <button variant = "primary" onClick={() => this.deployContractCall("lp")} disabled={this.state.account === undefined}>
            deploy LPtoken contracts
          </button>
          &nbsp;
          <button variant = "primary" onClick={() => this.deployContractCall("dex")} disabled={this.state.account === undefined}>
            deploy Dapper Dex contracts
          </button>
        </div>

          <pre className="textBox">
            {JSON.stringify(this.state.transaction, null, 2)}
          </pre>

          <button onClick={() => this.createVaultTransaction('cvflow')} >
            Create Empty Vault flow
          </button>

          <button onClick={() => this.createVaultTransaction('cvbab')} >
            Create Empty Vault bab
          </button>

          <br/> <br/>

          <button onClick={() => this.fundVaultTransaction('ftflow')} >
            FUND Empty Vault flow
          </button>

          <button onClick={() => this.fundVaultTransaction('ftbab')} >
            FUND Empty Vault bab
          </button> 
          
          <br/> <br/>
          
          <button onClick = {() => this.checkBalance()}>
            Get balance 
          </button>

          <button onClick = {() => this.createDex()}>
            Create Peacock Dex 🦚
          </button>
          
          <br/> <br/>

          <button onClick = {() => this.swapTokens()}>
            SWAP X TO Y
          </button>

          <input 
          
          />
          <button onClick = {() => this.depositLiquidity()}>
            Deposit Liquidity
          </button>

          

        </React.Fragment>
     );
    }
  }
export default DappExample;
 