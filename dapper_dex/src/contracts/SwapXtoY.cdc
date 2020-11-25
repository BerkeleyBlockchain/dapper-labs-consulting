// Transaction1.cdc
import FlowToken from 0x179b6b1cb6755e31
import BabToken from 0x01cf0e2f2f715450
import LPToken from 0xf3fcd2c1a78f5eee
import DapperDex from 0xe03daebed8ca0615

transaction {

  prepare(acct: AuthAccount) { 
    
    let LPAccount = getAccount(0xf3fcd2c1a78f5eee) // LP TOKEN ADDRESS
    let dexCap = LPAccount.getCapability<&DapperDex.Pool{DapperDex.PoolPublic}>(/public/DexPool)
    let dexRef = dexCap!.borrow()!

    let flowVault = acct.borrow<&{FlowToken.Receiver, FlowToken.Provider, FlowToken.Balance}>(from: /storage/FlowVault)
            ?? panic("Could not borrow a reference to 0x01's Flow Vault")
    let babVault = acct.borrow<&{BabToken.Receiver, BabToken.Provider, BabToken.Balance}>(from: /storage/BabVault)
            ?? panic("Could not borrow a reference to 0x01's BabVault")
    
    dexRef.XtoY(
      from: <- flowVault.withdraw(amount: UFix64(5)),
      to:babVault
    )

    }

    execute {
        log("SUCCESS")
    }
}