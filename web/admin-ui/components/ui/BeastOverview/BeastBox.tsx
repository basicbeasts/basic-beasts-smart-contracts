import React, { FC } from 'react';
import styled from 'styled-components';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import star from '../../../public/basic_starLevel.png';

const Container = styled.div`
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

const BeastImageBox = styled.div<Color>`
	background: ${(props) => props.colorCode || '#ffd966'};
	height: 250px;
	width: 200px;
	border-radius: 10px;
	position: relative;
	right: 40px;
	bottom: 20px;
`;
type Color = {
	colorCode: string;
};

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
	top: 50px;
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

type Props = {
	numberMinted: any;
	name: string;
	dexNumber: number;
	normalID: number;
	metallicID: number;
	cursedID: number;
	shinyID: number;
	mythicID: number;
	imageUrl: string;
	color: string;
};

//TODO: Add supply as props for each skin (get the data from beastSkins.ts).

const BeastBox: FC<Props> = ({
	numberMinted,
	name,
	dexNumber,
	normalID,
	metallicID,
	cursedID,
	shinyID,
	mythicID,
	imageUrl,
	color,
}) => {
	return (
		<Container>
			<BeastImageBox colorCode={color}>
				<BeastHeader>
					<BeastName>{name}</BeastName>
					<BeastDexNumber>
						{'#' + ('00' + dexNumber).slice(-3)}
					</BeastDexNumber>
				</BeastHeader>
				<StarImg src={star.src} />
				<BeastImage src={imageUrl} />
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
								{numberMinted[normalID] != null ? (
									<div>{numberMinted[normalID]}/1000</div>
								) : (
									<div>0/1000</div>
								)}
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
										text={`${0.133 * 100}%`}
										styles={buildStyles({
											textSize: '1.2em',
										})}
									/>
								</div>
							</td>
							<td>
								{numberMinted[metallicID] != null ? (
									<div>{numberMinted[metallicID]}/?</div>
								) : (
									<div>0/?</div>
								)}
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
										styles={buildStyles({
											textSize: '1.2em',
										})}
									/>
								</div>
							</td>
							<td>
								{numberMinted[cursedID] != null ? (
									<div>{numberMinted[cursedID]}/200</div>
								) : (
									<div>0/200</div>
								)}
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
										text={`${0.015 * 100}%`}
										styles={buildStyles({
											textSize: '1.2em',
										})}
									/>
								</div>
							</td>
							<td>
								{numberMinted[shinyID] != null ? (
									<div>{numberMinted[shinyID]}/50</div>
								) : (
									<div>0/50</div>
								)}
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
										text={`${0.04 * 100}%`}
										styles={buildStyles({
											textSize: '1.2em',
										})}
									/>
								</div>
							</td>
							<td>
								{numberMinted[mythicID] != null ? (
									<div>{numberMinted[mythicID]}/1</div>
								) : (
									<div>0/1</div>
								)}
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
										text={`${0 * 100}%`}
										styles={buildStyles({
											textSize: '1.2em',
										})}
									/>
								</div>
							</td>
						</tr>
					</table>
				</StyledTable>
			</BeastBoxWrapper>
		</Container>
	);
};

export default BeastBox;
