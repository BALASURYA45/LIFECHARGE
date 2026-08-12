import { BatteryCharging, Bot, ChevronDown, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendChatMessage } from '../services/aiService.js';
import { useAuth } from '../hooks/useAuth.js';
import { getVehicleSpec } from '../constants/vehicleDatabase.js';

const STORAGE_KEY = 'lifecharge.latestPrediction';
const HISTORY_KEY = 'lifecharge.predictionHistory';

function normalizeLanguageInput(message) {
  let normalized = message.toLowerCase();
  const pairs = [
    [/\bबैटरी\b/g, 'battery'],
    [/\bरिपोर्ट\b/g, 'report'],
    [/\bस्वास्थ्य\b/g, 'health'],
    [/\bतापमान\b/g, 'temperature'],
    [/\bचार्ज(?:िंg)?\b/g, 'charging'],
    [/\bलाइफ\b/g, 'life'],
    [/\bधन्यवाद\b/g, 'thanks'],
    [/\bनमस्ते\b/g, 'hello'],
    [/\bसहायक\b/g, 'assistant'],
    [/\bकृपया\b/g, 'please'],
    [/\bபேட்டரி\b/g, 'battery'],
    [/\bஅறிக்கை\b/g, 'report'],
    [/\bஆரோக்கியம்\b/g, 'health'],
    [/\bவெப்பநிலை\b/g, 'temperature'],
    [/\bசார்ஜ்\b/g, 'charging'],
    [/\bநன்றி\b/g, 'thanks'],
    [/\bவணக்கம்\b/g, 'hello'],
    [/\bஉதவியாளர்\b/g, 'assistant'],
    [/\bதயவு\b/g, 'please'],
  ];

  pairs.forEach(([pattern, replacement]) => {
    normalized = normalized.replace(pattern, replacement);
  });

  return normalized;
}

function formatVehicle(prediction) {
  if (!prediction?.vehicleMake && !prediction?.vehicleModel) return 'your EV';
  return [prediction.vehicleMake, prediction.vehicleModel].filter(Boolean).join(' ');
}

function getReportSummary(prediction) {
  if (!prediction) {
    return 'Run a battery health check first, then I can guide you using your SOH, RUL, stress scores, vehicle type, and risk factors.';
  }

  const vehicle = formatVehicle(prediction);
  const risk = prediction.riskLabel ? ` ${prediction.riskLabel.toLowerCase()}` : '';
  return `${vehicle} is at ${prediction.SOH}% SOH with about ${prediction.RUL} months RUL and${risk || ' current'} status ${prediction.batteryStatus}. Confidence is ${prediction.confidenceScore}%.`;
}

function getMainActions(prediction) {
  if (!prediction) {
    return [
      'Complete the battery health check so I can use your exact vehicle and report.',
      'Keep daily charging mostly between 20% and 80%.',
      'Avoid frequent fast charging unless the trip needs it.',
    ];
  }

  const input = prediction.input || {};
  const actions = [];

  if ((prediction.SOH ?? 100) < 80) {
    actions.push('Plan a service inspection because SOH is below the healthy 80% band.');
  }

  if ((prediction.RUL ?? 60) < 12) {
    actions.push('Start replacement or warranty planning because remaining useful life is short.');
  }

  if ((input.fastChargingUsage ?? 0) >= 50) {
    actions.push('Reduce DC fast charging and prefer slower AC charging for routine use.');
  }

  if ((input.averageTemperature ?? 25) >= 35 || prediction.enhancements?.thermalStress?.level === 'High') {
    actions.push('Park in shade, charge after the pack cools, and avoid charging immediately after hard driving.');
  }

  if ((input.socHistory ?? 50) > 85 || (input.socHistory ?? 50) < 20) {
    actions.push('Keep daily state of charge near 20-80% instead of regularly storing it very full or very low.');
  }

  if ((input.chargingCycles ?? 0) >= 1500 || prediction.enhancements?.cyclicStress?.level === 'High') {
    actions.push('Reduce unnecessary top-up cycles and combine short trips where practical.');
  }

  if (prediction.riskFactors?.length) {
    actions.push(...prediction.riskFactors.slice(0, 2));
  }

  if (!actions.length) {
    actions.push('Your report looks stable. Maintain moderate charging, smooth driving, and monthly health checks.');
  }

  return [...new Set(actions)].slice(0, 5);
}

