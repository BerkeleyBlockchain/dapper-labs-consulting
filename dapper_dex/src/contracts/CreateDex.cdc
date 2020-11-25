// Transaction1.cdc
import FlowToken from 0x179b6b1cb6755e31
import BabToken from 0x01cf0e2f2f715450
import LPToken from 0xf3fcd2c1a78f5eee
import DapperDex from 0xe03daebed8ca0615

transaction {

  let mintingRef: &LPToken.VaultMinter

  prepare(lpacc: AuthAccount) { 
    self.mintingRef = lpacc.borrow<&LPToken.VaultMinter>
                                (from: /storage/LPMinter)
                                  ?? panic("Could not borrow a reference to the minter LP ERROR")
	 
    // Borrow references to the stored Vault
    let flowVault = lpacc.borrow<&{FlowToken.Receiver, FlowToken.Provider, FlowToken.Balance}>(from: /storage/FlowVault)
            ?? panic("Could not borrow a reference to 0x03's Flow Vault")
    let babVault = lpacc.borrow<&{BabToken.Receiver, BabToken.Provider, BabToken.Balance}>(from: /storage/BabVault)
            ?? panic("Could not borrow a reference to 0x03's BabVault")
    let lpVault = lpacc.borrow<&{LPToken.Receiver, LPToken.Provider, LPToken.Balance}>(from: /storage/LPVault)
            ?? panic("Could not borrow a reference to 0x03's LPVault")
    
    let dex <- DapperDex.createDex(
        x: <- flowVault.withdraw(amount: UFix64(50)),
        y: <- babVault.withdraw(amount: UFix64(50)),
        mint: self.mintingRef,
        fee: 0.025,
        lp_receiver: lpVault,
    )
     // dex.YToX(from:1, to:flowVault)
    lpacc.save<@DapperDex.Pool>(<-dex, to: /storage/DexPool)

    // Create a public capability to the sale so that others can call its methods
    lpacc.link<&DapperDex.Pool{DapperDex.PoolPublic}>(/public/DexPool, target: /storage/DexPool)
    
    }

    execute {
        log("SUCCESS") 
    }
}