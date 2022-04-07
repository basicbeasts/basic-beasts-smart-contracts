import { FC } from "react"
import FuncButton from "@components/ui/FuncButton"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"

type Props = {
  id: any
  title: String
  initializeBeastCollection: any
  isBeastCollectionInitialized: any
}

const SetupAccount: FC<Props> = ({
  id,
  title,
  initializeBeastCollection,
  isBeastCollectionInitialized,
}) => {
  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <h3>Setup Beast Collection</h3>
        <FuncButton onClick={() => initializeBeastCollection()}>
          createEmptyCollection()
        </FuncButton>
        <br />
        <br />
        {isBeastCollectionInitialized ? (
          <div className="green-text">Collection is initialized</div>
        ) : (
          <>
            <div className="red-text">Collection is not initialized</div>
          </>
        )}
      </TestSection>
    </TestSectionStyles>
  )
}

export default SetupAccount
