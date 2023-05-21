import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"
import NonFungibleToken from "../flow/NonFungibleToken.cdc"
import FungibleToken from "../flow/FungibleToken.cdc"
import FlowToken from "../flow/FlowToken.cdc"
import MetadataViews from "../flow/MetadataViews.cdc"

pub contract Egg: NonFungibleToken {

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Events
    // -----------------------------------------------------------------------
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    // -----------------------------------------------------------------------
    // Egg Events
    // -----------------------------------------------------------------------
    pub event IncubationStarted(id: UInt64, incubationDateEnding: UFix64)
    pub event EggHatched(id: UInt64, beastTemplateID: UInt32, hatchedBy: Address?)

    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let CollectionPrivatePath: PrivatePath
    pub let AdminStoragePath: StoragePath
    pub let AdminPrivatePath: PrivatePath

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Fields
    // -----------------------------------------------------------------------
    pub var totalSupply: UInt64

    // -----------------------------------------------------------------------
    // Egg Fields
    // -----------------------------------------------------------------------
    pub var incubationDuration: UFix64
    pub var name: String
    pub var description: String
    access(self) var images: {String: String}
    access(self) var incubatorImages: {String: String}
    access(self) var hatchedEggImages: {String: String}
    access(self) var royalties: [MetadataViews.Royalty]

    pub struct IncubationTimer {

        pub let incubationDateEnding: UFix64

        init(incubationDateEnding: UFix64) {
            self.incubationDateEnding = incubationDateEnding
        }
    }

    pub resource interface Public {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let elementType: String
        pub let matron: BasicBeasts.BeastNftStruct
        pub let sire: BasicBeasts.BeastNftStruct
        pub fun isHatchable(): Bool
        pub fun isEmpty(): Bool
        pub fun getImage(): String
    }

    pub resource NFT: NonFungibleToken.INFT, Public, MetadataViews.Resolver {

        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let elementType: String
        access(self) var image: String
        pub let matron: BasicBeasts.BeastNftStruct
        pub let sire: BasicBeasts.BeastNftStruct
        access(self) var beast: @{UInt64: BasicBeasts.NFT}
        access(self) var incubationTimer: IncubationTimer?

        init(matron: BasicBeasts.BeastNftStruct, sire: BasicBeasts.BeastNftStruct, beast: @BasicBeasts.NFT) {
            
            Egg.totalSupply = Egg.totalSupply + 1

            self.id = self.uuid

            self.name = Egg.name.concat(" #").concat(self.uuid.toString())
            
            if let image = Egg.images[beast.getBeastTemplate().elements[0]] {
                self.image = image
            } else {
                self.image = Egg.images["Default"]!
            }

            self.description = Egg.description
            self.elementType = beast.getBeastTemplate().elements[0]
            self.matron = matron
            self.sire = sire
            self.beast <- {beast.id:<- beast}
            self.incubationTimer = nil
        }

        pub fun incubate() {
            pre {
                self.incubationTimer == nil: "Cannot incubate egg: Timer is already set"
                self.isHatchable() == false: "Cannot incubate egg: Egg is already hatchable"
            }
            let dateEnding = getCurrentBlock().timestamp + Egg.incubationDuration

            self.incubationTimer = IncubationTimer(incubationDateEnding: dateEnding)

            self.image = Egg.incubatorImages[self.elementType]!

            emit IncubationStarted(id: self.id, incubationDateEnding: dateEnding)
        }

        pub fun hatch(): @BasicBeasts.NFT {
            pre {
                self.incubationTimer != nil: "Cannot hatch egg: Egg must be incubated first"
                self.isHatchable(): "Cannot hatch egg: Egg must finish incubating first"
                self.isEmpty() == false: "Cannot hatch egg: Egg is empty"
                self.owner != nil: "Can't hatch egg: self.owner is nil"
            }
            let keys = self.beast.keys

            var beastCollection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

            beastCollection.deposit(token: <- self.beast.remove(key: keys[0])!)

            var newBeastCollection <- HunterScore.increaseHunterScore(wallet: self.owner!.address, beasts: <- beastCollection)

            let IDs = newBeastCollection.getIDs()

            let newBeast <- newBeastCollection.withdraw(withdrawID: IDs[0]) as! @BasicBeasts.NFT

            newBeast.setFirstOwner(firstOwner: self.owner!.address)

            destroy newBeastCollection

            self.image = Egg.hatchedEggImages[self.elementType]!

            emit EggHatched(id: self.id, beastTemplateID: newBeast.getBeastTemplate().beastTemplateID, hatchedBy: self.owner!.address)

            return <- newBeast
        }

        pub fun isHatchable(): Bool {
            if(self.incubationTimer == nil) {
                return false
            }
            return getCurrentBlock().timestamp >= self.incubationTimer!.incubationDateEnding
        }

        pub fun isEmpty(): Bool {
            return self.beast.length == 0
        }

        pub fun getImage(): String {
            return self.image
        }

        pub fun getViews(): [Type] {
			return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Royalties>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>()
			]
		}

        pub fun resolveView(_ view: Type): AnyStruct? {
			switch view {
			case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.name,
                        description: self.description,
					    thumbnail: MetadataViews.IPFSFile(cid: self.image, path: nil)
                    )
                case Type<MetadataViews.Royalties>():
                    return MetadataViews.Royalties(
                        Egg.royalties
                    )
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL("https://basicbeasts.io/")
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: Egg.CollectionStoragePath,
                        publicPath: Egg.CollectionPublicPath,
                        providerPath: Egg.CollectionPrivatePath,
                        publicCollection: Type<&Egg.Collection{Egg.EggCollectionPublic}>(),
                        publicLinkedType: Type<&Egg.Collection{Egg.EggCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&Egg.Collection{Egg.EggCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-Egg.createEmptyCollection()
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    let media = MetadataViews.Media(
                        file: MetadataViews.HTTPFile(
                            url: "https://basicbeasts.mypinata.cloud/ipfs/QmZLx5Tw7Fydm923kSkqcf5PuABtcwofuv6c2APc9iR41J"
                        ),
                        mediaType: "image/png"
                    )
                    return MetadataViews.NFTCollectionDisplay(
                        name: "Beast Egg Collection",
                        description: "This collection is used for the Basic Beasts Breeding.",
                        externalURL: MetadataViews.ExternalURL("https://basicbeasts.io"),
                        squareImage: media,
                        bannerImage: media,
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/basicbeastsnft")
                        }
                    )
		    }
			return nil
        }

        destroy() {
            destroy self.beast
        }
    }

    // -----------------------------------------------------------------------
    // Admin Resource Functions
    //
    // Admin is a special authorization resource that 
    // allows the owner to perform important NFT functions
    // -----------------------------------------------------------------------
    pub resource Admin {

        pub fun setTimer(durationInSeconds: UFix64) {
            Egg.incubationDuration = durationInSeconds
        }

        pub fun changeEggName(name: String) {
            pre {
                name != "": "Can't change egg name: Name can't be blank"
            }
            Egg.name = name
        }

        pub fun changeEggDescription(description: String) {
            pre {
                description != "": "Can't change egg description: Description can't be blank"
            }
            Egg.description = description
        }

        pub fun changeEggImage(element: String, image: String) {
            pre {
                element != "": "Can't change egg image for element: Element can't be blank"
                image != "": "Can't change egg image for element: Image can't be blank"
            }
            Egg.images.insert(key: element, image)
        }

        pub fun changeEggIncubatorImage(element: String, image: String) {
            pre {
                element != "": "Can't change egg image for element: Element can't be blank"
                image != "": "Can't change egg image for element: Image can't be blank"
            }
            Egg.incubatorImages.insert(key: element, image)
        }

        pub fun changeHatchedEggImage(element: String, image: String) {
            pre {
                element != "": "Can't change egg image for element: Element can't be blank"
                image != "": "Can't change egg image for element: Image can't be blank"
            }
            Egg.hatchedEggImages.insert(key: element, image)
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }

    }

    pub resource interface EggCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowEgg(id: UInt64): &Egg.NFT{Public}? { 
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrow Pack reference: The ID of the returned reference is incorrect"
            }
        }

    }

    pub resource Collection: EggCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {

        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) 
                ?? panic("Cannot withdraw: The Egg does not exist in the Collection")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @Egg.NFT
            let id = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            if self.owner?.address != nil {
                emit Deposit(id: id, to: self.owner?.address)
            }
            destroy oldToken
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        pub fun borrowEgg(id: UInt64): &Egg.NFT{Public}? {
            let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT?
            return ref as! &Egg.NFT?
        }

        pub fun borrowEntireEgg(id: UInt64): &Egg.NFT? {
            let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT?
            return ref as! &Egg.NFT?
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
			let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
			let eggNFT = nft as! &Egg.NFT
			return eggNFT 
		}

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // -----------------------------------------------------------------------
    // Access(Account) Functions
    // -----------------------------------------------------------------------

    access(account) fun mintEgg(matron: BasicBeasts.BeastNftStruct, sire: BasicBeasts.BeastNftStruct, beast: @BasicBeasts.NFT): @Egg.NFT {

        let newEgg: @NFT <- create NFT(matron: matron, sire: sire, beast: <-beast)

        return <- newEgg
    }

    // -----------------------------------------------------------------------
    // Public Getter Functions
    // -----------------------------------------------------------------------  

    pub fun getAllImages(): {String: String} {
        return self.images
    }

    pub fun getAllIncubatorImages(): {String: String} {
        return self.incubatorImages
    }

    pub fun getAllHatchedEggImages(): {String: String} {
        return self.hatchedEggImages
    }

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Functions
    // -----------------------------------------------------------------------

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create self.Collection()
    }

    init() {
        // Set named paths
        self.CollectionStoragePath = /storage/BasicBeastsEggCollection
        self.CollectionPublicPath = /public/BasicBeastsEggCollection
        self.CollectionPrivatePath = /private/BasicBeastsEggCollection
        self.AdminStoragePath = /storage/BasicBeastsEggAdmin
        self.AdminPrivatePath = /private/BasicBeastsEggAdminUpgrade

        // Initialize the fields
        self.totalSupply = 0
        // Initizalize incubationDuration to 72 hours in seconds
        self.incubationDuration = 259200.0
        self.name = "Beast Egg"
        self.description = "This egg contains a magical beast. Incubate the egg to hatch it."

        self.images = {
            "Default":"QmP2zqTF6P5jQKnoETXLQFqe2BRKaaWmq3chPfuctidL5h",
            "Electric":"QmUrskyUjcR2zRPPWwiQDxJfF3BR4FybkzCcnFBq71ybzY",
            "Water":"QmcYaP1fFyyxTBSyiuv5xV57edcutmSPpEhH7SNejatywn",
            "Grass":"QmTDAW5RdFSQVLvBazfMr2svKjLyHyyybpCb7KN6qRuNov",
            "Fire":"QmT5GQRFYjyX9XbxrfHV9eyTVur1j8o2HVWMH9anedYvEb",
            "Normal":"QmdJpZsU75XwbKntPH82G5L3gUDYu4iFFobQVTFZ31WSHc"
        }
        self.incubatorImages = {
            "Default":"QmUZmAvBBfbzqk5zBD6CYQqPNsYzo6NgwDG1EVwTtRb9bb",
            "Electric":"QmUS776zK2dEaNnxatHzRtLrxtDL47mtbBWRrpGfxS6726",
            "Water":"QmbLsj1EAf67pC3wnhurJYUoeoxjUQeyGbU8qSMn4o1Gq7",
            "Grass":"QmWGYe3MraWDusepsazdbtb2fG3SLbi7HvEn6mXYv4c59s",
            "Fire":"QmVHV15JH79TpqbQSenCLZAew9DDb8aZyvKT7LwcCKkytj",
            "Normal":"QmPAQynVttDgowUJxZHMpERQKYb5Pvy9eBTmN85RYea2fX"
        }
        self.hatchedEggImages = {
            "Default":"QmfFK6DeT2s97PZzQHhaRi5rzTV6FLC3ht1qBEBz9Yt2yV",
            "Electric":"QmTKRTbqdCRjf3Tbmgmc73CG4Ns3TzDg6NvppXajFgYAMh",
            "Water":"QmYmSw4TD447EeYG7n3ziHVRMZz2C7SYRAtrfnoNRtirtW",
            "Grass":"QmZi85omCt56usT6Wz1KzgoQsftETuuXZq6S9BY526mKLt",
            "Fire":"QmUsmBszYDGYuouN5sS4CExXiPTD7abMSGox7c6Y2BQPYv",
            "Normal":"QmcrRfdN82haQhuZpJ126NjFiJ5EqigWkUxCHoD6Vn86b5"
        }
        self.royalties = [MetadataViews.Royalty(
							recepient: self.account.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver),
							cut: 0.05, // 5% royalty on secondary sales
							description: "Basic Beasts 5% royalty from secondary sales."
						)]

        // Put a new Collection in storage
        self.account.save<@Collection>(<- create Collection(), to: self.CollectionStoragePath)

        // Create a public capability for the Collection
        self.account.link<&Collection{EggCollectionPublic}>(self.CollectionPublicPath, target: self.CollectionStoragePath)

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&Egg.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")

        emit ContractInitialized()
    }
}
 