---
name: create-ui5-card
description: Create SAP UI5 Integration Cards (manifest.json) for SAP Build Work Zone, Fiori Launchpad, or custom apps. Use this skill whenever the user wants to create a UI5 card, generate a card manifest, scaffold an integration card, build a dashboard card for Work Zone, or mentions SAP card types (List, Table, Object, Analytical). Also trigger when the user asks about card manifest structure, card data binding, or wants to convert data into a visual card format — even if they don't explicitly say "UI5" or "integration card."
---

# UI5 Integration Card Creator

Generate SAP UI5 Integration Card `manifest.json` files directly from a user's description. No external tools or MCP servers required — you produce valid manifests from your knowledge of the UI5 Integration Card specification.

## Core Workflow

The workflow is intentionally minimal: the user describes what they want, you generate the manifest, they iterate.

1. **Check for available data** — look in the `.data/` folder in the project root
2. **User describes the card** — what data, what layout, what purpose
3. **You generate `manifest.json`** — complete, valid, ready to use
4. **You run validation** — execute the bundled validation script
5. **Iterate** — user refines, you regenerate

If the user gives enough context upfront (card type, data source, fields), skip straight to generation. Only ask clarifying questions when genuinely ambiguous — for example, if the user says "show my sales data" but hasn't indicated whether they want a list, table, or chart.

## Data Discovery

Before generating a card, **always check for a `.data/` folder** in the project root directory. This folder contains available data sources (JSON files, API response samples, OData metadata) that should inform the card's data binding.

- If `.data/` exists with **one data source** — use it automatically, inform the user which data you're using
- If `.data/` exists with **multiple data sources** — ask the user which one to use (present the file names as options)
- If `.data/` does **not exist** or is empty — proceed normally, ask the user about their data or generate sample data

## Output Location

Write the `manifest.json` directly in the **current working directory** — do not create a subfolder.

- If a `manifest.json` **already exists** in the current directory — ask the user for permission before modifying it. Explain what changes you'd make and confirm before overwriting.
- If no `manifest.json` exists — create it in the current directory.

## Card Types

| Type | Best For |
|------|----------|
| **List** | Vertical list of items (most common) |
| **Table** | Tabular data with columns |
| **Object** | Single entity detail view |
| **Analytical** | KPIs, charts, numeric indicators |

When in doubt, default to **List** — it's the most versatile.

For detailed structure and examples of each card type, read `references/card-types.md`.

## Binding Syntax — READ THIS FIRST

Correct binding syntax is the difference between a working card and a blank one. Before generating any manifest, read `references/binding-syntax.md` for the full reference. Here's the critical summary:

| Binding Type | Syntax | Example |
|-------------|--------|---------|
| Simple (relative) | `{field}` | `"{name}"` — inside content with data.path |
| Simple (absolute) | `{/path/field}` | `"{/header/title}"` — from data root |
| Expression | `{= expr}` | `"{= ${price} > 100 ? 'High' : 'Low'}"` |
| i18n | `{i18n>KEY}` or `{{KEY}}` | `"{i18n>cardTitle}"` |
| Composite | multiple | `"{firstName} {lastName}"` |

**Critical rules:**
- Inside content items (where `data.path` is set), use **relative** paths: `{name}` not `{/items/0/name}`
- In expression bindings, reference fields with `${path}` not `{path}`
- String literals in expressions use **single quotes**: `'text'` (JSON uses double quotes)
- **No JavaScript function calls** in expressions — no `Math.*`, `parseInt()`, `.substring()`, etc.
- **No formatters** — do not use `format.*` or any custom/built-in formatter functions
- Only allowed expression operators: comparison (`===`, `>`, `<`), logical (`&&`, `||`, `!`), arithmetic (`+`, `-`, `*`, `/`, `%`), ternary (`? :`), string concatenation (`+`)
- URL templates use `{{destinations.x}}` / `{{parameters.x}}` — these are NOT data bindings
- Header bindings against card-level data use **absolute** paths: `{/headerField}`

## Manifest Structure

Every manifest follows this skeleton:

