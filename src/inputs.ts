/**
 * Circuit input builders.
 *
 * CRITICAL: every scalar is wrapped in a single-element array. The Rust witness
 * stack (rust-witness / circom-prover) SILENTLY ZEROES bare scalars — it does not
 * error, it emits a well-formed proof that fails verification. Arrays stay arrays.
 */
import { encryptMessage, encryptPCT, type PCT } from './crypto';
import type { EercKeys } from './keys';

export type CircuitInput = Record<string, string[]>;

const enc = (v: bigint | bigint[]): string[] =>
  (Array.isArray(v) ? v : [v]).map((x) => x.toString());

export const buildRegistrationInput = (
  keys: EercKeys,
  address: string,
  chainId: bigint,
  regHash: bigint,
): CircuitInput => ({
  SenderPrivateKey: enc(keys.formatted),
  SenderPublicKey: enc(keys.publicKey),
  SenderAddress: enc(BigInt(address)),
  ChainID: enc(chainId),
  RegistrationHash: enc(regHash),
});

export interface TransferBuild {
  input: CircuitInput;
  /** PCT for the sender's NEW balance — passed to transfer() alongside the proof */
  senderBalancePCT: PCT;
  /** PCT of the amount, encrypted to the receiver */
  receiverAmountPCT: PCT;
}

export const buildTransferInput = (args: {
  sender: EercKeys;
  receiverPublicKey: bigint[];
  auditorPublicKey: bigint[];
  /** sender's CURRENT plaintext balance (decrypted locally) */
  senderBalance: bigint;
  /** sender's CURRENT on-chain ElGamal ciphertext: [c1, c2] */
  encryptedBalance: [bigint[], bigint[]];
  amount: bigint;
}): TransferBuild => {
  const { sender, receiverPublicKey, auditorPublicKey, senderBalance, encryptedBalance, amount } = args;
  if (amount <= 0n) throw new Error('amount must be positive');
  if (amount > senderBalance) throw new Error('amount exceeds balance');

  const { cipher: vttSender } = encryptMessage(sender.publicKey, amount);
  const { cipher: vttReceiver, random: vttReceiverRandom } = encryptMessage(receiverPublicKey, amount);
  const rPCT = encryptPCT([amount], receiverPublicKey);
  const aPCT = encryptPCT([amount], auditorPublicKey);
  const sPCT = encryptPCT([senderBalance - amount], sender.publicKey);

  return {
    input: {
      ValueToTransfer: enc(amount),
      SenderPrivateKey: enc(sender.formatted),
      SenderPublicKey: enc(sender.publicKey),
      SenderBalance: enc(senderBalance),
      SenderBalanceC1: enc(encryptedBalance[0]),
      SenderBalanceC2: enc(encryptedBalance[1]),
      SenderVTTC1: enc(vttSender[0]),
      SenderVTTC2: enc(vttSender[1]),
      ReceiverPublicKey: enc(receiverPublicKey),
      ReceiverVTTC1: enc(vttReceiver[0]),
      ReceiverVTTC2: enc(vttReceiver[1]),
      ReceiverVTTRandom: enc(vttReceiverRandom),
      ReceiverPCT: enc(rPCT.ciphertext),
      ReceiverPCTAuthKey: enc(rPCT.authKey),
      ReceiverPCTNonce: enc(rPCT.nonce),
      ReceiverPCTRandom: enc(rPCT.encRandom),
      AuditorPublicKey: enc(auditorPublicKey),
      AuditorPCT: enc(aPCT.ciphertext),
      AuditorPCTAuthKey: enc(aPCT.authKey),
      AuditorPCTNonce: enc(aPCT.nonce),
      AuditorPCTRandom: enc(aPCT.encRandom),
    },
    senderBalancePCT: [...sPCT.ciphertext, ...sPCT.authKey, sPCT.nonce] as PCT,
    receiverAmountPCT: [...rPCT.ciphertext, ...rPCT.authKey, rPCT.nonce] as PCT,
  };
};

export const buildWithdrawInput = (args: {
  sender: EercKeys;
  auditorPublicKey: bigint[];
  senderBalance: bigint;
  encryptedBalance: [bigint[], bigint[]];
  amount: bigint;
}): { input: CircuitInput; senderBalancePCT: PCT } => {
  const { sender, auditorPublicKey, senderBalance, encryptedBalance, amount } = args;
  if (amount > senderBalance) throw new Error('amount exceeds balance');
  const aPCT = encryptPCT([amount], auditorPublicKey);
  const sPCT = encryptPCT([senderBalance - amount], sender.publicKey);
  return {
    input: {
      ValueToWithdraw: enc(amount),
      SenderPrivateKey: enc(sender.formatted),
      SenderPublicKey: enc(sender.publicKey),
      SenderBalance: enc(senderBalance),
      SenderBalanceC1: enc(encryptedBalance[0]),
      SenderBalanceC2: enc(encryptedBalance[1]),
      AuditorPublicKey: enc(auditorPublicKey),
      AuditorPCT: enc(aPCT.ciphertext),
      AuditorPCTAuthKey: enc(aPCT.authKey),
      AuditorPCTNonce: enc(aPCT.nonce),
      AuditorPCTRandom: enc(aPCT.encRandom),
    },
    senderBalancePCT: [...sPCT.ciphertext, ...sPCT.authKey, sPCT.nonce] as PCT,
  };
};

/** Amount PCT for a deposit (converter mode). */
export const buildDepositPCT = (units: bigint, publicKey: bigint[]): PCT => {
  const p = encryptPCT([units], publicKey);
  return [...p.ciphertext, ...p.authKey, p.nonce] as PCT;
};
