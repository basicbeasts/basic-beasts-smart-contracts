import { FC, useState } from 'react';
import * as fcl from '@onflow/fcl';
import Head from 'next/head';
import Sidebar from '../Sidebar';

//Configure FCL
fcl.config()
	.put('accessNode.api', process.env.NEXT_PUBLIC_ACCESS_NODE_API)
	.put('challenge.handshake', process.env.NEXT_PUBLIC_CHALLENGE_HANDSHAKE)
	.put('0xFungibleToken', process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS)
	.put('0xFUSD', process.env.NEXT_PUBLIC_FUSD_ADDRESS);
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
