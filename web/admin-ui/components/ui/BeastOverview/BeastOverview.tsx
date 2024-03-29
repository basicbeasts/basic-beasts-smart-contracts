import React, { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Table, { TableStyles } from '../Table';
import beastTemplates from '../../../../usability-testing/data/beastTemplates';
import BeastTemplate from '../../../../usability-testing/utils/BeastTemplate';
import beastSkins from '../../../../usability-testing/data/beastSkins';
import BeastCard from '../BeastCard';
import { GET_TOTAL_SUPPLY_BASIC_BEASTS } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.get-total-supply';
import { GET_ALL_BEAST_TEMPLATES } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.get-all-beast-templates';
import { GET_ALL_NUMBER_MINTED_PER_BEAST_TEMPLATE } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.get-all-number-minted-per-beast-template';
import { query } from '@onflow/fcl';
import { MINT_BEAST } from '../../../../usability-testing/cadence/transactions/BasicBeasts/admin/transaction.mint-beast';
import { SETUP_BEAST_COLLECTION } from '../../../../usability-testing/cadence/transactions/BasicBeasts/transaction.setup-account';
import { GET_BEAST_COLLECTION } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.get-beast-collection';

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
import * as t from '@onflow/types';
import BeastBox from './BeastBox';
import { toast } from 'react-toastify';

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
	const [totalNormal, setTotalNormal] = useState(0);
	const [totalMetallic, setTotalMetallic] = useState(0);
	const [totalCursed, setTotalCursed] = useState(0);
	const [totalShiny, setTotalShiny] = useState(0);
	const [totalMythic, setTotalMythic] = useState(0);

	const [allBeastTemplates, setAllBeastTemplates] = useState();
	const [
		allNumberMintedPerBeastTemplate,
		setAllNumberMintedPerBeastTemplate,
	] = useState();

	const [numberMinted, setNumberMinted] = useState([]);
	const [adminCollection, setAdminCollection] = useState();

	useEffect(() => {
		getTotalMintedBeasts();
		getTotalMintedSkins();
		getAdminBeastCollection();
	}, []);

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

	//Total Minted Beasts
	const getTotalMintedBeasts = async () => {
		try {
			let totalSupply = await query({
				cadence: GET_TOTAL_SUPPLY_BASIC_BEASTS,
			});
			setTotalMinted(totalSupply);
		} catch (err) {
			console.log(err);
		}
	};

	// Total Number Of Skins in Circulation
	const getTotalMintedSkins = async () => {
		var normalIDs = [];
		var metallicIDs = [];
		var cursedIDs = [];
		var shinyIDs = [];
		var mythicIDs = [];

		// Get All Beast Templates
		try {
			let beastTemplates = await query({
				cadence: GET_ALL_BEAST_TEMPLATES,
			});

			setAllBeastTemplates(beastTemplates);

			for (let templateID in beastTemplates) {
				let beastTemplate = beastTemplates[templateID];
				if (beastTemplate.skin == 'Normal') {
					normalIDs.push(templateID);
				}
				if (beastTemplate.skin == 'Metallic Silver') {
					metallicIDs.push(templateID);
				}
				if (beastTemplate.skin == 'Cursed Black') {
					cursedIDs.push(templateID);
				}
				if (beastTemplate.skin == 'Shiny Gold') {
					shinyIDs.push(templateID);
				}
				if (beastTemplate.skin == 'Mythic Diamond') {
					mythicIDs.push(templateID);
				}
			}
		} catch (err) {
			console.log(err);
		}

		try {
			let allNumberMintedPerBeastTemplate = await query({
				cadence: GET_ALL_NUMBER_MINTED_PER_BEAST_TEMPLATE,
			});
			setAllNumberMintedPerBeastTemplate(allNumberMintedPerBeastTemplate);

			// Get numberMintedPerBeastTemplate for each ID and add it to the sum such as setTotalNormal()

			var sum = 0;
			for (let element in normalIDs) {
				let id = normalIDs[element];
				sum = sum + parseInt(allNumberMintedPerBeastTemplate[id]);
				// Sets numMinted of each individual beastTemplateID
				setNumberMinted((numberMinted) => ({
					...numberMinted,
					[id]: allNumberMintedPerBeastTemplate[id],
				}));
			}
			setTotalNormal(sum);

			sum = 0;
			for (let element in metallicIDs) {
				let id = metallicIDs[element];
				sum = sum + parseInt(allNumberMintedPerBeastTemplate[id]);
				setNumberMinted((numberMinted) => ({
					...numberMinted,
					[id]: allNumberMintedPerBeastTemplate[id],
				}));
			}
			setTotalMetallic(sum);

			sum = 0;
			for (let element in cursedIDs) {
				let id = cursedIDs[element];
				sum = sum + parseInt(allNumberMintedPerBeastTemplate[id]);
				setNumberMinted((numberMinted) => ({
					...numberMinted,
					[id]: allNumberMintedPerBeastTemplate[id],
				}));
			}
			setTotalCursed(sum);

			sum = 0;
			for (let element in shinyIDs) {
				let id = shinyIDs[element];
				sum = sum + parseInt(allNumberMintedPerBeastTemplate[id]);
				setNumberMinted((numberMinted) => ({
					...numberMinted,
					[id]: allNumberMintedPerBeastTemplate[id],
				}));
			}
			setTotalShiny(sum);

			sum = 0;
			for (let element in mythicIDs) {
				let id = mythicIDs[element];
				sum = sum + parseInt(allNumberMintedPerBeastTemplate[id]);
				setNumberMinted((numberMinted) => ({
					...numberMinted,
					[id]: allNumberMintedPerBeastTemplate[id],
				}));
			}
			setTotalMythic(sum);
			console.log('numberMinted: ' + numberMinted[3]);
		} catch (err) {
			console.log(err);
		}
	};

	// Test getting Total Number of Skins in circulation by minting.
	const mintBeast = async (id: number) => {
		try {
			const res = await send([
				transaction(MINT_BEAST),
				args([arg(id, t.UInt32)]),
				payer(authz),
				proposer(authz),
				authorizations([authz]),
				limit(9999),
			]).then(decode);
			await tx(res).onceSealed();

			getTotalMintedBeasts();
			getTotalMintedSkins();
			getAdminBeastCollection();
		} catch (err) {
			console.log(err);
		}
	};

	const initializeBeastCollection = async () => {
		const id = toast.loading('Initializing...');

		try {
			const res = await send([
				transaction(SETUP_BEAST_COLLECTION),
				,
				payer(authz),
				proposer(authz),
				authorizations([authz]),
				limit(9999),
			]).then(decode);
			// wait for transaction to be mined

			tx(res).subscribe((res: any) => {
				if (res.status === 1) {
					toast.update(id, {
						render: 'Pending...',
						type: 'default',
						isLoading: true,
						autoClose: 5000,
					});
				}
				if (res.status === 2) {
					toast.update(id, {
						render: 'Finalizing...',
						type: 'default',
						isLoading: true,
						autoClose: 5000,
					});
				}
				if (res.status === 3) {
					toast.update(id, {
						render: 'Executing...',
						type: 'default',
						isLoading: true,
						autoClose: 5000,
					});
				}
			});
			await tx(res)
				.onceSealed()
				.then((result: any) => {
					toast.update(id, {
						render: 'Transaction Sealed',
						type: 'success',
						isLoading: false,
						autoClose: 5000,
					});
				});
		} catch (err) {
			toast.update(id, {
				render: () => <div>Error, try again later...</div>,
				type: 'error',
				isLoading: false,
				autoClose: 5000,
			});
			console.log(err);
		}
	};

	// Admin Beast Collection
	const getAdminBeastCollection = async () => {
		try {
			let collection = await query({
				cadence: GET_BEAST_COLLECTION,
				args: (arg: any, t: any) => [
					arg('0xf8d6e0586b0a20c7', t.Address),
				],
			});
			let mappedCollection = [];
			for (let item in collection) {
				const element = collection[item];
				var beast = {
					id: element.id,
					serialNumber: element.serialNumber,
					beastTemplateID: element.beastTemplateID,
					nickname: element.nickname,
					firstOwner: element.firstOwner,
					sex: element.sex,
					matron: element.matron,
					sire: element.sire,
					name: element.name,
					starLevel: element.starLevel,
					data: element.data,
					skin: element.skin,
					evolvedFrom: element.evolvedFrom,
				};
				mappedCollection.push(beast);
			}
			setAdminCollection(mappedCollection);
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
												<td>{totalNormal}</td>
												<td>{totalMetallic}</td>
												<td>{totalCursed}</td>
												<td>{totalShiny}</td>
												<td>{totalMythic}</td>
											</tr>
										</table>
									</StyledTable>
								</InfoBox>
							</ContainerRow>

							{beastSkins.map((beast: any, i: any) => (
								<ContainerRow key={i}>
									<BeastBox
										key={i}
										numberMinted={numberMinted}
										name={beast.name}
										dexNumber={beast.dexNumber}
										normalID={beast.normalID}
										metallicID={beast.metallicID}
										cursedID={beast.cursedID}
										shinyID={beast.shinyID}
										mythicID={beast.mythicID}
										imageUrl={beast.imageUrl}
										color={beast.color}
									/>
								</ContainerRow>
							))}
						</>
					) : (
						<></>
					)}
					{tab === 'adminNftCollection' ? (
						<>
							{/*
							TODO
							Fetch Admin Collection and Map the data
							*/}
							<Card
								bgColor={'#fff'}
								marginTop={'13vw'}
								bgColor2={'#737374'}
								fontColor={'#fff'}
							>
								<div>
									<H2>Admin Beast Collection</H2>
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

									{/* FOR TESTING */}
									{/* <button
										onClick={() =>
											initializeBeastCollection()
										}
									>
										init collection
									</button>
									<button onClick={() => mintBeast(16)}>
										mint beast (BeastTemplateID: 16)
									</button>
									<button
										onClick={() =>
											console.log(
												'numberMinted: ' +
													numberMinted[3]
											)
										}
									>
										test
									</button> */}
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
