/** Decrypts the demo recipient's confidential balance — the explorer can't show it. */
import { ethers } from 'ethers';
import { ENCRYPTED_ERC_ABI, keysFromSeed, decryptBalance, fromUnits } from '../src/index';

const RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
// Throwaway testnet recipient. Override with RECIPIENT_PK.
const PK = process.env.RECIPIENT_PK
  ?? '0x1111111111111111111111111111111111111111111111111111111111111111';
const EERC = process.env.EERC ?? '0xAf5a8Df08bF9af8f5C62e834F467C4F51feD6396';
const ERC20 = process.env.ERC20 ?? '0xE43B33d99F289fA0770Ca518E36d4e7354aC64Eb';

const provider = new ethers.JsonRpcProvider(RPC, 43113, { staticNetwork: true });
const addr = new ethers.Wallet(PK).address;
const keys = keysFromSeed(BigInt(PK));
const eerc = new ethers.Contract(EERC, ENCRYPTED_ERC_ABI as any, provider);

const id = await (eerc as any).tokenIds(ERC20);
const b = await (eerc as any).balanceOf(addr, id);
const c1 = [BigInt(b[0].c1.x), BigInt(b[0].c1.y)];
console.log('recipient      :', addr);
console.log('on-chain c1.x  :', c1[0].toString().slice(0, 30) + '…   <- this is all the explorer sees');
const dec = decryptBalance(keys.formatted, {
  encryptedBalance: [c1, [BigInt(b[0].c2.x), BigInt(b[0].c2.y)]],
  balancePCT: b[3].map((x: any) => BigInt(x)),
  amountPCTs: b[2].map((a: any) => a[0].map((x: any) => BigInt(x))),
});
console.log('DECRYPTED      :', fromUnits(dec.balance, 2), 'cUSDC', `(consistent=${dec.consistent})`);
process.exit(0);
