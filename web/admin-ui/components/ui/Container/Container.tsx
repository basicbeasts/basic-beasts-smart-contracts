import React, { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import Table, { TableStyles } from '../Table';
import beastTemplates from '../../../../usability-testing/data/beastTemplates';
import BeastTemplate from '../../../../usability-testing/utils/BeastTemplate';
import BeastCard from '../../../components/ui/BeastCard';

const Wrapper = styled.div`
	padding: 6em 6em 3em;
	position: relative;
	-webkit-box-pack: center;
	justify-content: center;
	@media (max-width: 899px) {
		padding: 0;
	}
`;

const Content = styled.div`
	position: relative;
	display: flex;
	flex-flow: column wrap;
	-webkit-box-pack: center;
	justify-content: center;
`;

const CardContainer = styled.div`
	position: relative;
	z-index: 1;
`;

const Card = styled.div<{
	bgColor: string;
	marginTop: string;
	bgColor2: string;
	fontColor: string;
}>`
	background: ${(props) => props.bgColor};
	position: relative;
	display: flex;
	gap: 30px;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	color: #333333;
	margin: 0 auto;
	padding: 1.5rem;
	width: 60vw;
	border-radius: 12px;
	margin-top: 6vw;

	@media (max-width: 1010px) {
		margin-top: ${(props) => props.marginTop};
		padding: 1.5rem 1.5rem 3rem;
		width: 80vw;
		flex-direction: column;
		//important to keep
		overflow-x: hidden;
	}
	::before {
		content: 'Overview';

		background: ${(props) => props.bgColor2};
		color: ${(props) => props.fontColor};
		position: absolute;
		height: 7vw;
		width: 29%;
		z-index: -1;
		padding-bottom: 4vw;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2.3vw;
		border-radius: 12px 12px 0 0;
		top: -3vw;
		left: 0;
		box-sizing: border-box;

		@media (max-width: 1010px) {
			width: 60%;
			font-size: 7vw;
			height: 13vw;
			top: -10vw;
			padding-bottom: 3vw;
		}
	}
`;

const CardImageContainer = styled.div`
	display: flex;
	flex-direction: column;
	@media (max-width: 1010px) {
		/* width: 70%; */
		margin-top: 5vw;
	}
`;
const H1 = styled.h1`
	font-size: 5em;

	font-weight: 400;
	margin: 0;
`;
const H2 = styled.h2`
	font-size: 2.2em;
	font-weight: 400;
	margin: 0;
`;

const Container: FC = () => {
	const columns = useMemo(
		() => [
			{
				Header: 'Beast Templates',
				columns: [
					{
						Header: 'beastTemplateID',
						accessor: 'beastTemplateID',
					},
					{
						Header: 'name',
						accessor: 'name',
					},
					{
						Header: 'skin',
						accessor: 'skin',
					},
					{
						Header: 'starLevel',
						accessor: 'starLevel',
					},
					{
						Header: 'maxAdminMintAllowed',
						accessor: 'maxAdminMintAllowed',
					},
				],
			},
		],
		[]
	);

	const data = useMemo(
		() => [
			{
				beastTemplateID: 1,
				name: 'Moon',
				skin: 'Normal',
				starLevel: 1,
				maxAdminMintAllowed: 1000,
			},
			{
				beastTemplateID: 2,
				name: 'Moon',
				skin: 'Metallic Silver',
				starLevel: 1,
				maxAdminMintAllowed: 1000000000,
			},
			{
				beastTemplateID: 3,
				name: 'Moon',
				skin: 'Cursed Black',
				starLevel: 1,
				maxAdminMintAllowed: 200,
			},
		],
		[]
	);

	const [selectedRow, setSelectedRow] = useState();
	const [beastTemplateID, setBeastTemplateID] = useState();
	const [beastTemplate, setBeastTemplate] = useState<
		BeastTemplate | undefined
	>();

	const selectRow = (index: any, id: any) => {
		setSelectedRow(index);
		setBeastTemplate(beastTemplates[id]);
	};

	return (
		<Wrapper>
			<Content>
				<H1>Beast Template</H1>
				<H2>Admin Dashboard</H2>
				<CardContainer>
					<Card
						bgColor={'#fff'}
						marginTop={'13vw'}
						bgColor2={'#737374'}
						fontColor={'#fff'}
					>
						<CardImageContainer>
							<H2>Overview of Created Beast Template(s)</H2>

							<TableStyles>
								<Table
									columns={columns}
									data={data}
									getRowProps={(row: any) => ({
										style: {
											background:
												row.index == selectedRow
													? '#ffe597'
													: 'white',
										},
									})}
									selectRow={selectRow}
								/>
							</TableStyles>
						</CardImageContainer>
						{beastTemplate != null ? (
							<div>
								<BeastCard beastTemplate={beastTemplate} />
							</div>
						) : (
							<></>
						)}
					</Card>
				</CardContainer>
			</Content>
		</Wrapper>
	);
};

export default Container;
