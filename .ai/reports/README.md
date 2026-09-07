# Task Reports

Store one concise Markdown report per completed task in this directory. Use a descriptive or timestamped filename, include exact validation commands and outcomes, and never include credentials or secrets.

Required format:

```markdown
# Task Report
## What changed
## Files changed
## Decisions
## Validation
## Issues / Risks
## Next step
```

Keep statements factual. Do not claim a quality gate passed unless Codex reran it and observed success. Copy a report to the Windows clipboard with:

```powershell
.\scripts\copy-report.ps1 .\.ai\reports\<report-file>.md
```
