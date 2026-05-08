# Binding Syntax Reference

This is the most critical part of card generation. Incorrect bindings cause cards to render blank or show raw binding strings. Read this whenever generating or modifying manifest bindings.

---

## Binding Types Overview

| Type | Syntax | Example | Use Case |
|------|--------|---------|----------|
| Simple property | `{path}` | `"{name}"` | Bind to a single data field |
| Absolute path | `{/path/to/field}` | `"{/header/title}"` | Bind to a field from the root of the data model |
| Relative path | `{field}` | `"{name}"` | Bind within a data context (e.g., inside content with `data.path`) |
| Expression | `{= expression}` | `"{= ${price} > 100 ? 'Expensive' : 'Affordable'}"` | Computed values, conditionals |
| i18n (translation) | `{i18n>KEY}` or `{{KEY}}` | `"{i18n>cardTitle}"` | Translatable texts from i18n.properties |
| Composite | Multiple parts | `"{firstName} {lastName}"` | Combine multiple bindings in one string |

---

## Simple Property Binding

The most common binding. References a field in the current data context.

```json
"title": "{name}"
"description": "{description}"
"info": { "value": "{status}" }
```

### Path Rules

- **Relative paths** (no leading `/`): resolved relative to the current data context
  - Inside `content` with `"data": { "path": "/items" }`, a binding `{name}` resolves to each item's `name` field
- **Absolute paths** (leading `/`): resolved from the root of the card's data model
  - `{/header/title}` always points to `data.json.header.title` regardless of content data path

### When to Use Which

```json
"data": {
  "json": {
    "headerInfo": { "title": "My Card", "count": 5 },
    "items": [
      { "name": "Item 1", "status": "Active" }
    ]
  }
}
```

- **Header** bindings → use absolute: `"{/headerInfo/title}"`, `"{/headerInfo/count}"`
- **Content items** (with `"data": { "path": "/items" }`) → use relative: `"{name}"`, `"{status}"`

**Common mistake:** Using absolute paths inside content items. If content has `data.path: "/items"`, then `"{/items/0/name}"` is WRONG — use `"{name}"` instead.

---

## Expression Binding

Expression bindings allow computed values using JavaScript-like syntax. They start with `{=` and end with `}`.

### Syntax

```
{= expression }
```

Inside the expression, reference data fields with `${path}`:

```json
"{= ${price} > 1000 ? 'Premium' : 'Standard'}"
```

### Supported Operators (ONLY these are allowed)

| Category | Operators |
|----------|-----------|
| Comparison | `===`, `!==`, `>`, `<`, `>=`, `<=` |
| Logical | `&&`, `||`, `!` |
| Arithmetic | `+`, `-`, `*`, `/`, `%` |
| Ternary | `condition ? valueIfTrue : valueIfFalse` |
| String | `+` (concatenation) |

**NOT allowed in expression bindings:**
- No JavaScript function calls (`Math.round()`, `parseInt()`, `parseFloat()`, `.substring()`, `.toFixed()`, etc.)
- No formatters (no `format.*`, no custom formatters)
- No `typeof` operator
- No method calls on values

### Examples

**Conditional text:**
```json
"info": {
  "value": "{= ${quantity} > 0 ? 'In Stock' : 'Out of Stock'}"
}
```

**Conditional state (color):**
```json
"info": {
  "state": "{= ${quantity} > 10 ? 'Success' : ${quantity} > 0 ? 'Warning' : 'Error'}"
}
```

**Computed highlight:**
```json
"highlight": "{= ${overdue} === true ? 'Error' : ${priority} === 'High' ? 'Warning' : 'None'}"
```

**String concatenation:**
```json
"title": "{= ${firstName} + ' ' + ${lastName}}"
```

**String concatenation with data fields:**
```json
"description": "{= ${amount} + ' ' + ${currency}}"
```

**Boolean visibility (for actions):**
```json
"visible": "{= ${status} !== 'Closed'}"
```

**Percentage calculation:**
```json
"description": "{= ${actual} / ${target} * 100 + '%'}"
```

### Expression Binding Rules

