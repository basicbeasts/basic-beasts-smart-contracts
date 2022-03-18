import { mintFlow, deployContractByName } from 'flow-js-testing';
import { getAdminAddress } from './common';

export const deployBasicBeasts = async () => {
	const Admin = await getAdminAddress();
	await mintFlow(Admin, '10.0');

	await deployContractByName({ to: Admin, name: 'NonFungibleToken' });
	return deployContractByName({ to: Admin, name: 'BasicBeasts' });
};
