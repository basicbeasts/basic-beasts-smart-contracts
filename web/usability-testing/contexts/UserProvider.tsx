import { FC, createContext, useContext } from "react"
import * as fcl from "@onflow/fcl"
import useBasicBeasts from "@hooks/use-basic-beasts.hook"
import useCurrentUser from "@hooks/use-current-user.hook"

export interface State {}

const initialState = {}

const Context = createContext<State | any>(initialState)

const UserProvider: FC = ({ children }) => {
  const [user, address]: any = useCurrentUser()

  // useBasicBeasts
  const {
    data: isBeastCollectionInitialized,
    loading,
    initializeBeastCollection,
    getAllBeastTemplates,
    createBeastTemplate,
  } = useBasicBeasts(user)

  return (
    <Context.Provider
      value={{
        isBeastCollectionInitialized,
        loading,
        initializeBeastCollection,
        getAllBeastTemplates,
        createBeastTemplate,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export default UserProvider

export const useUser = () => {
  return useContext(Context)
}