```json
{
  "_version": "1.14.0",
  "sap.app": {
    "id": "company.project.cardname",
    "type": "card",
    "title": "Card Title",
    "applicationVersion": { "version": "1.0.0" }
  },
  "sap.card": {
    "type": "<List|Table|Object|Analytical>",
    "header": { ... },
    "content": { ... },
    "data": { ... }
  }
}
```

### Key Rules

- **`sap.app.id`** — reverse-domain style, unique per card (e.g., `company.workzone.purchaseorders`)
- **`sap.app.type`** — always `"card"`
- **`sap.card.type`** — determines the content structure
- **Header types**: `"Default"` (title + subtitle + icon) or `"Numeric"` (KPI with trend/state)
- **Data binding** uses `{path}` syntax — paths are relative to the data context
- **Data sources**: static JSON (inline), OData v2/v4, or REST endpoints
- **Card-level data** (`sap.card/data`) is available to both header and content; content-level data (`sap.card/content/data`) scopes to content only

### Data Source Patterns

**Static JSON (prototyping/demo):**
```json
"data": {
  "json": [ ... ]
}
```

**OData Service:**
```json
"data": {
  "request": {
    "url": "{{destinations.myDest}}/sap/opu/odata/sap/SERVICE_SRV/EntitySet",
    "method": "GET"
  }
}
```

**REST API:**
```json
"data": {
  "request": {
    "url": "https://api.example.com/data",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {{parameters.token}}"
    }
  }
}
```

### Parameters and Destinations

Use `configuration` for dynamic values:

```json
"configuration": {
  "parameters": {
    "city": { "value": "Berlin" }
  },
  "destinations": {
    "myDest": { "name": "SAP_Backend" }
  }
}
```

Reference in data URLs: `{{parameters.city}}`, `{{destinations.myDest}}`.

## Validation

After generating the manifest, **always run the validation script**:

```bash
node <skill-path>/scripts/validate-manifest.mjs <path-to-manifest.json>
```

Replace `<skill-path>` with the absolute path to this skill's directory. The script checks:
- Required fields (`sap.app`, `sap.card`, `type`, `header`)
- Valid card type
- Header structure matches header type
- Content structure matches card type
- Data binding syntax (curly braces)
- Common mistakes (missing `item` for List, missing `columns` for Table, etc.)

If validation reports errors, fix them and re-validate before presenting to the user. Warnings are informational — mention them but don't block on them.

## Generation Guidelines

When generating a manifest:

1. **Use realistic sample data** — not empty placeholders. If the user mentions "purchase orders," generate 3-5 realistic PO entries with plausible values.

2. **Match binding paths to data** — if the JSON has `{ "name": "Notebook" }`, bind as `"{name}"` not `"{/items/0/name}"`. Read `references/binding-syntax.md` for expression binding syntax when you need conditional values or computed fields. **Never use formatters or JavaScript functions** in expressions.

3. **Include both header and content** — a card without a header title looks broken. Always set at least `title` in the header.

4. **Set appropriate status/highlight** — List cards benefit from `info` and `highlight` fields showing status. Use SAP value states: `"Success"`, `"Error"`, `"Warning"`, `"Information"`, `"None"`.

5. **Keep `sap.app.id` meaningful** — use reverse-domain notation reflecting the card's context (e.g., `company.workzone.procurement.openorders`).

6. **Default to `_version: "1.14.0"`** — widely supported baseline. Only go higher if the user needs newer features.

7. **Prefer card-level data** — put `data` at `sap.card` level (not nested in content) unless there's a specific reason to scope it.

## After Generation

Once the manifest is valid:
- Tell the user the file location
- Briefly describe what the card will look like
- Offer to: modify fields, change data source, add actions, create another card
- If they're using SAP Build Work Zone or this repo's card editor, mention they can preview it there

## What This Skill Does NOT Do

- Deploy cards (user handles deployment to Work Zone / Fiori Launchpad)
- Create custom UI5 components (use Component Card type for full customization)
- Connect to live backends for testing (manifest configuration only)
- Modify existing manifests (user should describe what they want changed and you edit directly)
