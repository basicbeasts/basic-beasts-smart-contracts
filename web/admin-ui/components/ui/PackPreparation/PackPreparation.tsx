import React, { FC, useEffect, useMemo, useState } from 'react';
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
import { GET_TOTAL_SUPPLY_PACK } from '../../../../usability-testing/cadence/scripts/Pack/script.get-total-supply';
import { GET_NUMBER_MINTED_PER_PACK_TEMPLATE } from '../../../../usability-testing/cadence/scripts/Pack/script.get-number-minted-per-pack-template';
import { query } from '@onflow/fcl';
import PackCard from './PackCard';
import { GET_PACK_COLLECTION } from '../../../../usability-testing/cadence/scripts/Pack/script.get-pack-collection';
import batch from 'data/batch';
import { IS_PACK_MINTED } from '../../../../usability-testing/cadence/scripts/Pack/script.is-minted';
import {
	send,
	transaction,
	args,
	arg,
	payer,
	proposer,
	authorizations,
	limit,
	authz,
	decode,
	tx,
} from '@onflow/fcl';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { MINT_AND_PREPARE_PACKS } from '../../../../usability-testing/cadence/transactions/Pack/admin/transaction.mint-and-prepare-packs';

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

const PackPreparation: FC = () => {
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

	const [totalMinted, setTotalMinted] = useState(0);
	const [totalStarter, setTotalStarter] = useState(0);
	const [totalMetallic, setTotalMetallic] = useState(0);
	const [totalCursed, setTotalCursed] = useState(0);
	const [totalShiny, setTotalShiny] = useState(0);
	const [adminCollection, setAdminCollection] = useState();
	const [adminStarterHolding, setAdminStarterHolding] = useState(0);
	const [adminMetallicHolding, setAdminMetallicHolding] = useState(0);
	const [adminCursedHolding, setAdminCursedHolding] = useState(0);
	const [adminShinyHolding, setAdminShinyHolding] = useState(0);
	const [mappedBatch, setMappedBatch] = useState();

	useEffect(() => {
		getTotalMintedPacks();
		getTotalMintedSkins();
		getAdminCollection();
		mapBatch();
	}, []);

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
						Header: 'BeastID',
						accessor: 'beastID',
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
						Header: 'Beast Serial',
						accessor: 'beastSerial',
					},
				],
			},
		],
		[]
	);

	const batchColumns = useMemo(
		() => [
			{
				Header: 'Current Loaded Pack Distribution Batch',
				columns: [
					{
						Header: 'Stock Number',
						accessor: 'stockNumber',
					},
					{
						Header: 'Pack Template ID',
						accessor: 'packTemplateID',
					},
					{
						Header: 'Beast Template ID',
						accessor: 'beastTemplateID',
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

	//Total Minted Packs
	const getTotalMintedPacks = async () => {
		try {
			let totalSupply = await query({
				cadence: GET_TOTAL_SUPPLY_PACK,
			});
			setTotalMinted(totalSupply);
		} catch (err) {
			console.log(err);
		}
	};

	//Total Minted Pack Skins
	const getTotalMintedSkins = async () => {
		// Normal
		let packTemplateID = 1;
		try {
			var totalMinted = await query({
				cadence: GET_NUMBER_MINTED_PER_PACK_TEMPLATE,
				args: (arg: any, t: any) => [arg(packTemplateID, t.UInt32)],
			});
			totalMinted != null
				? setTotalStarter(totalMinted)
				: setTotalStarter(0);
		} catch (err) {
			console.log(err);
		}
		// Metallic
		packTemplateID = 2;
		try {
			var totalMinted = await query({
				cadence: GET_NUMBER_MINTED_PER_PACK_TEMPLATE,
				args: (arg: any, t: any) => [arg(packTemplateID, t.UInt32)],
			});
			totalMinted != null
				? setTotalMetallic(totalMinted)
				: setTotalMetallic(0);
		} catch (err) {
			console.log(err);
		}
		// Cursed
		packTemplateID = 3;
		try {
			var totalMinted = await query({
				cadence: GET_NUMBER_MINTED_PER_PACK_TEMPLATE,
				args: (arg: any, t: any) => [arg(packTemplateID, t.UInt32)],
			});
			totalMinted != null
				? setTotalCursed(totalMinted)
				: setTotalCursed(0);
		} catch (err) {
			console.log(err);
		}
		// Shinys
		packTemplateID = 4;
		try {
			var totalMinted = await query({
				cadence: GET_NUMBER_MINTED_PER_PACK_TEMPLATE,
				args: (arg: any, t: any) => [arg(packTemplateID, t.UInt32)],
			});
			totalMinted != null ? setTotalShiny(totalMinted) : setTotalShiny(0);
		} catch (err) {
			console.log(err);
		}
	};

	const getIsMinted = async (stockNumber: any) => {
		try {
			let response = await query({
				cadence: IS_PACK_MINTED,
				args: (arg: any, t: any) => [arg(stockNumber, t.UInt64)],
			});
			return response;
		} catch (err) {
			console.log(err);
		}
	};

	const mapBatch = async () => {
		let mappedBatch = [];
		for (let item in batch) {
			let element = batch[item];
			var minted = false;
			await getIsMinted(element.stockNumber).then((response: any) => {
				minted = response;
			});
			var batchItem = {
				stockNumber: element.stockNumber,
				packTemplateID: element.packTemplateID,
				beastTemplateID: element.beastTemplateID,
				minted: minted.toString(),
			};

			mappedBatch.push(batchItem);
		}
		setMappedBatch(mappedBatch);
	};

	// Admin Pack Collection
	const getAdminCollection = async () => {
		try {
			let collection = await query({
				cadence: GET_PACK_COLLECTION,
				args: (arg: any, t: any) => [
					arg('0xf8d6e0586b0a20c7', t.Address),
				],
			});
			let mappedCollection = [];
			var starter = 0;
			var metallic = 0;
			var cursed = 0;
			var shiny = 0;
			for (let item in collection) {
				const element = collection[item];
				var beastID = Object.keys(element.beast)[0];

				// Get Pack from collection
				var pack = {
					id: element.id,
					stockNumber: element.stockNumber,
					packTemplateID: element.packTemplate.packTemplateID,
					name: element.packTemplate.name,
					beastID: beastID,
					beastName: element.beast[beastID].beastTemplate.name,
					beastSkin: element.beast[beastID].beastTemplate.skin,
					beastSerial: element.beast[beastID].serialNumber,
				};
				if (element.packTemplate.packTemplateID == 1) {
					starter = starter + 1;
				} else if (element.packTemplate.packTemplateID == 2) {
					metallic = metallic + 1;
				} else if (element.packTemplate.packTemplateID == 3) {
					cursed = cursed + 1;
				} else if (element.packTemplate.packTemplateID == 4) {
					shiny = shiny + 1;
				}
				// Add Pack
				mappedCollection.push(pack);
			}
			setAdminStarterHolding(starter);
			setAdminMetallicHolding(metallic);
			setAdminCursedHolding(cursed);
			setAdminShinyHolding(shiny);
			setAdminCollection(mappedCollection);
		} catch (err) {
			console.log(err);
		}
	};

	const mintPreparePacks = async () => {
		let packTemplateIDsDic: any[] = [];
		let beastTemplateIDsDic: any[] = [];

		let stockNumberArray: any[] = [];

		for (let element in batch) {
			const stockNumber = batch[element].stockNumber;
			const packTemplateID = batch[element].packTemplateID;
			const beastTemplateID = batch[element].beastTemplateID;

			stockNumberArray.push(stockNumber);
			packTemplateIDsDic.push({
				key: stockNumber,
				value: packTemplateID,
			});
			beastTemplateIDsDic.push({
				key: stockNumber,
				value: beastTemplateID,
			});
		}
		try {
			const res = await send([
				transaction(MINT_AND_PREPARE_PACKS),
				args([
					arg(stockNumberArray, t.Array(t.UInt64)),
					arg(
						packTemplateIDsDic,
						t.Dictionary({ key: t.UInt64, value: t.UInt32 })
					),
					arg(
						beastTemplateIDsDic,
						t.Dictionary({ key: t.UInt64, value: t.UInt32 })
					),
				]),
				payer(authz),
				proposer(authz),
				authorizations([authz]),
				limit(9999),
			]).then(decode);
			await tx(res).onceSealed();
			mapBatch();
		} catch (err) {
			console.log(err);
		}
	};

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
									<BigNumber>{totalMinted}</BigNumber>
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
												<td>{totalStarter}</td>
												<td>{totalMetallic}</td>
												<td>{totalCursed}</td>
												<td>{totalShiny}</td>
											</tr>
										</table>
									</StyledTable>
								</InfoBox>
							</ContainerRow>
							<ContainerRow>
								<PackCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/packs/pack_thumbnails/starter_thumbnail.png'
									}
									name={'Starter Pack'}
									maxSupply={50000}
									totalSupply={totalStarter}
									adminHoldings={adminStarterHolding}
								/>
							</ContainerRow>
							<ContainerRow>
								<PackCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/packs/pack_thumbnails/metallic_silver_thumbnail.png'
									}
									name={'Metallic Silver Pack'}
									maxSupply={0}
									totalSupply={totalMetallic}
									adminHoldings={adminMetallicHolding}
								/>
							</ContainerRow>
							<ContainerRow>
								<PackCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/packs/pack_thumbnails/cursed_black_thumbnail.png'
									}
									name={'Cursed Black Pack'}
									maxSupply={10000}
									totalSupply={totalCursed}
									adminHoldings={adminCursedHolding}
								/>
							</ContainerRow>

							<ContainerRow>
								<PackCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/packs/pack_thumbnails/shiny_gold_thumbnail.png'
									}
									name={'Shiny Gold Pack'}
									maxSupply={2500}
									totalSupply={totalShiny}
									adminHoldings={adminShinyHolding}
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
									{adminCollection != null ? (
										<TableStyles>
											<Table
												columns={columns}
												data={adminCollection}
												getRowProps={(row: any) => ({
													style: {
														background:
															row.index ==
															selectedRow
																? '#ffe597'
																: 'white',
													},
												})}
												selectRow={selectRow}
											/>
										</TableStyles>
									) : (
										'Collection is empty'
									)}
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
										{/* <H3>Select batch number</H3>
										<DropDownAction>
											<Dropdown
												options={['1', '2', '3']}
												onChange={(e) => {
													console.log();
												}}
												// value={beastIDs[0].toString()}
												placeholder="batch number"
											/> */}
										<Button
											onClick={() => mintPreparePacks()}
										>
											Mint & Prepare packs
										</Button>
										{/* </DropDownAction> */}
									</ActionContainer>
									{mappedBatch != null ? (
										<TableStyles>
											<Table
												columns={batchColumns}
												data={mappedBatch}
												getRowProps={(row: any) => ({
													style: {
														background:
															row.index ==
															selectedRow
																? '#ffe597'
																: 'white',
													},
												})}
												selectRow={selectRow}
											/>
										</TableStyles>
									) : (
										''
									)}
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

export default PackPreparation;
