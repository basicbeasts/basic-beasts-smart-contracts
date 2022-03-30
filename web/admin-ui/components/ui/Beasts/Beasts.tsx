import React, { FC, useState } from 'react';
import styled from 'styled-components';
import Table, { TableStyles } from '../Table';
import beastTemplates from '../../../../usability-testing/data/beastTemplates';
import BeastTemplate from '../../../../usability-testing/utils/BeastTemplate';
import BeastCard from '../BeastCard';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import star from '../../../public/basic_starLevel.png';

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
	margin-left: 20px;
	background: #fff;
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

const Beasts: FC = () => {
	const [tab, setTab] = useState<
		'overview' | 'adminNftCollection' | 'mintBeasts'
	>('overview');

	// For 'Overview' tab
	const [beastTemplate, setBeastTemplate] = useState<
		BeastTemplate | undefined
	>();
	// For 'Create Beast Template' tab
	const [beastTemplateID, setBeastTemplateID] = useState();

	return (
		<Container>
			<Content>
				<H1>Mint Beasts</H1>
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
							Admin NFT Collection
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
									<Input placeholder="dexNumber" />
									<Button>Search</Button>
								</ContainerRow>
							</CardTransparent>
							<ContainerRow>
								<InfoBox>
									<Heading>Total Minted Beasts</Heading>
									<BigNumber>2833</BigNumber>
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
									<H2>Create Beast Template</H2>
									<FetchBeastTemplateContainer>
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
									</FetchBeastTemplateContainer>
									{beastTemplate != null ? (
										<>
											<H2>Beast Template JSON Info</H2>
											<BeastTemplateInfo>
												<div>
													beastTemplateID:{' '}
													{
														beastTemplate.beastTemplateID
													}
												</div>
												<div>
													generation:{' '}
													{beastTemplate.generation}
												</div>
												<div>
													dexNumber:{' '}
													{beastTemplate.dexNumber}
												</div>{' '}
												<div>
													name: {beastTemplate.name}
												</div>{' '}
												<div>
													description:{' '}
													{beastTemplate.description}
												</div>{' '}
												<div>
													image:
													<Img
														src={
															beastTemplate.image
														}
													/>
												</div>{' '}
												<div>
													imageTransparentBg:
													<Img
														src={
															beastTemplate.imageTransparentBg
														}
													/>
												</div>{' '}
												<div>
													animationUrl:{' '}
													{beastTemplate.animationUrl}
												</div>
												<div>
													externalUrl:{' '}
													{beastTemplate.externalUrl}
												</div>
												<div>
													rarity:{' '}
													{beastTemplate.rarity}
												</div>
												<div>
													skin: {beastTemplate.skin}
												</div>
												<div>
													starLevel:{' '}
													{beastTemplate.starLevel}
												</div>
												<div>
													asexual:{' '}
													{beastTemplate.asexual.toString()}
												</div>
												<div>
													breedableBeastTemplateID:{' '}
													{
														beastTemplate.breedableBeastTemplateID
													}
												</div>
												<div>
													maxAdminMintAllowed:{' '}
													{
														beastTemplate.maxAdminMintAllowed
													}
												</div>
												<div>
													ultimateSkill:{' '}
													{
														beastTemplate.ultimateSkill
													}
												</div>
												<div>
													basicSkills:
													{beastTemplate.basicSkills.map(
														(
															skill: any,
															i: any
														) => (
															<span key={i}>
																{' '}
																{skill},
															</span>
														)
													)}
												</div>
												<div>
													elements:{' '}
													{beastTemplate.elements}
												</div>
												<div>
													data:{' '}
													{JSON.stringify(
														beastTemplate.data,
														null,
														2
													)}
												</div>
											</BeastTemplateInfo>
										</>
									) : (
										<></>
									)}
								</div>

								{beastTemplate != null ? (
									<>
										<div>
											<RedText>
												Beast Template is not created
											</RedText>
											<ActionButton
												onClick={() =>
													alert(
														'Create Beast Template'
													)
												}
											>
												Create →
											</ActionButton>
										</div>
										<div>
											<BeastCard
												beastTemplate={beastTemplate}
											/>
										</div>
									</>
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
							<CardTransparent
								bgColor={'#f8f8f8'}
								marginTop={'13vw'}
								bgColor2={'#737374'}
								fontColor={'#fff'}
							>
								<ContainerRow>
									<H2>Mint Beasts</H2>
									<Input placeholder="dexNumber" />
									<Button>Search</Button>
								</ContainerRow>
							</CardTransparent>
							<div>stuff</div>
						</>
					) : (
						<></>
					)}
				</CardContainer>
			</Content>
		</Container>
	);
};

export default Beasts;
