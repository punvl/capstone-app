# .claude Directory

This directory contains Claude Code configuration for the Badminton Training System project.

## Structure

```
.claude/
├── rules/                      # Permanent coding standards
│   ├── code-quality.md        # Quality standards (SOLID, DRY, Clean Code)
│   └── performance.md         # Performance requirements and optimization
├── agents/                    # Custom AI agents
│   └── pre-commit-guardian.md # Pre-commit quality checker
├── skills/                    # Auto-discovered capabilities
│   └── code-reviewer/         # Code review skill
│       └── SKILL.md
├── commands/                  # Slash commands
│   └── refactor.md           # Code refactoring command
├── hooks.json                # Git hooks configuration
└── README.md                 # This file
```

## Rules (Always Active)

### [code-quality.md](rules/code-quality.md)
Enforces code quality standards:
- SOLID principles
- TypeScript type safety (no `any` types)
- Clean code practices
- Error handling requirements
- Testing standards

### [performance.md](rules/performance.md)
Enforces performance standards:
- Algorithm complexity (avoid O(n²))
- Database optimization (prevent N+1 queries)
- React optimization (memoization)
- Caching strategies
- Bundle size management

## Agents (Auto-invoked)

### [pre-commit-guardian.md](agents/pre-commit-guardian.md)
**Automatically runs before commits** to:
1. Review changed files for quality/performance/security
2. Update CLAUDE.md with architectural changes
3. Run tests
4. Block commits with critical issues

**Triggered by**: "commit", "git commit", or attempting to commit

## Skills (Auto-discovered)

### [code-reviewer](skills/code-reviewer/)
**Automatically reviews code** when:
- Writing or modifying code
- User asks "review this code"
- Before committing changes

**Checks for**:
- Code quality issues
- Performance problems
- Security vulnerabilities
- Best practices violations

## Commands (Manual)

### `/refactor`
Refactor code for quality and performance with detailed analysis.

**Usage**: `/refactor src/services/session.ts`

## Hooks

### user-prompt-submit
Detects commit requests and reminds to run Pre-Commit Guardian.

### before-tool
Warns when git commit is attempted via Bash tool.

## How It Works

### When You Write Code
1. **Code Reviewer Skill** automatically reviews your changes
2. Provides feedback on quality, performance, and security
3. Suggests fixes with code examples

### When You Commit
1. **Pre-Commit Guardian Agent** automatically runs
2. Reviews all changed files
3. Updates CLAUDE.md if needed
4. Runs tests
5. Blocks commit if critical issues found
6. Provides detailed summary

### Always Active
- **Quality Rules** enforce standards on all code
- **Performance Rules** ensure optimization
- Claude follows these rules automatically

## Example Workflow

```bash
# 1. You write code
# → Code Reviewer automatically reviews it
# → Provides feedback in real-time

# 2. You're ready to commit
User: "commit these changes with message 'add shot filtering'"

# → Pre-Commit Guardian automatically runs
# → Reviews all changed files
# → Updates CLAUDE.md (if needed)
# → Runs tests
# → Provides summary

# 3. If issues found:
Agent: "❌ NOT READY TO COMMIT
- Critical: SQL injection in sessionService.ts:45
- Fix required before commit"

# 4. If all good:
Agent: "✅ READY TO COMMIT
- 3 files reviewed
- All tests passing
- CLAUDE.md updated
- Proceed with commit?"
```

## Customization

### Add a New Rule
```bash
cat > .claude/rules/testing.md << 'EOF'
---
name: testing-standards
---

# Testing Standards

All new features must have tests...
EOF
```

### Add a New Skill
```bash
mkdir -p .claude/skills/api-tester
cat > .claude/skills/api-tester/SKILL.md << 'EOF'
---
name: api-tester
description: Generate API tests. Use when creating new endpoints.
---
...
EOF
```

### Add a New Agent
```bash
cat > .claude/agents/security-auditor.md << 'EOF'
---
name: security-auditor
description: Security audit. Use when security review needed.
tools: Read, Grep, Bash
---
...
EOF
```

## Benefits

### For You
- ✅ Automatic code quality enforcement
- ✅ Catch issues before commit
- ✅ Learn best practices through feedback
- ✅ CLAUDE.md always up-to-date
- ✅ No manual quality checks needed

### For Your Team
- ✅ Consistent code quality
- ✅ Enforced standards
- ✅ Up-to-date documentation
- ✅ Reduced review time
- ✅ Knowledge sharing through rules

## Quick Commands

```bash
# Test the pre-commit guardian
/task Run the pre-commit-guardian agent on current changes

# Review specific file
/task Review src/services/session.service.ts for quality and performance

# Refactor code
/refactor src/services/session.service.ts
```

## Disabling (Emergency)

If you need to bypass checks temporarily:

```bash
# Disable hooks
mv .claude/hooks.json .claude/hooks.json.disabled

# Skip pre-commit agent
git commit -m "emergency hotfix" --no-verify
```

**⚠️ Only use in emergencies! Re-enable immediately after.**

---

**Last Updated**: 2025-01-18
**Maintained by**: Claude Code configuration
