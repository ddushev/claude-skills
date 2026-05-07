#!/usr/bin/env node

/**
 * UI5 Integration Card manifest.json validator.
 * Usage: node validate-manifest.mjs <path-to-manifest.json>
 * Exit code 0 = valid, 1 = errors found.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const VALID_CARD_TYPES = [
  "List", "Table", "Object", "Analytical",
  "Component", "AdaptiveCard", "AnalyticsCloud", "WebPage"
];

const VALID_HEADER_TYPES = ["Default", "Numeric"];
const VALID_VALUE_STATES = ["Success", "Error", "Warning", "Information", "None", "Neutral"];

function validate(manifest) {
  const errors = [];
  const warnings = [];

  // Top-level structure
  if (!manifest["sap.app"]) {
    errors.push("Missing required namespace 'sap.app'");
  } else {
    const app = manifest["sap.app"];
    if (!app.id) errors.push("sap.app.id is required");
    else if (!/^[a-zA-Z][\w.]*$/.test(app.id)) {
      warnings.push(`sap.app.id '${app.id}' should use reverse-domain notation (e.g., company.project.card)`);
    }
    if (app.type && app.type !== "card") {
      errors.push(`sap.app.type must be 'card', got '${app.type}'`);
    }
    if (!app.type) warnings.push("sap.app.type should be set to 'card'");
  }

  if (!manifest["sap.card"]) {
    errors.push("Missing required namespace 'sap.card'");
    return { errors, warnings };
  }

  const card = manifest["sap.card"];

  // Card type
  if (!card.type) {
    errors.push("sap.card.type is required");
  } else if (!VALID_CARD_TYPES.includes(card.type)) {
    errors.push(`Invalid card type '${card.type}'. Valid types: ${VALID_CARD_TYPES.join(", ")}`);
  }

  // Header
  if (!card.header) {
    errors.push("sap.card.header is required");
  } else {
    const header = card.header;
    if (header.type && !VALID_HEADER_TYPES.includes(header.type)) {
      errors.push(`Invalid header type '${header.type}'. Valid types: ${VALID_HEADER_TYPES.join(", ")}`);
    }
    if (!header.title) {
      warnings.push("Header title is recommended — cards without titles look incomplete");
    }
    if (header.type === "Numeric") {
      if (!header.mainIndicator) {
        warnings.push("Numeric headers typically have a mainIndicator with number/unit/trend/state");
      }
    }
  }

  // Content validation per card type
  if (card.type && card.content) {
    validateContent(card.type, card.content, errors, warnings);
  } else if (card.type && !card.content && card.type !== "Component") {
    warnings.push(`sap.card.content is missing — most ${card.type} cards need content configuration`);
  }

  // Data validation
  if (card.data) {
    validateData(card.data, errors, warnings);
  }

  // Check for common binding mistakes
  checkBindings(card, warnings);

  return { errors, warnings };
}

function validateContent(type, content, errors, warnings) {
  switch (type) {
    case "List":
      if (!content.item) {
        errors.push("List card content must have an 'item' property defining the item template");
      } else if (!content.item.title) {
        warnings.push("List item should have a 'title' binding");
      }
      break;

    case "Table":
      if (!content.row) {
        errors.push("Table card content must have a 'row' property");
      } else if (!content.row.columns || !Array.isArray(content.row.columns) || content.row.columns.length === 0) {
        errors.push("Table card must define at least one column in content.row.columns");
      }
      break;

    case "Object":
      if (!content.groups || !Array.isArray(content.groups) || content.groups.length === 0) {
        warnings.push("Object card should define at least one group in content.groups");
      }
      break;

    case "Analytical":
      if (!content.chartType) {
        errors.push("Analytical card content must specify 'chartType' (Line, Bar, Donut, StackedBar, etc.)");
      }
      if (!content.measures || !Array.isArray(content.measures) || content.measures.length === 0) {
        errors.push("Analytical card must define at least one measure");
      }
      if (!content.dimensions || !Array.isArray(content.dimensions) || content.dimensions.length === 0) {
        errors.push("Analytical card must define at least one dimension");
      }
      break;

    case "Timeline":
    case "Calendar":
      break;
  }
}

function validateData(data, errors, warnings) {
  if (data.request) {
    if (!data.request.url) {
      errors.push("Data request must have a 'url' property");
    }
  } else if (data.json === undefined) {
    warnings.push("sap.card.data should contain either 'json' (static) or 'request' (dynamic)");
  }
}

function checkBindings(card, warnings) {
  const json = JSON.stringify(card);

  // Check for common binding mistakes
  const badBindings = json.match(/"\{[^}"]*\{[^}"]*\}"/g);
  if (badBindings) {
    warnings.push("Possible nested binding detected — bindings should be simple like \"{fieldName}\" not nested");
  }

  // Check for absolute paths in content bindings when data.path is set
  if (card.content?.data?.path) {
    const contentStr = JSON.stringify(card.content);
    const absoluteBindings = contentStr.match(/"\{\/[^}]+\}"/g);
    if (absoluteBindings) {
      warnings.push(
        `Content has data.path set to '${card.content.data.path}' but uses absolute bindings (starting with /). ` +
        `Bindings in content items should be relative, e.g., '{name}' not '{/items/0/name}'`
      );
    }
  }
}

// --- CLI ---
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node validate-manifest.mjs <path-to-manifest.json>");
  process.exit(1);
}

const filePath = resolve(args[0]);
let manifest;

try {
  const raw = readFileSync(filePath, "utf-8");
  manifest = JSON.parse(raw);
} catch (e) {
  console.error(`Failed to read/parse ${filePath}: ${e.message}`);
  process.exit(1);
}

const { errors, warnings } = validate(manifest);

if (errors.length === 0 && warnings.length === 0) {
  console.log("✓ Manifest is valid — no errors or warnings.");
  process.exit(0);
}

if (warnings.length > 0) {
  console.log(`\n⚠ Warnings (${warnings.length}):`);
  warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
}

if (errors.length > 0) {
  console.log(`\n✗ Errors (${errors.length}):`);
  errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  process.exit(1);
}

console.log("\n✓ No errors. Warnings above are informational.");
process.exit(0);
