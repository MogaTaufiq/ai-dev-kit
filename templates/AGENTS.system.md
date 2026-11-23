Tier: {{TIER}} (since {{SINCE}})
Kit: ai-dev-kit {{KIT_VERSION}}
Tier decisions: none yet

# {{APP_NAME}} (system)

System-level rules for a multi-repo system. Each service has its own AGENTS.md with its own Definition of Done.

## Services
{{SERVICES}}

## Cross-service rules
- A decision that touches more than one service gets an ADR in `docs/adr/` here.
- The provider service owns each API schema (OpenAPI or JSON Schema). Consumers test against a pinned copy in their own CI.
- The system spec lives in `.scratch/` here. Per-service tickets live in each service.

## Forced stops
Every forced stop in each service's AGENTS.md applies here too, plus changing a cross-service contract.
