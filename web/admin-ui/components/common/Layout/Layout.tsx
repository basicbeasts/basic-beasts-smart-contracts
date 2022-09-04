import { FC, useState } from 'react';
import * as fcl from '@onflow/fcl';
import Head from 'next/head';
import Sidebar from '../Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Configure FCL
fcl.config()
	.put('app.detail.title', 'Basic Beasts')
	.put('app.detail.icon', 'https://i.imgur.com/LihLjpF.png')
	// Emulator
	// .put('accessNode.api', 'http://localhost:8080')
	// .put('discovery.wallet', 'http://localhost:8701/fcl/authn')
	// .put('0xNonFungibleToken', '0xf8d6e0586b0a20c7')
	// .put('0xMetadataViews', '0xf8d6e0586b0a20c7')
	// .put('0xFungibleToken', '0xf8d6e0586b0a20c7')
	// .put('0xBasicBeasts', '0xf8d6e0586b0a20c7')
	// .put('0xEmptyPotionBottle', '0xf8d6e0586b0a20c7')
	// .put('0xEvolution', '0xf8d6e0586b0a20c7')
	// .put('0xHunterScore', '0xf8d6e0586b0a20c7')
	// .put('0xSushi', '0xf8d6e0586b0a20c7')
	// .put('0xPoop', '0xf8d6e0586b0a20c7')
	// .put('0xPack', '0xf8d6e0586b0a20c7');
	//For testnet
	.put('0xNonFungibleToken', '0x631e88ae7f1d7c20')
	.put('0xMetadataViews', '0x631e88ae7f1d7c20')
	.put('0xFungibleToken', '9a0766d93b6608b7')
	.put('0xBasicBeasts', '0x22fc0fd68c3857cf')
	.put('0xEmptyPotionBottle', '0x22fc0fd68c3857cf')
	// .put('0xEvolution', '0xf8d6e0586b0a20c7')
	.put('0xHunterScore', '0x22fc0fd68c3857cf')
	.put('0xSushi', '0x22fc0fd68c3857cf')
	.put('0xPoop', '0x22fc0fd68c3857cf')
	.put('0xPack', '0x22fc0fd68c3857cf')
	.put('0xInbox', '0x22fc0fd68c3857cf')
	.put('0xEvolution', '0x22fc0fd68c3857cf')
	//.put('accessNode.api', 'https://access-testnet.onflow.org')
	.put('accessNode.api', 'https://rest-testnet.onflow.org')
	.put('challenge.handshake', 'https://flow-wallet-testnet.blocto.app/authn');
// .put('accessNode.api', 'https://access-testnet.onflow.org')
// .put('challenge.handshake', 'https://flow-wallet-testnet.blocto.app/authn')
// .put('accessNode.api', process.env.NEXT_PUBLIC_ACCESS_NODE_API)
// .put('challenge.handshake', process.env.NEXT_PUBLIC_CHALLENGE_HANDSHAKE)
//NEXT_PUBLIC_ACCESS_NODE_API="https://access-testnet.onflow.org"
//NEXT_PUBLIC_CHALLENGE_HANDSHAKE="https://flow-wallet-testnet.blocto.app/authn"
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

			<ToastContainer position="bottom-right" pauseOnFocusLoss={false} />
			<Sidebar />
			{children}
		</>
	);
};

export default Layout;
