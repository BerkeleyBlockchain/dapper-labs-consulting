export default function(xAmt) {
    var wLiquidity = 
    `
    // Transaction1.cdc
    import FlowToken from 0x179b6b1cb6755e31
    import BabToken from 0x01cf0e2f2f715450
    import LPToken from 0xf3fcd2c1a78f5eee
    import DapperDex from 0xe03daebed8ca0615
    
    transaction {
    
      prepare(acct: AuthAccount) { 
        
        let LPAccount = getAccount(0xf3fcd2c1a78f5eee)
        var xAmount = UFix64(${xAmt})
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
         
        dexRef.withdrawLiquidity(from: <- lpVault.withdraw(amount: UFix64(${xAmt})), 
                            to1: flowVault, 
                            to2: babVault, 
                            lp_amount: UFix64(${xAmt})
        )
  
        }
    
      execute {
            log("SUCCESS") 
        }
        
    }
    `
    return wLiquidity
}