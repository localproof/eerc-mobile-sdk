/** Deploys a USDC-symbol test ERC20 on Fuji and mints to the demo wallet. */
import { ethers } from 'ethers';
import { readFileSync, writeFileSync } from 'node:fs';

const RPC = process.env.RPC_URL!, PK = process.env.DEPLOYER_PK!, DEMO = process.env.DEMO_ADDR!;
const ART = new URL('../e2e/out', import.meta.url).pathname;

const provider = new ethers.JsonRpcProvider(RPC, 43113, { staticNetwork: true });
const deployer = new ethers.NonceManager(new ethers.Wallet(PK, provider));

const j = JSON.parse(readFileSync(`${ART}/SimpleERC20.sol/SimpleERC20.json`, 'utf8'));
const token = await new ethers.ContractFactory(j.abi, j.bytecode.object, deployer)
  .deploy('USD Coin (test)', 'USDC', 18);
await token.waitForDeployment();
const addr = await token.getAddress();
console.log('USDC token:', addr);
console.log('symbol    :', await (token as any).symbol());

await (await (token as any).mint(DEMO, ethers.parseEther('500'))).wait();
console.log('minted 500 USDC to', DEMO);

const p = new URL('../prover/react-native/src/config.ts', import.meta.url).pathname;
writeFileSync(p, readFileSync(p, 'utf8').replace(/erc20: '0x[0-9a-fA-F]*'/, `erc20: '${addr}'`));
console.log('config.ts -> erc20', addr);
process.exit(0);
