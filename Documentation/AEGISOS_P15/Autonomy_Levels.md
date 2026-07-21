# AEGISOS Autonomy Safety Levels Specification

AEGISOS supports 5 configurable levels of system autonomy.

---

## Safety Level Hierarchy

- **Level 0 (`L0_observation`)**: Observation only. No automations execute automatically.
- **Level 1 (`L1_recommendation`)**: Recommendations only (Default). System proposes automations for human approval.
- **Level 2 (`L2_approval`)**: Executes automations after explicit human confirmation.
- **Level 3 (`L3_automatic_trusted`)**: Executes trusted automations (high trust score entities) automatically.
- **Level 4 (`L4_context_aware`)**: Full context-aware autonomous execution supervised by Governance & Trust.
