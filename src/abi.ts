/**
 * Protocol ABIs, generated from the compiled contracts. Do not hand-edit.
 *
 * Deployment ADDRESSES deliberately do NOT live here — they are per-deployment
 * app config (see the app's config.ts). A stale copy in the SDK is a trap.
 */
export const ENCRYPTED_ERC_ABI = [
  {
    "type": "function",
    "name": "auditor",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "auditorPublicKey",
    "inputs": [],
    "outputs": [
      {
        "name": "x",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "y",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "eGCT",
        "type": "tuple",
        "internalType": "struct EGCT",
        "components": [
          {
            "name": "c1",
            "type": "tuple",
            "internalType": "struct Point",
            "components": [
              {
                "name": "x",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "y",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "c2",
            "type": "tuple",
            "internalType": "struct Point",
            "components": [
              {
                "name": "x",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "y",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          }
        ]
      },
      {
        "name": "nonce",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amountPCTs",
        "type": "tuple[]",
        "internalType": "struct AmountPCT[]",
        "components": [
          {
            "name": "pct",
            "type": "uint256[7]",
            "internalType": "uint256[7]"
          },
          {
            "name": "index",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "balancePCT",
        "type": "uint256[7]",
        "internalType": "uint256[7]"
      },
      {
        "name": "transactionIndex",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "deposit",
    "inputs": [
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "tokenAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amountPCT",
        "type": "uint256[7]",
        "internalType": "uint256[7]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "deposit",
    "inputs": [
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "tokenAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amountPCT",
        "type": "uint256[7]",
        "internalType": "uint256[7]"
      },
      {
        "name": "message",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "isAuditorKeySet",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setAuditorPublicKey",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "tokenIds",
    "inputs": [
      {
        "name": "tokenAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "proof",
        "type": "tuple",
        "internalType": "struct TransferProof",
        "components": [
          {
            "name": "proofPoints",
            "type": "tuple",
            "internalType": "struct ProofPoints",
            "components": [
              {
                "name": "a",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              },
              {
                "name": "b",
                "type": "uint256[2][2]",
                "internalType": "uint256[2][2]"
              },
              {
                "name": "c",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              }
            ]
          },
          {
            "name": "publicSignals",
            "type": "uint256[32]",
            "internalType": "uint256[32]"
          }
        ]
      },
      {
        "name": "balancePCT",
        "type": "uint256[7]",
        "internalType": "uint256[7]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "proof",
        "type": "tuple",
        "internalType": "struct TransferProof",
        "components": [
          {
            "name": "proofPoints",
            "type": "tuple",
            "internalType": "struct ProofPoints",
            "components": [
              {
                "name": "a",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              },
              {
                "name": "b",
                "type": "uint256[2][2]",
                "internalType": "uint256[2][2]"
              },
              {
                "name": "c",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              }
            ]
          },
          {
            "name": "publicSignals",
            "type": "uint256[32]",
            "internalType": "uint256[32]"
          }
        ]
      },
      {
        "name": "balancePCT",
        "type": "uint256[7]",
        "internalType": "uint256[7]"
      },
      {
        "name": "message",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "proof",
        "type": "tuple",
        "internalType": "struct WithdrawProof",
        "components": [
          {
            "name": "proofPoints",
            "type": "tuple",
            "internalType": "struct ProofPoints",
            "components": [
              {
                "name": "a",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              },
              {
                "name": "b",
                "type": "uint256[2][2]",
                "internalType": "uint256[2][2]"
              },
              {
                "name": "c",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              }
            ]
          },
          {
            "name": "publicSignals",
            "type": "uint256[16]",
            "internalType": "uint256[16]"
          }
        ]
      },
      {
        "name": "balancePCT",
        "type": "uint256[7]",
        "internalType": "uint256[7]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "proof",
        "type": "tuple",
        "internalType": "struct WithdrawProof",
        "components": [
          {
            "name": "proofPoints",
            "type": "tuple",
            "internalType": "struct ProofPoints",
            "components": [
              {
                "name": "a",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              },
              {
                "name": "b",
                "type": "uint256[2][2]",
                "internalType": "uint256[2][2]"
              },
              {
                "name": "c",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              }
            ]
          },
          {
            "name": "publicSignals",
            "type": "uint256[16]",
            "internalType": "uint256[16]"
          }
        ]
      },
      {
        "name": "balancePCT",
        "type": "uint256[7]",
        "internalType": "uint256[7]"
      },
      {
        "name": "message",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Deposit",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "dust",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PrivateTransfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "auditorPCT",
        "type": "uint256[7]",
        "indexed": false,
        "internalType": "uint256[7]"
      },
      {
        "name": "auditorAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Withdraw",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "auditorPCT",
        "type": "uint256[7]",
        "indexed": false,
        "internalType": "uint256[7]"
      },
      {
        "name": "auditorAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  }
] as const;

export const REGISTRAR_ABI = [
  {
    "type": "function",
    "name": "getUserPublicKey",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "publicKey",
        "type": "uint256[2]",
        "internalType": "uint256[2]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isUserRegistered",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "register",
    "inputs": [
      {
        "name": "proof",
        "type": "tuple",
        "internalType": "struct RegisterProof",
        "components": [
          {
            "name": "proofPoints",
            "type": "tuple",
            "internalType": "struct ProofPoints",
            "components": [
              {
                "name": "a",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              },
              {
                "name": "b",
                "type": "uint256[2][2]",
                "internalType": "uint256[2][2]"
              },
              {
                "name": "c",
                "type": "uint256[2]",
                "internalType": "uint256[2]"
              }
            ]
          },
          {
            "name": "publicSignals",
            "type": "uint256[5]",
            "internalType": "uint256[5]"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Register",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "publicKey",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct Point",
        "components": [
          {
            "name": "x",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "y",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "anonymous": false
  }
] as const;

export const ERC20_ABI = [
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mint",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  }
] as const;
