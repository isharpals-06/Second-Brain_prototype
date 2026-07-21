# AEGISOS Rollback Strategy Specification

Every automation defines a rollback capability to ensure safety and system recoverability.

---

## Supported Rollback Strategies

1. `git_revert`: Executes Git revert for repository-modifying workflows.
2. `file_cleanup`: Restores or deletes temporary files created during execution.
3. `compensation`: Executes custom workflow compensation steps.
4. `state_restore`: Restores World Model state from the latest snapshot checkpoint.
