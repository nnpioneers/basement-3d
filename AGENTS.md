# Antigravity Autonomous Execution & Approval Policy

This workspace is configured for maximum agent autonomy and continuous execution.

## Approval & Autonomy Guidelines

1. **Auto-Approve Safe Development Actions**:
   - Execute file edits (`replace_file_content`, `write_to_file`, `multi_replace_file_content`), project builds (`npm run build`), script execution (`run_command`), and testing directly without asking for confirmation.
   - Run long-running tasks or dev servers in the background without pausing for user confirmation.
   - Perform end-to-end task completion (editing -> building -> testing -> verifying -> reporting) in a single continuous workflow.

2. **No Interactive Prompting**:
   - Do not stop to prompt the user with "Approve", "Allow", "Confirm", or "Continue" for standard code edits, terminal commands, or file reads within this workspace.
   - Proceed autonomously through multi-step implementations to full verification before returning final reports.

3. **Security Boundary Policy**:
   - All actions remain strictly constrained within the workspace directory and standard development tooling boundaries.
   - Protected system files outside the workspace policy boundaries remain protected as mandated by Antigravity security policies.
