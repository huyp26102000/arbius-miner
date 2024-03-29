/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  VoteOnContestation,
  VoteOnContestationInterface,
} from "../VoteOnContestation";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IArbius",
        name: "_arbius",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_taskid",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "_agree",
        type: "bool",
      },
    ],
    name: "voteOnContestation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516101a23803806101a283398101604081905261002f91610054565b600080546001600160a01b0319166001600160a01b0392909216919091179055610084565b60006020828403121561006657600080fd5b81516001600160a01b038116811461007d57600080fd5b9392505050565b61010f806100936000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80631825c20e14602d575b600080fd5b603c603836600460a6565b603e565b005b600054604051630c12e10760e11b81526004810184905282151560248201526001600160a01b0390911690631825c20e90604401600060405180830381600087803b158015608b57600080fd5b505af1158015609e573d6000803e3d6000fd5b505050505050565b6000806040838503121560b857600080fd5b823591506020830135801515811460ce57600080fd5b80915050925092905056fea2646970667358221220a1f0ed38de6da637943c977cf55d6a2ec2d72955edee265662a3497a8e99f25764736f6c63430008130033";

type VoteOnContestationConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VoteOnContestationConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VoteOnContestation__factory extends ContractFactory {
  constructor(...args: VoteOnContestationConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _arbius: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<VoteOnContestation> {
    return super.deploy(
      _arbius,
      overrides || {}
    ) as Promise<VoteOnContestation>;
  }
  getDeployTransaction(
    _arbius: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_arbius, overrides || {});
  }
  attach(address: string): VoteOnContestation {
    return super.attach(address) as VoteOnContestation;
  }
  connect(signer: Signer): VoteOnContestation__factory {
    return super.connect(signer) as VoteOnContestation__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VoteOnContestationInterface {
    return new utils.Interface(_abi) as VoteOnContestationInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VoteOnContestation {
    return new Contract(address, _abi, signerOrProvider) as VoteOnContestation;
  }
}
