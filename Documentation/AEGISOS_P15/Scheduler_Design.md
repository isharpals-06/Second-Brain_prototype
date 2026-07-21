# AEGISOS Scheduler Design Specification

The Automation Scheduler manages cron schedules, recurring execution intervals, and one-off timed jobs with timezone awareness.

---

## Job Schema

```json
{
  "automationId": "auto_health_audit",
  "cronExpression": "0 0 * * *",
  "status": "scheduled",
  "nextRun": "2026-07-22T00:00:00.000Z"
}
```
