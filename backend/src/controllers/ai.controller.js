import { askLifyAI } from '../services/ai.service.js';

export async function chatWithLifyAI(request, response) {
  const { message, history, predictionContext, profileContext } = request.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return response.status(400).json({ success: false, message: 'Message text is required.' });
  }

  const result = await askLifyAI({
    message: message.trim(),
    history: Array.isArray(history) ? history : [],
    predictionContext: predictionContext ?? null,
    profileContext: profileContext ?? null,
  });

  return response.status(200).json({
    success: true,
    reply: result.reply,
    model: result.model,
  });
}
