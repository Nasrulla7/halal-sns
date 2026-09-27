# HALAL-INVEST: CI/CD & Verification Strategy

## Automated Verification Gates
1. **Type Checking:** `npm run lint` (runs `tsc --noEmit`).
2. **Automated Test Execution:** Runs deterministic financial calculation tests, Shariah hard-gate tests, and safety barrier tests.
3. **Static Security Checks:** Verifies no secrets or private keys are present in client bundles or public commits.
4. **Build Compilation:** `npm run build` compiles clean production bundle with zero warnings.
