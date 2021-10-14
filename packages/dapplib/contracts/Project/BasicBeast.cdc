/*
        BasicBeast.cdc

        Description: Central Smart Contract for Basic Beasts NFTs

        Author: bz bz.vanity@gmail.com

        This smart contract contains the core functionality for 
        the Beasts that are part of the Basic Beasts universe.

        When a new Beast wants to be added to the records, an Admin creates
        a new BeastTemplate that is stored in the smart contract.

        Then an Admin can create new EvolutionSets. EvolutionSets consist of a public struct that 
        contains public information about an EvolutionSet, and a private resource used 
        to mint new Beasts based on BeastTemplates that have been linked to the EvolutionSet

        The admin resource has the power to do all of the important actions
        in the smart contract and EvolutionSets. When they want to call functions in an EvolutionSet,
        they call their borrowEvolutionSet function to get a reference
        to an EvolutionSet in the contract.
        Then they can call functions on the EvolutionSet using that reference.

        In this way, the smart contract and its defined resources interact.

        When Beasts are minted, they are initialized with a BeastData struct and other
        NFT specific data that are returned by the minter.

        The contract also defines a Collection resource. This is an object that
        every Beast NFT owner will store in their account
        to manage their NFT Collection.

        The admin BasicBeast account will also have its own Beast Collection that it can 
        use to hold its own Beasts that have not yet been sent to a user.

        Note: All state-changing functions will panic if an invalid argument is 
        provided or one of its pre-conditions or post-conditions aren't met.
        Functions that don't modify state will simply return 0 or nil
        and those cases need to be handled by the caller.

        To my second-most favorite brother (at the time of writing), this one is for you.

        Special thanks to: 
        Jacob, Gel, Morgan, Nik, hh and the rest of the Decentology team for teaching us how to write cadence and build Dapps.
        Josh, Dieter, and the rest of the Flow and Dapper Labs team for making TopShot and Flow Blockchain great and available to everyone.
        Bjartek from Versus for helping everyone.
        You are the best partners, teachers, mentors, and friends one could ever ask for.

*/

import NonFungibleToken from "../Flow/NonFungibleToken.cdc"

