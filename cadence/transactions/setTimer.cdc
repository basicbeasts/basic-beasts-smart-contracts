import Egg from 0xfa252d0aa22bf86a

transaction() {
    let adminRef: &Egg.Admin

    prepare(signer: AuthAccount) {
        self.adminRef = signer
            .borrow<&Egg.Admin>(from: Egg.AdminStoragePath)
            ?? panic("borrow battle field admin failed")
    }

    execute {
        self.adminRef.setTimer(durationInSeconds: 1.0)
    }
}