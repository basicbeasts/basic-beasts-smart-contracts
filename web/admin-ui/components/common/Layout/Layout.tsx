import { FC, useState } from 'react';
import * as fcl from '@onflow/fcl';
import Head from 'next/head';
import Sidebar from '../Sidebar';

//Configure FCL
fcl.config()
	.put('app.detail.title', 'Basic Beasts')
	.put('app.detail.icon', 'https://i.imgur.com/LihLjpF.png')
	.put('accessNode.api', 'http://localhost:8080') // Emulator
	.put('discovery.wallet', 'http://localhost:8701/fcl/authn')
	.put('0xNonFungibleToken', '0xf8d6e0586b0a20c7')
	.put('0xMetadataViews', '0xf8d6e0586b0a20c7')
	.put('0xFungibleToken', '0xf8d6e0586b0a20c7')
	.put('0xBasicBeasts', '0xf8d6e0586b0a20c7')
	.put('0xEmptyPotionBottle', '0xf8d6e0586b0a20c7')
	.put('0xEvolution', '0xf8d6e0586b0a20c7')
	.put('0xHunterScore', '0xf8d6e0586b0a20c7')
	.put('0xSushi', '0xf8d6e0586b0a20c7')
	.put('0xPoop', '0xf8d6e0586b0a20c7')
	.put('0xPack', '0xf8d6e0586b0a20c7');
//For testnet
// .put('accessNode.api', process.env.NEXT_PUBLIC_ACCESS_NODE_API)
// .put('challenge.handshake', process.env.NEXT_PUBLIC_CHALLENGE_HANDSHAKE)
// .put('0xFungibleToken', process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS)
// .put('0xFUSD', process.env.NEXT_PUBLIC_FUSD_ADDRESS);
// .put("0xBasicBeast", process.env.NEXT_PUBLIC_BASIC_BEAST_ADDRESS)

const Layout: FC = ({ children }) => {
	return (
		<>
			<Head>
				<link
					rel="preload"
					href="/fonts/Pixelar/Pixelar-Regular-W01-Regular.ttf"
					as="font"
					crossOrigin=""
				/>
			</Head>
			<Sidebar />
			{children}
		</>
	);
};

export default Layout;
