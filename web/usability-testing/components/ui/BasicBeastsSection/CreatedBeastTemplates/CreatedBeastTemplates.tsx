import { FC, useMemo } from "react"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import Table, { TableStyles } from "@components/ui/Table"

type Props = {
  id: any
  title: String
  beastTemplateData: any
  beastTemplateIDs: any
}

const CreatedBeastTemplates: FC<Props> = ({
  id,
  title,
  beastTemplateData,
  beastTemplateIDs,
}) => {
  const columns = useMemo(
    () => [
      {
        Header: "Beast Templates",
        columns: [
          {
            Header: "beastTemplateID",
            accessor: "beastTemplateID",
          },
          {
            Header: "dexNumber",
            accessor: "dexNumber",
          },
          {
            Header: "name",
            accessor: "name",
          },
          {
            Header: "description",
            accessor: "description",
          },
          {
            Header: "image",
            accessor: "image",
          },
          {
            Header: "imageTransparentBg",
            accessor: "imageTransparentBg",
          },
          {
            Header: "rarity",
            accessor: "rarity",
          },
          {
            Header: "skin",
            accessor: "skin",
          },
          {
            Header: "starLevel",
            accessor: "starLevel",
          },
          {
            Header: "asexual",
            accessor: "asexual",
          },
          {
            Header: "breedableBeastTemplateID",
            accessor: "breedableBeastTemplateID",
          },
          {
            Header: "maxAdminMintAllowed",
            accessor: "maxAdminMintAllowed",
          },
          {
            Header: "ultimateSkill",
            accessor: "ultimateSkill",
          },
          {
            Header: "basicSkills",
            accessor: "basicSkills",
          },
          {
            Header: "elements",
            accessor: "elements",
          },
        ],
      },
    ],
    [],
  )

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <h3>getAllBeastTemplates()</h3>
        {beastTemplateData != null ? (
          <TableStyles>
            <Table columns={columns} data={beastTemplateData} />
          </TableStyles>
        ) : (
          <></>
        )}
        <h3>getAllBeastTemplateIDs()</h3>
        <span>All Beast Template IDs created: </span>
        {beastTemplateIDs != null ? (
          <>
            {beastTemplateIDs.map((id: any, i: any) => (
              <span>
                {id}
                {", "}
              </span>
            ))}
          </>
        ) : (
          <></>
        )}
      </TestSection>
    </TestSectionStyles>
  )
}

export default CreatedBeastTemplates
