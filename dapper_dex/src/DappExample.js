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
import DepositLiquidity from './cdcTransactions/DepositLiquidity'
import WithdrawLiquidity from './cdcTransactions/WithdrawLiquidity'
import SwapTokens from './cdcTransactions/Swap'
import getTokenPrices from './cdcScripts/getTokenPrices';

class DappExample extends React.Component {
    constructor() {
      super();
      this.state = {
        authUsers: [],
        babBalance: 0,
        flowBalance: 0,
        depositAmount: null,
        swapAmount: null,
        withdrawAmount: null,
        quotedPriceAmt: 0
      }
    
      this.sendTransaction = this.sendTransaction.bind(this)
      this.deployContract = this.deployContract.bind(this) 
      this.authenticate = this.authenticate.bind(this)
      this.unauthenticate = this.unauthenticate.bind(this) 
    }

    componentDidMount() {
      this.unauthenticate() 
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

    depositLiquidity = async () => { 
      const authz = fcl.currentUser().authorization
      const response = await fcl.send([
        fcl.transaction(DepositLiquidity(this.state.depositAmount)),
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

    withdrawLiquidity = async () => { 
      const authz = fcl.currentUser().authorization
      const response = await fcl.send([
        fcl.transaction(WithdrawLiquidity(this.state.withdrawAmount)),
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

    getQuotedPrice = () => { 
      this.sendScriptQuotaPrice(getTokenPrices(1,this.state.swapAmount)).then((resolve, reject) => {
        this.setState({
          quotedPriceAmt: resolve.OutputPrice,
        }) 
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

    swapTokens = async(type) => {
      console.log(type)
      const authz = fcl.currentUser().authorization
      const response = await fcl.send([ 
        fcl.transaction(SwapTokens(this.state.swapAmount, type === "xtoy" ? 1 : 0)),
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

    /**
     * FLOW CORE FUNCTIONS  
     **/
    sendScript = async (code) => {  
      return fcl.send([
              fcl.script(code), 
              fcl.args([
                fcl.arg(this.state.account, t.Address),
              ])
      ]).then(fcl.decode);

      //return response;
    };

    sendScriptQuotaPrice = async (code) => {  
      return fcl.send([
              fcl.script(code),  
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

          <br/>
          <input 
            placeholder = "Enter the Deposit amount"
            value = {this.state.depositAmount}
            onChange={(event) => this.setState({depositAmount: event.target.value})}
          />
          <button onClick = {() => this.depositLiquidity()}>
            Deposit Liquidity
          </button>
        
          <br/>
 

          <input 
            placeholder = "Enter the Swap Amount"
            value = {this.state.swapAmount}
            onChange={(event) => this.setState({swapAmount: event.target.value})}
          />
          <button onClick = {() => this.swapTokens("xtoy")}>
            SWAP X TO Y
          </button>
          
          <button onClick = {() => this.swapTokens("ytox")}>
            SWAP Y TO X
          </button>
          <button onClick = {() => this.getQuotedPrice()}>
            Get Quoted Price
          </button>
          <br/> 
          <p> Quoted Price: {this.state.quotedPriceAmt} </p>

          <br/>
          <input 
            placeholder = "Enter the Withdraw amount"
            value = {this.state.withdrawAmount}
            onChange={(event) => this.setState({withdrawAmount: event.target.value})}
          />
          <button onClick = {() => this.withdrawLiquidity()}>
            Withdraw Liquidity
          </button>

          <br/> <br/> <br/> <br/>


        </React.Fragment>
     );
    }
  }
export default DappExample;
 