"use strict";

const vscode = require("vscode");

const MAX_SELECTION = 12000;

function workspaceRoot() {
  const f = vscode.workspace.workspaceFolders;
  return f && f.length ? f[0].uri.fsPath : "";
}

function activeContext() {
  const ed = vscode.window.activeTextEditor;
  const file = ed ? ed.document.uri.fsPath : "(no active editor)";
  let selection = "";
  if (ed && !ed.selection.isEmpty) {
    selection = ed.document.getText(ed.selection);
    if (selection.length > MAX_SELECTION) {
      selection =
        selection.slice(0, MAX_SELECTION) +
        "\n\n… [truncated for clipboard; selection was longer]";
    }
  } else {
    selection = "(none)";
  }
  return { file, selection };
}

function buildPrompt(kind) {
  const root = workspaceRoot() || "(no folder open)";
  const { file, selection } = activeContext();

  const base = `Workspace root: ${root}
Active file: ${file}
Selected text:
---
${selection}
---
`;

  switch (kind) {
    case "coai14":
      return `${base}
Run the **COAI Sovereign Stack** (all 14 agents in COAI order). Apply \`.cursor/skills/coai-sovereign-stack/SKILL.md\` fully — same as slash command \`/coai-suite\`.

Ask me for anything missing: URL or pasted page content, brand, primary service, location, NAP, GBP notes, competitors, site page list (internal links), URL for Core Web Vitals, and recent wins for E-E-A-T.

Do not invent facts; label assessed scores clearly.`;
    case "seo6":
      return `${base}
Run the **SEO Agent Suite** (six agents, entity-first). Apply \`.cursor/skills/seo-agent-suite/SKILL.md\` fully — same as slash command \`/seo-suite\`.

Ask for URL or paste, brand, primary service, location if local, NAP + GBP notes if needed.`;
    case "audit":
      return `${base}
Run a **composite page audit** per \`.cursor/commands/audit-page.md\` — slash \`/audit-page\`.

Use entity-mapper + content-clarity-checker + schema-architect (gaps only). Output the scorecard; scores are assessed unless I provide tool data.`;
    default:
      return base;
  }
}

async function copyPrompt(kind) {
  const text = buildPrompt(kind);
  await vscode.env.clipboard.writeText(text);
  await vscode.window.showInformationMessage(
    "COAI prompt copied. Paste into Cursor Chat (Ctrl/Cmd+L) and send.",
    "OK"
  );
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const bar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  bar.text = "$(list-unordered) COAI";
  bar.tooltip = "COAI / SEO suite — pick workflow and copy prompt for chat";
  bar.command = "poisonwell.coaiPicker";
  bar.show();

  context.subscriptions.push(
    bar,
    vscode.commands.registerCommand("poisonwell.coaiPicker", async () => {
      const pick = await vscode.window.showQuickPick(
        [
          {
            label: "$(rocket) Full COAI suite",
            description: "14 agents · /coai-suite",
            kind: "coai14",
          },
          {
            label: "$(symbol-class) SEO suite (6)",
            description: "Entity-first · /seo-suite",
            kind: "seo6",
          },
          {
            label: "$(search) Audit page",
            description: "Scores + schema gaps · /audit-page",
            kind: "audit",
          },
        ],
        { placeHolder: "Choose workflow — prompt copies to clipboard" }
      );
      if (pick && pick.kind) await copyPrompt(pick.kind);
    }),
    vscode.commands.registerCommand("poisonwell.coaiFull", () =>
      copyPrompt("coai14")
    ),
    vscode.commands.registerCommand("poisonwell.seoSix", () =>
      copyPrompt("seo6")
    ),
    vscode.commands.registerCommand("poisonwell.auditPage", () =>
      copyPrompt("audit")
    )
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
