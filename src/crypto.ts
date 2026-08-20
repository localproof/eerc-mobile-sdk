/**
 * eERC crypto primitives, React-Native safe.
 *
 * Deliberately does NOT use `maci-crypto` (its RNG does `require("crypto")`,
 * which Metro cannot resolve) nor `node:crypto`. Uses the underlying pure-JS
 * @zk-kit packages directly, with a pluggable random source.
 */
import { Base8, Fr, addPoint, mulPointEscalar, subOrder, type Point } from '@zk-kit/baby-jubjub';
import { poseidonDecrypt, poseidonEncrypt } from '@zk-kit/poseidon-cipher';

export const SUB_ORDER = subOrder;
export const BASE_POINT_ORDER =
  2736030358979909402780800718157159386076813972158567259200215660948447373041n;
export const SNARK_FIELD_SIZE =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

/** Random source. RN: install `react-native-get-random-values` before importing. */
export type RandomBytes = (n: number) => Uint8Array;
let randomSource: RandomBytes = (n) => {
  const g = globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } };
  if (!g.crypto?.getRandomValues) {
    throw new Error(
      'no secure RNG: call setRandomSource(), or import "react-native-get-random-values" first',
    );
  }
  return g.crypto.getRandomValues(new Uint8Array(n));
};
export const setRandomSource = (fn: RandomBytes) => { randomSource = fn; };

const bytesToBigInt = (b: Uint8Array): bigint =>
  BigInt('0x' + Array.from(b, (x) => x.toString(16).padStart(2, '0')).join(''));

/** Rejection-sampled field element, matching maci-crypto's genRandomBabyJubValue. */
export const randomFieldValue = (): bigint => {
  const min =
    6350874878119819312338956282401532410528162663560392320966563075034087161851n;
  let v = SNARK_FIELD_SIZE;
  do {
    const rand = bytesToBigInt(randomSource(32));
    if (rand >= min) v = rand % SNARK_FIELD_SIZE;
  } while (v >= SNARK_FIELD_SIZE);
  return v;
};

/** 16 random bytes + 1, so it is never zero. */
export const randomNonce = (): bigint => bytesToBigInt(randomSource(16)) + 1n;

/**
 * The circuits consume the BabyJubJub secret SCALAR directly and only assert
 * pubKey == Base8 * scalar, so the derivation is ours to choose. Reducing a seed
 * into the subgroup order keeps this pure-JS (no blake, no CJS deps) and RN-safe.
 */
export const toScalar = (seed: bigint): bigint => {
  const s = ((seed % SUB_ORDER) + SUB_ORDER) % SUB_ORDER;
  return s === 0n ? 1n : s;
};

// ---------------------------------------------------------------- ElGamal

export const encryptPoint = (
  publicKey: bigint[],
  point: bigint[],
  random: bigint = randomFieldValue(),
): [Point<bigint>, Point<bigint>] => [
  mulPointEscalar(Base8, random),
  addPoint(point as Point<bigint>, mulPointEscalar(publicKey as Point<bigint>, random)),
];

export const encryptMessage = (
  publicKey: bigint[],
  message: bigint,
  random: bigint = randomFieldValue(),
): { cipher: [bigint[], bigint[]]; random: bigint } => {
  let encRandom = random;
  if (encRandom >= BASE_POINT_ORDER) encRandom = randomFieldValue() / 100n;
  return {
    cipher: encryptPoint(publicKey, mulPointEscalar(Base8, message), encRandom),
    random: encRandom,
  };
};

/** @param scalar the secret SCALAR (EercKeys.formatted), not a seed */
export const decryptPoint = (scalar: bigint, c1: bigint[], c2: bigint[]): bigint[] => {
  const c1x = mulPointEscalar(c1 as Point<bigint>, scalar);
  return addPoint(c2 as Point<bigint>, [Fr.e(c1x[0] * -1n), c1x[1]] as Point<bigint>);
};

// ------------------------------------------------------------------- PCT

/** Poseidon ciphertext: 4 ciphertext + 2 authKey + 1 nonce, as stored on-chain. */
export type PCT = [bigint, bigint, bigint, bigint, bigint, bigint, bigint];

export const encryptPCT = (inputs: bigint[], publicKey: bigint[]) => {
  const nonce = randomNonce();
  let encRandom = randomFieldValue();
  if (encRandom >= BASE_POINT_ORDER) encRandom = randomFieldValue() / 10n;
  const key = mulPointEscalar(publicKey as Point<bigint>, encRandom);
  return {
    ciphertext: poseidonEncrypt(inputs, key, nonce),
    nonce,
    encRandom,
    authKey: mulPointEscalar(Base8, encRandom),
  };
};

/** @param scalar the secret SCALAR (EercKeys.formatted), not a seed */
export const decryptPCT = (
  scalar: bigint,
  ciphertext: bigint[],
  authKey: bigint[],
  nonce: bigint,
  length = 1,
): bigint[] => {
  const shared = mulPointEscalar(authKey as Point<bigint>, scalar);
  return poseidonDecrypt(ciphertext, shared, nonce, length).slice(0, length);
};

/** Split an on-chain uint256[7] PCT into its parts. */
export const splitPCT = (pct: readonly bigint[]) => ({
  ciphertext: pct.slice(0, 4).map(BigInt),
  authKey: pct.slice(4, 6).map(BigInt),
  nonce: BigInt(pct[6]),
});

/** Flatten to the uint256[7] the contracts take. */
export const flattenPCT = (p: {
  ciphertext: bigint[]; authKey: bigint[]; nonce: bigint;
}): PCT => [...p.ciphertext, ...p.authKey, p.nonce] as PCT;
