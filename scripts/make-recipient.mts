/**
 * Creates + registers a demo RECIPIENT on Fuji whose eERC key derives from its
 * EVM key (same derivation the app uses), so its confidential balance can be
 * decrypted later to prove a transfer landed.
 */
import { ethers } from 'ethers';
import * as snarkjs from 'snarkjs';
import { readFileSync } from 'node:fs';
import { REGISTRAR_ABI, keysFromSeed, registrationHash,
         buildRegistrationInput, snarkjsToCalldata } from '../src/index';

const RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
const B = new URL('../vendor/eerc/circom/build', import.meta.url).pathname;
const REGISTRAR = process.env.REGISTRAR!, FUNDER = process.env.FUNDER_PK!, PK = process.env.RECIPIENT_PK!;

const provider = new ethers.JsonRpcProvider(RPC, 43113, { staticNetwork: true });
const funder = new ethers.NonceManager(new ethers.Wallet(FUNDER, provider));
const bobW = new ethers.Wallet(PK, provider);
const bob = new ethers.NonceManager(bobW);
const keys = keysFromSeed(BigInt(PK));
console.log('recipient:', bobW.address);

const registrar = new ethers.Contract(REGISTRAR, REGISTRAR_ABI as any, bob);
if (await registrar.isUserRegistered(bobW.address)) {
  console.log('already registered'); process.exit(0);
}
if ((await provider.getBalance(bobW.address)) < ethers.parseEther('0.01')) {
  console.log('funding gas…');
  await (await funder.sendTransaction({ to: bobW.address, value: ethers.parseEther('0.02') })).wait();
}

const h = registrationHash(43113n, keys.formatted, bobW.address);
const input = buildRegistrationInput(keys, bobW.address, 43113n, h);
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  input, `${B}/registration/registration.wasm`, `${B}/registration/circuit_final.zkey`);
const p = snarkjsToCalldata(await snarkjs.groth16.exportSolidityCallData(proof, publicSignals));
const r = await (await registrar.register(p)).wait();
console.log('registered, tx', r.hash);
process.exit(0);
