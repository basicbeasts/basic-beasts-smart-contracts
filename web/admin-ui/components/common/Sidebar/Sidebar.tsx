import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import NextLink from 'next/link';
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
import * as fcl from '@onflow/fcl';

import * as t from '@onflow/types';
import { SETUP_BEAST_COLLECTION } from '../../../../usability-testing/cadence/transactions/BasicBeasts/transaction.setup-account';
import { authorizationFunction } from '../../../authorization';

import { HAS_BASIC_BEASTS_COLLECTION } from '../../../../usability-testing/cadence/scripts/BasicBeasts/script.has-basic-beasts-collection';

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
	const [isInitialized, setIsInitialized] = useState();

	useEffect(() => {
		isCollectionInitialized();
	}, []);

	const setupAccount = async () => {
		try {
			const res = await send([
				transaction(SETUP_BEAST_COLLECTION),
				,
				payer(authorizationFunction),
				proposer(authorizationFunction),
				authorizations([authorizationFunction]),
				limit(9999),
			]).then(decode);
			const trx = await tx(res).onceSealed();
			return trx;
		} catch (err) {
			console.log(err);
		}
	};

	const isBeastCollectionInitialized = async () => {
		try {
			let response = await query({
				cadence: HAS_BASIC_BEASTS_COLLECTION,
				args: (arg: any, t: any) => [
					arg('f8d6e0586b0a20c7', t.Address),
				],
			});
			console.log(response);
			// setIsInitialized(response);
		} catch (err) {
			console.log(err);
		}
	};

	const isCollectionInitialized = async () => {
		try {
			let response = await query({
				cadence: HAS_BASIC_BEASTS_COLLECTION,
				args: (arg: any, t: any) => [
					arg('f8d6e0586b0a20c7', t.Address),
				],
			});
			console.log(response);
		} catch (err) {
			console.log(err);
		}
	};

	const stop = async () => {
		try {
			const response = await fcl
				.send([
					fcl.script(HAS_BASIC_BEASTS_COLLECTION),
					fcl.args([fcl.arg('f8d6e0586b0a20c7', t.Address)]),
				])
				.then(fcl.decode);
			console.log(response);
		} catch (err) {
			console.log(err);
		}
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
				<NextLink href="/">
					<A>Beast Overview</A>
				</NextLink>
				<NextLink href="/mint-packs">
					<A>Pack Prep</A>
				</NextLink>
				<NextLink href="/distribute-packs">
					<A>Pack Distribution</A>
				</NextLink>
				<NextLink href="/mint-tokens">
					<A>Fungible Tokens</A>
				</NextLink>
				<NextLink href="/beast-templates">
					<A>Beast Template</A>
				</NextLink>
				<NextLink href="/airdrop">
					<A>Airdrop</A>
				</NextLink>
				<button onClick={() => console.log()}>Setup Account</button>
				<A>{isInitialized ? 'Initialized' : 'Not Initialized'}</A>
			</Wrapper>
		</Container>
	);
};

export default Sidebar;