function getCompanySpecificAdvice(prediction) {
  const make = prediction?.vehicleMake || 'your vehicle company';
  const model = prediction?.vehicleModel ? ` ${prediction.vehicleModel}` : '';
  const input = prediction?.input || {};
  const capacity = input.batteryCapacity ? `${input.batteryCapacity} kWh` : 'its rated';
  const voltage = input.voltage ? `${input.voltage} V` : 'OEM-specified';

  return [
    `For ${make}${model}, follow the official service interval and use only approved chargers matched to the ${capacity}, ${voltage} battery pack.`,
    'Check warranty terms before any third-party battery repair or charger modification.',
    'If the company app provides charge limits, set a daily cap around 80% and reserve 100% for long trips.',
  ];
}

function getDatasetAwareNote(prediction) {
  const model = prediction?.modelName || 'the trained LIFECHARGE model';
  const confidence = prediction?.confidenceScore;
  return `I am grounding this in the latest health report, model output from ${model}, stored prediction history, and the battery datasets used to train LIFECHARGE. ${confidence ? `This report has ${confidence}% confidence, so treat the suggestions as maintenance guidance, not a lab measurement.` : ''}`;
}

function formatShortDate(value) {
  if (!value) return 'recent check';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function readStoredHistory() {
  try {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getReportHistoryAnswer(history, prediction) {
  const reports = history.length ? history : prediction ? [prediction] : [];

  if (!reports.length) {
    return 'I do not have any Report History in this browser yet. Run a battery health check or select a past check from Report History, then I can compare SOH, RUL, risk, and usage changes.';
  }

  const latest = reports[0];
  const previous = reports[1];

  if (!previous) {
    return `From Report History, I have one report right now: ${getReportSummary(latest)}\n\nAfter you run or select another report, I can compare changes in SOH, RUL, risk, thermal stress, cyclic stress, and vehicle usage.`;
  }

  const sohDelta = Number((latest.SOH - previous.SOH).toFixed(2));
  const rulDelta = Number((latest.RUL - previous.RUL).toFixed(2));
  const direction = sohDelta >= 0 ? 'improved or stayed stable' : 'reduced';

  return `Using Report History, here is the comparison:\n- Latest: ${formatShortDate(latest.createdAt)} | ${formatVehicle(latest)} | SOH ${latest.SOH}% | RUL ${latest.RUL} months | ${latest.batteryStatus}\n- Previous: ${formatShortDate(previous.createdAt)} | ${formatVehicle(previous)} | SOH ${previous.SOH}% | RUL ${previous.RUL} months | ${previous.batteryStatus}\n- SOH change: ${sohDelta > 0 ? '+' : ''}${sohDelta}%\n- RUL change: ${rulDelta > 0 ? '+' : ''}${rulDelta} months\n\nYour battery health has ${direction}. ${sohDelta < 0 ? 'Focus on charging discipline, heat control, and reducing high-stress usage.' : 'Keep the current habits consistent and continue monthly checks.'}`;
}

function getReportGuidanceAnswer(history, prediction) {
  const reports = history.length ? history : prediction ? [prediction] : [];

  if (!reports.length) {
    return 'For battery health report questions, I use Report History. I do not see a saved report yet, so run a battery health check first. After that I can explain the report and compare it with previous reports.';
  }

  const latest = reports[0];
  return `I am referring to Report History for this battery health report.\n\nLatest report:\n- Vehicle: ${formatVehicle(latest)}\n- Checked: ${formatShortDate(latest.createdAt)}\n- SOH: ${latest.SOH}%\n- RUL: ${latest.RUL} months\n- Status: ${latest.batteryStatus}\n- Risk: ${latest.riskLabel ?? 'Not available'}\n\nHelpful actions:\n${getMainActions(latest).map((item) => `- ${item}`).join('\n')}\n\n${reports.length > 1 ? 'You also have previous reports available, so ask "compare previous reports" and I will compare changes from Report History.' : 'Only one report is available now. Run another check later and I can compare the trend.'}`;
}

function answerMathQuestion(message) {
  const expressionMatch = message.match(/(?:calculate|what is|solve)?\s*([-+*/().\d\s]+)\??$/i);
  if (!expressionMatch) return null;

  const expression = expressionMatch[1].trim();
  if (!/^\d[\d\s+\-*/().]*$/.test(expression) || expression.length > 80) return null;

  try {
    const result = Function(`"use strict"; return (${expression});`)();
    return Number.isFinite(result) ? `${expression} = ${Number(result.toFixed(6))}` : null;
  } catch {
    return null;
  }
}

function answerAppQuestion(text) {
  if (text.includes('dashboard')) {
    return 'Use Dashboard to see overall battery health, status distribution, recent predictions, and summary metrics.';
  }

  if (text.includes('report') && (text.includes('download') || text.includes('pdf') || text.includes('csv'))) {
    return 'Open Reports from the navigation bar. From there you can generate a PDF report or export CSV prediction history.';
  }

  if (text.includes('what-if') || text.includes('scenario')) {
    return 'The scenario simulation page has been removed. For comparisons, use Report History: run or select battery health reports, then ask me to compare previous reports.';
  }

  if (text.includes('train') || text.includes('model') || text.includes('dataset')) {
    return 'Open ML Training to train or inspect the active model. LIFECHARGE uses the prepared battery datasets and stores model metadata like best models, metrics, and training ID.';
  }

  return null;
}

function isBatteryHealthCheckQuestion(text) {
  return (
    text.includes('battery health') &&
    (
      text.includes('why') ||
      text.includes('what') ||
      text.includes('how') ||
      text.includes('benefit') ||
      text.includes('important') ||
      text.includes('need') ||
      text.includes('should i check') ||
      text.includes('should check')
    )
  );
}

function isReportQuestion(text) {
  return (
    text.includes('battery health report') ||
    text.includes('health report') ||
    text.includes('report') ||
    text.includes('result') ||
    text.includes('my soh') ||
    text.includes('my rul') ||
    text.includes('explain soh') ||
    text.includes('explain rul') ||
    text.includes('battery status') ||
    text.includes('risk score') ||
    text.includes('risk factor') ||
    text.includes('confidence score')
  );
}

function getBatteryHealthCheckReason() {
  return `You should check battery health because it tells you how much usable battery capacity and life are left before performance or safety problems become expensive.\n\nMain benefits:\n- SOH shows how strong the battery is compared with a new battery.\n- RUL estimates how many months of useful life may remain.\n- Risk factors reveal habits like high fast charging, heat, deep discharge, or heavy cycle use.\n- Early checks help you change charging and driving habits before damage becomes serious.\n- A report is useful for service planning, warranty decisions, resale value, and long-trip confidence.`;
}

function answerGeneralQuestion(message) {
  const text = message.toLowerCase();
  const mathAnswer = answerMathQuestion(message);
  if (mathAnswer) return mathAnswer;

  if (text.includes('your name') || text.includes('who are you')) {
    return 'I am Lify, the LIFECHARGE assistant. I can explain battery reports, compare previous checks, guide maintenance, help with the app, and answer simple general questions.';
  }

  if (text.includes('date') || text.includes('time')) {
    return `Your browser time is ${new Intl.DateTimeFormat('en-IN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}.`;
  }

  if (text.includes('ev') && text.includes('battery')) {
    return 'An EV battery stores electrical energy in cells, usually lithium-ion. Long life depends mainly on temperature control, moderate charging, avoiding deep discharge, and reducing repeated high-power fast charging.';
  }

  if (text.includes('lithium') || text.includes('lfp') || text.includes('nmc')) {
    return 'LFP batteries are usually durable and tolerate more cycles, while NMC batteries often provide higher energy density. For both, heat control and moderate charging are still the biggest daily habits.';
  }

  if (text.includes('thank')) {
    return 'You are welcome. Ask me anything about your report, battery care, app usage, or a simple general question.';
  }

  return null;
}

function classifyBatteryConcern(message, prediction = null) {
  const text = normalizeLanguageInput(message || '').replace(/[^a-z0-9%\s]/g, ' ');
  const batteryWords = ['battery', 'batteries', 'health', 'soh', 'rul', 'charging', 'charge', 'risk', 'status', 'temperature', 'thermal', 'degradation', 'cell', 'capacity', 'range'];
  const issueWords = ['serious', 'issue', 'problem', 'critical', 'warning', 'bad', 'decline', 'failing', 'health check', 'not good'];

  const hasBatterySignal = batteryWords.some((word) => text.includes(word));
  const hasMetricSignal = /(soh|rul|health).*\d|\d.*(soh|rul|health)/.test(text) || /\b\d{1,3}%\b/.test(text) && /battery|health|charge|risk|status|temperature/.test(text);
  const isBatteryRelated = hasBatterySignal || hasMetricSignal;

  if (!isBatteryRelated) {
    return { isBatteryRelated: false, category: 'non_battery', needsClarification: true };
  }

  let category = 'general';
  if (issueWords.some((word) => text.includes(word))) category = 'issue';
  else if (/(charging|charge|fast|soc|temperature|heat)/.test(text)) category = 'charging';
  else if (/(maintain|life|service|replace|warranty|care)/.test(text)) category = 'maintenance';
  else if (/(report|result|status|risk|soh|rul|confidence|explain)/.test(text)) category = 'report';

  if (prediction && category === 'issue') {
    const soh = Number(prediction.SOH ?? 100);
    const rul = Number(prediction.RUL ?? 60);
    const status = String(prediction.batteryStatus || '').toLowerCase();
    const risk = String(prediction.riskLabel || '').toLowerCase();

    if (soh < 80 || rul < 12 || status.includes('critical') || status.includes('warning') || risk.includes('high')) {
      category = 'issue';
    }
  }

  return { isBatteryRelated: true, category, needsClarification: false };
}

function getIssueAnswer(prediction, history = []) {
  if (!prediction) {
    return 'I need your latest battery health report before I can tell if this is a real issue. Please run a battery health check and I will review the SOH, RUL, risk, and charging pattern.';
  }

  const latest = history[0] ?? prediction;
  const soh = Number(latest.SOH ?? 100);
  const rul = Number(latest.RUL ?? 60);
  const status = String(latest.batteryStatus || 'Good');
  const risk = String(latest.riskLabel || 'Low Risk');
  const fastCharge = Number(latest.input?.fastChargingUsage ?? 0);
  const averageTemp = Number(latest.input?.averageTemperature ?? 25);

  const issueText = [];
  if (soh < 80) issueText.push(`SOH is ${soh}%`, 'below the healthy threshold');
  if (rul < 12) issueText.push(`RUL is only ${rul} months`);
  if (status.toLowerCase().includes('critical') || status.toLowerCase().includes('warning')) issueText.push(`the battery status is ${status}`);
  if (risk.toLowerCase().includes('high')) issueText.push(`the risk level is ${risk}`);
  if (fastCharge >= 50) issueText.push(`fast charging is high at ${fastCharge}%`);
  if (averageTemp >= 35) issueText.push(`temperature is high at ${averageTemp}°C`);

  const summary = issueText.length ? issueText.join(', ') : 'the current report is still stable but should be monitored';

  return `Yes — this is serious based on your current report: ${summary}. I recommend checking the battery sooner, reducing fast charging, avoiding heat stress, and keeping daily SOC in the 20-80% range until the next inspection.`;
}

function getRunnableConditionAnswer(prediction, selectedVehicle) {
  const vehName = selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : (prediction ? formatVehicle(prediction) : 'your EV');

  if (!prediction) {
    return `Based on your connected profile vehicle (**${vehName}**), your vehicle is configured!\n\nTo evaluate if your car is in good, runnable condition, please run a quick **Battery Health Check** on the Prediction page. Once completed, I will analyze your State of Health (SOH %), Remaining Life (RUL), and risk levels for an exact verdict.`;
  }

  const soh = Number(prediction.SOH ?? 100);
  const rul = Number(prediction.RUL ?? 60);
  const status = String(prediction.batteryStatus || 'Good');
  const risk = String(prediction.riskLabel || 'Low Risk');

  let verdict = '✅ **YES, your vehicle is in GOOD RUNNABLE CONDITION!**';
  if (soh < 70 || status.toLowerCase().includes('critical') || risk.toLowerCase().includes('high')) {
    verdict = '❌ **ATTENTION: Immediate Service Inspection Recommended.**';
  } else if (soh < 80 || rul < 12 || status.toLowerCase().includes('warning')) {
    verdict = '⚠️ **CAUTION: Suitable for daily city commutes, but schedule maintenance soon.**';
  }

  return `${verdict}\n\n**Health Report Analysis for ${vehName}:**\n- **State of Health (SOH):** ${soh}%\n- **Remaining Useful Life (RUL):** ${rul} months\n- **Battery Status:** ${status}\n- **Risk Level:** ${risk}\n\n**Maintenance Tips:**\n- Keep daily state of charge between **20% and 80%**.\n- Prefer AC slow charging for routine daily use.\n- Avoid fast charging when the battery pack is warm.`;
}

export { buildReply, classifyBatteryConcern };

function buildReply(message, prediction, history = [], t, selectedVehicle = null) {
  const text = message.toLowerCase();
  const generalAnswer = answerGeneralQuestion(message);
  const appAnswer = answerAppQuestion(text);
  const concern = classifyBatteryConcern(message, prediction);

  if (/\b(hi|hello|hey|vanakkam|thanks|thank you|नमस्ते|धन्यवाद|நன்றி)\b/.test(text)) {
    return generalAnswer || t('chatbot.greeting');
  }

  if (/(runnable|condition|good|run|drive|healthy|road trip|long trip|safe)/.test(text)) {
    return getRunnableConditionAnswer(prediction, selectedVehicle);
  }

  if (!concern.isBatteryRelated) {
    const contextLine = prediction ? `For your battery context: ${getReportSummary(prediction)}` : 'Run a battery health check first so I can explain your actual battery results.';
    return `I am trained mainly for battery health and charging questions. Are you asking about your battery report, a charging issue, or battery maintenance? ${contextLine}`;
  }

  if (concern.category === 'issue') {
    return getIssueAnswer(prediction, history);
  }


  if (text.includes('previous') || text.includes('history') || text.includes('compare') || text.includes('past')) {
    return getReportHistoryAnswer(history, prediction);
  }

  if (isBatteryHealthCheckQuestion(text)) {
    return getBatteryHealthCheckReason();
  }

  if (isReportQuestion(text)) {
    return `${getReportGuidanceAnswer(history, prediction)}\n\n${getDatasetAwareNote(history[0] ?? prediction)}`;
  }

  if (text.includes('company') || text.includes('specific') || text.includes('brand') || text.includes('manufacturer') || text.includes('warranty')) {
    return `Company-specific care for ${formatVehicle(prediction)}:\n${getCompanySpecificAdvice(prediction).map((item) => `- ${item}`).join('\n')}`;
  }

  if (text.includes('charge') || text.includes('charging') || text.includes('fast')) {
    return `Charging routine I suggest:\n- Use AC or slower charging for daily use.\n- Keep daily SOC around 20-80%.\n- Avoid fast charging when the battery is hot.\n- Charge to 100% only before longer trips.\n\n${prediction ? `Your report shows fast charging usage at ${prediction.input?.fastChargingUsage ?? 0}%.` : 'After a health check, I can tune this advice to your exact usage.'}`;
  }

  if (text.includes('maintain') || text.includes('manage') || text.includes('longer') || text.includes('life')) {
    return `To make the battery last longer:\n${getMainActions(prediction).map((item) => `- ${item}`).join('\n')}\n- Drive smoothly and avoid repeated deep discharge.\n- Recheck health monthly or after unusual range drops.`;
  }

  if (text.includes('temperature') || text.includes('heat') || text.includes('cool')) {
    return `Heat management matters a lot:\n- Park in shade where possible.\n- Let the pack cool before charging after heavy use.\n- Avoid keeping the vehicle at 100% SOC in hot weather.\n- Watch thermal stress in the report; high thermal stress means you should reduce heat plus fast charging together.`;
  }

  if (appAnswer) return appAnswer;
  if (generalAnswer) return generalAnswer;

  return `I can answer general questions too, but I only know what is available inside this app and stable built-in guidance. For questions needing live internet or expert confirmation, please verify from an official source.\n\nFor your battery context: ${getReportSummary(prediction)}\n\nYou can ask me to explain the report, compare previous reports, suggest maintenance, help with app pages, or solve simple calculations.`;
}

function readStoredPrediction() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function readStoredSelectedVehicle() {
  try {
    const stored = window.localStorage.getItem('lifecharge_user_selected_vehicle');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed?.categoryId && parsed?.make && parsed?.model) {
      const spec = getVehicleSpec(parsed.categoryId, parsed.make, parsed.model);
      return { ...parsed, spec };
    }
    return null;
  } catch {
    return null;
  }
}

export default function LifyChatbot() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(readStoredSelectedVehicle);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chatbot.intro'),
    },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    setPrediction(readStoredPrediction());
    setSelectedVehicle(readStoredSelectedVehicle());
    setHistory(readStoredHistory());

    function handlePredictionUpdated(event) {
      setPrediction(event.detail ?? readStoredPrediction());
      setSelectedVehicle(readStoredSelectedVehicle());
      setHistory(readStoredHistory());
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `I found your latest health report. ${getReportSummary(event.detail)} Ask me how to maintain it for longer life.`,
        },
      ]);
    }

    function handleStorage() {
      setPrediction(readStoredPrediction());
      setSelectedVehicle(readStoredSelectedVehicle());
      setHistory(readStoredHistory());
    }

    window.addEventListener('lifecharge:prediction-updated', handlePredictionUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('lifecharge:prediction-updated', handlePredictionUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const activeVeh = selectedVehicle || (prediction ? { make: prediction.vehicleMake, model: prediction.vehicleModel } : null);

  const contextLabel = useMemo(() => (
    activeVeh?.model
      ? `${activeVeh.make ? `${activeVeh.make} ` : ''}${activeVeh.model}${prediction ? ` · SOH ${prediction.SOH}%` : ''}`
      : 'Groq AI Powered'
  ), [activeVeh, prediction]);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    const currentVeh = selectedVehicle || readStoredSelectedVehicle();
    const profileContext = {
      userName: user?.name,
      userEmail: user?.email,
      userRole: user?.role,
      selectedVehicle: currentVeh,
    };

    try {
      const reply = await sendChatMessage({
        message: trimmed,
        history: updatedMessages,
        predictionContext: prediction,
        profileContext,
      });

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: reply },
      ]);
    } catch (error) {
      console.warn('Lify AI Groq response fallback:', error);
      const normalized = normalizeLanguageInput(trimmed);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: buildReply(normalized, prediction, history, t, currentVeh) },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section className="flex h-[min(620px,calc(100vh-96px))] w-[calc(100vw-32px)] max-w-sm flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl shadow-slate-900/20">
          <header className="flex items-start gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 p-4 text-white">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-300 text-slate-950">
              <Bot size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-black leading-tight">Lify</h2>
              <p className="mt-1 truncate text-xs text-slate-300">{contextLabel}</p>
            </div>
            <button className="lc-focus rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white" type="button" onClick={() => setIsOpen(false)} aria-label={t('chatbot.closeButton')}>
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] whitespace-pre-line rounded-xl px-3 py-2 text-sm leading-6 ${message.role === 'user' ? 'bg-cyan-600 text-white font-medium shadow-sm' : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-sm'}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-3">
                  <span className="size-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.2s]" />
                  <span className="size-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.1s]" />
                  <span className="size-2 animate-bounce rounded-full bg-cyan-400" />
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {t('chatbot.quickPrompts', { returnObjects: true }).map((prompt) => (
                <button key={prompt} className="lc-focus shrink-0 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors" type="button" onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
              <input
                className="lc-focus min-h-11 flex-1 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isTyping}
                placeholder={t('chatbot.placeholder')}
              />
              <button className="lc-focus grid size-11 place-items-center rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-cyan-500/20" type="submit" disabled={isTyping} aria-label="Send message">
                <Send size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          className="lc-focus flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 font-bold text-white shadow-2xl shadow-slate-900/25 hover:bg-slate-800"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t('chatbot.openButton')}
        >
          <span className="grid size-9 place-items-center rounded-full bg-cyan-300 text-slate-950">
            <BatteryCharging size={19} aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{t('chatbot.openButton')}</span>
          <MessageCircle className="sm:hidden" size={18} aria-hidden="true" />
          <ChevronDown className="hidden rotate-180 sm:block" size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
