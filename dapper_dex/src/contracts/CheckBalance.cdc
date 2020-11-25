import FlowToken from 0x179b6b1cb6755e31
import BabToken from 0x01cf0e2f2f715450
    
transaction {
    prepare(acct: AuthAccount) { 
        
        // Borrow references to the stored Vault
        let flowVault = acct.borrow<&{FlowToken.Receiver, FlowToken.Provider, FlowToken.Balance}>(from: /storage/FlowVault)
            ?? panic("Could not borrow a reference to 0x03's Flow Vault")
        let babVault = acct.borrow<&{BabToken.Receiver, BabToken.Provider, BabToken.Balance}>(from: /storage/BabVault)
            ?? panic("Could not borrow a reference to 0x03's BabVault")

        let flowBalance = flowVault.balance
        let babBalance = babVault.balance

        log(flowBalance)
        log(babBalance)
        
    }

    execute {
        log("SUCCESS")
    }
 
}