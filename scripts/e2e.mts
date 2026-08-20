/**
 * eERC END-TO-END, driven entirely through @eerc/sdk.
 * This is the SDK's integration test: if this passes, the wallet will work.
 *
 *   RPC_URL=... DEPLOYER_PK=0x... PROVER=snarkjs|native  npm run e2e
 *   EERC=0x... REGISTRAR=0x... ERC20=0x...   (reuse an existing deployment)
 */
import { ethers } from 'ethers';
import * as snarkjs from 'snarkjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  randomKeys, registrationHash, buildRegistrationInput, buildTransferInput,
  buildDepositPCT, decryptBalance, snarkjsToCalldata, nativeToCalldata,
  fromUnits, toUnits, type CalldataProof, type CircuitInput,
} from '../src/index';

const ART = new URL('../e2e/out', import.meta.url).pathname;
const B = new URL('../vendor/eerc/circom/build', import.meta.url).pathname;
const PROVER = process.env.PROVER ?? 'snarkjs';
const RPC = process.env.RPC_URL ?? 'http://127.0.0.1:8545';
// Defaults are anvil's PUBLIC, well-known dev accounts — never fund these on a real network.
const DEPLOYER_PK = process.env.DEPLOYER_PK ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const USER_B_PK = process.env.USER_B_PK ?? '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const EERC_DECIMALS = 2;

const provider = new ethers.JsonRpcProvider(RPC);
const wA = new ethers.Wallet(DEPLOYER_PK, provider);
const wB = new ethers.Wallet(USER_B_PK, provider);
const A_ = new ethers.NonceManager(wA); // ethers resends stale nonces on rapid deploys
const B_ = new ethers.NonceManager(wB);
const addrA = wA.address, addrB = wB.address;
const log = (...a: unknown[]) => console.log(...a);

const art = (n: string, f: string) => {
  const j = JSON.parse(readFileSync(`${ART}/${f}.sol/${n}.json`, 'utf8'));
  return { abi: j.abi, bytecode: j.bytecode.object as string };
};
const deploy = async (s: any, a: { abi: any; bytecode: string }, args: unknown[] = []) => {
  const c = await new ethers.ContractFactory(a.abi, a.bytecode, s).deploy(...args);
  await c.waitForDeployment();
  return c;
};

