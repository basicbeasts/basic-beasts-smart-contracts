import React, { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import 'react-circular-progressbar/dist/styles.css';

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
		padding: 0 25px 10px;
	}
`;

const BeastBox = styled.div`
	background: #ffffff;
	border-radius: 10px;
	box-shadow: 3px 3px 9px 0px rgba(0, 0, 0, 0.2);
	margin-left: 30px;
	margin-top: 30px;
	width: 46vw;
	flex-direction: row;
	display: flex;
`;
const BeastImageBox = styled.div`
	width: 300px;
	margin: 0;
`;

const BeastBoxWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin: auto;
`;

const BeastImage = styled.img`
	width: 100%;
	user-drag: none;
	-webkit-user-drag: none;
	border-radius: 10px;
	display: block;
`;

type Props = {
	src: string;
	name: string;
	maxSupply: number;
	totalSupply: number;
};

const PackCard: FC<Props> = ({ src, name, totalSupply, maxSupply }) => {
	return (
		<BeastBox>
			<BeastImageBox>
				<BeastImage src={src} />
			</BeastImageBox>
			<BeastBoxWrapper>
				<YellowHeading>{name}</YellowHeading>
				<StyledTable>
					<table>
						<tr>
							<th>Max Supply</th>
							<th>Total Supply</th>
							<th>Admin Holdings</th>
						</tr>
						<tr>
							<td>
								{maxSupply > 0 ? (
									<div>
										{maxSupply.toLocaleString(undefined, {
											maximumFractionDigits: 2,
										})}
									</div>
								) : (
									<div>?</div>
								)}
							</td>
							<td>
								<div>
									{totalSupply.toLocaleString(undefined, {
										maximumFractionDigits: 2,
									})}
								</div>
							</td>
							<td>
								<div>
									{(0).toLocaleString(undefined, {
										maximumFractionDigits: 2,
									})}
								</div>
							</td>
						</tr>
					</table>
				</StyledTable>
			</BeastBoxWrapper>
		</BeastBox>
	);
};

export default PackCard;
