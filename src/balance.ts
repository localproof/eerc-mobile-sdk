/**
 * Reading an eERC balance.
 *
 * The plaintext balance is NOT recoverable from the ElGamal ciphertext alone
 * (that needs a discrete log). It is reconstructed from the Poseidon
 * ciphertexts: balancePCT plus every pending amountPCT. The ElGamal ciphertext
 * is then used to CHECK that reconstruction.
 */
import { Base8, mulPointEscalar, type Point } from '@zk-kit/baby-jubjub';
import { decryptPCT, decryptPoint, splitPCT } from './crypto';

export interface OnChainBalance {
  /** ElGamal ciphertext [c1, c2] */
  encryptedBalance: [bigint[], bigint[]];
  balancePCT: bigint[];
  amountPCTs: bigint[][];
}

const decryptOne = (scalar: bigint, pct: readonly bigint[]): bigint => {
  if (pct.every((e) => BigInt(e) === 0n)) return 0n;
  const { ciphertext, authKey, nonce } = splitPCT(pct);
  return BigInt(decryptPCT(scalar, ciphertext, authKey, nonce, 1)[0]);
};

export interface DecryptedBalance {
  balance: bigint;
  /** false when the PCT sum disagrees with the ElGamal ciphertext (missed a PCT) */
  consistent: boolean;
}

/** @param scalar EercKeys.formatted */
export const decryptBalance = (
  scalar: bigint,
  b: OnChainBalance,
): DecryptedBalance => {
  let total = decryptOne(scalar, b.balancePCT);
  for (const pct of b.amountPCTs) total += decryptOne(scalar, pct);

  let consistent = true;
  const [c1, c2] = b.encryptedBalance;
  if (c1?.[0] !== undefined && BigInt(c1[0]) !== 0n) {
    const point = decryptPoint(scalar, c1.map(BigInt), c2.map(BigInt));
    const expected = total === 0n
      ? [0n, 1n]
      : (mulPointEscalar(Base8, total) as Point<bigint>).map(BigInt);
    consistent = point[0] === expected[0] && point[1] === expected[1];
  } else {
    consistent = total === 0n;
  }
  return { balance: total, consistent };
};

/** eERC stores integers at its own `decimals`; the underlying ERC20 has its own. */
export const toUnits = (amount: bigint, erc20Decimals: number, eercDecimals: number): bigint =>
  amount / 10n ** BigInt(erc20Decimals - eercDecimals);

export const fromUnits = (units: bigint, eercDecimals: number): string => {
  const d = 10n ** BigInt(eercDecimals);
  const whole = units / d;
  const frac = (units % d).toString().padStart(eercDecimals, '0');
  return eercDecimals === 0 ? whole.toString() : `${whole}.${frac}`;
};
