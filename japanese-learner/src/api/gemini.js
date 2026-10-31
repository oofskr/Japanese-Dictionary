const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-flash-latest';

export async function generateTranslation(japanese, context = '') {
  if (!API_KEY) {
    throw new Error(
      '尚未設定 Gemini API Key：請在 .env 設定 VITE_GEMINI_API_KEY，並重新啟動伺服器。金鑰可從 https://aistudio.google.com/apikey 取得。'
    );
  }

  const prompt = context
    ? `學習者正在學習日語，以下日語句子屬於「${context}」類別。\n請把這句日語翻譯成自然、簡潔的繁體中文。只輸出中文翻譯，不要解釋。\n\n日語：${japanese}\n翻譯：`
    : `請把以下日語翻譯成自然、簡潔的繁體中文。只輸出中文翻譯，不要解釋。\n\n日語：${japanese}\n翻譯：`;

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: '你是日語學習助教，負責把日語翻譯成繁體中文，只輸出翻譯結果。',
              },
            ],
          },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
        }),
      }
    );
  } catch {
    throw new Error('無法連線到 Gemini API，請確認網路連線後再試。');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // 回應不是 JSON，下面會統一回報錯誤
  }

  if (!response.ok) {
    const message = data?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gemini API 錯誤：${message}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('')?.trim();
  if (!text) {
    const reason = data?.candidates?.[0]?.finishReason;
    throw new Error(`Gemini 沒有回傳翻譯結果${reason ? `（${reason}）` : ''}`);
  }
  return text;
}
