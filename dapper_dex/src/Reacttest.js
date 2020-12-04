// 0x01cf0e2f2f715450 BAB TOKEN ADDRESS sis1
// 0x179b6b1cb6755e31 FLOW TOKEN  sis2
// 0xf3fcd2c1a78f5eee LP TOKEN sis3
// 0xe03daebed8ca0615 DAPPER DEX sis4


/*
fcl.config()
  .put("0xProfile", "0x1d007d755706c469")
fcl.send([
  fcl.transaction`
    import Profile from 0xProfile
    transaction(displayName: String) {
      prepare(account: AuthAccount) {
        account
          .borrow<&{Profile.Owner}>(from: Profile.privatePath)!
          .setDisplayName(displayName)
      }
    }
  `
])

*/

