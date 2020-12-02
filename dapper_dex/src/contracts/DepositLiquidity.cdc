// Transaction1.cdc
import FlowToken from 0x01
import BabToken from 0x02
import LPToken from 0x04
import DapperDex from 0x03

transaction {

  prepare(acct: AuthAccount) { 
    
    let LPAccount = getAccount(0x04)
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