import FlowToken from 0x179b6b1cb6755e31
import BabToken from 0x01cf0e2f2f715450
import LPToken from 0xf3fcd2c1a78f5eee

pub contract DapperDex {

  pub resource interface PoolPublic {
        pub fun swap(from: @AnyResource, toX: &AnyResource{FlowToken.Receiver}, toY: &AnyResource{BabToken.Receiver})
    pub fun XtoY(from: @FlowToken.Vault, to: &AnyResource{BabToken.Receiver})
    pub fun YtoX(from: @BabToken.Vault, to: &AnyResource{FlowToken.Receiver})
    pub fun price(
        input_amount:UFix64,
        input_reserve:UFix64,
        output_reserve:UFix64
    ): UFix64 
    pub fun depositLiquidity(from1: @FlowToken.Vault, from2: @BabToken.Vault, to: &AnyResource{LPToken.Receiver}, x_amount:UFix64)
    pub fun withdrawLiquidity(from: @LPToken.Vault, to1:&AnyResource{FlowToken.Receiver}, to2:&AnyResource{BabToken.Receiver}, lp_amount:UFix64)
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
        mint: &LPToken.VaultMinter
        fee: UFix64
        initial_lp_receiver: &AnyResource{LPToken.Receiver}
    ){
        self.xVault <- x
        self.yVault <- y
        self.lpVault <- LPToken.createEmptyVault()
        self.fee = fee
        self.totalLPTokens = self.xVault.balance
        self.mintingRef = mint
        self.mintingRef.mintTokens(amount: UFix64(self.totalLPTokens), recipient: initial_lp_receiver)
    }

    pub fun depositLiquidity(
        from1: @FlowToken.Vault, 
        from2: @BabToken.Vault, 
        to: &AnyResource{LPToken.Receiver}, 
        x_amount:UFix64
    ) {

      assert(x_amount <= from1.balance, message: "Intended x amount is greater than X vault Balance")

      let ratio = self.yVault.balance / self.xVault.balance
      let y_amount = ratio * x_amount
      assert(y_amount <= from2.balance, message: "Intended y amount is greater than Y vault Balance")

      let numLPTokens = (x_amount / self.xVault.balance) * self.totalLPTokens

      self.xVault.deposit(from: <- from1)
      self.yVault.deposit(from: <- from2)
      
      self.mintingRef.mintTokens(amount: UFix64(numLPTokens), recipient: to)

      self.totalLPTokens = self.totalLPTokens + numLPTokens
        
    }

    pub fun withdrawLiquidity(
      from: @LPToken.Vault, 
      to1:&AnyResource{FlowToken.Receiver}, 
      to2:&AnyResource{BabToken.Receiver}, 
      lp_amount:UFix64
    ) {

      assert(lp_amount <= from.balance, message: "Intended LP amount is greater than LP vault Balance")

      let ratio = lp_amount / self.totalLPTokens

      // Amount to give the withdrawer
      let numXTokens = ratio * self.xVault.balance
      let numYTokens = ratio * self.yVault.balance

      self.lpVault.deposit(from: <- from)
      self.totalLPTokens = self.totalLPTokens - lp_amount 
      to1.deposit(from: <- self.xVault.withdraw(amount:numXTokens))
      to2.deposit(from: <- self.yVault.withdraw(amount:numYTokens))
    }

     pub fun swap(
      from: @AnyResource, 
      toX: &AnyResource{FlowToken.Receiver},
      toY: &AnyResource{BabToken.Receiver}
    ) {
      if let xVault <- from as? @FlowToken.Vault {
        let yRecieverVault = toY as &AnyResource{BabToken.Receiver}
        self.XtoY(from: <- xVault, to: yRecieverVault)
      } else if let yVault <- from as? @BabToken.Vault {
        let xRecieverVault = toX as &AnyResource{FlowToken.Receiver}
        self.YtoX(from: <- yVault, to: xRecieverVault)
      }
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
    mint: &LPToken.VaultMinter,
    fee: UFix64,
    lp_receiver: &AnyResource{LPToken.Receiver}
  ): @Pool {
    return <- create Pool(x: <- x, y: <- y, mint: mint, fee: fee, initial_lp_receiver: lp_receiver)
  }
}