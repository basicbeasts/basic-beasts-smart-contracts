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
import batch from 'data/batch';
import { CREATE_PACK_MAIL } from '../../../../usability-testing/cadence/transactions/Inbox/centralizedInbox/transaction.create-pack-mail';
import { GET_ALL_MAILS } from '../../../../usability-testing/cadence/scripts/Inbox/script.get-all-mails';
import { GET_PACK_COLLECTION } from '../../../../usability-testing/cadence/scripts/Pack/script.get-pack-collection';
import { toast } from 'react-toastify';

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
	font-size: 1.5em;
	border-radius: 13px;
	width: 200px;
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
	const [mails, setMails] = useState<any>();

	const columns = useMemo(
		() => [
			{
				Header: 'Centralized Inbox',
				columns: [
					{
						Header: 'Address',
						accessor: 'address',
					},
					{
						Header: 'Stock Number',
						accessor: 'stockNumber',
					},
					{
						Header: 'Pack Template ID',
						accessor: 'packTemplateID',
					},
					{
						Header: 'Pack Type',
						accessor: 'packType',
					},
					{
						Header: 'Beast Skin',
						accessor: 'beastSkin',
					},
					{
						Header: 'Beast Template ID',
						accessor: 'beastTemplateID',
					},
					{
						Header: 'Beast Name',
						accessor: 'beastName',
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
						Header: 'Wallet Address',
						accessor: 'address',
					},
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
						Header: 'Beast Name',
						accessor: 'beastName',
					},
					{
						Header: 'Beast Skin',
						accessor: 'beastSkin',
					},
					{
						Header: 'Distributed',
						accessor: 'distributed',
					},
					{
						Header: 'In Admin Collection',
						accessor: 'adminHas',
					},
				],
			},
		],
		[]
	);

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

	const [adminCollection, setAdminCollection] = useState<any>();

	useEffect(() => {
		getAllBeastTemplates();
		getAllMails();
		getAdminCollection();
	}, []);

	const selectRow = (index: any, id: any) => {
		setSelectedRow(index);
		setBeastTemplate(beastTemplates[id]);
		getBeastTemplate(id);
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
		let mappedBatch = [];
		for (let element in batch) {
			let item = batch[element];
			var distributed = false;
			var adminHas = false;
			var batchItem = {
				address: item.address,
				stockNumber: item.stockNumber,
				packTemplateID: item.packTemplateID,
				beastTemplateID: item.beastTemplateID,
				beastName: beastTemplates[item.beastTemplateID].name,
				beastSkin: beastTemplates[item.beastTemplateID].skin,
				distributed: distributed.toString(),
				adminHas: adminHas.toString(),
			};
			mappedBatch.push(batchItem);
		}
		setMappedBatch(mappedBatch);
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

	const distributePacks = async () => {
		const id = toast.loading('Initializing...');

		let mails = [];

		for (let element in batch) {
			const address = batch[element].address;

			// Check if address and stockNumbers has been added before
			var addressAdded = false;
			for (let mail in mails) {
				let mailAddress = mails[mail].key;
				if (address == mailAddress) {
					addressAdded = true;
				}
			}

			// If address has not been added.
			// Loop through the whole batch
			// add all stockNumbers into a single array
			// push it once.
			if (!addressAdded) {
				var stockNumbers = [];
				for (let item in batch) {
					if (address == batch[item].address) {
						stockNumbers.push(batch[item].stockNumber);
					}
				}
				mails.push({ key: address, value: stockNumbers });
			}
		}
		console.log(mails);
		try {
			const res = await send([
				transaction(CREATE_PACK_MAIL),
				args([
					arg(
						mails,
						t.Dictionary({
							key: t.Address,
							value: t.Array(t.UInt64),
						})
					),
				]),
				// payer(authz),
				// proposer(authz),
				// authorizations([authz]),
				payer(authorizationFunction),
				proposer(authorizationFunction),
				authorizations([authorizationFunction]),
				limit(9999),
			]).then(decode);
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
			setTab('overview');
			getAdminCollection();
			getAllMails();
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

	// Script - Get all mails
	const getAllMails = async () => {
		try {
			let mails = await query({
				cadence: GET_ALL_MAILS,
				args: (arg: any, t: any) => [
					arg('0x22fc0fd68c3857cf', t.Address),
				],
			});

			let mappedMails = [];

			for (let address in mails) {
				let addressMails = mails[address];
				for (let mail in addressMails) {
					let element = addressMails[mail];

					var keys = Object.keys(element.beast);
					var beastKey: string = keys[0];
					console.log(addressMails[mail]);
					console.log('address' + address);
					var newMail = {
						address: address,
						stockNumber: element.stockNumber,
						packTemplateID: element.packTemplate.packTemplateID,
						packType: element.packTemplate.name,
						beastTemplateID:
							element.beast[
								beastKey as keyof typeof element.beast
							]?.beastTemplate.beastTemplateID,
						beastName:
							element.beast[
								beastKey as keyof typeof element.beast
							]?.beastTemplate.name,
						beastSkin:
							element.beast[
								beastKey as keyof typeof element.beast
							]?.beastTemplate.skin,
					};
					mappedMails.push(newMail);
				}
			}

			setMails(mappedMails);
		} catch (err) {
			console.log(err);
		}
	};

	// Admin Pack Collection
	const getAdminCollection = async () => {
		try {
			let collection = await query({
				cadence: GET_PACK_COLLECTION,
				args: (arg: any, t: any) => [
					// arg('0xf8d6e0586b0a20c7', t.Address),
					arg('0x22fc0fd68c3857cf', t.Address),
				],
			});
			let mappedCollection = [];
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
				// Add Pack
				mappedCollection.push(pack);
			}
			setAdminCollection(mappedCollection);
		} catch (err) {
			console.log(err);
		}
	};

	const packColumns = useMemo(
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
						Header: 'Address',
						accessor: 'address',
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
										<>
											<TableStyles>
												<Table
													columns={columns}
													data={mails}
													getRowProps={(
														row: any
													) => ({
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
										</>
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
									<H2>Admin Pack Collection</H2>
									{adminCollection != null ? (
										<>
											{adminCollection.length > 0 ? (
												<>
													{' '}
													<TableStyles>
														<Table
															columns={
																packColumns
															}
															data={
																adminCollection
															}
															getRowProps={(
																row: any
															) => ({
																style: {
																	background:
																		row.index ==
																		selectedRow
																			? '#ffe597'
																			: 'white',
																},
															})}
															selectRow={
																selectRow
															}
														/>
													</TableStyles>
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
															onClick={() =>
																distributePacks()
															}
														>
															Distribute Pack
															Batch
														</Button>
														{/* </DropDownAction> */}
													</ActionContainer>
												</>
											) : (
												<div>
													Admin collection is empty
												</div>
											)}
										</>
									) : (
										'No admin collection found'
									)}
								</div>

								{mappedBatch != null ? (
									<TableStyles>
										<Table
											columns={batchColumns}
											data={mappedBatch}
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
								) : (
									''
								)}
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
