import React, { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import Table, { TableStyles } from '../Table';
import beastTemplates from '../../../../usability-testing/data/beastTemplates';
import BeastTemplate from '../../../../usability-testing/utils/BeastTemplate';
import BeastCard from '../BeastCard';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import star from '../../../public/basic_starLevel.png';
import { GET_TOTAL_SUPPLY_BASIC_BEASTS } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.get-total-supply';
import { query } from '@onflow/fcl';

const Container = styled.div`
	padding: 6em 6em 3em;
	-webkit-box-pack: center;
	justify-content: center;
	background: #f8f8f8;
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
	margin-right: 400px;

	@media (max-width: 1010px) {
		margin-top: ${(props) => props.marginTop};
		padding: 1.5rem 1.5rem 3rem;
		width: 80vw;
		flex-direction: column;
		//important to keep
		overflow-x: hidden;
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

const InfoBox = styled.div`
	background: #ffffff;
	padding: 20px 40px;
	border-radius: 10px;
	box-shadow: 3px 3px 9px 0px rgba(0, 0, 0, 0.2);
	margin-left: 30px;
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

const BeastBox = styled.div`
	background: #ffffff;
	padding: 20px 40px;
	border-radius: 10px;
	box-shadow: 3px 3px 9px 0px rgba(0, 0, 0, 0.2);
	margin-left: 30px;
	margin-top: 30px;
	width: 46vw;
	flex-direction: row;
	display: flex;
	height: 250px;
`;
const BeastImageBox = styled.div`
	background: #ffd966;
	height: 250px;
	width: 200px;
	border-radius: 10px;
	position: relative;
	right: 40px;
	bottom: 20px;
`;

const BeastBoxWrapper = styled.div`
	margin: 15px 0 0 20px;
`;

const BeastHeader = styled.div`
	display: table;
	clear: both;
	width: 100%;
	padding: 10px 20px 0;
	color: #fff;
`;

const BeastName = styled.div`
	float: left;
	font-size: 3em;
`;

const BeastDexNumber = styled.div`
	float: right;
	font-size: 2em;
	margin-top: 18px;
`;

const BeastImage = styled.img`
	width: 150px;
	top: 70px;
	left: 20px;
	position: relative;
	user-drag: none;
	-webkit-user-drag: none;
`;

const StarImg = styled.img`
	width: 25px;
	margin-left: 20px;
	margin-top: 10px;
	user-drag: none;
	-webkit-user-drag: none;
	float: left;
`;

const BeastOverview: FC = () => {
	const [tab, setTab] = useState<
		'overview' | 'adminNftCollection' | 'mintBeasts'
	>('overview');

	// For 'Overview' tab
	const [selectedRow, setSelectedRow] = useState();
	const [beastTemplate, setBeastTemplate] = useState<
		BeastTemplate | undefined
	>();

	const [totalMinted, setTotalMinted] = useState(0);

	const selectRow = (index: any, id: any) => {
		setSelectedRow(index);
		setBeastTemplate(beastTemplates[id]);
	};

	const columns = useMemo(
		() => [
			{
				Header: 'Beast Collection',
				columns: [
					{
						Header: 'Beast ID',
						accessor: 'id',
					},
					{
						Header: 'Serial Number',
						accessor: 'serialNumber',
					},
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
						Header: 'sex',
						accessor: 'sex',
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
				serialNumber: 1,
				id: 532,
				sex: 'Female',
			},
			{
				beastTemplateID: 2,
				name: 'Moon',
				skin: 'Metallic Silver',
				starLevel: 1,
				serialNumber: 1,
				id: 531,
				sex: 'Female',
			},
			{
				beastTemplateID: 3,
				name: 'Moon',
				skin: 'Cursed Black',
				starLevel: 1,
				serialNumber: 1,
				id: 522,
				sex: 'Male',
			},
			{
				beastTemplateID: 4,
				name: 'Moon',
				skin: 'Shiny Gold',
				starLevel: 1,
				serialNumber: 1,
				id: 552,
				sex: 'Female',
			},
			{
				beastTemplateID: 6,
				name: 'Saber',
				skin: 'Normal',
				starLevel: 1,
				serialNumber: 1,
				id: 632,
				sex: 'Male',
			},
		],
		[]
	);

	const getTotalMintedBeasts = async () => {
		try {
			let beastTemplateIDs = await query({
				cadence: GET_TOTAL_SUPPLY_BASIC_BEASTS,
			});
			setTotalMinted(beastTemplateIDs);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<Container>
			<Content>
				<H1>Beast Overview</H1>
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
							Admin Beast Collection
						</Tab>
						<Tab
							onClick={() => {
								setTab('mintBeasts');
							}}
							selected={tab === 'mintBeasts'}
						>
							Mint Beasts
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
									<H2>Overview of Minted Beasts</H2>
									{/* TODO:  Create Filter
									<Input placeholder="dexNumber" />
									<Button>Search</Button> */}
								</ContainerRow>
							</CardTransparent>
							<ContainerRow>
								<InfoBox>
									<Heading>Total Minted Beasts</Heading>
									<BigNumber>{totalMinted}</BigNumber>
								</InfoBox>
								<InfoBox>
									<YellowHeading>
										Total Number of Skins in circulation
									</YellowHeading>
									<StyledTable>
										<table>
											<tr>
												<th>Normal</th>
												<th>Metallic Silver</th>
												<th>Cursed Black</th>
												<th>Shiny Gold</th>
												<th>Mythic Diamond</th>
											</tr>
											<tr>
												<td>1916</td>
												<td>838</td>
												<td>48</td>
												<td>31</td>
												<td>0</td>
											</tr>
										</table>
									</StyledTable>
								</InfoBox>
							</ContainerRow>

							<ContainerRow>
								<BeastBox>
									<BeastImageBox>
										<BeastHeader>
											<BeastName>Moon</BeastName>
											<BeastDexNumber>
												#001
											</BeastDexNumber>
										</BeastHeader>
										<StarImg src={star.src} />
										<BeastImage
											src={
												'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/beasts/001_normal.png'
											}
										/>
									</BeastImageBox>
									<BeastBoxWrapper>
										<YellowHeading>
											Total Number of Skins in circulation
										</YellowHeading>
										<StyledTable>
											<table>
												<tr>
													<th>Normal</th>
													<th>Metallic Silver</th>
													<th>Cursed Black</th>
													<th>Shiny Gold</th>
													<th>Mythic Diamond</th>
												</tr>
												<tr>
													<td>
														<div>133/1000</div>
														<div
															style={{
																width: 60,
																height: 60,
																margin: '10px auto 0',
															}}
														>
															<CircularProgressbar
																value={0.133}
																maxValue={1}
																text={`${
																	0.133 * 100
																}%`}
																styles={buildStyles(
																	{
																		textSize:
																			'1.2em',
																	}
																)}
															/>
														</div>
													</td>
													<td>
														<div>60/?</div>
														<div
															style={{
																width: 60,
																height: 60,
																margin: '10px auto 0',
															}}
														>
															<CircularProgressbar
																value={0.133}
																maxValue={1}
																text={`N/A`}
																styles={buildStyles(
																	{
																		textSize:
																			'1.2em',
																	}
																)}
															/>
														</div>
													</td>
													<td>
														<div>3/200</div>
														<div
															style={{
																width: 60,
																height: 60,
																margin: '10px auto 0',
															}}
														>
															<CircularProgressbar
																value={0.015}
																maxValue={1}
																text={`${
																	0.015 * 100
																}%`}
																styles={buildStyles(
																	{
																		textSize:
																			'1.2em',
																	}
																)}
															/>
														</div>
													</td>
													<td>
														<div>2/50</div>
														<div
															style={{
																width: 60,
																height: 60,
																margin: '10px auto 0',
															}}
														>
															<CircularProgressbar
																value={0.04}
																maxValue={1}
																text={`${
																	0.04 * 100
																}%`}
																styles={buildStyles(
																	{
																		textSize:
																			'1.2em',
																	}
																)}
															/>
														</div>
													</td>
													<td>
														<div>0/1</div>
														<div
															style={{
																width: 60,
																height: 60,
																margin: '10px auto 0',
															}}
														>
															<CircularProgressbar
																value={0}
																maxValue={1}
																text={`${
																	0 * 100
																}%`}
																styles={buildStyles(
																	{
																		textSize:
																			'1.2em',
																	}
																)}
															/>
														</div>
													</td>
												</tr>
											</table>
										</StyledTable>
									</BeastBoxWrapper>
								</BeastBox>
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
									<H2>Admin Beast Collection</H2>

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
					{tab === 'mintBeasts' ? (
						<>
							<Card
								bgColor={'#fff'}
								marginTop={'13vw'}
								bgColor2={'#737374'}
								fontColor={'#fff'}
							>
								<div>
									<H2>
										Prepare packs in order to mint Beasts
									</H2>
									<H3>
										Currently disabled to mint specific
										beast
									</H3>
									{/*<FetchBeastTemplateContainer>
										<H3>Fetch a Beast Template</H3>
										<Input
											placeholder="beastTemplateID"
											type="text"
											onChange={(e: any) =>
												setBeastTemplateID(
													e.target.value
												)
											}
										></Input>
										<Button
											onClick={() =>
												setBeastTemplate(
													beastTemplates[
														beastTemplateID
													]
												)
											}
										>
											Fetch
										</Button>
									</FetchBeastTemplateContainer> */}
								</div>

								{/* {beastTemplate != null ? (
									<>
										<div>
											<BeastCard
												beastTemplate={beastTemplate}
											/>
										</div>
									</>
								) : (
									<></>
								)} */}
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

export default BeastOverview;
