# Card Type Reference

Detailed manifest structure for each supported card type. Read this file when you need the exact structure for a specific card type.

---

## List Card

The most common card type. Displays items in a vertical list.

```json
{
  "_version": "1.14.0",
  "sap.app": {
    "id": "company.project.listcard",
    "type": "card",
    "title": "Purchase Orders",
    "applicationVersion": { "version": "1.0.0" }
  },
  "sap.card": {
    "type": "List",
    "header": {
      "type": "Default",
      "title": "Open Purchase Orders",
      "subtitle": "Procurement Department",
      "icon": { "src": "sap-icon://sales-order" },
      "status": { "text": "5 of 20" }
    },
    "content": {
      "data": { "path": "/items" },
      "item": {
        "title": "{name}",
        "description": "{description}",
        "info": {
          "value": "{status}",
          "state": "{statusState}"
        },
        "highlight": "{highlight}",
        "icon": { "src": "{icon}" }
      }
    },
    "data": {
      "json": {
        "items": [
          {
            "name": "PO-12345",
            "description": "Office supplies from Staples",
            "status": "Approved",
            "statusState": "Success",
            "highlight": "Success",
            "icon": "sap-icon://cart"
          },
          {
            "name": "PO-12346",
            "description": "IT Equipment - Dell Monitors",
            "status": "Pending",
            "statusState": "Warning",
            "highlight": "Warning",
            "icon": "sap-icon://laptop"
          },
          {
            "name": "PO-12347",
            "description": "Catering for Q2 All Hands",
            "status": "Rejected",
            "statusState": "Error",
            "highlight": "Error",
            "icon": "sap-icon://meal"
          }
        ]
      }
    }
  }
}
```

