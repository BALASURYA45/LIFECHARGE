# Database Schema

MongoDB collections planned for LIFECHARGE:

## Users

Stores registered user accounts, hashed passwords, reset tokens, profile metadata, and timestamps.

Fields implemented in Module 2:

- `name`
- `email`
- `password`
- `role`
- `passwordResetToken`
- `passwordResetExpires`
- `createdAt`
- `updatedAt`

## BatteryData

Stores historical battery inputs such as age, charging cycles, charging frequency, fast charging usage, average temperature, charging duration, daily distance, SOC history, capacity, voltage, and current.

Fields implemented in Module 3:

- `user`
- `batteryAge`
- `chargingCycles`
- `chargingFrequency`
- `fastChargingUsage`
- `averageTemperature`
- `chargingDuration`
- `dailyDistance`
- `socHistory`
- `batteryCapacity`
- `voltage`
- `current`
- `source`
- `notes`
- `createdAt`
- `updatedAt`

## Predictions

Stores prediction outputs including SOH, RUL, status, confidence score, degradation trend, feature importance snapshot, and recommendation references.

Fields implemented in Module 5:

- `user`
- `input`
- `SOH`
- `RUL`
- `batteryStatus`
- `confidenceScore`
- `degradationTrend`
- `modelName`
- `modelTrainingId`
- `createdAt`
- `updatedAt`

## Reports

Stores report metadata such as user, report type, date range, generated file location, and export status.
