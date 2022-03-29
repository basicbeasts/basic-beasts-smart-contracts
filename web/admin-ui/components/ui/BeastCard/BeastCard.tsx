import React, { FC } from 'react';
import styled from 'styled-components';
import star from '../../../public/basic_starLevel.png';

const Container = styled.div<Omit<Unknown, 'beastTemplate'>>`
	width: 400px;
	background: #fff;
	margin: 30px 20px;
	font-size: 18px;
	opacity: ${({ unknown }) => (!unknown ? '1' : '0.8')};
	user-drag: none;
	-webkit-user-drag: none;
	user-select: none;
	-moz-user-select: none;
	-webkit-user-select: none;
	-ms-user-select: none;
	/* border: solid 1px #939393; */
`;

// -----------------------------------------------------------------------
// Header
// Styling for the header of a Beast Card
// -----------------------------------------------------------------------

const Header = styled.div`
	height: 235px;
	background: rgb(99, 91, 255);
	box-shadow: 0px -6px 5px 4px rgb(99, 91, 255); //Here to adjust how close header and content should be
	padding: 28px 35px;
	color: #fff;
`;

const BeastName = styled.h3`
	margin: 0;
	font-size: 65px;
	font-weight: normal;
`;

const HeaderDetails = styled.div`
	display: table;
	clear: both;
	width: 100%;
	margin-top: 10px;
`;

const Type = styled.div`
	float: left;
	background-color: rgb(99, 91, 255);
	box-shadow: -3px 0px 0px 0px rgb(133, 127, 252),
		0px -3px 0px 0px rgb(133, 127, 252), 0px 3px 0px 0px rgb(133, 127, 252),
		3px 0px 0px 0px rgb(133, 127, 252), inset -3px 0px rgb(107, 102, 203);
	padding-top: 0px;
	padding-bottom: 2px;
	padding-left: 8px;
	padding-right: 8px;
	width: 80px;
	margin-top: 10px;
	margin-left: 1px;
	font-size: 1em;
`;

const DexNumber = styled.div`
	float: right;
	font-size: 35px;
`;

// -----------------------------------------------------------------------
// Content
// Styling for the content of a Beast Card
// -----------------------------------------------------------------------

const Content = styled.div`
	height: 340px;
	background: #fff;
	box-shadow: 0px 0px 5px 4px #fff;
	padding: 40px;
`;

const ContentWrapper = styled.div<Omit<Unknown, 'beastTemplate'>>`
	top: ${({ unknown }) => (!unknown ? '-150px' : '30px')};
	position: relative;
`;

const Img = styled.img`
	width: 180px;
	left: 75px;
	top: -10px;
	position: relative;
	user-drag: none;
	-webkit-user-drag: none;
`;

const Description = styled.div`
	height: 60px;
	font-size: 0.8em;
`;

const StarImg = styled.img`
	width: 25px;
	float: right;
	margin-right: 5px;
	margin-top: 1px;
	user-drag: none;
	-webkit-user-drag: none;
`;

const StarLevel = styled.div`
	display: table;
	clear: both;
	height: 40px;
`;

const StarLevelLabel = styled.div`
	float: left;
	margin-right: 50px;
	font-size: 1em;
	@media (max-width: 450px) {
		margin-right: 38px;
	}
`;

const BasicSkills = styled.div`
	display: table;
	clear: both;
	height: 95px;
`;

const Skills = styled.div`
	float: right;
	margin-top: 5px;
`;

const Skill = styled.div`
	height: 25px;
	font-size: 1em;
`;

const BasicSkillsLabel = styled.div`
	float: left;
	margin-right: 45px;
	font-size: 1em;
	@media (max-width: 450px) {
		margin-right: 33px;
	}
`;

const UltimateSkill = styled.div`
	display: table;
	clear: both;
	background-color: rgb(99, 91, 255);
	box-shadow: -3px 0px 0px 0px #7e79dc, 0px -3px 0px 0px #7e79dc,
		0px 3px 0px 0px #7e79dc, 3px 0px 0px 0px #7e79dc,
		inset -3px -3px #928ee4;
	padding-top: 5px;
	padding-bottom: 10px;
	padding-left: 10px;
	padding-right: 10px;
	margin-left: -10px;
`;

const UltimateSkillLabel = styled.div`
	float: left;
	font-size: 1em;
	margin-right: 32px;
	margin-top: 3px;
	color: white;
	@media (max-width: 450px) {
		margin-right: 20px;
	}
`;

const SkillName = styled.div`
	float: right;
	width: 150px;
	margin-top: 3px;
	font-size: 1em;
	color: white;
`;

type Unknown = {
	unknown: Boolean;
};

type Color = {
	colorCode: any;
};

type Button = {
	outset: string;
	inset: string;
};

type BeastTemplate = {
	dexNumber: number;
	name: string;
	type: string;
	description: string;
	starLevel: number;
	basicSkills: [string];
	ultimateSkill: string;
	image: string;
	color: string;
	buttonBackground: string;
	buttonOutset: string;
	buttonInset: string;
	typeTagBackground: string;
	typeTagOutset: string;
	typeTagInset: string;
	elements: [string];
};

type Props = {
	beastTemplate: BeastTemplate;
};

const BeastCard: FC<Props> = ({ beastTemplate }) => {
	const unknown = beastTemplate.name == '???';

	return (
		<Container unknown={unknown}>
			<Header>
				<BeastName>{beastTemplate.name}</BeastName>
				<HeaderDetails>
					<Type>{beastTemplate.elements[0]}</Type>
					<DexNumber>
						{'#' + ('00' + beastTemplate.dexNumber).slice(-3)}
					</DexNumber>
				</HeaderDetails>
			</Header>
			<Content>
				<ContentWrapper unknown={unknown}>
					{unknown ? <></> : <Img src={beastTemplate.image} />}
					<Description>{beastTemplate.description}</Description>

					<StarLevel>
						<StarLevelLabel>Star Level</StarLevelLabel>
						{Array.from(Array(beastTemplate.starLevel), (e, i) => {
							return <StarImg src={star.src} key={i} />;
						})}
					</StarLevel>

					<BasicSkills>
						<BasicSkillsLabel>Basic Skills</BasicSkillsLabel>
						<Skills>
							{beastTemplate.basicSkills.map(
								(skill: any, i: any) => (
									<Skill key={i}>{skill}</Skill>
								)
							)}
						</Skills>
					</BasicSkills>

					<UltimateSkill>
						<UltimateSkillLabel>Ultimate Skill</UltimateSkillLabel>
						<SkillName>{beastTemplate.ultimateSkill}</SkillName>
					</UltimateSkill>
				</ContentWrapper>
			</Content>
		</Container>
	);
};
export default BeastCard;
