// Transaction1.cdc
import LPToken from 0xf3fcd2c1a78f5eee
 
transaction {

  prepare(first: AuthAccount) {
 
    log("Set minting Ref")
 
    log("Empty Vault stored")
    let vault <- LPToken.createEmptyVault()
    first.save<@LPToken.Vault>(<-vault, to: /storage/LPVault)
    
    log(first)
    // Link each account
    first.link<&LPToken.Vault{LPToken.Receiver, LPToken.Balance}>(/public/LPReceiver, target: /storage/LPVault)
  }

    execute {
      log("SUCCESS")
    }

  post { 
    }
}