1. **Always use `${path}` for field references** inside expressions — not `{path}`
2. **String literals** use single quotes: `'text'` (double quotes conflict with JSON)
3. **Nested ternaries** are valid but keep them readable (max 2 levels deep)
4. **No function calls** — no `Math.*`, no `parseInt()`, no `.substring()`, no method calls whatsoever
5. **No formatters** — do not use `format.*` or any custom formatter functions
6. **No variable declarations** — expressions must be single-expression, no statements
7. **Absolute paths** in expressions: `${/root/field}` (with leading slash)
8. **Only use operators from the allowed list above** — comparison, logical, arithmetic, ternary, and string concatenation

### Common Patterns

**Map a value to a ValueState:**
```json
"state": "{= ${status} === 'Approved' ? 'Success' : ${status} === 'Rejected' ? 'Error' : ${status} === 'Pending' ? 'Warning' : 'None'}"
```

**Show/hide based on condition:**
```json
"visible": "{= ${role} === 'Admin' || ${role} === 'Manager'}"
```

**Null-safe access:**
```json
"subtitle": "{= ${manager} ? ${manager} : 'Unassigned'}"
```

---

## i18n (Translation) Binding

Two equivalent syntaxes for referencing translated strings:

### Handlebars syntax (simpler, recommended for titles)
```json
"title": "{{cardTitle}}"
```
Resolves from a `messagebundle.properties` or similar translation file.

### Model syntax
```json
"title": "{i18n>cardTitle}"
```
References the `i18n` model explicitly. Requires `"i18n"` path in `sap.app`:

```json
"sap.app": {
  "id": "my.card",
  "type": "card",
  "i18n": "i18n/i18n.properties"
}
```

### When to Use

- Use i18n for any user-facing static text (titles, labels, column headers)
- Do NOT use i18n for data-bound values
- For prototype/demo cards with static JSON data, plain strings are fine — skip i18n

---

## Composite Binding

Combine multiple bindings in a single string value:

```json
"title": "{firstName} {lastName}"
"description": "{city}, {country}"
"info": { "value": "{amount} {currency}" }
```

Each `{...}` segment is resolved independently. Static text between them is preserved.

### With Expression

You can also embed an expression in a composite context, but typically it's cleaner to use a single expression binding for computed values.

---

## Data Context and Path Resolution

Understanding how paths resolve is essential:

### Card-Level Data

```json
"sap.card": {
  "data": {
    "json": {
      "title": "My Dashboard",
      "count": 42,
      "items": [ { "name": "A" }, { "name": "B" } ]
    }
  },
  "header": {
    "title": "{/title}",
    "status": { "text": "{/count} items" }
  },
  "content": {
    "data": { "path": "/items" },
    "item": {
      "title": "{name}"
    }
  }
}
```

- `header` bindings resolve against the root → use absolute paths: `{/title}`, `{/count}`
- `content` with `data.path: "/items"` creates a new context → item bindings are relative: `{name}`

### Content-Level Data (Override)

Content can define its own data source that overrides card-level data:

```json
"content": {
  "data": {
    "request": { "url": "/api/items" },
    "path": "/results"
  },
  "item": {
    "title": "{name}"
  }
}
```

Here, `{name}` resolves against each object in the `/results` array from the API response.

### Array Indexing

You rarely need array indices in bindings. The `data.path` property handles iteration:

- **Correct:** `"data": { "path": "/items" }` + `"title": "{name}"`
- **Wrong:** `"title": "{/items/0/name}"`

---

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| `"{items.name}"` | `"{name}"` (with data.path set) or `"{/items/0/name}"` |
| `{= {price} > 100}` | `"{= ${price} > 100}"` (use `${}` in expressions) |
| `"{= "${name}" + "!"}"` | `"{= ${name} + '!'}"` (single quotes for strings) |
| Missing quotes: `title: {name}` | `"title": "{name}"` (binding must be a JSON string) |
| `"{i18n.title}"` | `"{i18n>title}"` (i18n uses `>` not `.`) |
| `"{{destinations.myDest}}"` inside data binding | `"{{destinations.myDest}}"` is for URL templates only, not for field bindings |
| `"{= ${status} == 'Active'}"` | `"{= ${status} === 'Active'}"` (prefer strict equality) |

---

## URL Templates vs Data Bindings

These look similar but are different systems:

**URL templates** (in `data.request.url`) use double curly braces for parameters/destinations:
```json
"url": "{{destinations.backend}}/api/v1/orders?city={{parameters.city}}"
```

**Data bindings** (in header/content properties) use single curly braces:
```json
"title": "{orderName}"
```

Never mix these up — `{{field}}` in a content property is an i18n reference, not a data binding.
