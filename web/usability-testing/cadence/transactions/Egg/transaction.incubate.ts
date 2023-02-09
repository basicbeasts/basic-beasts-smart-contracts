export const INCUBATE = `
import Egg from 0xEgg

transaction(eggID: UInt64) {

    prepare(acct: AuthAccount) {

        let eggCollectionRef = acct.borrow<&Egg.Collection>(from: Egg.CollectionStoragePath)
            ?? panic("Couldn't get a reference to the egg collection")
            
        let eggRef = eggCollectionRef.borrowEntireEgg(id: eggID)

        eggRef!.incubate()
        
    }

}

`
