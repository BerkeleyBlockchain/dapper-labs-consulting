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
 
    let recipient = getAccount(0x01cf0e2f2f715450) // BAB TOKEN ADDRESS
    let cap = recipient.getCapability(/public/FlowReceiver)!
    // Borrow a reference from the capability
    self.receiverRef =  cap.borrow<&FlowToken.Vault{FlowToken.Receiver, FlowToken.Balance}>()
        ?? panic("Could not borrow a reference to the receiver")
     
  }

    execute { 
        self.mintingRef.mintTokens(amount: UFix64(100), recipient: self.receiverRef)
    }

  post {

    getAccount(0x01cf0e2f2f715450).getCapability(/public/FlowReceiver)!
                    .check<&FlowToken.Vault{FlowToken.Receiver}>():
                    "0x01 Vault Receiver Reference was not created correctly"

    }
}