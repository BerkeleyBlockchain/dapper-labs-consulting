import FlowToken from 0x179b6b1cb6755e31
import BabToken from 0xf3fcd2c1a78f5eee
import LPToken from 0xe03daebed8ca0615

pub contract DapperDex {

  pub resource interface PoolPublic {
    pub fun XtoY(from: @FlowToken.Vault, to: &AnyResource{BabToken.Receiver})
    pub fun YtoX(from: @BabToken.Vault, to: &AnyResource{FlowToken.Receiver})
    pub fun price(
        input_amount:UFix64,
        input_reserve:UFix64,
        output_reserve:UFix64
    ): UFix64 
    pub fun depositLiquidity(from1: @FlowToken.Vault, from2: @BabToken.Vault, to: &AnyResource{LPToken.Receiver}, x_amount:UFix64)
    pub fun withdrawLiquidity(from: @LPToken.Vault, to1:&AnyResource{FlowToken.Receiver}, to2:&AnyResource{BabToken.Receiver}, amount:UFix64)
  }

  pub resource Pool: PoolPublic {
    pub let xVault: @FlowToken.Vault
    pub let yVault: @BabToken.Vault
    pub let lpVault: @LPToken.Vault
    pub let mintingRef: &LPToken.VaultMinter
    pub var totalLPTokens: UFix64
    pub var fee: UFix64

    init(
        x: @FlowToken.Vault,
        y: @BabToken.Vault,
        lp: @LPToken.Vault,
        mint: &LPToken.VaultMinter
    ){
        self.xVault <- x
        self.yVault <- y
        self.lpVault <- lp
        self.fee = 0.0025
        self.totalLPTokens = self.xVault.balance
        self.mintingRef = mint
    }

    pub fun depositLiquidity(
        from1: @FlowToken.Vault, 
        from2: @BabToken.Vault, 
        to: &AnyResource{LPToken.Receiver}, 
        x_amount:UFix64
    ) {
      // TODO: CHECKS TO MAKE SURE THEY HAVE x_amount and y_amount in tthe Flow and BAB Token Vaults
      let ratio = self.yVault.balance / self.xVault.balance
      let y_amount = ratio * x_amount
      let numLPTokens = (x_amount / self.xVault.balance) * self.totalLPTokens

      self.xVault.deposit(from: <- from1)
      self.yVault.deposit(from: <- from2)
      // to.deposit(from: <- self.lpVault.withdraw(amount:numLPTokens))
      
      self.mintingRef.mintTokens(amount: UFix64(numLPTokens), recipient: to)

      self.totalLPTokens = self.totalLPTokens + numLPTokens
        

      //log("Depositing liquidity")

    }

    pub fun withdrawLiquidity(
      from: @LPToken.Vault, 
      to1:&AnyResource{FlowToken.Receiver}, 
      to2:&AnyResource{BabToken.Receiver}, 
      amount:UFix64
    ) {
      // TODO: CHECK THEY ACTUALLY HAVE AMOUNT SPECIFICIED IN LPTOKEN.VAULT....also burn tokens from user vault somehow

      let ratio = amount / self.totalLPTokens

      // Amount to give the withdrawer
      let numXTokens = ratio * self.xVault.balance
      let numYTokens = ratio * self.yVault.balance

      self.lpVault.deposit(from: <- from)
      self.totalLPTokens = self.totalLPTokens - amount 
      to1.deposit(from: <- self.xVault.withdraw(amount:numXTokens))
      to2.deposit(from: <- self.yVault.withdraw(amount:numYTokens))
    }

    pub fun XtoY(
        from: @FlowToken.Vault,
        to:&AnyResource{BabToken.Receiver}
    ) { 
      //log("Got to XtoY")
      // calculate price using input amt(vaultamt) 
      let amtY = self.price(
          input_amount:from.balance,
          input_reserve:self.xVault.balance,
          output_reserve:self.yVault.balance
          )
      self.xVault.deposit(from: <- from) // into our x value from the parameter we're sending 
      to.deposit(from: <- self.yVault.withdraw(amount:amtY))
    }
    pub fun YtoX(
        from: @BabToken.Vault,
        to:&AnyResource{FlowToken.Receiver}
    ) { 
      //log("Got to YtoX")
      // calculate price using input amt(vaultamt) 
      let amtX = self.price(
          input_amount:from.balance,
          input_reserve:self.yVault.balance,
          output_reserve:self.xVault.balance
          )
      self.yVault.deposit(from: <- from) // into our y value from the parameter we're sending 
      to.deposit(from: <- self.xVault.withdraw(amount:amtX))
    }

    pub fun price( 
        input_amount:UFix64, 
        input_reserve:UFix64,
        output_reserve:UFix64
    ): UFix64 {
        // take the fee out of the input give them market price on fee adjusted input 
        
        // Fee 0.002
        // x = 10 BAB n Valut amt
        // y = 50 FLOW m Vault amt
        // z = 1 - fee
        // return = m - n*m/(m + inputAmt * z)
    
        /*
        * x * y = k
        * 10 eth 1000 dai (1eth = 91 dai)
        * trade 1 eth to dai k = 10,000
        * (10+1) * (1000 - x) = 10,000 without fee
        * (10+(1 * (1-0.02))) * (1000 - x) = 10,000 without fee
        * 11 * (1000-x) = 10,000
        * 10,000 / 11 = (1000 - x)
        * 909 = 1000 - x
        * x = 90.9 ~ 91 without fee
        * x = 89.25 with fee 
        */  
        let fee_amount = input_amount * self.fee / (UFix64(1) + self.fee)
        //log("Amount fees")
        //log(fee_amount)
        //log("Amount left")
        let input_minus_fee_amount = input_amount - fee_amount
        //log(input_minus_fee_amount)
        //log("Got to price function")
        let price = output_reserve - (input_reserve * output_reserve) / (input_reserve + input_minus_fee_amount)
        //log("Price")
        //log(price)
        return price
    }
        
    destroy() {
      destroy self.xVault
      destroy self.yVault
      destroy self.lpVault
      
    }
  } 
  
  pub fun createDex(
    x: @FlowToken.Vault,
    y: @BabToken.Vault,
    lp: @LPToken.Vault,
    mint: &LPToken.VaultMinter
  ): @Pool {
    return <- create Pool(x: <- x, y: <- y, lp: <- lp, mint: mint)
  }
}
