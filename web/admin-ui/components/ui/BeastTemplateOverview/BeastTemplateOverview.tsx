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

	const data = useMemo(
		() => [
			{
				beastTemplateID: 1,
				name: 'Moon',
				skin: 'Normal',
				starLevel: 1,
				maxAdminMintAllowed: 1000,
				numberMintedPerBeastTemplate: 0,
				retired: 'false',
			},
			{
				beastTemplateID: 2,
				name: 'Moon',
				skin: 'Metallic Silver',
				starLevel: 1,
				maxAdminMintAllowed: 1000000000,
				numberMintedPerBeastTemplate: 0,
				retired: 'false',
			},
			{
				beastTemplateID: 3,
				name: 'Moon',
				skin: 'Cursed Black',
				starLevel: 1,
				maxAdminMintAllowed: 200,
				numberMintedPerBeastTemplate: 0,
				retired: 'false',
			},
			{
				beastTemplateID: 4,
				name: 'Moon',
				skin: 'Shiny Gold',
				starLevel: 1,
				maxAdminMintAllowed: 50,
				numberMintedPerBeastTemplate: 0,
				retired: 'false',
			},
			{
				beastTemplateID: 6,
				name: 'Saber',
				skin: 'Normal',
				starLevel: 1,
				maxAdminMintAllowed: 1000,
				numberMintedPerBeastTemplate: 0,
				retired: 'false',
			},
		],
		[]
	);

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
				</CardContainer>
			</Content>
		</Container>
	);
};

export default BeastTemplateOverview;
