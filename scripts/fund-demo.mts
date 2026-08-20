/** Funds the in-app demo wallet with AVAX (gas) + TEST tokens, then writes config.ts. */
import { ethers } from 'ethers';
import { readFileSync, writeFileSync } from 'node:fs';

const RPC = process.env.RPC_URL!, PK = process.env.DEPLOYER_PK!;
const EERC = process.env.EERC!, REGISTRAR = process.env.REGISTRAR!, ERC20 = process.env.ERC20!;
const DEMO_PK = process.env.DEMO_PK!;

const provider = new ethers.JsonRpcProvider(RPC, 43113, { staticNetwork: true });
const funder = new ethers.NonceManager(new ethers.Wallet(PK, provider));
const demo = new ethers.Wallet(DEMO_PK, provider);
console.log('demo wallet:', demo.address);

const gas = await provider.getBalance(demo.address);
if (gas < ethers.parseEther('0.02')) {
  console.log('  sending 0.05 AVAX for gas...');
  await (await funder.sendTransaction({ to: demo.address, value: ethers.parseEther('0.05') })).wait();
}
const erc20 = new ethers.Contract(ERC20, ['function mint(address,uint256)','function balanceOf(address) view returns (uint256)'], funder);
const bal: bigint = await erc20.balanceOf(demo.address);
if (bal < ethers.parseEther('50')) {
  console.log('  minting 500 TEST...');
  await (await erc20.mint(demo.address, ethers.parseEther('500'))).wait();
}
console.log('  AVAX:', ethers.formatEther(await provider.getBalance(demo.address)));
console.log('  TEST:', ethers.formatEther(await erc20.balanceOf(demo.address)));

const p = new URL('../prover/react-native/src/config.ts', import.meta.url).pathname;
let c = readFileSync(p, 'utf8');
c = c.replace(/encryptedERC: '0x[0-9a-fA-F]*'/, `encryptedERC: '${EERC}'`)
     .replace(/registrar: '0x[0-9a-fA-F]*'/, `registrar: '${REGISTRAR}'`)
     .replace(/erc20: '0x[0-9a-fA-F]*'.*/, `erc20: '${ERC20}',`)
     .replace(/demoPrivateKey: '0x[0-9a-fA-F]*'/, `demoPrivateKey: '${DEMO_PK}'`);
writeFileSync(p, c);
console.log('config.ts updated');
process.exit(0);
