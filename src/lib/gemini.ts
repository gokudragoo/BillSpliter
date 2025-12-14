const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export interface ReceiptAnalysis {
  isValid: boolean;
  isFake: boolean;
  amount: number | null;
  currency: string | null;
  merchant: string | null;
  date: string | null;
  category: string | null;
  items: string[];
  confidence: number;
  reason: string;
}

export async function analyzeReceipt(imageBase64: string): Promise<ReceiptAnalysis> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze this receipt image and extract the following information. Return ONLY valid JSON with this exact structure:
{
  "isValid": true/false (is this a valid receipt image),
  "isFake": true/false (does this appear to be edited/fake),
  "amount": number or null (total amount),
  "currency": "INR"/"USD"/"EUR" etc or null,
  "merchant": "store name" or null,
  "date": "YYYY-MM-DD" or null,
  "category": "Food"/"Transport"/"Shopping"/"Entertainment"/"Utilities"/"Other",
  "items": ["item1", "item2"],
  "confidence": 0-100,
  "reason": "explanation of analysis"
}

Be strict about detecting fake receipts. Look for:
- Inconsistent fonts or alignment
- Missing required receipt elements
- Photoshop artifacts
- Unusual patterns

Return ONLY the JSON object, nothing else.`
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error('Gemini API request failed');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse Gemini response:', e);
  }

  return {
    isValid: false,
    isFake: true,
    amount: null,
    currency: null,
    merchant: null,
    date: null,
    category: null,
    items: [],
    confidence: 0,
    reason: 'Failed to analyze receipt'
  };
}
