import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x05d4D20Ab099dd2c4Ee59D305c17273c8D0d06F1';

export const CONTRACT_ABI = [
  "function createGroup(string groupId, string name) external",
  "function addMember(string groupId, address member) external",
  "function addExpense(string groupId, uint256 amount, string category, string receiptHash, address[] splitWith) external",
  "function recordSettlement(string groupId, address to, uint256 amount, string txHash) external payable",
  "function getGroup(string groupId) external view returns (string, address, address[], bool, uint256)",
  "function getGroupExpenses(string groupId) external view returns (tuple(string, address, uint256, string, string, bool, uint256, address[])[])",
  "function getCreditScore(address user) external view returns (uint256)",
  "function getUserGroups(address user) external view returns (string[])",
  "event GroupCreated(string indexed groupId, address indexed creator, string name)",
  "event ExpenseAdded(string indexed groupId, address indexed paidBy, uint256 amount)",
  "event SettlementCompleted(string indexed groupId, address indexed from, address indexed to, uint256 amount)"
];

export async function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

export async function createGroupOnChain(groupId: string, name: string, signer: ethers.Signer) {
  const contract = await getContract(signer);
  const tx = await contract.createGroup(groupId, name);
  await tx.wait();
  return tx.hash;
}

export async function addExpenseOnChain(
  groupId: string,
  amount: number,
  category: string,
  receiptHash: string,
  splitWith: string[],
  signer: ethers.Signer
) {
  const contract = await getContract(signer);
  const amountWei = ethers.parseEther(amount.toString());
  const tx = await contract.addExpense(groupId, amountWei, category, receiptHash, splitWith);
  await tx.wait();
  return tx.hash;
}

export async function recordSettlementOnChain(
  groupId: string,
  to: string,
  amount: number,
  txHash: string,
  signer: ethers.Signer
) {
  const contract = await getContract(signer);
  const amountWei = ethers.parseEther(amount.toString());
  const tx = await contract.recordSettlement(groupId, to, amountWei, txHash, { value: amountWei });
  await tx.wait();
  return tx.hash;
}

export async function getCreditScoreOnChain(address: string, provider: ethers.Provider) {
  const contract = await getContract(provider);
  const score = await contract.getCreditScore(address);
  return Number(score);
}

export function getProvider() {
  return new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC);
}
