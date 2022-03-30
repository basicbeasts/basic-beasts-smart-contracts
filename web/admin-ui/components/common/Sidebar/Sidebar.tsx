import React, { FC } from 'react';
import styled from 'styled-components';
import NextLink from 'next/link';

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
	display: flex;
	flex-direction: column;
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

const A = styled.a`
	color: #fff;
	cursor: pointer;
	font-size: 2em;
	line-height: 1.5em;
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
				<NextLink href="/">
					<A>Beast Template</A>
				</NextLink>
				<NextLink href="/mint-beasts">
					<A>Mint Beasts</A>
				</NextLink>
				<NextLink href="/mint-tokens">
					<A>Mint Tokens</A>
				</NextLink>
				<NextLink href="/mint-packs">
					<A>Mint Packs</A>
				</NextLink>
				<NextLink href="/distribute-packs">
					<A>Distribute Packs</A>
				</NextLink>
				<NextLink href="/airdrop">
					<A>Airdrop</A>
				</NextLink>
			</Wrapper>
		</Container>
	);
};

export default Sidebar;