pub contract BasicBeast: NonFungibleToken {

    // -----------------------------------------------------------------------
    // BasicBeast contract-level Events
    // -----------------------------------------------------------------------

    // Emitted when the contract is created
    pub event ContractInitialized()

    // Events for EvolutionSet-related actions
    //
    // Emitted when a new EvolutionSet is created
    pub event EvolutionSetCreated(setID: UInt32)
    // Emitted when a new BeastTemplate is added to an EvolutionSet
    pub event BeastTemplateAddedToEvolutionSet(setID: UInt32, beastTemplateID: UInt32)
    // Emitted when a new BeastTemplate is removed from an EvolutionSet
    pub event BeastTemplateRemovedFromEvolutionSet(setID: UInt32, beastTemplateID: UInt32)
    // Emitted when a BeastTemplate is retired from a Set and cannot be used to mint
    pub event BeastTemplateRetiredFromEvolutionSet(setID: UInt32, beastTemplateID: UInt32, numBeasts: UInt32)
    // Emitted when an EvolutionSet is locked, meaning BeastTemplates cannot be added nor be removed
    pub event EvolutionSetLocked(setID: UInt32)
    // Emitted when a Beast is minted from an EvolutionSet
    pub event BeastMinted(
                        beastID: UInt64, 
                        beastTemplate: BeastTemplate, 
                        setID: UInt32, 
                        serialNumber: UInt32,
                        sex: String,
                        bornAt: UInt64, 
                        matron: UInt64,
                        sire: UInt64,
                        evolvedFrom: [UInt64]
    )

    // Events for Beast-related actions
    //
    // Emitted when a nickname has been set for a Beast
    pub event BeastNewNicknameIsSet(id: UInt64, nickname: String?)
    // Emitted when a beneficiary has been set to a Beast
    pub event BeastBeneficiaryIsSet(id: UInt64, beneficiary: Address?)
    // Emitted when a Beast is destroyed
    pub event BeastDestroyed(id: UInt64)

    // Events for Admin-related actions
    //
    // Emitted when a new BeastTemplate is created
    pub event BeastTemplateCreated(
                                    id: UInt32, 
                                    generation: UInt32,
                                    dexNumber: UInt32,
                                    name: String, 
                                    image: String,
                                    description: String,
                                    rarity: String,
                                    skin: String,
                                    starLevel: UInt32,
                                    asexual: Bool,
                                    ultimateSkill: String,
                                    basicSkills: [String],
                                    elements: {String: Bool},
                                    data: {String: String}
    )
    // Emitted when a new generation has been triggered by an admin
    pub event NewGenerationStarted(newCurrentGeneration: UInt32)
    // Emitted when a new key-value-pair of BeastTemplate's data has been added
    pub event NewBeastTemplateDataFieldAdded(beastTemplateID: UInt32, key: String, value: String)
    // Emitted when a key of a BeastTemplate's data has been removed
    pub event BeastTemplateDataFieldRemoved(beastTemplateID: UInt32, key: String)
    // Emitted when Beast Parents breeding counts are incremented
    pub event BeastParentsBreedingCountsIncremented(
                                                matronID: UInt64, 
                                                matronBreedingCount: UInt32, 
                                                sireID: UInt64, 
                                                sireBreedingCount: UInt32
    )
    
    // Events for Collection-related actions
    //
    // Emitted when a Beast is withdrawn from a Collection
    pub event Withdraw(id: UInt64, from: Address?)
    // Emitted when a Beast is deposited into a Collection
    pub event Deposit(id: UInt64, to: Address?)

    // -----------------------------------------------------------------------
    // BasicBeast contract-level Named Paths
    // -----------------------------------------------------------------------
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let AdminStoragePath: StoragePath

    // -----------------------------------------------------------------------
    // Beast contract-level fields.
    // These contain actual values that are stored in the smart contract.
    // -----------------------------------------------------------------------

    // Generation that a BeastTemplate belongs to.
    // Generation is a concept that indicates a group of BeastTemplates through time.
    // Many BeastTemplates can exist at a time, but only one generation.
    pub var currentGeneration: UInt32

    // Variable size dictionary of Beast structs
    access(self) var beastTemplates: {UInt32: BeastTemplate}

    // Variable size dictionary of EvolutionSet resources
    access(self) var evolutionSets: @{UInt32: EvolutionSet}

    // Variable size dictionary of beastTemplateIDs
    // that have been added to an EvolutionSet
    // Key is beastTemplateID and value is setID of an EvolutionSet
    access(contract) var beastTemplatesInAnEvolutionSet: {UInt32: UInt32}

    // Variable size dictionary of IDs of Beast NFTs
    // that shows the number of times a Beast has been used for breeding
    access(contract) var breedingCounts: {UInt64: UInt32}

    // The ID that is used to create BeastTemplates.
    // Every time a BeastTemplate is created, beastTemplateID is assigned
    // to the new BeastTemplate's ID and then is incremented by 1.
    pub var nextBeastTemplateID: UInt32

    // The ID that is used to create EvolutionSets. Every time an EvolutionSet is created
    // setID is assigned to the new EvolutionSet's ID and then is incremented by 1.
    pub var nextSetID: UInt32

    // The total number of Beast NFTs that have been created
    // Because NFTs can be destroyed, it doesn't necessarily mean that this
    // reflects the total number of NFTs in existence, just the number that
    // have been minted to date. Also used as global Beast IDs for minting.
    pub var totalSupply: UInt64

    // -----------------------------------------------------------------------
    // The Basic Beast contract-level Composite Type definitions
    // -----------------------------------------------------------------------
    // These are just *definitions* for Types that this contract
    // and other accounts can use. These definitions do not contain
    // actual stored values, but an instance (or object) of one of these Types
    // can be created by this contract that contains stored values.
    // -----------------------------------------------------------------------

    // BeastTemplate holds metadata associated with a specific Beast.
    //
    // Beast NFTs will all reference a single BeastTemplate as the owner of
    // its metadata. The BeastTemplates are publicly accessible, so anyone can
    // read the metadata associated with a specific BeastTemplate ID
    //
    pub struct BeastTemplate { 

        // The unique ID for the BeastTemplate
        pub let beastTemplateID: UInt32

        // Generation that this BeastTemplate belongs to.
        // Generation is a concept that indicates a group of BeastTemplate through time.
        // Many BeastTemplate can exist at a time, but only one generation.
        pub let generation: UInt32

        // The BeastTemplate's dex number
        pub let dexNumber: UInt32

        // The BeastTemplate's name
        pub let name: String

        // The BeastTemplate's image URL
        pub let image: String

        // The BeastTemplate's description
        pub let description: String

        // The BeastTemplate's rarity
        // e.g. "Common" or "Legendary"
        pub let rarity: String

        // The BeastTemplate's skin
        // Skin refers to an alternate appearance and/or color scheme
        // e.g. "Normal", "Cursed Black", "Shiny Gold", "Mythic Diamond"
        pub let skin: String

        // The BeastTemplate's star level
        // 1 is low, 3 is high
        pub let starLevel: UInt32

        // A boolean indicating if a BeastTemplate has a sex e.g. "Female" or is asexual
        pub let asexual: Bool

        // The BeastTemplate's ultimate skill
        pub let ultimateSkill: String

        // An array of the BeastTemplate's basic skills
        pub let basicSkills: [String]

        // A dictionary of the BeastTemplate's elements.
        // e.g. does the BeastTemplate have fire or water as its elements?
        pub let elements: {String: Bool}

        // A string mapping of all other BeastTemplate metadata
        pub let data: {String: String}

        init(
            dexNumber: UInt32,
            name: String, 
            image: String,
            description: String,
            rarity: String,
            skin: String,
            starLevel: UInt32,
            asexual: Bool,
            ultimateSkill: String,
            basicSkills: [String],
            elements: {String: Bool},
            data: {String: String}
        ) {
            pre {
                name != "": "New BeastTemplate name cannot be blank"
                image != "": "New BeastTemplate image cannot be blank"
                description != "": "New BeastTemplate description cannot be blank"
                rarity != "": "New BeastTemplate rarity must be determined"
                skin != "": "New BeastTemplate skin must be determined"
                ultimateSkill != "": "New BeastTemplate ultimate skill cannot be blank"
                basicSkills.length != 0: "New BeastTemplate basic skills cannot be empty"
                elements.length != 0: "New BeastTemplate element cannot be empty"
                data.length != 0: "New BeastTemplate data cannot be empty"
            }
            self.beastTemplateID = BasicBeast.nextBeastTemplateID 
            self.generation = BasicBeast.currentGeneration
            self.dexNumber = dexNumber
            self.name = name
            self.image = image
            self.description = description
            self.rarity = rarity
            self.skin = skin
            self.starLevel = starLevel
            self.asexual = asexual
            self.ultimateSkill = ultimateSkill
            self.basicSkills = basicSkills
            self.elements = elements
            self.data = data

            // Increment the ID so that it isn't used again
            BasicBeast.nextBeastTemplateID = BasicBeast.nextBeastTemplateID + 1 as UInt32

            emit BeastTemplateCreated(
                                    id: self.beastTemplateID, 
                                    generation: self.generation,
                                    dexNumber: self.dexNumber,
                                    name: self.name, 
                                    image: self.image,
                                    description: self.description,
                                    rarity: self.rarity,
                                    skin: self.skin,
                                    starLevel: self.starLevel,
                                    asexual: self.asexual,
                                    ultimateSkill: self.ultimateSkill,
                                    basicSkills: self.basicSkills,
                                    elements: self.elements,
                                    data: self.data
                                    )
        }
    }

    // An EvolutionSet is a grouping of BeastTemplates. 
    // It is not possible for a BeastTemplate to exist in 
    // multiple different EvolutionSets at the same time.
    // 
    // EvolutionSetData is a struct that is used so anyone can easily 
    // query information about an EvolutionSet by calling various getters located 
    // at the end of the contract. Only the admin has the ability 
    // to modify any data in the private EvolutionSet resource.
    //
    pub struct EvolutionSetData {

        // Unique ID for the EvolutionSet
        pub let setID: UInt32

        // Name of the Set
        pub let name: String

        // Map of beastTemplateIDs that indicates if a BeastTemplate in this EvolutionSet can be minted.
        // When a BeastTemplate is added to an EvolutionSet, it is mapped to false (not retired).
        // When a BeastTemplate is retired, this is set to true and cannot be changed.
        pub var retired: {UInt32: Bool}

        // Indicates if the EvolutionSet is currently locked.
        // When an EvolutionSet is created, it is unlocked 
        // and BeastTemplates are allowed to be added to it.
        // When an EvolutionSet is locked, BeastTemplates cannot be added nor be removed.
        // An EvolutionSet can never be changed from locked to unlocked,
        // the decision to lock an EvolutionSet is final.
        // If an EvolutionSet is locked, BeastTemplates cannot be added, but
        // Beasts can still be minted from BeastTemplates
        // that exist in the EvolutionSet.
        pub var locked: Bool

        // Mapping of beastTemplateIDs that indicates the number of Beasts 
        // that have been minted for specific BeastTemplates in this EvolutionSet.
        // When a Beast is minted, this value is stored in the Beast to
        // show its place in the EvolutionSet, e.g. beastTemplateID 13 of 60 Beasts minted.
        pub var numOfMintedPerBeastTemplate: {UInt32: UInt32}

        init(setID: UInt32) {
            pre {
                setID != nil: "setID cannot be empty"
            }

            let set = &BasicBeast.evolutionSets[setID] as &EvolutionSet

            self.setID = set.setID
            self.name = set.name
            self.retired = set.retired
            self.locked = set.locked
            self.numOfMintedPerBeastTemplate = set.numOfMintedPerBeastTemplate
        }
    }
    
    // EvolutionSet is a resource type that contains the functions to add and remove
    // BeastTemplates from an EvolutionSet and mint Beasts.
    //
    // It is stored in a private field in the contract so that
    // the admin resource can call its methods.
    //
    // The admin can add BeastTemplates to an EvolutionSet so that the EvolutionSet can mint Beasts
    // that reference that BeastTemplate.
    // The Beasts that are minted by an EvolutionSet will be listed as belonging to
    // the EvolutionSet that minted it, as well as the BeastTemplate it references.
    // 
    // Admin can also retire BeastTemplates from the EvolutionSet, meaning that the retired
    // BeastTemplate can no longer have Beasts minted from it.
    //
    // If the admin locks the EvolutionSet, no more BeastTemplates can be added to it, but 
    // Beasts can still be minted.
    //
    // If retireAllBeastTemplates() and lock() are called back-to-back, 
    // the EvolutionSet is closed off forever and nothing more can be done with it.
    pub resource EvolutionSet {

        // Unique ID for the EvolutionSet
        pub let setID: UInt32

        // Name of the EvolutionSet
        pub let name: String

        // Map of beastTemplateIDs that indicates if a BeastTemplate in this EvolutionSet can be minted.
        // When a BeastTemplate is added to an EvolutionSet, it is mapped to false (not retired).
        // When a BeastTemplate is retired, this is set to true and cannot be changed.
        access(contract) var retired: {UInt32: Bool}

        // Indicates if the EvolutionSet is currently locked.
        // When an EvolutionSet is created, it is unlocked 
        // and BeastTemplates are allowed to be added to it.
        // When an EvolutionSet is locked, BeastTemplates cannot be added nor be removed.
        // An EvolutionSet can never be changed from locked to unlocked,
        // the decision to lock an EvolutionSet is final.
        // If an EvolutionSet is locked, BeastTemplates cannot be added, but
        // Beasts can still be minted from BeastTemplates
        // that exist in the EvolutionSet.
        access(contract) var locked: Bool

        // Mapping of beastTemplateIDs that indicates the number of Beasts 
        // that have been minted for specific BeastTemplates in this EvolutionSet.
        // When a Beast is minted, this value is stored in the Beast to
        // show its place in the EvolutionSet, e.g. beastTemplateID 13 of 60 Beasts minted.
        access(contract) var numOfMintedPerBeastTemplate: {UInt32: UInt32}

        init(name: String) {
            self.setID = BasicBeast.nextSetID
            self.name = name
            self.retired = {}
            self.locked = false
            self.numOfMintedPerBeastTemplate = {}

            // Increment the ID so that it isn't used again
            BasicBeast.nextSetID = BasicBeast.nextSetID + 1 as UInt32

            emit EvolutionSetCreated(setID: self.setID)
        }

        // addBeastTemplate adds a BeastTemplate to the EvolutionSet
        //
        // Parameters: beastTemplateID: The ID of the BeastTemplate that is being added
        //
        // Pre-Conditions:
        // The BeastTemplate needs to be an existing BeastTemplate
        // The EvolutionSet must not be locked
        // The BeastTemplate can't have already been added to the EvolutionSet
        // The BeastTemplate can't be in another EvolutionSet
        //
        pub fun addBeastTemplate(beastTemplateID: UInt32) {
            pre {
                BasicBeast.beastTemplates[beastTemplateID] != nil: "Cannot add the BeastTemplate to EvolutionSet: The BeastTemplate doesn't exist."
                !self.locked: "Cannot add the BeastTemplate to the EvolutionSet: The EvolutionSet is locked."
                self.numOfMintedPerBeastTemplate[beastTemplateID] == nil: "The BeastTemplate has already been added to this EvolutionSet." 
                BasicBeast.beastTemplatesInAnEvolutionSet[beastTemplateID] == nil: "The BeastTemplate has already been added to a EvolutionSet." 
            }

            // Open the BeastTemplate up for minting 
            // if it has never been added to this EvolutionSet before
            if self.retired[beastTemplateID] == nil {
                self.retired[beastTemplateID] = false
            }

            // Initialize the Beast minted count for this BeastTemplate to zero
            self.numOfMintedPerBeastTemplate[beastTemplateID] = 0

            // Add the BeastTemplate to the array of beastTemplatesInAnEvolutionSet
            BasicBeast.beastTemplatesInAnEvolutionSet.insert(key: beastTemplateID, self.setID)

            emit BeastTemplateAddedToEvolutionSet(setID: self.setID, beastTemplateID: beastTemplateID)
        }

        // addBeastTemplates adds multiple BeastTemplates to the EvolutionSet
        //
        // Parameters: beastTemplateIDs: The IDs of the BeastTemplates that are being added
        //                      as an array
        //
        pub fun addBeastTemplates(beastTemplateIDs: [UInt32]) {
            for beastTemplate in beastTemplateIDs {
                self.addBeastTemplate(beastTemplateID: beastTemplate)
            }
        }

        // removeBeastTemplate removes a BeastTemplate from the EvolutionSet
        // The removed BeastTemplate stays in the EvolutionSet's retired dictionary
        // ensuring that the retirement of a Beast in an EvolutionSet persists
        //
        // Parameters: beastTemplateID: The ID of the BeastTemplate that is being removed
        //
        // Pre-Conditions:
        // The BeastTemplate needs to be an existing BeastTemplate
        // The EvolutionSet must not be locked
        // The BeastTemplate can't have already been minted or not exist in the EvolutionSet
        //
        pub fun removeBeastTemplate(beastTemplateID: UInt32) {
            pre {
                BasicBeast.beastTemplates[beastTemplateID] != nil: "Cannot add the BeastTemplate to EvolutionSet: The BeastTemplate doesn't exist."
                !self.locked: "Cannot remove the BeastTemplate to the EvolutionSet: The EvolutionSet is locked."
                self.numOfMintedPerBeastTemplate[beastTemplateID] == 0: "The BeastTemplate has already been minted or does not exist in this EvolutionSet." 
            }

            // Set the Beast minted count for this BeastTemplate to nil
            self.numOfMintedPerBeastTemplate[beastTemplateID] = nil

            // Remove the BeastTemplate from the array of beastTemplatesInAnEvolutionSet
            BasicBeast.beastTemplatesInAnEvolutionSet.remove(key: beastTemplateID)

            emit BeastTemplateRemovedFromEvolutionSet(setID: self.setID, beastTemplateID: beastTemplateID)
        }

        // removeAllBeastTemplates removes all the BeastTemplates in the EvolutionSet
        // Afterwards, the EvolutionSet will be empty from BeastTemplates
        // This function will revert if any 
        //
        pub fun removeAllBeastTemplates() {
            let beastTemplatesInSet = self.numOfMintedPerBeastTemplate.keys

            for beastTemplate in beastTemplatesInSet { 
                self.retireBeastTemplate(beastTemplateID: beastTemplate) 
            }
        }


        // retireBeastTemplate retires a BeastTemplate from the EvolutionSet so that it can't mint new Beasts
        // beastTemplates that have been removed from the set can still be retired
        //
        // Parameters: beastTemplateID: The ID of the BeastTemplate that is being retired
        //
        // Pre-Conditions:
        // The BeastTemplate is part of the EvolutionSet and not retired (available for minting).
        // 
        pub fun retireBeastTemplate(beastTemplateID: UInt32) {
            pre {
                self.retired[beastTemplateID] != nil: "Cannot retire the BeastTemplate: The BeastTemplate doesn't exist in the Set."
            }

            if !self.retired[beastTemplateID]! {
                self.retired[beastTemplateID] = true

                 emit BeastTemplateRetiredFromEvolutionSet(setID: self.setID, beastTemplateID: beastTemplateID, numBeasts: self.numOfMintedPerBeastTemplate[beastTemplateID]!)
            }
        }

        // retireAllBeastTemplates retires all the BeastTemplates in the EvolutionSet
        // Afterwards, none of the retired BeastTemplates will be able to mint new Beasts
        //
        pub fun retireAllBeastTemplates() {
            let beastTemplatesInSet = self.numOfMintedPerBeastTemplate.keys

            for beastTemplate in beastTemplatesInSet { 
                self.retireBeastTemplate(beastTemplateID: beastTemplate) 
            }
        }

        // lock() locks the EvolutionSet so that no more BeastTemplates can be added to it
        //
        // Pre-Conditions:
        // The EvolutionSet should not be locked
        pub fun lock() {
            if !self.locked {
                self.locked = true
                emit EvolutionSetLocked(setID: self.setID)
            }
        }
        
        // mintBeast mints a new Beast and returns the newly minted Beast
        // 
        // Parameters: beastTemplateID: The ID of the BeastTemplate that the Beast references
        //             sex: The BeastTemplate's sex. "Female" or "Male"
        //             bornAt: A unix timestamp of when this Beast came into existence
        //             matron: The Beast ID of the matron of this Beast. Set as 0 for genesis
        //             sire: The Beast ID of the sire of this Beast. Set as 0 for genesis
        //             evolvedFrom: The Beast IDs of the Beasts this Beast is evolved from.
        //                          Set as 0 for genesis or special Beasts
        //
        // Pre-Conditions:
        // The Beast must exist in the EvolutionSet and be allowed to mint new Beasts
        //
        // Returns: The NFT that was minted
        // 
        pub fun mintBeast(
                            beastTemplate: BeastTemplate,
                            bornAt: UInt64, 
                            matron: UInt64, 
                            sire: UInt64, 
                            evolvedFrom: [UInt64]
            ): @NFT {
            pre {
                self.numOfMintedPerBeastTemplate[beastTemplate.beastTemplateID] != nil: "Cannot mint the Beast: This BeastTemplate doesn't exist in this set."
                !self.retired[beastTemplate.beastTemplateID]!: "Cannot mint the Beast from this BeastTemplate: This BeastTemplate has been retired in this set."
                evolvedFrom.length != 0: "Cannot mint the Beast: New Beast's evolution origin cannot be empty"
            }

            // Gets the number of Beasts that have been minted for this BeastTemplate
            // to use as this BeastTemplates's serial number
            let numInBeastTemplate = self.numOfMintedPerBeastTemplate[beastTemplate.beastTemplateID]!

            // Mint the new Beast
            let newBeast: @NFT <- create NFT(
                                            evolvedFrom: evolvedFrom,
                                            sire: sire,
                                            matron: matron,
                                            bornAt: bornAt,
                                            serialNumber: numInBeastTemplate + 1 as UInt32, 
                                            beastTemplate: beastTemplate, 
                                            setID: self.setID,
            )

            // Increment the count of Beasts minted for this BeastTemplate
            self.numOfMintedPerBeastTemplate[beastTemplate.beastTemplateID] = numInBeastTemplate + 1 as UInt32

            return <-newBeast
        }
        
        // batchMintBeast mints a specified quantity of a 
        // single referenced BeastTemplate and returns them as a Collection
        // when the same BeastTemplate is being minted in a batch all minted Beasts
        // will have the same bornAt, matron, sire, and evolvedFrom data
        //
        // Parameters: beastTemplateID: the ID of the BeastTemplate that the Beasts are minted for
        //             sex: The BeastTemplate's sex. "Female" or "Male"
        //             bornAt: A unix timestamp of when this Beast came into existence
        //             matron: The Beast ID of the matron of this Beast. Set as 0 for genesis
        //             sire: The Beast ID of the sire of this Beast. Set as 0 for genesis
        //             evolvedFrom: The Beast IDs of the Beasts this Beast is evolved from.
        //                          Set as 0 for genesis or special Beasts
        //             quantity: The quantity of the BeastTemplate to be minted
        //
        // Returns: Collection object that contains all the Beasts that were minted
        pub fun batchMintBeast(
                                beastTemplate: BeastTemplate,
                                sex: String,
                                bornAt: UInt64, 
                                matron: UInt64, 
                                sire: UInt64, 
                                evolvedFrom: [UInt64], 
                                quantity: UInt64
                                ): @Collection {

            let newCollection <- create Collection()

            var count: UInt64 = 0
            while count < quantity {
                newCollection.deposit(token: <-self.mintBeast(
                                                            beastTemplate: beastTemplate,
                                                            bornAt: bornAt, 
                                                            matron: matron, 
                                                            sire: sire, 
                                                            evolvedFrom: evolvedFrom
                                                            )
                )
                count = count + 1 as UInt64
            }

            return <-newCollection
        }

    }

    // BeastData is a struct and contains the metadata of a Beast NFT
    pub struct BeastData {

        // The ID of the EvolutionSet that the Beast comes from
        pub let setID: UInt32

        // The ID of the BeastTemplate that the Beast references
        pub let beastTemplate: BeastTemplate

        // The place in the edition that this Beast was minted
        // Otherwise known as the serial number
        pub let serialNumber: UInt32

        // The BeastTemplate's sex at birth.
        pub let sex: String

        // A unix timestamp of when this Beast came into existence
        pub let bornAt: UInt64
        
        // The Beast ID of the matron of this Beast
        // set to 0 for genesis Beasts
        pub let matron: UInt64

        // The Beast ID of the sire of this Beast
        // set to 0 for genesis Beasts
        pub let sire: UInt64

        // The Beast IDs of the Beasts this Beast is evolved from
        // set to 0 for genesis and special Beasts
        pub let evolvedFrom: [UInt64]

        init(
            setID: UInt32, 
            beastTemplate: BeastTemplate, 
            serialNumber: UInt32,
            sex: String,
            bornAt: UInt64,
            matron: UInt64,
            sire: UInt64,
            evolvedFrom: [UInt64]
        ) {
            self.setID = setID
            self.beastTemplate = beastTemplate
            self.serialNumber = serialNumber
            self.sex = sex
            self.bornAt = bornAt
            self.matron = matron
            self.sire = sire
            self.evolvedFrom = evolvedFrom
        }
    }

    // The resource that represents the Beast NFTs
    //
    pub resource NFT: NonFungibleToken.INFT {
        // Global unique Beast ID
        pub let id: UInt64

        // The nickname of the Beast
        pub var nickname: String?

        // The wallet address of the beneficiary to receive 
        // potential royalty fees from all future trades of this NFT
        pub var beneficiary: Address?

        // Struct of Beast NFT metadata
        pub let data: BeastData

        init(
            evolvedFrom: [UInt64],
            sire: UInt64,
            matron: UInt64,
            bornAt: UInt64,
            serialNumber: UInt32, 
            beastTemplate: BeastTemplate, 
            setID: UInt32, 
            ) {
            // Increment the global Beast IDs
            BasicBeast.totalSupply = BasicBeast.totalSupply + 1 as UInt64

            // Set unique Beast ID to the newly incremented totalSupply
            self.id = BasicBeast.totalSupply

            // Initialize the breedingCount for the newly minted Beast
            BasicBeast.breedingCounts.insert(key: self.id, 0)

            // Set nickname to nil
            // any holder of this NFT can change
            // its nickname
            self.nickname = nil

            // Set beneficiary to nil
            // so the admin that mints the NFT does not 
            // automatically become the beneficiary and 
            // the next holder can potentially be set as beneficiary
            self.beneficiary = nil

            // Initialize sex as "Asexual"
            var sex = "Asexual"
            // Check if BeastTemplate is not asexual
            if !beastTemplate.asexual {
                // Get random 0 or 1 and assign sex as either 
                // Female or Male depending on the result
                var random = getCurrentBlock().timestamp % 2.0

                if 0 == Int(random) {
                    sex = "Female"
                } else {
                    sex = "Male"
                }

            }

            // Set the metadata struct
            self.data = BeastData(
                                setID: setID, 
                                beastTemplate: beastTemplate, 
                                serialNumber: serialNumber,
                                sex: sex,
                                bornAt: bornAt,
                                matron: matron,
                                sire: sire,
                                evolvedFrom: evolvedFrom
            )

            emit BeastMinted(
                            beastID: self.id, 
                            beastTemplate: beastTemplate, 
                            setID: self.data.setID, 
                            serialNumber: self.data.serialNumber, 
                            sex: self.data.sex,
                            bornAt: self.data.bornAt, 
                            matron: self.data.matron,
                            sire: self.data.sire,
                            evolvedFrom: self.data.evolvedFrom
            )
        }

        // setNickname sets the nickname of this NFT
        // 
        // Parameters: nickname: The nickname of the Beast
        //
        pub fun setNickname(nickname: String) {
            self.nickname = nickname

            emit BeastNewNicknameIsSet(id: self.id, nickname: self.nickname!)
        }

        // getNickname returns the nickname of this NFT
        //
        // Returns: The nickname as a String optional
        pub fun getNickname(): String? {
            return self.nickname
        }

        // setBeneficiary sets the beneficiary of this NFT
        // this action cannot be undone
        // 
        // Parameters: beneficiary: The address of the beneficiary
        //
        pub fun setBeneficiary(beneficiary: Address) {
            pre {
                self.beneficiary == nil: "Beneficiary is already initialized"
            }

            self.beneficiary = beneficiary

            emit BeastBeneficiaryIsSet(id: self.id, beneficiary: self.beneficiary!)
        }

        // getBeneficiary returns the beneficiary's address of this NFT
        //
        // Returns: The beneficiary as an Address optional
        pub fun getBeneficiary(): Address? {
            return self.beneficiary
        }

        // If the Beast is destroyed, emit an event to indicate 
        // to outside observers that is has been destroyed.
        destroy() {
            emit BeastDestroyed(id: self.id)
        }
    }

    // Admin is a special authorization resource that
    // allows the owner to perform important functions to modify the
    // various aspects of the BeastTemplates, EvolutionSets, and Beasts
    //
    pub resource Admin {

        // createBeastTemplate creates a new BeastTemplate
        // and stores it in the BeastTemplates dictionary in the Basic Beast smart contract
        // 
        // Parameters: 
        // dexNumber: The dex number of the BeastTemplate
        // name: The name of the BeastTemplate
        // image: The image URL of the BeastTemplate
        // description: The description of the BeastTemplate
        // rarity: The rarity of the BeastTemplate. e.g. "Common" or "Legendary"
        // skin: The skin of the BeastTemplate. e.g. "Normal" or "Shiny Gold"
        // starLevel: The star level of the BeastTemplate
        // asexual: A Boolean indicating if the BeastTemplate is asexual or has a sex e.g. "Female"
        // ultimateSkill: The ultimate skill of the BeastTemplate
        // basicSkills: A string array of the BeastTemplate's basic skills
        // elements: A dictionary mapping of elements to check which elements the BeastTemplate has
        // data: A dictionary mapping other types of metadata titles to the BeastTemplate's data
        // 
        // Returns: the ID of the new BeastTemplate object
        //
        pub fun createBeastTemplate(
                                    dexNumber: UInt32,
                                    name: String, 
                                    image: String,
                                    description: String,
                                    rarity: String,
                                    skin: String,
                                    starLevel: UInt32,
                                    asexual: Bool,
                                    ultimateSkill: String,
                                    basicSkills: [String],
                                    elements: {String: Bool},
                                    data: {String: String}
                                    ): UInt32 {
            // Create the new BeastTemplate
            var newBeastTemplate = BeastTemplate(
                                                dexNumber: dexNumber,
                                                name: name, 
                                                image: image,
                                                description: description,
                                                rarity: rarity,
                                                skin: skin,
                                                starLevel: starLevel,
                                                asexual: asexual,
                                                ultimateSkill: ultimateSkill,
                                                basicSkills: basicSkills,
                                                elements: elements,
                                                data: data
                                                )

            let newID = newBeastTemplate.beastTemplateID

            // Store it in the contract storage
            BasicBeast.beastTemplates[newID] = newBeastTemplate

            return newID
        }

        // createEvolutionSet creates a new EvolutionSet resource and stores it
        // in the EvolutionSets mapping in this contract
        // 
        // Parameters: name: The name of the EvolutionSet
        //
        pub fun createEvolutionSet(name: String) {
            var newSet <- create EvolutionSet(name: name)

            BasicBeast.evolutionSets[newSet.setID] <-! newSet
        }

        // borrowEvolutionSet returns a reference to an EvolutionSet in the Beast
        // contract so that the admin can call methods on it
        //
        // Parameters: setID: The ID of the EvolutionSet that you want to
        // get a reference to
        //
        // Returns: A reference to the EvolutionSet with all of the fields
        // and methods exposed
        //
        pub fun borrowEvolutionSet(setID: UInt32): &EvolutionSet {
            pre {
                BasicBeast.evolutionSets[setID] != nil: "Cannot borrow Set: The Set doesn't exist."
            }

            // use `&` to indicate the reference to the object and/(as) type. 
            return &BasicBeast.evolutionSets[setID] as &EvolutionSet
        }

        // startNewGeneration ends the current generation by incrementing
        // the generation number, meaning that new BeastTemplates will be using the 
        // new generation number from now on
        //
        // Returns: The new generation number
        //
        pub fun startNewGeneration(): UInt32 {
            // end the current generation and start a new one
            // by incrementing the be number
            BasicBeast.currentGeneration = BasicBeast.currentGeneration + 1 as UInt32

            emit NewGenerationStarted(newCurrentGeneration: BasicBeast.currentGeneration)

            return BasicBeast.currentGeneration
        }

        // updateBeastTemplateDataByField updates a BeastTemplate's data
        // by adding a new key-value-pair or changing an existing key's 
        // value in the data dictionary
        //
        // Parameters: 
        // beastTemplateID: The id of the BeastTemplate to update
        // key: The new key or existing key to insert into data
        // value: The value that is to be inserted with the key
        //
        // Returns: The data as a String to String mapping optional
        //
        pub fun updateBeastTemplateDataByField(beastTemplateID: UInt32, key: String, value: String): {String: String}? {
            pre {
                BasicBeast.beastTemplates[beastTemplateID] != nil: "Cannot update BeastTemplate: The BeastTemplate doesn't exist."
            }

            BasicBeast.beastTemplates[beastTemplateID]?.data?.insert(key: key, value)

            emit NewBeastTemplateDataFieldAdded(beastTemplateID: beastTemplateID, key: key, value: value)

            return BasicBeast.beastTemplates[beastTemplateID]?.data
        }

        // removeBeastTemplateDataByField removes a key from 
        // a BeastTemplate's data dictionary
        //
        // Parameters: 
        // beastTemplateID: The id of the BeastTemplate to update
        // key: The key that is to be removed from the data dictionary
        //
        // Returns: The removed key as a String optional
        //
        pub fun removeBeastTemplateDataByField(beastTemplateID: UInt32, key: String): String??  {
            pre {
                BasicBeast.beastTemplates[beastTemplateID] != nil: "Cannot change BeastTemplate data: The BeastTemplate doesn't exist."
            }

            let removedKey = BasicBeast.beastTemplates[beastTemplateID]?.data?.remove(key: key)

            emit BeastTemplateDataFieldRemoved(beastTemplateID: beastTemplateID, key: key)

            return removedKey
        }

        // incrementBeastParentsBreedingCounts increments the 
        // breeding counts of a matron and a sire
        //
        // Parameters: 
        // matron: The reference of the matron Beast
        // sire: The reference of the sire Beast
        //
        // Returns: The breedingCounts UInt64 to UInt32 mapping
        //
        pub fun incrementBeastParentsBreedingCounts(matron: &BasicBeast.NFT, sire: &BasicBeast.NFT): {UInt64: UInt32} {
            pre {
                BasicBeast.breedingCounts[matron.id] != nil: "Cannot increment breeding count: The Matron doesn't exist"
                BasicBeast.breedingCounts[sire.id] != nil: "Cannot increment breeding count: The Sire doesn't exist"
            }
            var matronBreedingCount = BasicBeast.breedingCounts[matron.id] ?? 0 as UInt32

            matronBreedingCount = matronBreedingCount + 1
            
            BasicBeast.breedingCounts.insert(key: matron.id, matronBreedingCount)

            var sireBreedingCount = BasicBeast.breedingCounts[matron.id] ?? 0 as UInt32

            sireBreedingCount = sireBreedingCount + 1
            
            BasicBeast.breedingCounts.insert(key: sire.id, sireBreedingCount)

            emit BeastParentsBreedingCountsIncremented(
                                                matronID: matron.id, 
                                                matronBreedingCount: matronBreedingCount, 
                                                sireID: sire.id, 
                                                sireBreedingCount: sireBreedingCount
            )

            return BasicBeast.breedingCounts
        }

        // createNewAdmin creates a new Admin Resource
        //
        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }
    }

    // This is the interface that users can cast their Beast Collection as
    // to allow others to deposit Beasts into their Collection
    //
    pub resource interface BeastCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun batchDeposit(tokens: @NonFungibleToken.Collection)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowBeast(id: UInt64): &BasicBeast.NFT? { 
            // If the result isn't nil, the id of the returned reference
            // should be the same as the argument to the function
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrw Beast reference: The ID of the returned reference is incorrect"
            }
        }
    }

    // Collection is a resource that every user who owns NFTs 
    // will store in their account to manage their NFTs
    //
    pub resource Collection: BeastCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {
        // Dictionary of Beast conforming tokens
        // NFT is a resource type with a UInt64 ID field
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        // withdraw removes a Beast from the Collection and moves it to the caller
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {

            let token <- self.ownedNFTs.remove(key: withdrawID) 
                ?? panic("Cannot withdraw: The Beast does not exist in the Collection")

            emit Withdraw(id: token.id, from: self.owner?.address)
            
            return <-token
        }

        // batchWithdraw withdraws multiple tokens and returns them as a Collection
        pub fun batchWithdraw(ids: [UInt64]): @NonFungibleToken.Collection {
            // Create a new empty Collection
            var batchCollection <- create Collection()
            
            // Iterate through the ids and withdraw them from the Collection
            for id in ids {
                batchCollection.deposit(token: <-self.withdraw(withdrawID: id))
            }
            
            // Return the withdrawn tokens
            return <-batchCollection
        }

        // deposit takes a Beast and adds it to the Collection's dictionary
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @BasicBeast.NFT

            let id = token.id
            
            // add the new token to the dictionary
            let oldToken <- self.ownedNFTs[id] <- token

            if self.owner?.address != nil {
                emit Deposit(id: id, to: self.owner?.address)
            }

            destroy oldToken
        }

        // batchDeposit takes a Collection object as an argument
        // and deposits each contained NFT into this Collection
        pub fun batchDeposit(tokens: @NonFungibleToken.Collection) {
            let keys = tokens.getIDs()

            // Iterate through the keys in the Collection and deposit each one
            for key in keys {
                self.deposit(token: <-tokens.withdraw(withdrawID: key))
            }

            destroy tokens
        }

        // getIDs returns an array of the IDs that are in the Collection
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // borrowNFT Returns a borrowed reference to a Beast in the Collection
        // so that the caller can read its ID
        //
        // Parameters: id: The ID of the NFT to get the reference for
        //
        // Returns: A reference to the NFT
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return &self.ownedNFTs[id] as &NonFungibleToken.NFT
        }

        // borrowBeast Returns a borrowed reference to a Beast in the Collection
        // so that the caller can read data and call methods from it
        // They can use this to read its setID, beastTemplateID, serialNumber,
        // or any of the EvolutionSetData or Beast Data associated with it by
        // getting the setID or beastTemplateID and reading those fields from
        // the smart contract
        //
        // Parameters: id: The ID of the NFT to get the reference for
        //
        // Returns: A reference to the NFT
        pub fun borrowBeast(id: UInt64): &BasicBeast.NFT? {

            if self.ownedNFTs[id] != nil { 
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &BasicBeast.NFT
            } else {
                return nil
            }

        }

        // If a transaction destroys the Collection object,
        // All the NFTs contained within are also destroyed
        //
        destroy() {
            destroy self.ownedNFTs
        }
    }

    // -----------------------------------------------------------------------
    // Basic Beast contract-level function definitions
    // -----------------------------------------------------------------------

    // createEmptyCollection creates a new, empty Collection object so that
    // a user can store it in their account storage.
    // Once they have a Collection in their storage, they are able to receive
    // Beasts in transactions
    //
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create self.Collection()
    }

    // getAllBeastTemplates returns all the BeastTemplates in this BasicBeast smart contract
    //
    // Returns: An array of all the BeastTemplates that have been created
    pub fun getAllBeastTemplates(): [BasicBeast.BeastTemplate] {
        return self.beastTemplates.values
    }

    // getBeastTemplate returns all the metadata associated with a specific BeastTemplate
    // 
    // Parameters: beastTemplateID: The id of the BeastTemplate that is being searched
    //
    // Returns: The BeastTemplate as a BasicBeast.BeastTemplate optional
    pub fun getBeastTemplate(beastTemplateID: UInt32): BasicBeast.BeastTemplate? {
        return self.beastTemplates[beastTemplateID]
    }

    // getBeastTemplateBasicSkills returns all the basic skills associated with a specific BeastTemplate
    // 
    // Parameters: beastTemplateID: The id of the BeastTemplate that is being searched
    //
    // Returns: The basic skills as a String array optional
    pub fun getBeastTemplateBasicSkills(beastTemplateID: UInt32): [String]? {
        // Don't force a revert if the beastTemplateID is invalid
        return self.beastTemplates[beastTemplateID]?.basicSkills
    }

    // getBeastTemplateElements returns all the elements associated with a specific BeastTemplate
    // 
    // Parameters: beastTemplateID: The id of the BeastTemplate that is being searched
    //
    // Returns: The elements as a String to Bool mapping optional
    pub fun getBeastTemplateElements(beastTemplateID: UInt32): {String: Bool}? {
        // Don't force a revert if the beastTemplateID is invalid
        return self.beastTemplates[beastTemplateID]?.elements
    }

    // getBeastTemplateElementsByField returns the elements associated with a 
    // specific field of the elements
    // 
    // Parameters: beastTemplates: The id of the BeastTemplate that is being searched
    //             field: The element that is being checked
    //
    // Returns: The elements field as a Bool optional
    pub fun getBeastTemplateElementsByField(beastTemplateID: UInt32, field: String): Bool? {
        // Don't force a revert if the beastTemplateID or field is invalid
        if let beastTemplates = self.beastTemplates[beastTemplateID] {
            return beastTemplates.elements[field]
        } else {
            return nil
        }
    }

    // getBeastTemplateData returns all the other data associated with a specific BeastTemplate
    // 
    // Parameters: beastTemplateID: The id of the BeastTemplate that is being searched
    //
    // Returns: The data as a String to String mapping optional
    pub fun getBeastTemplateData(beastTemplateID: UInt32): {String: String}? {
        // Don't force a revert if the beastTemplateID is invalid
        return self.beastTemplates[beastTemplateID]?.data
    }

    // getBeastTemplateDataByField returns the data associated with a 
    // specific field of the data dictionary
    // 
    // Parameters: beastTemplateID: The id of the BeastTemplate that is being searched
    //             field: The data field that is used to search
    //
    // Returns: The data field as a String optional
    pub fun getBeastTemplateDataByField(beastTemplateID: UInt32, field: String): String? {
        // Don't force a revert if the beastTemplateID or field is invalid
        if let beastTemplate = self.beastTemplates[beastTemplateID] {
            return beastTemplate.data[field]
        } else {
            return nil
        }
    } 
    
    // getEvolutionSetName returns the name that the specified EvolutionSet
    //            is associated with.
    // 
    // Parameters: setID: The id of the EvolutionSet that is being searched
    //
    // Returns: The name of the EvolutionSet
    pub fun getEvolutionSetName(setID: UInt32): String? {
        // Don't force a revert if the setID is invalid
        return self.evolutionSets[setID]?.name
    }

    // getSetIDsByName returns the IDs that the specified EvolutionSet name
    //                 is associated with.
    // 
    // Parameters: setName: The name of the EvolutionSet that is being searched
    //
    // Returns: An array of the IDs of the EvolutionSet if it exists, or nil if doesn't
    pub fun getSetIDsByName(setName: String): [UInt32]? {
        var setIDs: [UInt32] = []

        // Iterate through all the setDatas and search for the name
        for setID in self.evolutionSets.keys {
            // If the name is found, return the ID
            if setName == self.EvolutionSetData(setID: setID).name {
                setIDs.append(setID)
            }
        }
        
        // If the name isn't found, return nil
        // Don't force a revert if the setName is invalid
        if setIDs.length == 0 {
            return nil
        } else {
            return setIDs
        }
    }

    // getBeastTemplatesInSet returns the list of beastTemplatesIDs that are in the EvolutionSet
    // 
    // Parameters: setID: The id of the EvolutionSet that is being searched
    //
    // Returns: An array of beastTemplatesIDs
    pub fun getBeastTemplatesInSet(setID: UInt32): [UInt32]? {
        // Don't force a revert if the setID is invalid
        return self.evolutionSets[setID]?.numOfMintedPerBeastTemplate?.keys
    }

    // isEditionRetired returns a boolean that indicates if an EvolutionSet/BeastTemplate combo
    //                  (otherwise known as a Beast edition) is retired.
    //                  If a Beast edition is retired, it still remains in the EvolutionSet,
    //                  but Beasts can no longer be minted from it.
    // 
    // Parameters: setID: The id of the EvolutionSet that is being searched
    //             beastTemplateID: The id of the BeastTemplate that is being searched
    //
    // Returns: Boolean indicating if the Beast edition is retired or not
    pub fun isEditionRetired(setID: UInt32, beastTemplateID: UInt32): Bool? {
        // Don't force a revert if the EvolutionSet or beastTemplateID is invalid
        if self.evolutionSets[setID] != nil {

            // Get reference to the EvolutionSet
            let setToRead = &self.evolutionSets[setID] as &EvolutionSet

            // See if the BeastTemplate is retired from this Set
            let retired = setToRead.retired[beastTemplateID]

            // Return the retired status
            return retired
        } else {
            // If the EvolutionSet wasn't found, return nil
            return nil
        }
    }

    // isEvolutionSetLocked returns a boolean that indicates if an EvolutionSet
    //             is locked. If an EvolutionSet is locked, 
    //             new BeastTemplates can no longer be added to it,
    //             but Beasts can still be minted from BeastTemplates
    //             that are currently in it.
    // 
    // Parameters: setID: The id of the EvolutionSet that is being searched
    //
    // Returns: Boolean indicating if the EvolutionSet is locked or not
    pub fun isEvolutionSetLocked(setID: UInt32): Bool? {
        // Don't force a revert if the setID is invalid
        return self.evolutionSets[setID]?.locked
    }

    // getNumBeastsInEdition return the number of Beasts that have been 
    //                        minted from a certain Beast edition.
    //
    // Parameters: setID: The id of the EvolutionSet that is being searched
    //             beastTemplateID: The id of the BeastTemplate that is being searched
    //
    // Returns: The total number of Beasts 
    //          that have been minted from a specific BeastTemplate
    pub fun getNumBeastsInEdition(setID: UInt32, beastTemplateID: UInt32): UInt32? {
        // Don't force a revert if the EvolutionSet or beastTemplateID is invalid
        if self.evolutionSets[setID] != nil {

            // Get reference to the EvolutionSet
            let setToRead = &self.evolutionSets[setID] as &EvolutionSet

            // Read the numOfMintedPerBeastTemplate
            let amount = setToRead.numOfMintedPerBeastTemplate[beastTemplateID]

            return amount
        } else {
            // If the EvolutionSet wasn't found return nil
            return nil
        }
    }

    // getAllBeastTemplatesInAnEvolutionSet returns the dictionary of all 
    // BeastTemplates that are in an EvolutionSet
    //
    // Returns: The breedingCounts as a UInt64 to UInt32 mapping
    pub fun getAllBeastTemplatesInAnEvolutionSet(): {UInt32: UInt32} {
        return self.beastTemplatesInAnEvolutionSet
    }

    // getBeastTemplateEvolutionSet returns the EvolutionSet 
    // that a BeastTemplate is in
    // 
    // Parameters: beastTemplateID: The id of the BeastTemplate that is being searched
    //
    // Returns: The breedingCount as a UInt32 optional
    pub fun getBeastTemplateEvolutionSet(beastTemplateID: UInt32): UInt32? {
        // Don't force a revert if the beastTemplateID is invalid
        return self.beastTemplatesInAnEvolutionSet[beastTemplateID]
    }

    // getAllBreedingCounts returns the dictionary of all Beasts' breedingCounts
    //
    // Returns: The breedingCounts as a UInt64 to UInt32 mapping
    pub fun getAllBreedingCounts(): {UInt64: UInt32} {
        return self.breedingCounts
    }

    // getBeastBreedingCount returns the breedingCount of a Beast
    // 
    // Parameters: beastID: The id of the Beast that is being searched
    //
    // Returns: The breedingCount as a UInt32 optional
    pub fun getBeastBreedingCount(beastID: UInt64): UInt32? {
        // Don't force a revert if the beastID is invalid
        return self.breedingCounts[beastID]
    }

    // Get BreedingCount of NFT

    // -----------------------------------------------------------------------
    // BasicBeast contract initialization function
    // -----------------------------------------------------------------------
    //
    init() {
        // Initialize the named paths
        self.CollectionStoragePath = /storage/BasicBeastCollection
        self.CollectionPublicPath = /public/BasicBeastCollection
        self.AdminStoragePath = /storage/BasicBeastAdmin

        // Initialize the fields
        self.currentGeneration = 1
        self.beastTemplates = {}
        self.evolutionSets <- {}
        self.beastTemplatesInAnEvolutionSet = {}
        self.breedingCounts = {}
        self.nextBeastTemplateID = 0
        self.nextSetID = 0
        self.totalSupply = 0

        // Put a new Collection in storage
        self.account.save<@Collection>(<- create Collection(), to: self.CollectionStoragePath)

        // Create a public capability for the Collection
        self.account.link<&{BeastCollectionPublic}>(self.CollectionPublicPath, target: self.CollectionStoragePath)

        // Put the Minter in storage
        self.account.save<@Admin>(<- create Admin(), to: self.AdminStoragePath)
        
        emit ContractInitialized()
    }

}
 