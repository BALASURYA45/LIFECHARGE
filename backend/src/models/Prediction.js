import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Vehicle identification
    vehicleCategory: {
      type: String,
      enum: ['two_wheeler', 'three_wheeler', 'four_wheeler', 'bus_heavy'],
    },
    vehicleMake: String,
    vehicleModel: String,
    vehicleType: {
      type: String,
      enum: ['BIKE', 'AUTO', 'CAR', 'BUS'],
    },
    input: {
      batteryAge: Number,
      chargingCycles: Number,
      chargingFrequency: Number,
      fastChargingUsage: Number,
      averageTemperature: Number,
      chargingDuration: Number,
      dailyDistance: Number,
      socHistory: Number,
      batteryCapacity: Number,
      voltage: Number,
      current: Number,
      totalKmDriven: Number,
      expectedCycles: Number,
      typicalRange: Number,
      estimatedLifeYears: Number,
    },
    SOH: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    RUL: {
      type: Number,
      required: true,
      min: 0,
    },
    batteryStatus: {
      type: String,
      required: true,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    riskLabel: {
      type: String,
      enum: ['Low Risk', 'Medium Risk', 'High Risk'],
      default: 'Low Risk',
    },
    riskFactors: [String],
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    degradationTrend: {
      type: String,
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
    modelTrainingId: {
      type: String,
      required: true,
    },
    explanation: {
      method: String,
      featureImportance: [
        {
          feature: String,
          label: String,
          value: Number,
          impact: Number,
          direction: {
            type: String,
            enum: ['positive', 'negative'],
          },
        },
      ],
      topNegativeFactors: [
        {
          feature: String,
          label: String,
          value: Number,
          impact: Number,
          direction: String,
        },
      ],
      topPositiveFactors: [
        {
          feature: String,
          label: String,
          value: Number,
          impact: Number,
          direction: String,
        },
      ],
      plainEnglishExplanation: String,
      generatedAt: Date,
    },
    recommendations: {
      items: [
        {
          title: String,
          description: String,
          priority: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
          },
          category: String,
        },
      ],
      summary: String,
      generatedAt: Date,
    },
    enhancements: {
      degradationRate: {
        value: Number,
        unit: String,
        description: String,
      },
      thermalStress: {
        score: Number,
        level: String,
      },
      cyclicStress: {
        score: Number,
        level: String,
      },
      anomalyDetection: {
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        isAnomalous: Boolean,
        factors: [String],
      },
      prognosis: {
        OPTIMAL: {
          label: String,
          monthsTo80SOH: Number,
          monthsToReplacement: Number,
          estimatedCyclesRemaining: Number,
        },
        MODERATE: {
          label: String,
          monthsTo80SOH: Number,
          monthsToReplacement: Number,
          estimatedCyclesRemaining: Number,
        },
        HARSH: {
          label: String,
          monthsTo80SOH: Number,
          monthsToReplacement: Number,
          estimatedCyclesRemaining: Number,
        },
      },
      confidenceInterval: {
        soh: {
          lower: Number,
          upper: Number,
          margin: Number,
        },
        rul: {
          lower: Number,
          upper: Number,
          margin: Number,
        },
      },
      comparison: {
        vehicleType: String,
        baselineSOHTarget: Number,
        baselineRULTarget: Number,
        sohDelta: Number,
        rulDelta: Number,
        performanceRating: String,
      },
      earlyLife: {
        cyclesUsed: Number,
        predictedSoh: Number,
        predictedRul: Number,
        degradationRate: Number,
        confidenceScore: Number,
      },
      multiTask: {
        soh: Number,
        rul: Number,
        degradationRate: Number,
        trendLabel: String,
      },
      anomalyDetails: {
        isAnomalous: Boolean,
        anomalyScore: Number,
        severity: String,
        affectedCycle: Number,
        explanation: String,
        factors: [String],
      },
      versionInfo: {
        modelName: String,
        modelVersion: String,
        datasetName: String,
        featureVersion: String,
        predictionTimestamp: Date,
      },
    },
    // LITHYX Research Extensions
    lithyx: {
      healthIndicators: {
        icPeaks: [
          {
            positionV: Number,
            height: Number,
            widthV: Number,
          },
        ],
        dvFeatures: [
          {
            positionAh: Number,
            inflectionV: Number,
          },
        ],
        ccDurationMinutes: Number,
        cvDurationMinutes: Number,
        cRate: Number,
        dod: Number,
        temperatureC: Number,
      },
      physicsPrediction: {
        soh: Number,
        rul: Number,
        residualSoh: Number,
        parameters: {
          activationEnergyEa: Number,
          degradationCoeffK: Number,
          crateStressCoeff: Number,
          dodStressCoeff: Number,
          resistanceGrowthK: Number,
        },
      },
      conformalBounds: {
        sohLower: Number,
        sohUpper: Number,
        rulLower: Number,
        rulUpper: Number,
        picp: Number,
        mpiw: Number,
        confidenceLevel: Number,
      },
      crossChemistry: {
        sourceChemistry: String,
        targetChemistry: String,
        fewShotK: Number,
        domainAlignmentMetric: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

predictionSchema.index({ user: 1, createdAt: -1 });

export const Prediction = mongoose.model('Prediction', predictionSchema);