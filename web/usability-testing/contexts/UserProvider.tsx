import { FC, createContext, useContext } from "react"
import useBeastCollection from "@hooks/basic-beasts-hooks/use-beast-collection.hook"
import useCurrentUser from "@hooks/use-current-user.hook"
import useBeastTemplate from "@hooks/basic-beasts-hooks/use-beast-template.hook"
import useBeast from "@hooks/basic-beasts-hooks/use-beast.hook"

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

  //useBeast
  const {
    data: getNumberMintedPerBeastTemplate,
    numberMintedPerBeastTemplate,
  } = useBeast(user)

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
        getNumberMintedPerBeastTemplate,
        numberMintedPerBeastTemplate,
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
