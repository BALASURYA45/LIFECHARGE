import apiClient from './apiClient.js';

export async function sendChatMessage({ message, history, predictionContext, profileContext }) {
  try {
    const { data } = await apiClient.post('/ai/chat', {
      message,
      history,
      predictionContext,
      profileContext,
    });
    return data.reply;
  } catch (error) {
    // If backend endpoint is unavailable or fails, fallback to direct Groq client fetch
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (apiKey) {
      return callGroqDirectly({ message, history, predictionContext, profileContext, apiKey });
    }
    throw error;
  }
}

async function callGroqDirectly({ message, history = [], predictionContext, profileContext, apiKey }) {
  let profileDetails = 'User vehicle profile not configured yet.';
  if (profileContext?.selectedVehicle) {
    const v = profileContext.selectedVehicle;
    const specInfo = v.spec ? ` (${v.spec.batteryCapacity} kWh, ${v.spec.typicalRange} km range)` : '';
    profileDetails = `Connected Vehicle Model in Profile: ${v.make} ${v.model}${specInfo}.`;
  }
  if (profileContext?.userName) {
    profileDetails += ` Driver Name: ${profileContext.userName}.`;
  }

  let predictionDetails = 'No recent battery prediction check on file.';
  if (predictionContext) {
    const vehicle = [predictionContext.vehicleMake, predictionContext.vehicleModel].filter(Boolean).join(' ') || 'EV';
    predictionDetails = `Latest Prediction Check for ${vehicle}: SOH: ${predictionContext.SOH}%, RUL: ${predictionContext.RUL} months, Status: ${predictionContext.batteryStatus}, Risk Level: ${predictionContext.riskLabel}.`;
  }

  const systemPrompt = `You are Lify AI, an expert, friendly conversational AI assistant for LifeCharge EV Battery Intelligence Platform.

USER PROFILE CONTEXT:
${profileDetails}

BATTERY PREDICTION REPORT CONTEXT:
${predictionDetails}

CRITICAL RULES FOR USER INQUIRIES:
1. VEHICLE CONDITION & RUNNABILITY ASSESSMENT:
   When asked "is my car good?", "is it in runnable condition?", "can I drive it?", or "how is my vehicle condition?":
   - Provide a direct runnable verdict ("✅ YES, your vehicle is in Good Runnable Condition", "⚠️ CAUTION: Short trips only, service recommended", or "❌ ATTENTION: Inspection Required").
   - Detail their exact SOH %, RUL, and battery status metrics.
   - Provide 2-3 tailored driving/charging maintenance tips.

2. CAR MODEL QUESTIONS:
   Always prioritize the connected vehicle model from USER PROFILE CONTEXT (${profileDetails}). Never guess random car models. Use clean Markdown formatting.`;

  const formattedHistory = history.slice(-6).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error('Groq returned empty response.');
  }

  return reply;
}
