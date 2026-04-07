# Poisonwell COAI Launcher

Adds a **status bar button** `COAI` (bottom-right) and **Command Palette** actions that **copy a ready-made audit prompt** (with workspace path, active file, and selection) so you can paste into **Cursor Chat**.

Cursor does not expose a public API to inject text into Chat automatically; clipboard + paste is the reliable pattern.

## Install (one time)

1. Open this repo in Cursor.
2. `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (macOS).
3. Run **Extensions: Install from Location…** (or **Developer: Install Extension from Location…** depending on version).
4. Select the folder: `extensions/poisonwell-coai-launcher`.
5. Reload the window if prompted.

## Use

- **Status bar:** click **`COAI`** → pick Full COAI (14), SEO suite (6), or Audit page → prompt is copied → **paste into Chat** (`Ctrl/Cmd+L`) and send.
- **Command Palette:** search **`COAI:`** for direct copy (no picker).

## Uninstall

Extensions view → find **Poisonwell COAI Launcher** → Uninstall.
