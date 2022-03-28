##BasicBeasts.cdc
Contract has 27 (28 createNewAdmin) functions.

###Checklist

public functions:
getAllBeastTemplates()
getAllBeastTemplateIDs()
getBeastTemplate(beastTemplateID: UInt32)
getNumMintedPerBeastTemplate(beastTemplateID: UInt32)
isBeastRetired(beastTemplateID: UInt32)

createEmptyCollection()

admin functions:
createBeastTemplate(...)
startNewGeneration()
mintBeast(beastTemplateID: UInt32)
retireBeast(beastTemplateID: UInt32)

- (Extra, func does not exist inside contract) batchMintBeast(beastTemplate: UInt32, quantity: UInt32)

###TODO

public functions:
getRetiredDictionary()
getAllRetiredKeys()
getAllNumMintedPerBeastTemplate()
getAllNumMintedPerBeastTemplateKeys()

collection functions:
withdraw(withdrawID: UInt64)
deposit(token: @NonFungibleToken.NFT)
getIDs()
borrowNFT(id: UInt64)
borrowBeast(id: UInt64)
destroy()

beast NFT functions:
setNickname(nickname: String)
setFirstOwner(firstOwner: Address)
getBeastTemplate()
getNickname()
getFirstOwner()
getEvolvedFrom()
destroy()

Extra:
Read all fields in NFTs, contract, etc.

admin functions:
createNewAdmin()
