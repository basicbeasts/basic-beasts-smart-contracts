import React, { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import Table, { TableStyles } from '../Table';
import beastTemplates from '../../../../usability-testing/data/beastTemplates';
import BeastTemplate from '../../../../usability-testing/utils/BeastTemplate';
import BeastCard from '../BeastCard';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import star from '../../../public/basic_starLevel.png';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import FungibleTokenCard from '../FungibleTokenOverview/FungibleTokenCard';

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

const CardTransparent = styled.div<{
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
	border-radius: 0px;

	@media (max-width: 1010px) {
		margin-top: ${(props) => props.marginTop};
		padding: 1.5rem 1.5rem 3rem;
		width: 80vw;
		flex-direction: column;
		//important to keep
		overflow-x: hidden;
	}
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
const H3 = styled.h3`
	font-size: 1.2em;
	font-weight: 400;
	margin: 0 0 5px;
	color: #707070;
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

const ContainerRow = styled.div`
	flex-direction: row;
	display: flex;
	width: 100%;
`;

const Button = styled.button`
	margin-left: 15px;
	font-size: 1em;
	border-radius: 13px;
	width: 150px;
	height: 1.7vw;
	background: #ffd966;
	color: #a15813;
	border: none;
	cursor: pointer;
	&:hover {
		background: #ffd966d9;
	}
`;

const MainBox = styled.div`
	background: #ffffff;
	padding: 20px 40px;
	border-radius: 10px;
	box-shadow: 3px 3px 9px 0px rgba(0, 0, 0, 0.2);
	margin-left: 30px;
`;

const InfoBox = styled.div`
	background: #ffffff;
	padding: 20px 40px;
	border-radius: 10px;
	box-shadow: 3px 3px 9px 0px rgba(0, 0, 0, 0.2);
	margin-left: 30px;
	width: 29vw;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const YellowHeading = styled.h3`
	color: #e4be23;
	font-weight: 400;
	margin: 0;
`;

const StyledTable = styled.div`
	table {
		margin-top: 20px;
	}
	th {
		color: #636672be;
		font-weight: 400;
	}
	td {
		text-align: center;
		border-left: 1px solid #7070706d;
		font-size: 1.5em;
	}
	td:first-child {
		border-left: none;
	}
	th,
	td {
		padding: 0 15px 10px;
	}
`;

const BigNumber = styled.div`
	font-size: 3.5em;
	padding: 10px 50px 0;
	text-align: center;
`;

const Heading = styled.h3`
	font-weight: 400;
	margin: 0;
	font-size: 1.5em;
	text-align: center;
`;

const ActionContainer = styled.div`
	margin: 20px 0;
`;

const BeastBox = styled.div`
	background: #ffffff;
	padding: 20px 40px;
	border-radius: 10px;
	box-shadow: 3px 3px 9px 0px rgba(0, 0, 0, 0.2);
	margin-left: 30px;
	margin-top: 30px;
	flex-direction: row;
	display: flex;
`;

const DropDownAction = styled.div`
	flex-direction: row;
	display: flex;
`;

const PackOverview: FC = () => {
	const [tab, setTab] = useState<
		'overview' | 'adminNftCollection' | 'mintPacks'
	>('overview');

	// For 'Overview' tab
	const [selectedRow, setSelectedRow] = useState();
	const [beastTemplate, setBeastTemplate] = useState<
		BeastTemplate | undefined
	>();
	// For 'Create Beast Template' tab
	const [beastTemplateID, setBeastTemplateID] = useState();

	const selectRow = (index: any, id: any) => {
		setSelectedRow(index);
		setBeastTemplate(beastTemplates[id]);
	};

	const columns = useMemo(
		() => [
			{
				Header: 'Minted Packs ',
				columns: [
					{
						Header: 'Pack ID',
						accessor: 'id',
					},
					{
						Header: 'Stock Number',
						accessor: 'stockNumber',
					},
					{
						Header: 'Template ID',
						accessor: 'packTemplateID',
					},
					{
						Header: 'Name',
						accessor: 'name',
					},
					{
						Header: 'Beast Name',
						accessor: 'beastName',
					},
					{
						Header: 'Beast Skin',
						accessor: 'beastSkin',
					},
					{
						Header: 'Minted',
						accessor: 'minted',
					},
				],
			},
		],
		[]
	);

	const data = useMemo(
		() => [
			{
				packTemplateID: 1,
				name: 'Starter',
				minted: 'false',
				stockNumber: 1,
				id: 1,
				beastName: 'Moon',
				beastSkin: 'Normal',
			},
			{
				packTemplateID: 2,
				name: 'Metallic Silver',
				minted: 'false',
				stockNumber: 2,
				id: 2,
				beastName: 'Moon',
				beastSkin: 'Metallic Silver',
			},
			{
				packTemplateID: 3,
				name: 'Cursed Black',
				minted: 'false',
				stockNumber: 3,
				id: 3,
				beastName: 'Moon',
				beastSkin: 'Cursed Black',
			},
			{
				packTemplateID: 4,
				name: 'Shiny Gold',
				minted: 'false',
				stockNumber: 4,
				id: 4,
				beastName: 'Moon',
				beastSkin: 'Shiny Gold',
			},
		],
		[]
	);

	return (
		<Container>
			<Content>
				<H1>Pack Preparation</H1>
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
								setTab('adminNftCollection');
							}}
							selected={tab === 'adminNftCollection'}
						>
							Admin Pack Collection
						</Tab>
						<Tab
							onClick={() => {
								setTab('mintPacks');
							}}
							selected={tab === 'mintPacks'}
						>
							Mint Packs
						</Tab>
					</Tabs>
					{tab === 'overview' ? (
						<>
							<CardTransparent
								bgColor={'#f8f8f8'}
								marginTop={'13vw'}
								bgColor2={'#737374'}
								fontColor={'#fff'}
							>
								<ContainerRow>
									<H2>Overview of Minted Packs</H2>
								</ContainerRow>
							</CardTransparent>
							<ContainerRow>
								<MainBox>
									<Heading>Total Minted Packs</Heading>
									<BigNumber>2833</BigNumber>
								</MainBox>
								<InfoBox>
									<YellowHeading>
										Total Number of Packs minted
									</YellowHeading>
									<StyledTable>
										<table>
											<tr>
												<th>Starter</th>
												<th>Metallic Silver</th>
												<th>Cursed Black</th>
												<th>Shiny Gold</th>
											</tr>
											<tr>
												<td>1916</td>
												<td>838</td>
												<td>48</td>
												<td>31</td>
											</tr>
										</table>
									</StyledTable>
								</InfoBox>
							</ContainerRow>
							<ContainerRow>
								<FungibleTokenCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/packs/pack_thumbnails/starter_thumbnail.png'
									}
									name={'Starter Pack'}
								/>
							</ContainerRow>
							<ContainerRow>
								<FungibleTokenCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/packs/pack_thumbnails/metallic_silver_thumbnail.png'
									}
									name={'Metallic Silver Pack'}
								/>
							</ContainerRow>
							<ContainerRow>
								<FungibleTokenCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/packs/pack_thumbnails/cursed_black_thumbnail.png'
									}
									name={'Cursed Black Pack'}
								/>
							</ContainerRow>

							<ContainerRow>
								<FungibleTokenCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/packs/pack_thumbnails/shiny_gold_thumbnail.png'
									}
									name={'Shiny Gold Pack'}
								/>
							</ContainerRow>
						</>
					) : (
						<></>
					)}
					{tab === 'adminNftCollection' ? (
						<>
							<Card
								bgColor={'#fff'}
								marginTop={'13vw'}
								bgColor2={'#737374'}
								fontColor={'#fff'}
							>
								<div>
									<H2>Admin Pack Collection</H2>

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
					{tab === 'mintPacks' ? (
						<>
							<Card
								bgColor={'#fff'}
								marginTop={'13vw'}
								bgColor2={'#737374'}
								fontColor={'#fff'}
							>
								<div>
									<H2>Pack Data Batches</H2>

									<ActionContainer>
										<H3>Select batch number</H3>
										<DropDownAction>
											<Dropdown
												options={['1', '2', '3']}
												onChange={(e) => {
													console.log();
												}}
												// value={beastIDs[0].toString()}
												placeholder="batch number"
											/>
											<Button
												onClick={() => console.log()}
											>
												Mint & Prepare packs
											</Button>
										</DropDownAction>
									</ActionContainer>

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

export default PackOverview;
