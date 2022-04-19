import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import NextLink from 'next/link';
import * as fcl from '@onflow/fcl';

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
	const [user, setUser] = useState({ addr: '' });

	useEffect(() => {
		fcl.currentUser.subscribe(setUser);
	}, []);

	const logIn = () => {
		fcl.authenticate();
		console.log('test');
	};

	const logOut = () => {
		fcl.unauthenticate();
	};
	return (
		<Container>
			<Wrapper>
				<Logo>
					<LogoText>
						Basic <br />
						Beasts
					</LogoText>
				</Logo>

				{user.addr ? (
					<>
						<A>{user.addr}</A>
						<button onClick={logOut}>Log Out</button>{' '}
					</>
				) : (
					<button onClick={logIn}>Log In</button>
				)}

				<NextLink href="/">
					<A>Beast Overview</A>
				</NextLink>
				<NextLink href="/mint-packs">
					<A>Pack Prep</A>
				</NextLink>
				<NextLink href="/mint-tokens">
					<A>Fungible Tokens</A>
				</NextLink>
				<NextLink href="/beast-templates">
					<A>Beast Template</A>
				</NextLink>
				<NextLink href="/distribute-packs">
					<A>Pack Distribution</A>
				</NextLink>
				<NextLink href="/airdrop">
					<A>Airdrop (soon)</A>
				</NextLink>
			</Wrapper>
		</Container>
	);
};

export default Sidebar;
