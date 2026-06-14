#!/usr/bin/env bash
# close-feature-issues.sh
#
# Close all open GitHub issues that belong to the current feature.
# Reads the feature number from .specify/feature.json (e.g. "005" from
# "specs/005-login-form") and closes every open issue whose title
# contains "[005]".
#
# Usage: close-feature-issues.sh [commit_sha]
#
# When commit_sha is provided, the closing comment includes it.

set -euo pipefail

PROJECT_ROOT="$(pwd)"
FEATURE_JSON="$PROJECT_ROOT/.specify/feature.json"
COMMIT_SHA="${1:-}"

if [[ ! -f "$FEATURE_JSON" ]]; then
  echo "close-feature-issues: .specify/feature.json not found; nothing to do." >&2
  exit 0
fi

# Extract feature_directory value (e.g. "specs/005-login-form")
FEATURE_DIR="$(grep '"feature_directory"' "$FEATURE_JSON" | sed 's/.*: *"\(.*\)".*/\1/')"

if [[ -z "$FEATURE_DIR" ]]; then
  echo "close-feature-issues: feature_directory not set in feature.json; nothing to do." >&2
  exit 0
fi

# Extract the numeric prefix (e.g. "005" from "specs/005-login-form")
BASENAME="$(basename "$FEATURE_DIR")"
FEATURE_NUM="$(echo "$BASENAME" | grep -oE '^[0-9]+')"

if [[ -z "$FEATURE_NUM" ]]; then
  echo "close-feature-issues: could not determine feature number from '$FEATURE_DIR'." >&2
  exit 1
fi

echo "close-feature-issues: closing open issues for feature [$FEATURE_NUM]..."

if ! command -v gh >/dev/null 2>&1; then
  echo "close-feature-issues: gh CLI not found; install GitHub CLI to use this script." >&2
  exit 1
fi

# Collect open issue numbers matching the feature tag
ISSUE_NUMBERS=()
while IFS=$'\t' read -r num _rest; do
  [[ -n "$num" ]] && ISSUE_NUMBERS+=("$num")
done < <(gh issue list --state open --search "\\[$FEATURE_NUM\\] in:title" --json number,title \
  --jq '.[] | [.number|tostring, .title] | @tsv' 2>/dev/null)

if [[ ${#ISSUE_NUMBERS[@]} -eq 0 ]]; then
  echo "close-feature-issues: no open issues found for feature [$FEATURE_NUM]."
  exit 0
fi

if [[ -n "$COMMIT_SHA" ]]; then
  COMMENT="Implemented in commit $COMMIT_SHA"
else
  COMMENT="Implemented — closing after /speckit-implement completed"
fi

for NUM in "${ISSUE_NUMBERS[@]}"; do
  gh issue close "$NUM" --comment "$COMMENT"
done

echo "close-feature-issues: closed ${#ISSUE_NUMBERS[@]} issue(s)."
