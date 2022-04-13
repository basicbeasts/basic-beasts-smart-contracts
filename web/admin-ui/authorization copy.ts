import * as fcl from '@onflow/fcl';
import { ec as EC } from 'elliptic';
import { SHA3 } from 'sha3';

// const ec = new EC('secp256k1');
const ec = new EC('p256');

// Emulator
const ADDRESS = 'f8d6e0586b0a20c7';
const PRIVATE_KEY =
	'3cf1e5c7c7aa34c751333ba20c7247c8a6707005b8d29b06e5de874593bd4bdf';
const KEY_ID = 0;

const sign = (message: any) => {
	const key = ec.keyFromPrivate(Buffer.from(PRIVATE_KEY, 'hex'));
	const sig = key.sign(hash(message)); // hashMsgHex -> hash
	const n = 32;
	const r = sig.r.toArrayLike(Buffer, 'be', n);
	const s = sig.s.toArrayLike(Buffer, 'be', n);
	return Buffer.concat([r, s]).toString('hex');
};

const hash = (message: any) => {
	const sha = new SHA3(256);
	sha.update(Buffer.from(message, 'hex'));
	return sha.digest();
};

export const authorizationFunction = async (account: any) => {
	// authorization function need to return an account
	return {
		...account, // bunch of defaults in here, we want to overload some of them though
		tempId: `${ADDRESS}-${KEY_ID}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
		addr: fcl.sansPrefix(ADDRESS), // the address of the signatory, currently it needs to be without a prefix right now
		keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
		signingFunction: async (signable: any) => {
			// Singing functions are passed a signable and need to return a composite signature
			// signable.message is a hex string of what needs to be signed.
			return {
				addr: fcl.withPrefix(ADDRESS), // needs to be the same as the account.addr but this time with a prefix, eventually they will both be with a prefix
				keyId: Number(KEY_ID), // needs to be the same as account.keyId, once again make sure its a number and not a string
				signature: sign(signable.message), // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
			};
		},
	};
};

module.exports = {
	authorizationFunction,
};
