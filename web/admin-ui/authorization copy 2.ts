import { ec as EC } from 'elliptic';
import { SHA3 } from 'sha3';
import * as fcl from '@onflow/fcl';
import * as rlp from 'rlp';
import { config } from '@onflow/config';

export const sansPrefix = (address) => {
	if (address == null) return null;
	return address.replace(/^0x/, '');
};

export const withPrefix = (address) => {
	if (address == null) return null;
	return '0x' + sansPrefix(address);
};

const ec = new EC('p256');

const hashMsgHex = (msgHex) => {
	const sha = new SHA3(256);
	sha.update(Buffer.from(msgHex, 'hex'));
	return sha.digest();
};

export const signWithKey = (privateKey, msgHex) => {
	const key = ec.keyFromPrivate(Buffer.from(privateKey, 'hex'));
	const sig = key.sign(hashMsgHex(msgHex));
	const n = 32; // half of signature length?
	const r = sig.r.toArrayLike(Buffer, 'be', n);
	const s = sig.s.toArrayLike(Buffer, 'be', n);
	return Buffer.concat([r, s]).toString('hex');
};

export const authorizationFunction =
	(addr, keyId = 0) =>
	async (account = {}) => {
		const serviceAddress = await config().get('f8d6e0586b0a20c7');
		const pkey = await config().get(
			'3cf1e5c7c7aa34c751333ba20c7247c8a6707005b8d29b06e5de874593bd4bdf'
		);

		addr = sansPrefix(addr || serviceAddress);

		const signingFunction = async (data) => ({
			keyId,
			addr: withPrefix(addr),
			signature: signWithKey(pkey, data.message),
		});

		return {
			...account,
			tempId: `${addr}-${keyId}`,
			addr: fcl.sansPrefix(addr),
			keyId,
			signingFunction,
		};
	};

export const pubFlowKey = async () => {
	const keys = ec.keyFromPrivate(
		Buffer.from(await config().get('PRIVATE_KEY'), 'hex')
	);
	const publicKey = keys.getPublic('hex').replace(/^04/, '');
	return rlp
		.encode([
			Buffer.from(publicKey, 'hex'), // publicKey hex to binary
			2, // P256 per https://github.com/onflow/flow/blob/master/docs/accounts-and-keys.md#supported-signature--hash-algorithms
			3, // SHA3-256 per https://github.com/onflow/flow/blob/master/docs/accounts-and-keys.md#supported-signature--hash-algorithms
			1000, // give key full weight
		])
		.toString('hex');
};
