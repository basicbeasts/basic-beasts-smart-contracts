##BasicBeasts.cdc
Contract has 27 (28 createNewAdmin) functions.
So we should have a total of 28 scripts and transactions in the hooks of this folder.

###Checklist

public functions:
getAllBeastTemplates()
getAllBeastTemplateIDs()
getBeastTemplate(beastTemplateID: UInt32)
createEmptyCollection()

admin functions:
createBeastTemplate(...)
startNewGeneration()

###TODO

public functions:
getRetiredDictionary()
getAllRetiredKeys()
isBeastRetired(beastTemplateID: UInt32)
getAllNumMintedPerBeastTemplate()
getAllNumMintedPerBeastTemplateKeys()
getNumMintedPerBeastTemplate(beastTemplateID: UInt32)

collection functions:
withdraw(withdrawID: UInt64)
deposit(token: @NonFungibleToken.NFT)
getIDs()
borrowNFT(id: UInt64)
borrowBeast(id: UInt64)
destroy()

admin functions:
mintBeast(beastTemplateID: UInt32) - tx written
retireBeast(beastTemplateID: UInt32) - tx written

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
