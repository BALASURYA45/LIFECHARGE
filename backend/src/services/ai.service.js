import axios from 'axios';
import { env } from '../config/env.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function askLifyAI({ message, history = [], predictionContext = null, profileContext = null }) {
  const apiKey = env.groqApiKey || process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Groq API Key is not configured on the backend.');
  }

  let profileDetails = 'User vehicle profile not configured yet.';
  if (profileContext?.selectedVehicle) {
    const v = profileContext.selectedVehicle;
    const specInfo = v.spec ? ` (Battery: ${v.spec.batteryCapacity} kWh, Range: ${v.spec.typicalRange} km, Chemistry: ${v.spec.batteryType}, Life: ${v.spec.estimatedLifeYears} yrs)` : '';
    profileDetails = `Connected Vehicle Model in Profile: ${v.make} ${v.model}${specInfo}.`;
  }
  if (profileContext?.userName) {
    profileDetails += ` Driver Name: ${profileContext.userName}.`;
  }

  let predictionDetails = 'No recent battery prediction check on file.';
  if (predictionContext) {
    const vehicle = [predictionContext.vehicleMake, predictionContext.vehicleModel].filter(Boolean).join(' ') || 'EV';
    predictionDetails = `Latest Prediction Check for ${vehicle}: State of Health (SOH): ${predictionContext.SOH}%, Remaining Useful Life (RUL): ${predictionContext.RUL} months, Status: ${predictionContext.batteryStatus}, Risk Level: ${predictionContext.riskLabel}, Fast Charging Usage: ${predictionContext.input?.fastChargingUsage ?? 0}%, Temp: ${predictionContext.input?.averageTemperature ?? 25}°C.`;
  }

  const systemMessage = {
    role: 'system',
    content: `You are Lify AI, an ultra-intelligent, friendly, and expert Conversational AI Assistant embedded inside the LifeCharge EV Battery Intelligence Platform.

ACTIVE USER PROFILE CONTEXT:
${profileDetails}

LATEST BATTERY PREDICTION REPORT DATA:
${predictionDetails}

CRITICAL RULES FOR USER INQUIRIES:
1. VEHICLE CONDITION & RUNNABILITY EVALUATION:
   When the user asks "is my car good?", "is it in runnable condition?", "can I drive it?", "is my vehicle safe?", "how is my car condition?", or similar questions:
   - **Direct Runnable Verdict**: Give a clear, upfront verdict (e.g. "✅ YES, your vehicle is in **Good Runnable Condition**", "⚠️ CAUTION: Suitable for short city trips, but schedule a service check", or "❌ ATTENTION: Inspection Required").
   - **Report Evidence**: Cite their actual report metrics (${predictionDetails}) like SOH %, RUL in months, risk level, and battery status.
   - **Practical Recommendations**: Provide 2-3 specific driving/charging recommendations tailored to their report.

2. CAR MODEL IDENTIFICATION:
   Always identify their car model directly from their USER PROFILE CONTEXT (${profileDetails}). Never guess or invent random car brands like Ola or Tesla unless configured in their profile.

3. GENERAL QUERY SUPPORT & FORMATTING:
   Answer ANY question (EV topics, general science, math, coding, life advice) with clean Markdown formatting (bold headings, bullet points). Keep a warm, professional, AI assistant tone.`,
  };

  // Build message thread (limit past messages to prevent token bloat)
  const formattedHistory = (history || [])
    .slice(-6)
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [systemMessage, ...formattedHistory, { role: 'user', content: message }],
    temperature: 0.7,
    max_tokens: 1024,
  };

  try {
    const response = await axios.post(GROQ_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    const reply = response.data?.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('Empty response from Groq AI.');
    }

    return {
      reply,
      model: response.data.model || 'llama-3.3-70b-versatile',
      usage: response.data.usage,
    };
  } catch (error) {
    // Fallback model if main model hits rate limit or error
    if (error?.response?.data?.error?.code === 'rate_limit_exceeded') {
      try {
        payload.model = 'llama3-8b-8192';
        const fallbackResponse = await axios.post(GROQ_API_URL, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });
        const reply = fallbackResponse.data?.choices?.[0]?.message?.content;
        if (reply) {
          return { reply, model: 'llama3-8b-8192' };
        }
      } catch {
        // Fallback failed
      }
    }
    throw error;
  }
}
