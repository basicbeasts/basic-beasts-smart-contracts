import { useEffect, useState } from "react"
import * as fcl from "@onflow/fcl"

export default function useCurrentUser() {
  const [user, setUser] = useState({ addr: null })

  const logIn = () => {
    fcl.authenticate()
  }

  const logOut = () => {
    fcl.unauthenticate()
  }

  useEffect(() => {
    fcl.currentUser().subscribe(setUser)
  }, [])

  return [user, user?.addr != null, logIn, logOut]
}
