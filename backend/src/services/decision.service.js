/**
 * Decision Intelligence Service for Battery Lifecycle Optimization.
 * Evaluates operational scenarios and determines the optimal strategy based on quantitative SOH/RUL models.
 */

export function evaluateScenariosAndRecommend(scenariosPayload) {
  const current = scenariosPayload.current || { soh: 82, rul: 500, temp: 38, fastCharging: 55 };
  const baseRul = current.rul || 500;

  // Operational scenarios evaluated
  const scenarios = [
    {
      id: 'CURRENT',
      label: 'Current Strategy',
      fastCharging: current.fastCharging || 55,
      temperature: current.temp || 38,
      soh: current.soh || 82,
      rul: baseRul,
      thermalStress: 68,
      riskLevel: 'HIGH',
    },
    {
      id: 'NORMAL',
      label: 'Balanced Routine',
      fastCharging: 30,
      temperature: 30,
      soh: Math.min(100, (current.soh || 82) + 2.5),
      rul: Math.round(baseRul * 1.12),
      thermalStress: 42,
      riskLevel: 'MODERATE',
    },
    {
      id: 'AGGRESSIVE',
      label: 'High-Demand Commercial',
      fastCharging: 85,
      temperature: 44,
      soh: Math.max(40, (current.soh || 82) - 5.0),
      rul: Math.round(baseRul * 0.75),
      thermalStress: 88,
      riskLevel: 'CRITICAL',
    },
    {
      id: 'OPTIMIZED',
      label: 'Optimized Longevity Strategy',
      fastCharging: 15,
      temperature: 26,
      soh: Math.min(100, (current.soh || 82) + 4.2),
      rul: Math.round(baseRul * 1.24),
      thermalStress: 22,
      riskLevel: 'LOW',
    },
  ];

  // Objective score calculation: SOH * 0.4 + (RUL/10) * 0.4 - ThermalStress * 0.2
  const evaluated = scenarios.map((s) => {
    const score = Math.round(s.soh * 0.4 + (s.rul / 10) * 0.4 - s.thermalStress * 0.2);
    const rulGain = s.rul - baseRul;
    return {
      ...s,
      objectiveScore: score,
      rulGain: rulGain > 0 ? `+${rulGain} cycles` : `${rulGain} cycles`,
      estimatedLifespanYears: (s.rul / 180).toFixed(1),
    };
  });

  // Rank scenarios descending by objective score
  evaluated.sort((a, b) => b.objectiveScore - a.objectiveScore);

  const bestScenario = evaluated[0];
  const netGainCycles = bestScenario.rul - baseRul;

  return {
    recommendedScenarioId: bestScenario.id,
    recommendedScenarioLabel: bestScenario.label,
    expectedRulGain: `+${netGainCycles} useful cycles (~${(netGainCycles / 180).toFixed(1)} years extension)`,
    decisionRationale: (
      `The Decision Engine identified '${bestScenario.label}' as the optimal operating strategy. ` +
      `Limiting DC fast charging to ${bestScenario.fastCharging}% and maintaining average temperature below ${bestScenario.temperature}°C ` +
      `reduces thermal stress by ${68 - bestScenario.thermalStress}% and extends remaining useful life from ${baseRul} to ${bestScenario.rul} cycles.`
    ),
    evaluations: evaluated,
    generatedAt: new Date(),
  };
}
