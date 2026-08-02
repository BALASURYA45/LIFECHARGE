Objective: Redesign the LifeCharge authenticated app around routine-based battery analysis and add a new real app page at /routine.

Target audience: EV owners who do not know technical battery terms but can describe their daily, weekly, or monthly driving and charging habits.

Aesthetic direction: Quiet operational dashboard with crisp white surfaces, strong black text, restrained cyan/emerald/amber status accents, dense but easy scanning. Avoid marketing hero composition and avoid a single-hue purple/blue look.

Content structure:
- Refresh the dashboard first screen to guide users toward routine entry as the primary path.
- Keep the existing /prediction page available as a legacy/current health-check page.
- Add /routine with:
  - segmented control for Daily, Weekly, Monthly routine mode
  - vehicle selection
  - routine habit inputs adapted to selected period
  - derived preview values that explain how entries are converted into average daily distance, weekly charging frequency, and usage stress
  - submit button that calls the existing prediction API and shows result/recommendation/history context
- Add navigation entry for routine analysis before the legacy analyze page.

Typography: Existing Inter/system stack, tight dashboard headings, no oversized hero text inside app surfaces.

Color direction: White/slate base, black primary actions, cyan as data accent, emerald for healthy, amber for caution. Keep red only for warnings/errors.

Memorable detail: A "routine translator" panel that visibly converts daily/weekly/monthly habits into battery-health analysis inputs.

Technical constraints:
- Use existing React/Vite/Tailwind conventions.
- Reuse VehicleSelector, PredictionResult, ExplanationPanel, RecommendationPanel, prediction/recommendation/explanation services.
- Keep old /prediction route and page.
- Do not require backend schema changes if possible; build the payload accepted by the current prediction endpoint.

Output path: C:\Users\balas\Desktop\LifeCharge\frontend\src