// -------------------------------------------------------------- provers
const proveSnarkjs = async (name: string, input: CircuitInput): Promise<CalldataProof> => {
  const zkey = [`${B}/${name}/${name}.zkey`, `${B}/${name}/circuit_final.zkey`]
    .find((p) => { try { readFileSync(p); return true; } catch { return false; } })!;
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, `${B}/${name}/${name}.wasm`, zkey);
  return snarkjsToCalldata(await snarkjs.groth16.exportSolidityCallData(proof, publicSignals));
};
const proveNative = (name: string, input: CircuitInput): CalldataProof => {
  const dir = '/tmp/eerc_native_in';
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${name}_input.json`, JSON.stringify(input, null, 2));
  const zkey = [`${B}/${name}/${name}.zkey`, `${B}/${name}/circuit_final.zkey`]
    .find((p) => { try { readFileSync(p); return true; } catch { return false; } })!;
  execFileSync('cp', [zkey, `${dir}/${name}.zkey`]);
  execFileSync('cargo', ['+stable', 'test', '--release', '--lib', 'eerc_prove', '--', '--nocapture'], {
    cwd: process.env.PROVER_DIR ?? new URL('../prover', import.meta.url).pathname,
    env: { ...process.env, EERC_ARTIFACTS: dir, EERC_CIRCUIT: name }, stdio: 'inherit',
  });
  return nativeToCalldata(JSON.parse(readFileSync(`${dir}/${name}_proof.json`, 'utf8')));
};
const prove = (n: string, i: CircuitInput) => PROVER === 'native' ? proveNative(n, i) : proveSnarkjs(n, i);

// ============================================================ deploy
log(`--- deploying (prover=${PROVER}) ---`);
const chainId = (await provider.getNetwork()).chainId;
log(`  chainId : ${chainId}`);
const bal0 = await provider.getBalance(addrA);
log(`  deployer: ${addrA} (${ethers.formatEther(bal0)} native)`);
if (bal0 === 0n) throw new Error('deployer has no funds');
if ((await provider.getBalance(addrB)) < ethers.parseEther('0.02')) {
  log('  funding user B for gas...');
  await (await A_.sendTransaction({ to: addrB, value: ethers.parseEther('0.05') })).wait();
}

const babyJub = await deploy(A_, art('BabyJubJub', 'BabyJubJub'));
const vs: Record<string, string> = {};
for (const [k, n] of [['reg','RegistrationVerifier'],['mint','MintVerifier'],['wd','WithdrawVerifier'],['tr','TransferVerifier'],['bn','BurnVerifier']] as const)
  vs[k] = await (await deploy(A_, art(n, n))).getAddress();
const registrar = await deploy(A_, art('Registrar', 'Registrar'), [vs.reg]);
const ea = art('EncryptedERC', 'EncryptedERC');
const eerc = await deploy(A_, {
  abi: ea.abi,
  bytecode: ea.bytecode.replace(/__\$[0-9a-fA-F]{34}\$__/g, (await babyJub.getAddress()).slice(2).toLowerCase()),
}, [{ registrar: await registrar.getAddress(), isConverter: true, name: '', symbol: '',
      mintVerifier: vs.mint, withdrawVerifier: vs.wd, transferVerifier: vs.tr, burnVerifier: vs.bn,
      decimals: EERC_DECIMALS }]);
const erc20 = await deploy(A_, art('SimpleERC20', 'SimpleERC20'), ['Test', 'TEST', 18]);
log('  eERC     :', await eerc.getAddress());
log('  registrar:', await registrar.getAddress());
log('  erc20    :', await erc20.getAddress());

// ============================================================ register
log('--- registering (SDK) ---');
const kA = randomKeys(), kB = randomKeys();
for (const [signer, addr, keys, label] of [[A_, addrA, kA, 'A'], [B_, addrB, kB, 'B']] as const) {
  const h = registrationHash(chainId, keys.formatted, addr);
  const p = await prove('registration', buildRegistrationInput(keys, addr, chainId, h));
  await (await (registrar.connect(signer) as any).register(p)).wait();
  log(`  ${label} registered`);
}
await (await (eerc.connect(A_) as any).setAuditorPublicKey(addrA)).wait();
const auditorPub = (await (registrar as any).getUserPublicKey(addrA)).map(BigInt);
log('  auditor set to A');

// ============================================================ deposit
log('--- deposit (SDK) ---');
const DEPOSIT = ethers.parseEther('100');
const units = toUnits(DEPOSIT, 18, EERC_DECIMALS);
await (await (erc20.connect(A_) as any).mint(addrA, DEPOSIT)).wait();
await (await (erc20.connect(A_) as any).approve(await eerc.getAddress(), DEPOSIT)).wait();
await (await (eerc.connect(A_) as any).deposit(DEPOSIT, await erc20.getAddress(),
  buildDepositPCT(units, kA.publicKey))).wait();
log(`  deposited ${ethers.formatEther(DEPOSIT)} TEST -> ${units} units`);

// ============================================================ read balance
log('--- reading + DECRYPTING balance (SDK) ---');
const tokenId = await (eerc as any).tokenIds(await erc20.getAddress());
const readBalance = async (who: string, keys: typeof kA) => {
  const r = await (eerc as any).balanceOf(who, tokenId);
  const dec = decryptBalance(keys.formatted, {
    encryptedBalance: [[BigInt(r[0].c1.x), BigInt(r[0].c1.y)], [BigInt(r[0].c2.x), BigInt(r[0].c2.y)]],
    balancePCT: r[3].map(BigInt),
    amountPCTs: r[2].map((a: any) => a[0].map(BigInt)),
  });
  return { raw: r, ...dec };
};
const balA = await readBalance(addrA, kA);
log(`  A balance: ${fromUnits(balA.balance, EERC_DECIMALS)} (consistent=${balA.consistent})`);
if (balA.balance !== units) throw new Error(`decrypted ${balA.balance}, expected ${units}`);
if (!balA.consistent) throw new Error('PCT sum disagrees with ElGamal ciphertext');

// ============================================================ transfer
const SEND = 25n;
log(`--- transfer ${fromUnits(SEND, EERC_DECIMALS)} A->B (${PROVER}) ---`);
const built = buildTransferInput({
  sender: kA, receiverPublicKey: kB.publicKey, auditorPublicKey: auditorPub,
  senderBalance: balA.balance,
  encryptedBalance: [[BigInt(balA.raw[0].c1.x), BigInt(balA.raw[0].c1.y)],
                     [BigInt(balA.raw[0].c2.x), BigInt(balA.raw[0].c2.y)]],
  amount: SEND,
});
const tProof = await prove('transfer', built.input);
const tx = await (eerc.connect(A_) as any)[
  'transfer(address,uint256,((uint256[2],uint256[2][2],uint256[2]),uint256[32]),uint256[7])'
](addrB, tokenId, tProof, built.senderBalancePCT);
const rcpt = await tx.wait();
log(`  TX MINED status=${rcpt.status} gas=${rcpt.gasUsed}`);
log(`  hash: ${rcpt.hash}`);

// ============================================================ verify both sides
log('--- verifying balances (SDK) ---');
const afterA = await readBalance(addrA, kA);
const afterB = await readBalance(addrB, kB);
log(`  A: ${fromUnits(afterA.balance, EERC_DECIMALS)} (consistent=${afterA.consistent})`);
log(`  B: ${fromUnits(afterB.balance, EERC_DECIMALS)} (consistent=${afterB.consistent})`);
if (afterA.balance !== units - SEND) throw new Error(`A expected ${units - SEND}, got ${afterA.balance}`);
if (afterB.balance !== SEND) throw new Error(`B expected ${SEND}, got ${afterB.balance}`);
if (!afterA.consistent || !afterB.consistent) throw new Error('balance inconsistent after transfer');

log('\n*** SDK END-TO-END PASS — balances decrypt correctly on both sides ***');
process.exit(0);