### List Item Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | string/binding | Main text |
| `description` | string/binding | Secondary text |
| `info.value` | string/binding | Status text (right side) |
| `info.state` | ValueState | Color of info text |
| `highlight` | ValueState | Left border color |
| `icon.src` | string/binding | Icon (sap-icon:// or image URL) |
| `actions` | array | Action buttons |

---

## Table Card

Displays data in a tabular format with column headers.

```json
{
  "_version": "1.14.0",
  "sap.app": {
    "id": "company.project.tablecard",
    "type": "card",
    "title": "Employees",
    "applicationVersion": { "version": "1.0.0" }
  },
  "sap.card": {
    "type": "Table",
    "header": {
      "type": "Default",
      "title": "Team Members",
      "subtitle": "Engineering Department",
      "status": { "text": "4 entries" }
    },
    "content": {
      "data": { "path": "/employees" },
      "row": {
        "columns": [
          { "title": "Name", "value": "{name}" },
          { "title": "Role", "value": "{role}" },
          { "title": "Location", "value": "{location}" },
          {
            "title": "Status",
            "value": "{status}",
            "state": "{statusState}"
          }
        ]
      }
    },
    "data": {
      "json": {
        "employees": [
          { "name": "Alice Chen", "role": "Tech Lead", "location": "Berlin", "status": "Active", "statusState": "Success" },
          { "name": "Bob Mueller", "role": "Developer", "location": "Munich", "status": "Active", "statusState": "Success" },
          { "name": "Carol Smith", "role": "Designer", "location": "London", "status": "On Leave", "statusState": "Warning" },
          { "name": "Dave Park", "role": "Developer", "location": "Seoul", "status": "Active", "statusState": "Success" }
        ]
      }
    }
  }
}
```

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | string | Column header text |
| `value` | string/binding | Cell value |
| `state` | ValueState/binding | Cell text color |
| `icon.src` | string/binding | Show icon instead of text |
| `url` | string/binding | Make cell a link |
| `identifier` | boolean | Bold formatting |
| `progressIndicator` | object | Show progress bar |

---

## Object Card

Displays detailed information about a single entity.

```json
{
  "_version": "1.14.0",
  "sap.app": {
    "id": "company.project.objectcard",
    "type": "card",
    "title": "Employee Details",
    "applicationVersion": { "version": "1.0.0" }
  },
  "sap.card": {
    "type": "Object",
    "header": {
      "type": "Default",
      "title": "{/employee/name}",
      "subtitle": "{/employee/title}",
      "icon": { "src": "{/employee/photo}" }
    },
    "content": {
      "groups": [
        {
          "title": "Contact",
          "items": [
            { "label": "Email", "value": "{/employee/email}" },
            { "label": "Phone", "value": "{/employee/phone}" },
            { "label": "Office", "value": "{/employee/office}" }
          ]
        },
        {
          "title": "Organization",
          "items": [
            { "label": "Department", "value": "{/employee/department}" },
            { "label": "Manager", "value": "{/employee/manager}" },
            { "label": "Cost Center", "value": "{/employee/costCenter}" }
          ]
        }
      ]
    },
    "data": {
      "json": {
        "employee": {
          "name": "Alice Chen",
          "title": "Senior Software Engineer",
          "photo": "sap-icon://person-placeholder",
          "email": "alice.chen@company.com",
          "phone": "+49 30 1234567",
          "office": "Berlin HQ, Room 4.12",
          "department": "Platform Engineering",
          "manager": "Thomas Weber",
          "costCenter": "CC-4010"
        }
      }
    }
  }
}
```

### Group Item Properties

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | Field label |
| `value` | string/binding | Field value |
| `type` | string | "link", "email", "phone" for special formatting |
| `url` | string/binding | Makes value a clickable link |
| `icon.src` | string/binding | Icon next to value |
| `state` | ValueState | Color of the value |

---

## Analytical Card

Displays KPIs with optional charts (Line, Bar, Donut, StackedBar, StackedColumn).

```json
{
  "_version": "1.14.0",
  "sap.app": {
    "id": "company.project.analyticalcard",
    "type": "card",
    "title": "Revenue Analytics",
    "applicationVersion": { "version": "1.0.0" }
  },
  "sap.card": {
    "type": "Analytical",
    "header": {
      "type": "Numeric",
      "title": "Revenue",
      "subtitle": "Q1 2024",
      "unitOfMeasurement": "EUR",
      "mainIndicator": {
        "number": "{/kpi/revenue}",
        "unit": "K",
        "trend": "{/kpi/trend}",
        "state": "{/kpi/state}"
      },
      "sideIndicators": [
        { "title": "Target", "number": "{/kpi/target}", "unit": "K" },
        { "title": "Deviation", "number": "{/kpi/deviation}", "unit": "%" }
      ]
    },
    "content": {
      "chartType": "Line",
      "legend": { "visible": true },
      "plotArea": { "dataLabel": { "visible": true } },
      "dimensions": [
        { "name": "Month", "value": "{Month}" }
      ],
      "measures": [
        { "name": "Revenue", "value": "{Revenue}" }
      ],
      "feeds": [
        { "uid": "categoryAxis", "type": "Dimension", "values": ["Month"] },
        { "uid": "valueAxis", "type": "Measure", "values": ["Revenue"] }
      ]
    },
    "data": {
      "json": {
        "kpi": {
          "revenue": "127.5",
          "target": "150",
          "deviation": "-15",
          "trend": "Down",
          "state": "Critical"
        },
        "chartData": [
          { "Month": "Jan", "Revenue": 85 },
          { "Month": "Feb", "Revenue": 102 },
          { "Month": "Mar", "Revenue": 127.5 }
        ]
      }
    }
  }
}
```

### Chart Types

| Type | Use When |
|------|----------|
| `Line` | Trends over time |
| `Bar` | Comparing categories |
| `StackedBar` | Category breakdown |
| `StackedColumn` | Stacked vertical bars |
| `Donut` | Part-of-whole |

### Numeric Header Properties

| Property | Description |
|----------|-------------|
| `mainIndicator.number` | The big KPI number |
| `mainIndicator.unit` | Unit label (K, %, EUR) |
| `mainIndicator.trend` | `"Up"`, `"Down"`, `"None"` |
| `mainIndicator.state` | `"Good"`, `"Critical"`, `"Error"`, `"Neutral"` |
| `sideIndicators` | Array of { title, number, unit } |
| `unitOfMeasurement` | Top-level unit label |

---

## Common Patterns

### Actions (Navigation)

```json
"actions": [
  {
    "type": "Navigation",
    "parameters": {
      "url": "https://app.example.com/details/{id}"
    }
  }
]
```

### Filters (in configuration)

```json
"configuration": {
  "filters": {
    "status": {
      "type": "Select",
      "label": "Status",
      "items": [
        { "title": "All", "key": "all" },
        { "title": "Open", "key": "open" },
        { "title": "Closed", "key": "closed" }
      ]
    }
  }
}
```

### Value States

Used for `state`, `highlight`, `infoState`:
- `"Success"` — green
- `"Error"` — red
- `"Warning"` — orange
- `"Information"` — blue
- `"None"` — neutral/default

### SAP Icons

Common icons: `sap-icon://sales-order`, `sap-icon://cart`, `sap-icon://person-placeholder`, `sap-icon://laptop`, `sap-icon://accept`, `sap-icon://decline`, `sap-icon://warning`, `sap-icon://activity-items`, `sap-icon://calendar`.

Full list: https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html
