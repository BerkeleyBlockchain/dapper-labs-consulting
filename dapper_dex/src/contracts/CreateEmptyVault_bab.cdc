// Transaction1.cdc
import BabToken from 0x01cf0e2f2f715450
 
transaction {

  prepare(first: AuthAccount) {
 
    log("Set minting Ref")
 
    log("Empty Vault stored")
    let vault <- BabToken.createEmptyVault()
    first.save<@BabToken.Vault>(<-vault, to: /storage/BabVault)
    
    log(first)
    // Link each account
    first.link<&BabToken.Vault{BabToken.Receiver, BabToken.Balance}>(/public/BabReceiver, target: /storage/BabVault)
  }

    execute {
      log("SUCCESS")
    }

  post {

    getAccount(0xe03daebed8ca0615).getCapability(/public/BabReceiver)!
                    .check<&BabToken.Vault{BabToken.Receiver}>():
                    "0x01 Vault Receiver Reference was not created correctly"
    }
}
