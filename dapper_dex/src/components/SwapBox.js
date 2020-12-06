import React, { Component } from 'react';
import {DropdownButton, 
      InputGroup, 
      Dropdown, 
      FormControl,
      Button,
      Container,
      Row,
      Col
    } from 'react-bootstrap'
import { ArrowDownUp } from 'react-bootstrap-icons';
import SideBar from './SideBar'
import { template as setCode } from "@onflow/six-set-code"
import * as t from "@onflow/types"
import * as fcl from '@onflow/fcl';
// Dapper imports 
import BabToken from '../contracts/build/BabToken'
import FlowToken from '../contracts/build/FlowToken'
import LPToken from '../contracts/build/LPToken'
import DapperDex from '../contracts/build/DapperDex'
// Transaction imports 
import CreateEmptyFlowVault from '../contracts/build/CreateEmptyVault_flow'
import CreateEmptyBabVault from '../contracts/build/CreateEmptyVault_bab'
import FundEmptyFlowVault from '../contracts/build/FundEmptyVault_flow'
import FundEmptyBabVault from '../contracts/build/FundEmptyVault_bab'
import CheckFlowBabBalance from '../contracts/build/CheckBalance'
import CreatePeacockDex from '../contracts/build/CreateDex'  
import SwapTokens from '../cdcTransactions/Swap'
import getTokenPrices from '../cdcScripts/getTokenPrices';

class SwapBox extends Component {
  constructor() {
    super();
    this.state = {
      account: '',
      contract: null,
      output: null,
      page: 0,
      babBalance: 0,
      flowBalance: 0,
      dropDownValue: "Token Name",
      dropDownValue1: "Token Name",
      swapType: null,
      quotedPriceAmt: null,
      swapAmount: null,
      swapTypeText: null
    }

    this.authenticate = this.authenticate.bind(this)
    this.unauthenticate = this.unauthenticate.bind(this)
    this.gotoSetup = this.gotoSetup.bind(this)
    this.gotoSwap = this.gotoSwap.bind(this)
  }

  componentDidMount () { 
    this.unauthenticate()
  }

  authenticate() { 
    fcl.authenticate().then((response) => {
      console.log(response)
      this.setState({
        account: response.addr,
        output: response.addr
      }, () => {
        this.checkBalance()
      })
    }
    ) 
  }

