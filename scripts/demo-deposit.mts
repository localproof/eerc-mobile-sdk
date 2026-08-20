/** One-off: deposit public USDC into the demo wallet's confidential balance. */
import { ethers } from 'ethers';
import { ENCRYPTED_ERC_ABI, ERC20_ABI, keysFromSeed, buildDepositPCT, decryptBalance,
         fromUnits, toUnits } from '../src/index';

const RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
const EERC = process.env.EERC!, ERC20 = process.env.ERC20!, PK = process.env.DEMO_PK!;
const EERC_DEC = 2, ERC20_DEC = 18;

const provider = new ethers.JsonRpcProvider(RPC, 43113, { staticNetwork: true });
const signer = new ethers.NonceManager(new ethers.Wallet(PK, provider));
const addr = new ethers.Wallet(PK).address;
const keys = keysFromSeed(BigInt(PK));

const eerc = new ethers.Contract(EERC, ENCRYPTED_ERC_ABI as any, signer);
const erc20 = new ethers.Contract(ERC20, ERC20_ABI as any, signer);

const amount = ethers.parseUnits('25', ERC20_DEC);
const units = toUnits(amount, ERC20_DEC, EERC_DEC);
console.log('approving…');
await (await (erc20 as any).approve(EERC, amount)).wait();
console.log(`depositing 25 USDC -> ${units} units`);
const r = await (await (eerc as any).deposit(amount, ERC20, buildDepositPCT(units, keys.publicKey))).wait();
console.log('tx', r.hash, 'status', r.status);

const id = await (eerc as any).tokenIds(ERC20);
const b = await (eerc as any).balanceOf(addr, id);
const dec = decryptBalance(keys.formatted, {
  encryptedBalance: [[BigInt(b[0].c1.x), BigInt(b[0].c1.y)], [BigInt(b[0].c2.x), BigInt(b[0].c2.y)]],
  balancePCT: b[3].map((x: any) => BigInt(x)),
  amountPCTs: b[2].map((a: any) => a[0].map((x: any) => BigInt(x))),
});
console.log(`confidential balance: ${fromUnits(dec.balance, EERC_DEC)} cUSDC (consistent=${dec.consistent})`);
process.exit(0);
