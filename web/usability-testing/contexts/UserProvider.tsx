import { FC, createContext, useContext } from "react"
import useBeastCollection from "@hooks/basic_beasts_hooks/use-beast-collection.hook"
import useCurrentUser from "@hooks/use-current-user.hook"
import useBeastTemplate from "@hooks/basic_beasts_hooks/use-beast-template.hook"

export interface State {}

const initialState = {}

const Context = createContext<State | any>(initialState)

const UserProvider: FC = ({ children }) => {
  const [user, address]: any = useCurrentUser()

  // useBeastCollection
  const { data: isBeastCollectionInitialized, initializeBeastCollection } =
    useBeastCollection(user)

  // useBeastCollection
  const {
    data: beastTemplates,
    getAllBeastTemplates,
    createBeastTemplate,
    getBeastTemplate,
    beastTemplateData,
    fetchedBeastTemplate,
    getAllBeastTemplateIDs,
    beastTemplateIDs,
  } = useBeastTemplate(user)

  return (
    <Context.Provider
      value={{
        isBeastCollectionInitialized,
        initializeBeastCollection,
        beastTemplates,
        getAllBeastTemplates,
        createBeastTemplate,
        getBeastTemplate,
        beastTemplateData,
        fetchedBeastTemplate,
        getAllBeastTemplateIDs,
        beastTemplateIDs,
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
