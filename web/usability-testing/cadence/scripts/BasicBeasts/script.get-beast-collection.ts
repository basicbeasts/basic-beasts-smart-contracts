export const GET_BEAST_COLLECTION = `
import BasicBeasts from 0xBasicBeasts

pub struct Beast {
    pub let id: UInt64
    pub let serialNumber: UInt32
    pub let beastTemplateID: UInt32
    pub let nickname: String?
    pub let firstOwner: Address?
    pub let sex: String
    pub let matron: BasicBeasts.BeastNftStruct?
    pub let sire: BasicBeasts.BeastNftStruct?
    pub let name: String
    pub let starLevel: UInt32
    pub let data: {String: String}
    pub let skin: String
    pub let evolvedFrom: [BasicBeasts.BeastNftStruct]?

    init(
    id: UInt64, 
    serialNumber: UInt32,
    beastTemplateID: UInt32,
    nickname: String?,
    firstOwner: Address?,
    sex: String, 
    matron: BasicBeasts.BeastNftStruct?,
    sire: BasicBeasts.BeastNftStruct?,
    name: String,
    starLevel: UInt32,
    data: {String: String},
    skin: String,
    evolvedFrom: [BasicBeasts.BeastNftStruct]?
    ) {
        self.id = id
        self.serialNumber = serialNumber
        self.beastTemplateID = beastTemplateID
        self.nickname = nickname
        self.firstOwner = firstOwner
        self.sex = sex
        self.matron = matron
        self.sire = sire
        self.name = name
        self.starLevel = starLevel
        self.data = data
        self.skin = skin
        self.evolvedFrom = evolvedFrom
    }
}

pub fun main(acct: Address): [Beast] {
    var beastCollection: [Beast] = []

    let collectionRef = getAccount(acct).getCapability(BasicBeasts.CollectionPublicPath)
        .borrow<&{BasicBeasts.BeastCollectionPublic}>()
        ?? panic("Could not get public beast collection reference")

    let beastIDs = collectionRef.getIDs()

    for id in beastIDs {
        let borrowedBeast = collectionRef.borrowBeast(id: id)!
        let beast = Beast(
                            id: borrowedBeast.id, 
                            serialNumber: borrowedBeast.serialNumber, 
                            beastTemplateID: borrowedBeast.getBeastTemplate().beastTemplateID,
                            nickname: borrowedBeast.getNickname(), 
                            firstOwner: borrowedBeast.getFirstOwner(), 
                            sex: borrowedBeast.sex, 
                            matron: borrowedBeast.matron, 
                            sire: borrowedBeast.sire, 
                            name: borrowedBeast.getBeastTemplate().name, 
                            starLevel: borrowedBeast.getBeastTemplate().starLevel, 
                            data: borrowedBeast.getBeastTemplate().data, 
                            skin: borrowedBeast.getBeastTemplate().skin, 
                            evolvedFrom: borrowedBeast.getEvolvedFrom()
        )
        beastCollection.append(beast)
    }

  return beastCollection
}
`
