// Script1.cdc
import FlowToken from 0x179b6b1cb6755e31 
import BabToken from 0x01cf0e2f2f715450
import LPToken from 0xf3fcd2c1a78f5eee

// This script reads the Vault balances of two accounts.
pub fun main(address:Address): AnyStruct? {
    // Get the accounts' public account objects
     

    // Get references to the account's receivers
    // by getting their public capability
    // and borrowing a reference from the capability
    log("CALLED SCRIPT ")
    let acct1ReceiverRef = getAccount(address).getCapability(/public/FlowReceiver)!
                            .borrow<&FlowToken.Vault{FlowToken.Balance}>()
                            ?? panic("Er 1")

    log("GOT ACT1 RECIEVER REF")
    let acct2ReceiverRef = getAccount(address).getCapability(/public/BabReceiver)!
                            .borrow<&BabToken.Vault{BabToken.Balance}>()
                            ?? panic("Er 2")

    log("GOT ACT1 RECIEVER REF")
    let acct3ReceiverRef = getAccount(address).getCapability(/public/LPReceiver)!
                            .borrow<&LPToken.Vault{LPToken.Balance}>()
                            ?? panic("Could not borrow a reference to the acct1 receiver")
    
    
    log(acct1ReceiverRef.balance)
    // Use optional chaining to read and log balance fields
    return {"flowBalance": acct1ReceiverRef.balance, "babBalance": acct2ReceiverRef.balance, "lpBalance": acct3ReceiverRef.balance}
}