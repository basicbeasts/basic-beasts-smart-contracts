import React, { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
	position: fixed;
	height: 100%;
	background-color: #111823;
	top: 0;
	left: 0;
	width: 18vw;
`;

const Wrapper = styled.div`
	width: 60%;
	margin: auto;
`;

const Logo = styled.div`
	margin: 100px auto;
`;

const LogoText = styled.span`
	color: rgb(243, 203, 35);
	cursor: pointer;
	font-size: 5em;
	line-height: 0.5em;
	text-transform: capitalize;
	text-align: center;
`;

const Sidebar: FC = () => {
	return (
		<Container>
			<Wrapper>
				<Logo>
					<LogoText>
						Basic <br />
						Beasts
					</LogoText>
				</Logo>
				<div>Beast Template</div>

				<div>sidebar items</div>
			</Wrapper>
		</Container>
	);
};

export default Sidebar;
