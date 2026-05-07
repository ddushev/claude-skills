# Claude Skills

A collection of Claude Code skills for SAP UI5 development.

## Available Skills

### create-ui5-card

Generate SAP UI5 Integration Card `manifest.json` files. Supports List, Table, Object, and Analytical card types with full binding syntax (simple, expression, i18n, composite).

## Installation

```bash
npx skills add ddushev/claude-skills@create-ui5-card -y && mkdir -p .claude/skills && mv .agents/skills/create-ui5-card .claude/skills/ && rm -rf .agents
```

After installation, Claude Code will automatically trigger the skill when you ask to create a UI5 card.

## Usage

Just ask Claude to create a card:

- "Create a list card showing open purchase orders with status"
- "I need a table card with employee data"
- "Build an analytical card for monthly revenue KPIs"

The skill generates a complete, valid `manifest.json` in your current directory and runs validation automatically.
