// Transaction1.cdc
import FlowToken from 0x179b6b1cb6755e31

transaction {

  prepare(first: AuthAccount) {
    log("Set minting Ref")
 
    log("Empty Vault stored")
    let vault <- FlowToken.createEmptyVault()
    first.save<@FlowToken.Vault>(<-vault, to: /storage/FlowVault)
    
    log(first)
    // Link each account
    first.link<&FlowToken.Vault{FlowToken.Receiver, FlowToken.Balance}>(/public/FlowReceiver, target: /storage/FlowVault)
  }

    execute {
      log("SUCCESS")
    }

  post {
    // account address LP TOKEN
    getAccount(0xe03daebed8ca0615).getCapability(/public/FlowReceiver)!
                    .check<&FlowToken.Vault{FlowToken.Receiver}>():
                    "0x01 Vault Receiver Reference was not created correctly"
    }
}
