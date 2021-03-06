import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import BeastTemplate from '../../../../usability-testing/utils/BeastTemplate';
import 'react-circular-progressbar/dist/styles.css';
import FungibleTokenCard from './FungibleTokenCard';
import { query } from '@onflow/fcl';
import { GET_EMPTY_POTION_BOTTLE_TOTAL_SUPPLY } from '../../../../usability-testing/cadence/scripts/EmptyPotionBottle/script.get-total-supply';
import { GET_SUSHI_TOTAL_SUPPLY } from '../../../../usability-testing/cadence/scripts/Sushi/script.get-total-supply';
import { GET_POOP_TOTAL_SUPPLY } from '../../../../usability-testing/cadence/scripts/Poop/script.get-total-supply';
import { GET_SUSHI_BALANCE } from '../../../../usability-testing/cadence/scripts/Sushi/script.get-balance';
import { GET_POOP_BALANCE } from '../../../../usability-testing/cadence/scripts/Poop/script.get-balance';
import { GET_EMPTY_POTION_BOTTLE_BALANCE } from '../../../../usability-testing/cadence/scripts/EmptyPotionBottle/script.get-balance';

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
		font-size: 2em;
	}
	td:first-child {
		border-left: none;
	}
	th,
	td {
		padding: 0 40px 10px;
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

const FungibleTokenOverview: FC = () => {
	const [tab, setTab] = useState<'overview' | 'mintTokens'>('overview');

	const [totalMinted, setTotalMinted] = useState(0);
	const [totalEPB, setTotalEPB] = useState(0);
	const [totalPoop, setTotalPoop] = useState(0);
	const [totalSushi, setTotalSushi] = useState(0);
	const [adminEPB, setAdminEPB] = useState(0);
	const [adminPoop, setAdminPoop] = useState(0);
	const [adminSushi, setAdminSushi] = useState(0);

	useEffect(() => {
		getTotalMinted();
		getAdminBalances();
	}, []);

	//Total Minted Tokens
	const getTotalMinted = async () => {
		var sum = 0;
		// EPB
		try {
			var totalSupply = await query({
				cadence: GET_EMPTY_POTION_BOTTLE_TOTAL_SUPPLY,
			});
			setTotalEPB(parseInt(totalSupply));
			sum = sum + parseInt(totalSupply);
		} catch (err) {
			console.log(err);
		}
		// Sushi
		try {
			var totalSupply = await query({
				cadence: GET_SUSHI_TOTAL_SUPPLY,
			});
			setTotalSushi(parseInt(totalSupply));
			sum = sum + parseInt(totalSupply);
		} catch (err) {
			console.log(err);
		}
		// Poop
		try {
			var totalSupply = await query({
				cadence: GET_POOP_TOTAL_SUPPLY,
			});
			setTotalPoop(parseInt(totalSupply));
			sum = sum + parseInt(totalSupply);
		} catch (err) {
			console.log(err);
		}
		setTotalMinted(sum);
	};

	const getAdminBalances = async () => {
		try {
			let response = await query({
				cadence: GET_EMPTY_POTION_BOTTLE_BALANCE,
				args: (arg: any, t: any) => [
					arg('0xf8d6e0586b0a20c7', t.Address),
				],
			});
			setAdminEPB(parseInt(response));
		} catch (err) {
			console.log(err);
		}
		try {
			let response = await query({
				cadence: GET_POOP_BALANCE,
				args: (arg: any, t: any) => [
					arg('0xf8d6e0586b0a20c7', t.Address),
				],
			});
			setAdminPoop(parseInt(response));
		} catch (err) {
			console.log(err);
		}
		try {
			let response = await query({
				cadence: GET_SUSHI_BALANCE,
				args: (arg: any, t: any) => [
					arg('0xf8d6e0586b0a20c7', t.Address),
				],
			});
			setAdminSushi(parseInt(response));
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<Container>
			<Content>
				<H1>Fungible Tokens</H1>
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
								setTab('mintTokens');
							}}
							selected={tab === 'mintTokens'}
						>
							Mint Tokens
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
									<H2>Overview of Minted Tokens</H2>
								</ContainerRow>
							</CardTransparent>
							<ContainerRow>
								<MainBox>
									<Heading>Total Minted Tokens</Heading>
									<BigNumber>
										{totalMinted.toLocaleString(undefined, {
											maximumFractionDigits: 2,
										})}
									</BigNumber>
								</MainBox>
								<InfoBox>
									<YellowHeading>Total Supply</YellowHeading>
									<StyledTable>
										<table>
											<tr>
												<th>Empty Potion Bottle</th>
												<th>Sushi</th>
												<th>Poop</th>
											</tr>
											<tr>
												<td>
													{totalEPB.toLocaleString(
														undefined,
														{
															maximumFractionDigits: 2,
														}
													)}
												</td>
												<td>
													{totalSushi.toLocaleString(
														undefined,
														{
															maximumFractionDigits: 2,
														}
													)}
												</td>
												<td>
													{totalPoop.toLocaleString(
														undefined,
														{
															maximumFractionDigits: 2,
														}
													)}
												</td>
											</tr>
										</table>
									</StyledTable>
								</InfoBox>
							</ContainerRow>

							<ContainerRow>
								<FungibleTokenCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/fungible_tokens/fungible_tokens_thumbnails/empty_potion_bottle_thumbnail.png'
									}
									name={'Empty Potion Bottle'}
									totalSupply={totalEPB}
									adminBalance={adminEPB}
								/>
							</ContainerRow>
							<ContainerRow>
								<FungibleTokenCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/fungible_tokens/fungible_tokens_thumbnails/sushi_thumbnail.png'
									}
									name={'Sushi'}
									totalSupply={totalSushi}
									adminBalance={adminSushi}
								/>
							</ContainerRow>
							<ContainerRow>
								<FungibleTokenCard
									src={
										'https://raw.githubusercontent.com/basicbeasts/basic-beasts-frontend/main/public/fungible_tokens/fungible_tokens_thumbnails/poop_thumbnail.png'
									}
									name={'Poop'}
									totalSupply={totalPoop}
									adminBalance={adminPoop}
								/>
							</ContainerRow>
						</>
					) : (
						<></>
					)}
					{tab === 'mintTokens' ? (
						<>
							<Card
								bgColor={'#fff'}
								marginTop={'13vw'}
								bgColor2={'#737374'}
								fontColor={'#fff'}
							>
								<div>
									<H2>
										Prepare packs in order to mint Packs
									</H2>
									<H3>
										Currently disabled to mint specific pack
									</H3>
									{/* <FetchBeastTemplateContainer>
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

export default FungibleTokenOverview;
