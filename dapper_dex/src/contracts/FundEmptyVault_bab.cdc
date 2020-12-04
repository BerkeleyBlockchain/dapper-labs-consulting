// Transaction1.cdc
import BabToken from 0x01cf0e2f2f715450
 
transaction {
  // Local variable for storing the reference to the minter resource
  let mintingRef: &BabToken.VaultMinter
 
  var receiverRef: &BabToken.Vault{BabToken.Receiver}

  prepare(first: AuthAccount) {
 
    log("Set minting Ref")
    self.mintingRef = first.borrow<&BabToken.VaultMinter>
                                 (from: /storage/BabMinter)
                                        ?? panic("Could not borrow a reference to the minter")
 
    let recipient = getAccount(0xe03daebed8ca0615) // All account address except BAB
    let cap = recipient.getCapability(/public/BabReceiver)!
 
    self.receiverRef =  cap.borrow<&BabToken.Vault{BabToken.Receiver, BabToken.Balance}>()
        ?? panic("Could not borrow a reference to the receiver")
     
  }

    execute {
        self.mintingRef.mintTokens(amount: UFix64(100), recipient: self.receiverRef)
    }

  post {
    }
}