const SIDESHIFT_SECRET = process.env.SIDESHIFT_SECRET!;
const SIDESHIFT_AFFILIATE_ID = process.env.SIDESHIFT_AFFILIATE_ID!;

export interface Coin {
  coin: string;
  networks: string[];
  name: string;
}

export interface ShiftQuote {
  id: string;
  createdAt: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  depositAmount: string;
  settleAmount: string;
  rate: string;
  expiresAt: string;
}

export interface Shift {
  id: string;
  createdAt: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  depositAddress: string;
  settleAddress: string;
  depositAmount: string;
  settleAmount: string;
  status: string;
  expiresAt: string;
}

export async function getCoins(): Promise<Coin[]> {
  const response = await fetch('https://sideshift.ai/api/v2/coins');
  if (!response.ok) throw new Error('Failed to fetch coins');
  return response.json();
}

export async function getPair(depositCoin: string, settleCoin: string, depositNetwork: string, settleNetwork: string) {
  const response = await fetch(
    `https://sideshift.ai/api/v2/pair/${depositCoin}-${depositNetwork}/${settleCoin}-${settleNetwork}`
  );
  if (!response.ok) throw new Error('Failed to fetch pair info');
  return response.json();
}

export async function createQuote(
  depositCoin: string,
  settleCoin: string,
  depositNetwork: string,
  settleNetwork: string,
  settleAmount: string
): Promise<ShiftQuote> {
  const response = await fetch('https://sideshift.ai/api/v2/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-sideshift-secret': SIDESHIFT_SECRET
    },
    body: JSON.stringify({
      depositCoin,
      settleCoin,
      depositNetwork,
      settleNetwork,
      settleAmount,
      affiliateId: SIDESHIFT_AFFILIATE_ID
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create quote');
  }
  
  return response.json();
}

export async function createVariableShift(
  settleAddress: string,
  depositCoin: string,
  settleCoin: string,
  depositNetwork: string,
  settleNetwork: string,
  refundAddress?: string
): Promise<Shift> {
  const response = await fetch('https://sideshift.ai/api/v2/shifts/variable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-sideshift-secret': SIDESHIFT_SECRET
    },
    body: JSON.stringify({
      settleAddress,
      depositCoin,
      settleCoin,
      depositNetwork,
      settleNetwork,
      affiliateId: SIDESHIFT_AFFILIATE_ID,
      refundAddress
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create shift');
  }
  
  return response.json();
}

export async function createFixedShift(
  settleAddress: string,
  quoteId: string,
  refundAddress?: string
): Promise<Shift> {
  const response = await fetch('https://sideshift.ai/api/v2/shifts/fixed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-sideshift-secret': SIDESHIFT_SECRET
    },
    body: JSON.stringify({
      settleAddress,
      quoteId,
      affiliateId: SIDESHIFT_AFFILIATE_ID,
      refundAddress
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create shift');
  }
  
  return response.json();
}

export async function getShiftStatus(shiftId: string): Promise<Shift> {
  const response = await fetch(`https://sideshift.ai/api/v2/shifts/${shiftId}`);
  if (!response.ok) throw new Error('Failed to fetch shift status');
  return response.json();
}
