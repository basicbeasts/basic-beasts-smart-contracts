// What is love?
import FungibleToken from "../flow/FungibleToken.cdc"
import NonFungibleToken from "../flow/NonFungibleToken.cdc"
import MetadataViews from "../flow/MetadataViews.cdc"
import FlowToken from "../flow/FlowToken.cdc"

pub contract LovePotion: NonFungibleToken {

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Events
    // -----------------------------------------------------------------------
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    // -----------------------------------------------------------------------
    // LovePotion Events
    // -----------------------------------------------------------------------
    pub event LovePotionMinted(id: UInt64)

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
    // LovePotion Fields
    // -----------------------------------------------------------------------
    pub var potionImage: String
    access(self) var royalties: [MetadataViews.Royalty]
    
    pub resource interface Public {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let image: String
    }

    pub resource NFT: NonFungibleToken.INFT, Public, MetadataViews.Resolver {

        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let image: String
        access(self) let royalties: [MetadataViews.Royalty]
    
        init() {
            self.id = LovePotion.totalSupply
            self.name = "Love Potion"
            self.description = "Use this magical elixir to ignite feelings of love and passion."
            self.image = LovePotion.potionImage
            self.royalties = LovePotion.royalties

            LovePotion.totalSupply = LovePotion.totalSupply + 1

            emit LovePotionMinted(id: self.id)
        }
    
        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Royalties>(),
                Type<MetadataViews.Editions>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Serial>()
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
                case Type<MetadataViews.Editions>():
                    // There is no max number of NFTs that can be minted from this contract
                    // so the max edition field value is set to nil
                    let editionInfo = MetadataViews.Edition(name: "Love Potion Edition", number: self.id, max: nil)
                    let editionList: [MetadataViews.Edition] = [editionInfo]
                    return MetadataViews.Editions(
                        editionList
                    )
                case Type<MetadataViews.Serial>():
                    return MetadataViews.Serial(
                        self.id
                    )
                case Type<MetadataViews.Royalties>():
                    return MetadataViews.Royalties(
                        self.royalties
                    )
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL("https://basicbeasts.io/")
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: LovePotion.CollectionStoragePath,
                        publicPath: LovePotion.CollectionPublicPath,
                        providerPath: LovePotion.CollectionPrivatePath,
                        publicCollection: Type<&LovePotion.Collection{LovePotion.LovePotionCollectionPublic}>(),
                        publicLinkedType: Type<&LovePotion.Collection{LovePotion.LovePotionCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&LovePotion.Collection{LovePotion.LovePotionCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-LovePotion.createEmptyCollection()
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
                        name: "Love Potion Collection",
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
    }

    pub resource interface LovePotionCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowLovePotion(id: UInt64): &LovePotion.NFT{Public}? { 
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrow Love Potion reference: The ID of the returned reference is incorrect"
            }
        }
    }

    pub resource Collection: LovePotionCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {

        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @LovePotion.NFT

            let id: UInt64 = token.id

            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }
 
        pub fun borrowLovePotion(id: UInt64): &LovePotion.NFT{Public}? {
            let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT?
            return ref as! &LovePotion.NFT?
        }

        pub fun borrowEntireLovePotion(id: UInt64): &LovePotion.NFT? {
            let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT?
            return ref as! &LovePotion.NFT?
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let lovePotion = nft as! &LovePotion.NFT
            return lovePotion as &AnyResource{MetadataViews.Resolver}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    access(account) fun mint(): @NFT {
            // create a new NFT
            var newNFT <- create NFT()

            return <-newNFT
    }

    pub resource Admin {

        pub fun changePotionImage(cid: String) {
            LovePotion.potionImage = cid
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }

    }

    init() {
        // Initialize contract fields
        self.totalSupply = 0
        self.potionImage = "bafybeieshac7orxgpugg5xgbokepdk477gmg3dnpxckbdyxrvgoqma52se" //TODO add image
        self.royalties = [MetadataViews.Royalty(
							recepient: self.account.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver),
							cut: 0.05, // 5% royalty on secondary sales
							description: "Basic Beasts 5% royalty from secondary sales."
						)]

        // Set the named paths
        self.CollectionStoragePath = /storage/BasicBeastsLovePotionCollection
        self.CollectionPublicPath = /public/BasicBeastsLovePotionCollection
        self.CollectionPrivatePath = /private/BasicBeastsLovePotionCollection
        self.AdminStoragePath = /storage/BasicBeastsLovePotionAdmin
        self.AdminPrivatePath = /private/BasicBeastsLovePotionAdminUpgrade

        // Create a Collection resource and save it to storage
        let collection <- create Collection()
        self.account.save(<-collection, to: self.CollectionStoragePath)

        // create a public capability for the collection
        self.account.link<&LovePotion.Collection{NonFungibleToken.CollectionPublic, LovePotion.LovePotionCollectionPublic, MetadataViews.ResolverCollection}>(
            self.CollectionPublicPath,
            target: self.CollectionStoragePath
        )

        // Create a Admin resource and save it to storage
        let admin <- create Admin()
        self.account.save(<-admin, to: self.AdminStoragePath)

        self.account.link<&LovePotion.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")

        emit ContractInitialized()
    }
}
 