  unauthenticate(){
    this.setState({account: ''})
    fcl.unauthenticate()
    this.setState({
      flowBalance: 0,
      babBalance: 0
    })
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
      this.checkBalance()
    }).catch(err => {
      console.log(err)
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
            output: resolve, 
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
        transaction: resolve,
        output: resolve,
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
        transaction: resolve,
        output: resolve, 
      }, () => {
        //this.checkBalance()
      })
    }).catch(err => {
      console.log(err)
    })
  }


  getQuotedPrice = (type) => { 
    this.sendScriptQuotaPrice(getTokenPrices(type,this.state.swapAmount)).then((resolve, reject) => {
      this.setState({
        quotedPriceAmt: resolve.OutputPrice,
      }) 
    }).catch(err => {
      console.log(err)
    })
  }

  swapTokens = async() => {
    const authz = fcl.currentUser().authorization
    const response = await fcl.send([ 
      fcl.transaction(SwapTokens(this.state.swapAmount, this.state.swapType)),
      fcl.proposer(authz),
      fcl.payer(authz),
      fcl.authorizations([
        authz
      ]),
      fcl.limit(1000)
    ])

    try {
    return await fcl.tx(response).onceExecuted().then((resolve) => {
      this.checkBalance()
      this.setState({
        swapAmount: null,
        quotedPriceAmt: null
      })
    })
    } catch (error) {
    return error;
    }
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
  /**
   * Flow core functionality end 
   */

  onChangeText(text) {
    this.setState({
      swapAmount: text
    }, () => {
      if (this.state.dropDownValue1 != "Token Name") {
        this.getQuotedPrice(this.state.swapType)
      }
    })
  }

  changeValue(text, type) {
    this.setState({
      dropDownValue: text, 
      swapType: type, 
    }, () => {
      this.getQuotedPrice(type)
    })
  }

  changeValue1(text, type) {
    this.setState({
      dropDownValue1: text,
      swapType: type
    }, () => {
      this.getQuotedPrice(type)
    })
  }

  gotoSetup() {
    this.setState({
      page: 1
    })
  }

  gotoSwap() {
    this.setState({
      page: 0
    })
  }



  render() {
 
  var header={
      color:"#000",
      fontWeight:"550",
      width: '65%',
      alignSelf: 'center', 
      border: '1px solid gray',
      padding: 30,
      borderRadius: 30, 
  }
  
    return (
      <Container fluid>
        <Row>
      
      <Col sm={4} style = {{height: "100vh", }}> 
        
        <SideBar
          accountNum = {this.state.account} 
          authenticateWallet = {this.authenticate} 
          unauthenticateWallet = {this.unauthenticate}
          gotoSetup = {this.gotoSetup}
          gotoSwap = {this.gotoSwap}
          babBalance = {this.state.babBalance}
          flowBalance = {this.state.flowBalance}
        />  

      </Col>

      <br/> <br/>

      <Col sm={8} >  
      <br/>
        {this.state.page == 0 ?  
        <div style = {header}> 
        <h1 style = {{fontWeight: '700'}}> Peacock Swap </h1>
        
        <div style = {{alignSelf: 'center', width: '100%', paddingTop: 20}}>  
          <InputGroup  
            className="mb-3" 
            style ={{height: 60, borderRadius: 0}} 
          >

          <DropdownButton
            as={InputGroup.Prepend}
            variant="outline-secondary"
            title={this.state.dropDownValue}
            id="input-group-dropdown-1"
            onChange = {this.handleChange}
          > 
          
            <Dropdown.Item as="button"><div onClick={(e) => this.changeValue(e.target.textContent, 0)}>Y FLOW</div></Dropdown.Item>
            <Dropdown.Item as="button"><div onClick={(e) => this.changeValue(e.target.textContent, 1)}>X BAB</div></Dropdown.Item>

          </DropdownButton>
          <FormControl 
            aria-describedby="basic-addon1" 
            style ={{height: 60, borderRadius: 0}} 
            value = {this.state.swapAmount}
            placeholder = "Enter the swap Amount"
            onChange={(e) => this.onChangeText(e.target.value)}
          />
          </InputGroup>

        </div>
      
      <div style = {{display: "flex",justifyContent: 'center'}}> 
        <ArrowDownUp size={30} color="gray"/>
      </div>
      <br/>

      <div style = {{alignSelf: 'center', width: '100%'}}>  
        <InputGroup  className="mb-3" style ={{height: 60, borderRadius: 0}}>
          <DropdownButton
            as={InputGroup.Prepend}
            variant="outline-secondary"
            title={this.state.dropDownValue1}
            id="input-group-dropdown-1"
            onChange = {this.handleChange}
          >
            <Dropdown.Item as="button"><div onClick={(e) => this.changeValue1(e.target.textContent, 0)}>Y FLOW</div></Dropdown.Item>
            <Dropdown.Item as="button"><div onClick={(e) => this.changeValue1(e.target.textContent, 1)}>X BAB</div></Dropdown.Item>

          </DropdownButton>
          <FormControl 
            disabled 
            aria-describedby="basic-addon1" 
            style ={{height: 60, borderRadius: 0}} 
            value = {this.state.quotedPriceAmt}
            placeholder = "Quoted Amount"
            />

        </InputGroup>
      </div>
      
        <br/>
        <div style = {{display: "flex",justifyContent: 'center'}}>
          {this.state.account != '' ?
          <Button size="lg" variant="dark" style = {{width: '100%', alignSelf: 'center', height: 60}} onClick = {this.swapTokens}>Swap</Button>
          :
          <Button size="lg" variant="dark" style = {{width: '100%', alignSelf: 'center', height: 60}} onClick = {this.authenticate}>Connect to Wallet</Button>
        }
          </div>
        </div>
        :
        (this.state.page == 1) ?
        <div>
          <h1 style = {{fontWeight: '800'}}> Peacock Setup </h1>
          <br/> <br/>
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
          &nbsp; <br/> <br/> 
          <button variant = "primary" onClick={() => this.deployContractCall("dex")} disabled={this.state.account === undefined}>
            deploy Dapper Dex contracts
          </button>
          
          <hr/>

          <button onClick={() => this.createVaultTransaction('cvflow')} >
            Create Empty Vault flow
          </button>

          <button onClick={() => this.createVaultTransaction('cvbab')} >
            Create Empty Vault bab
          </button>
          
          <hr/>

          <button onClick={() => this.fundVaultTransaction('ftflow')} >
            FUND Empty Vault flow
          </button>

          <button onClick={() => this.fundVaultTransaction('ftbab')} >
            FUND Empty Vault bab
          </button> 

          <hr/>

          <button onClick = {() => this.createDex()}>
            Create Peacock Dex 🦚
          </button>
          
        </div>
        :
        null
        }

      <div style = {{display: "flex",justifyContent: 'center', width: '70%', marginTop: 100}}>  
        <div style = {{width: '100%'}}> 
        <h5> Output </h5>
          <pre  style = {{height: 200, border: '1px solid #287EC7', overflow: 'auto',  borderRadius: 1}}>
            {JSON.stringify(this.state.output, null, 2)}
          </pre>
        </div>
        </div>
        
      </Col>
        
        </Row> 
      </Container>
       
    );
  }


}


export default SwapBox


// /* Rectangle 48 */

// position: absolute;
// width: 289px;
// height: 289px;
// left: 0px;
// top: 0px;

// background: rgba(234, 240, 248, 0.5);
// border: 0.5px solid rgba(255, 255, 255, 0.2);
// box-sizing: border-box;
// border-radius: 20px;