// Transaction1.cdc
import FlowToken from 0x179b6b1cb6755e31
 
transaction {

  let mintingRef: &FlowToken.VaultMinter 
  var receiverRef: &FlowToken.Vault{FlowToken.Receiver}

  prepare(first: AuthAccount) {
 
    log("Set minting Ref")
    self.mintingRef = first.borrow<&FlowToken.VaultMinter>
                                 (from: /storage/FlowMinter)
                                        ?? panic("Could not borrow a reference to the minter")
 
    let recipient = getAccount(0xe03daebed8ca0615) // All account address except flow
    let cap = recipient.getCapability(/public/FlowReceiver)!
    // Borrow a reference from the capability
    self.receiverRef =  cap.borrow<&FlowToken.Vault{FlowToken.Receiver, FlowToken.Balance}>()
        ?? panic("Could not borrow a reference to the receiver")
     
  }

    execute { 
        self.mintingRef.mintTokens(amount: UFix64(100), recipient: self.receiverRef)
    }

  post {

    }
}