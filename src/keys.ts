/** eERC keypair: a BabyJubJub key derived deterministically from a signature. */
import { Base8, mulPointEscalar } from '@zk-kit/baby-jubjub';
import { poseidon3 } from 'poseidon-lite';
import { toScalar, randomFieldValue, SNARK_FIELD_SIZE } from './crypto';

export interface EercKeys {
  /** the seed this key came from (equals `formatted` when imported as a scalar) */
  privateKey: bigint;
  /** BabyJubJub secret scalar — this is what the circuits consume */
  formatted: bigint;
  /** BabyJubJub public key, registered on-chain */
  publicKey: bigint[];
}

/** Build a keypair from a raw seed. */
export const keysFromSeed = (privateKey: bigint): EercKeys => {
  const formatted = toScalar(privateKey);
  return {
    privateKey,
    formatted,
    publicKey: mulPointEscalar(Base8, formatted).map(BigInt) as bigint[],
  };
};

/** Import an existing BabyJubJub secret scalar (e.g. from another eERC client). */
export const keysFromScalar = (formatted: bigint): EercKeys => ({
  privateKey: formatted,
  formatted: toScalar(formatted),
  publicKey: mulPointEscalar(Base8, toScalar(formatted)).map(BigInt) as bigint[],
});

export const randomKeys = (): EercKeys => keysFromSeed(randomFieldValue());

/**
 * Derive an eERC key from an EVM signature, so the user's wallet is the only
 * secret they need to hold. Sign a FIXED message; the key is the hash reduced
 * into the scalar field.
 */
export const keysFromSignature = (signatureHex: string): EercKeys => {
  const hex = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;
  return keysFromSeed(BigInt('0x' + hex) % SNARK_FIELD_SIZE);
};

/** The message the wallet signs to derive its eERC key. Changing this rotates every key. */
export const KEY_DERIVATION_MESSAGE =
  'eERC: derive my confidential balance key\n\nOnly sign this on a site you trust.';

/** CRH(chainId, secretScalar, address) — what Registrar checks. */
export const registrationHash = (
  chainId: bigint,
  formatted: bigint,
  address: string,
): bigint => poseidon3([chainId, formatted, BigInt(address)]);
