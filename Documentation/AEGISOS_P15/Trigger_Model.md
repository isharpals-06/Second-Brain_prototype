# AEGISOS Trigger Model Specification

AEGISOS automations support multi-event triggering mechanisms.

---

## Trigger Types

- `filesystem`: Triggers on file creation, modification, or deletion in monitored paths.
- `git`: Triggers on repository commits, branch switches, or PR activity.
- `cron`: Triggers on standard cron time schedules (e.g. `0 0 * * *`).
- `memory`: Triggers when Memory OS generates a new reflection report.
- `event`: Triggers on custom system perception events.
