import React, { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import Table, { TableStyles } from '../Table';
import beastTemplates from '../../../../usability-testing/data/beastTemplates';
import BeastTemplate from '../../../../usability-testing/utils/BeastTemplate';
import BeastCard from '../BeastCard';

const Container = styled.div`
	padding: 6em 6em 3em;
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
	margin-top: 40px;
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
	align-items: flex-start;
	color: #333333;
	margin: 0 auto;
	padding: 1.5rem;
	border-radius: 12px;

	@media (max-width: 1010px) {
		margin-top: ${(props) => props.marginTop};
		padding: 1.5rem 1.5rem 3rem;
		width: 80vw;
		flex-direction: column;
		//important to keep
		overflow-x: hidden;
	}
	/* ::before {
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
	} */
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

const Tabs = styled.div`
	flex-direction: row;
	display: flex;
`;

const Tab = styled.div<{ selected?: boolean }>`
	background-color: ${(props) => (props.selected ? '#737374' : '#BDBDBE')};
	color: #f8f8f8;
	/* padding-top: 5px;
	padding-bottom: 10px;
	padding-left: 15px;
	padding-right: 30px; */
	color: #fff;
	/* z-index: -1; */
	margin-bottom: -10px;
	padding: 0.1vw 2vw 1vw;
	display: flex;
	justify-content: center;
	/* align-items: center; */
	font-size: 1.5vw;
	border-radius: 12px 12px 0 0;
	/* left: 0; */
	/* box-sizing: border-box; */
	font-weight: 400;
	cursor: pointer;
`;

const BeastTemplateOverview: FC = () => {
	const [tab, setTab] = useState<'overview' | 'createBeastTemplate'>(
		'overview'
	);

	const columns = useMemo(
		() => [
			{
				Header: 'Beast Templates',
				columns: [
					{
						Header: 'Beast Template ID',
						accessor: 'beastTemplateID',
					},
					{
						Header: 'Name',
						accessor: 'name',
					},
					{
						Header: 'Skin',
						accessor: 'skin',
					},
					{
						Header: 'Star Level',
						accessor: 'starLevel',
					},
					{
						Header: 'Max Mint Allowed',
						accessor: 'maxAdminMintAllowed',
					},
					{
						Header: 'Num Minted',
						accessor: 'numMintedPerBeastTemplate',
					},
					{
						Header: 'Retired',
						accessor: 'retired',
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
				numMintedPerBeastTemplate: 0,
				retired: 'false',
			},
			{
				beastTemplateID: 2,
				name: 'Moon',
				skin: 'Metallic Silver',
				starLevel: 1,
				maxAdminMintAllowed: 1000000000,
				numMintedPerBeastTemplate: 0,
				retired: 'false',
			},
			{
				beastTemplateID: 3,
				name: 'Moon',
				skin: 'Cursed Black',
				starLevel: 1,
				maxAdminMintAllowed: 200,
				numMintedPerBeastTemplate: 0,
				retired: 'false',
			},
			{
				beastTemplateID: 6,
				name: 'Saber',
				skin: 'Normal',
				starLevel: 1,
				maxAdminMintAllowed: 1000,
				numMintedPerBeastTemplate: 0,
				retired: 'false',
			},
		],
		[]
	);

	const [selectedRow, setSelectedRow] = useState();
	const [beastTemplate, setBeastTemplate] = useState<
		BeastTemplate | undefined
	>();

	const selectRow = (index: any, id: any) => {
		setSelectedRow(index);
		setBeastTemplate(beastTemplates[id]);
	};

	return (
		<Container>
			<Content>
				<H1>Beast Template</H1>
				<H2>Admin Dashboard</H2>
				<CardContainer>
					<Tabs>
						<Tab
							onClick={() => setTab('overview')}
							selected={tab === 'overview'}
						>
							Overview
						</Tab>
						<Tab
							onClick={() => {
								setTab('createBeastTemplate');
							}}
							selected={tab === 'createBeastTemplate'}
						>
							Create Beast Template
						</Tab>
					</Tabs>
					{tab === 'overview' ? (
						<>
							<Card
								bgColor={'#fff'}
								marginTop={'13vw'}
								bgColor2={'#737374'}
								fontColor={'#fff'}
							>
								<div>
									<H2>
										Overview of Created Beast Template(s)
									</H2>

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
								</div>
								{beastTemplate != null ? (
									<div>
										<BeastCard
											beastTemplate={beastTemplate}
										/>
									</div>
								) : (
									<></>
								)}
							</Card>
						</>
					) : (
						<></>
					)}
					{tab === 'createBeastTemplate' ? (
						<>
							<Card
								bgColor={'#fff'}
								marginTop={'13vw'}
								bgColor2={'#737374'}
								fontColor={'#fff'}
							>
								<div>
									<H2>Create Beast Template</H2>
									<div>Fetch a Beast Template</div>

									<H2>Beast Template Info</H2>
								</div>
							</Card>
						</>
					) : (
						<></>
					)}
				</CardContainer>
			</Content>
		</Container>
	);
};

export default BeastTemplateOverview;
