export default function(xamt) {
    var returnDeposit = 
    `
import FlowToken from 0x179b6b1cb6755e31 
import BabToken from 0x01cf0e2f2f715450
import LPToken from 0xf3fcd2c1a78f5eee
import DapperDex from 0xe03daebed8ca0615

// This script reads the Vault balances of two accounts.
pub fun main(): AnyStruct? {

    let LPAccount = getAccount(0xf3fcd2c1a78f5eee) 
    let dexCap = LPAccount.getCapability<&DapperDex.Pool{DapperDex.PoolPublic}>(/public/DexPool)
    let dexRef = dexCap!.borrow()!

    let ratio = dexRef.xVaultSupply() / dexRef.yVaultSupply()
    let y_amount = ratio * UFix64(${xamt})
      

    log("Hello")
    // Use optional chaining to read and log balance fields
    return {"DepositQuote": y_amount}
    
}
    `

    return returnDeposit
}