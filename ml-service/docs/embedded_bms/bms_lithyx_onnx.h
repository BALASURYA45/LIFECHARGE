/*
 * LITHYX Embedded BMS Microcontroller Auto-Generated Header
 * Architecture: ARM Cortex-M4/M7, ESP32, STM32, TI C2000 BMS
 * Generated: 2026-10-03 18:40:06
 */

#ifndef BMS_LITHYX_ONNX_H
#define BMS_LITHYX_ONNX_H

#ifdef __cplusplus
extern "C" {
#endif

#define BMS_MODEL_INPUT_DIM      15
#define BMS_MODEL_SEQ_LEN        30
#define BMS_MODEL_HIDDEN_DIM     64
#define BMS_QUANT_SCALE_SOH      0.00392157f
#define BMS_QUANT_ZERO_POINT_SOH 128
#define BMS_RECOMMENDED_RATE_HZ  1.0f

// Input telemetry feature index mapping
typedef enum {
    FEATURE_VOLTAGE_V        = 0,
    FEATURE_CURRENT_A        = 1,
    FEATURE_TEMP_C           = 2,
    FEATURE_DQ_DV_PEAK       = 3,
    FEATURE_OHMIC_RE_OHM     = 4,
    FEATURE_CHARGE_TRANSFER  = 5,
    FEATURE_CC_DURATION_SEC  = 6,
    FEATURE_PEAK_TEMP_RISE   = 7,
    FEATURE_C_RATE           = 8,
    FEATURE_DOD              = 9,
    FEATURE_TOTAL_CYCLES     = 10,
    FEATURE_THERMAL_STRESS   = 11,
    FEATURE_FAST_CHARGE_RATIO= 12,
    FEATURE_ENERGY_THROUGHPUT= 13,
    FEATURE_SMOOTH_IMPEDANCE = 14
} BMS_Feature_Index_t;

typedef struct {
    float predicted_soh;
    float predicted_rul_cycles;
    float lower_bound_95;
    float upper_bound_95;
    uint32_t execution_time_us;
} BMS_Inference_Result_t;

#ifdef __cplusplus
}
#endif

#endif // BMS_LITHYX_ONNX_H
