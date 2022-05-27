import React, { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Table, { TableStyles } from '../Table';
import beastTemplates from '../../../../usability-testing/data/beastTemplates';
import BeastTemplate from '../../../../usability-testing/utils/BeastTemplate';
import BeastCard from '../BeastCard';
import {
	query,
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
import { CREATE_BEAST_TEMPLATE } from '../../../../usability-testing/cadence/transactions/BasicBeasts/admin/transaction.create-beast-template';
import { GET_BEAST_TEMPLATE } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.get-beast-template';
import { authorizationFunction } from 'authorization';
import { GET_ALL_BEAST_TEMPLATES } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.get-all-beast-templates';
import { GET_NUM_MINTED_PER_BEAST_TEMPLATE } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.get-num-minted-per-beast-template';
import { IS_BEAST_RETIRED } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.is-beast-retired';

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
const H3 = styled.h3`
	font-size: 1.2em;
	font-weight: 400;
	margin: 0 0 5px;
	color: #707070;
`;

const ActionButton = styled.div`
	font-size: 2em;
	font-weight: 400;
	margin: 0 0 5px;
	color: #707070;
	cursor: pointer;
`;

const Input = styled.input`
	font-size: 1em;
	height: 2vw;
	border-radius: 13px;
	border: 1px solid #bfc0c4;
	padding: 0.5vw;
`;

const Button = styled.button`
	margin-left: 15px;
	font-size: 1em;
	border-radius: 13px;
	width: 100px;
	height: 2vw;
	background: #ffd966;
	color: #a15813;
	border: none;
	cursor: pointer;
	&:hover {
		background: #ffd966d9;
	}
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

const FetchBeastTemplateContainer = styled.div`
	margin: 20px 0;
`;

const RedText = styled.div`
	color: red;
	font-size: 3em;
	margin: 0 0 10px; ;
`;

const GreenText = styled.div`
	color: green;
	font-size: 3em;
	margin: 0 0 10px; ;
`;

const ContainerRow = styled.div`
	flex-direction: row;
`;

const BeastTemplateInfo = styled.div`
	margin-top: 10px;
	font-size: 1.2em;
	line-height: 1.1em;
`;

const Img = styled.img`
	width: 30px;
	top: 8px;
	position: relative;
	user-drag: none;
	-webkit-user-drag: none;
`;

const ActionContainer = styled.div`
	margin: 20px 0;
`;

const DistributePacksOverview: FC = () => {
	const [tab, setTab] = useState<'overview' | 'distributePacks'>('overview');

	const columns = useMemo(
		() => [
			{
				Header: 'Centralized Inbox',
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
						accessor: 'numberMintedPerBeastTemplate',
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

	// Dummy data
	// const data = useMemo(
	// 	() => [
	// 		{
	// 			beastTemplateID: 1,
	// 			name: 'Moon',
	// 			skin: 'Normal',
	// 			starLevel: 1,
	// 			maxAdminMintAllowed: 1000,
	// 			numberMintedPerBeastTemplate: 0,
	// 			retired: 'false',
	// 		},
	// 		{
	// 			beastTemplateID: 2,
	// 			name: 'Moon',
	// 			skin: 'Metallic Silver',
	// 			starLevel: 1,
	// 			maxAdminMintAllowed: 1000000000,
	// 			numberMintedPerBeastTemplate: 0,
	// 			retired: 'false',
	// 		},
	// 		{
	// 			beastTemplateID: 3,
	// 			name: 'Moon',
	// 			skin: 'Cursed Black',
	// 			starLevel: 1,
	// 			maxAdminMintAllowed: 200,
	// 			numberMintedPerBeastTemplate: 0,
	// 			retired: 'false',
	// 		},
	// 		{
	// 			beastTemplateID: 4,
	// 			name: 'Moon',
	// 			skin: 'Shiny Gold',
	// 			starLevel: 1,
	// 			maxAdminMintAllowed: 50,
	// 			numberMintedPerBeastTemplate: 0,
	// 			retired: 'false',
	// 		},
	// 		{
	// 			beastTemplateID: 6,
	// 			name: 'Saber',
	// 			skin: 'Normal',
	// 			starLevel: 1,
	// 			maxAdminMintAllowed: 1000,
	// 			numberMintedPerBeastTemplate: 0,
	// 			retired: 'false',
	// 		},
	// 	],
	// 	[]
	// );

	// For 'Overview' tab
	const [selectedRow, setSelectedRow] = useState();
	const [beastTemplate, setBeastTemplate] = useState<
		BeastTemplate | undefined
	>();
	const [beastTemplateData, setBeastTemplateData] = useState();

	// For 'Create Beast Template' tab
	const [beastTemplateID, setBeastTemplateID] = useState();
	const [templateCreated, setTemplateCreated] = useState(false);

	const [mappedBatch, setMappedBatch] = useState();

	useEffect(() => {
		getAllBeastTemplates();
	}, []);

	const selectRow = (index: any, id: any) => {
		setSelectedRow(index);
		setBeastTemplate(beastTemplates[id]);
		getBeastTemplate(id);
	};

	// For 'Create Beast Template' tab
	const createBeastTemplate = async () => {
		let beastTemplate = beastTemplates[beastTemplateID];
		try {
			const res = await send([
				transaction(CREATE_BEAST_TEMPLATE),
				args([
					arg(beastTemplate.beastTemplateID, t.UInt32),
					arg(beastTemplate.dexNumber, t.UInt32),
					arg(beastTemplate.name, t.String),
					arg(beastTemplate.description, t.String),
					arg(beastTemplate.image, t.String),
					arg(beastTemplate.imageTransparentBg, t.String),
					arg(beastTemplate.animationUrl, t.Optional(t.String)),
					arg(beastTemplate.externalUrl, t.Optional(t.String)),
					arg(beastTemplate.rarity, t.String),
					arg(beastTemplate.skin, t.String),
					arg(beastTemplate.starLevel, t.UInt32),
					arg(beastTemplate.asexual, t.Bool),
					arg(beastTemplate.breedableBeastTemplateID, t.UInt32),
					arg(beastTemplate.maxAdminMintAllowed, t.UInt32),
					arg(beastTemplate.ultimateSkill, t.String),
					arg(beastTemplate.basicSkills, t.Array(t.String)),
					arg(beastTemplate.elements, t.Array(t.String)),
					arg(
						beastTemplate.data,
						t.Dictionary({ key: t.String, value: t.String })
					),
				]),
				payer(authz),
				proposer(authz),
				authorizations([authz]),
				// payer(authorizationFunction),
				// proposer(authorizationFunction),
				// authorizations([authorizationFunction]),
				limit(9999),
			]).then(decode);

			const trx = await tx(res).onceSealed();
			console.log('sealed');
			getBeastTemplate(beastTemplateID);
			getAllBeastTemplates();
			return trx;
		} catch (err) {
			console.log(err);
		}
	};

	const getBeastTemplate = async (beastTemplateID: any) => {
		try {
			let response = await query({
				cadence: GET_BEAST_TEMPLATE,
				args: (arg: any, t: any) => [
					arg(parseInt(beastTemplateID), t.UInt32),
				],
			});

			if (response == null) {
				setTemplateCreated(false);
			} else {
				setTemplateCreated(true);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const getNumberMintedPerBeastTemplate = async (beastTemplateID: number) => {
		var numMinted = 0;
		try {
			await query({
				cadence: GET_NUM_MINTED_PER_BEAST_TEMPLATE,
				args: (arg: any, t: any) => [arg(beastTemplateID, t.UInt32)],
			}).then((response: any) => {
				numMinted = response;
			});
			return numMinted;
		} catch (err) {
			console.log(err);
		}
	};

	const isBeastRetired = async (beastTemplateID: number) => {
		var retired = false;
		try {
			await query({
				cadence: IS_BEAST_RETIRED,
				args: (arg: any, t: any) => [arg(beastTemplateID, t.UInt32)],
			}).then((response: any) => {
				retired = response;
			});
			return retired;
		} catch (err) {
			console.log(err);
		}
	};

	// Script - Get all beast templates
	const getAllBeastTemplates = async () => {
		try {
			let beastTemplates = await query({
				cadence: GET_ALL_BEAST_TEMPLATES,
			});
			let mappedBeastTemplates = [];

			for (let beastTemplateID in beastTemplates) {
				const element = beastTemplates[beastTemplateID];
				var id = element.beastTemplateID;
				var numMinted = 0;
				await getNumberMintedPerBeastTemplate(id).then(
					(response: any) => {
						numMinted = response;
					}
				);

				var retired = false;
				await isBeastRetired(id).then((response: any) => {
					retired = response;
				});

				var template = {
					beastTemplateID: element.beastTemplateID,
					generation: element.generation,
					dexNumber: element.dexNumber,
					name: element.name,
					description: element.description,
					image: element.image,
					imageTransparentBg: element.imageTransparentBg,
					animationUrl: element.animationUrl,
					externalUrl: element.externalUrl,
					rarity: element.rarity,
					skin: element.skin,
					starLevel: element.starLevel,
					asexual: element.asexual,
					breedableBeastTemplateID: element.breedableBeastTemplateID,
					maxAdminMintAllowed: element.maxAdminMintAllowed,
					ultimateSkill: element.ultimateSkill,
					basicSkills: element.basicSkills,
					elements: element.elements,
					numberMintedPerBeastTemplate: numMinted.toString(),
					retired: retired.toString(),
				};
				mappedBeastTemplates.push(template);
			}
			setBeastTemplateData(mappedBeastTemplates);
		} catch (err) {
			console.log(err);
		}
	};

	const mapBatch = async () => {
		// let mappedBatch = [];
		// for (let item in batch) {
		// 	let element = batch[item];
		// 	var minted = false;
		// 	await getIsMinted(element.stockNumber).then((response: any) => {
		// 		minted = response;
		// 	});
		// 	var batchItem = {
		// 		stockNumber: element.stockNumber,
		// 		packTemplateID: element.packTemplateID,
		// 		beastTemplateID: element.beastTemplateID,
		// 		minted: minted.toString(),
		// 	};
		// 	mappedBatch.push(batchItem);
		// }
		// setMappedBatch(mappedBatch);
	};

	const mintPreparePacks = async () => {};

	return (
		<Container>
			<Content>
				<H1>Distribute Packs</H1>
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
								setTab('distributePacks');
							}}
							selected={tab === 'distributePacks'}
						>
							Distribute Packs
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
										Overview of Packs in Centralized Inbox
									</H2>
									{beastTemplateData != null ? (
										<TableStyles>
											<Table
												columns={columns}
												data={beastTemplateData}
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
										<></>
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
					{tab === 'distributePacks' ? (
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

export default DistributePacksOverview;
