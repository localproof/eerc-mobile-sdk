/** Groth16 proof shapes and the arkworks -> Solidity conversion. */
export interface ProofPoints {
  a: [bigint, bigint];
  b: [[bigint, bigint], [bigint, bigint]];
  c: [bigint, bigint];
}
export interface CalldataProof { proofPoints: ProofPoints; publicSignals: bigint[] }

/** What the native prover returns (already affine). */
export interface NativeProof {
  a: { x: string; y: string };
  b: { x: [string, string]; y: [string, string] };
  c: { x: string; y: string };
  inputs: string[];
  ms?: number;
}

/**
 * Arkworks emits Fp2 as (c0, c1); Solidity Groth16 verifiers expect each pair
 * REVERSED. Getting this wrong yields a valid-looking proof the chain rejects.
 */
export const nativeToCalldata = (p: NativeProof): CalldataProof => ({
  proofPoints: {
    a: [BigInt(p.a.x), BigInt(p.a.y)],
    b: [
      [BigInt(p.b.x[1]), BigInt(p.b.x[0])],
      [BigInt(p.b.y[1]), BigInt(p.b.y[0])],
    ],
    c: [BigInt(p.c.x), BigInt(p.c.y)],
  },
  publicSignals: p.inputs.map(BigInt),
});

/** snarkjs `exportSolidityCallData` string -> the same shape (already reversed by snarkjs). */
export const snarkjsToCalldata = (raw: string): CalldataProof => {
  const n = raw.replace(/[["\]\s]/g, '').split(',').map((s) => BigInt(s));
  return {
    proofPoints: { a: [n[0], n[1]], b: [[n[2], n[3]], [n[4], n[5]]], c: [n[6], n[7]] },
    publicSignals: n.slice(8),
  };
};
