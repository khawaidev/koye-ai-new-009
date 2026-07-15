# Koye Engine V2 Migration Plan

## Standard Babylon.js Project Architecture + AI Runtime

**Status:** Architecture Proposal

**Priority:** Critical

---

# Objective

Migrate the current Koye scripting runtime from a **custom script engine** into a **standard Babylon.js project architecture** while preserving the AI-powered editing experience.

The final result should satisfy all of the following:

* Generated projects are standard Babylon.js + Vite projects.
* Users can export and run projects anywhere with `npm install` and `npm run dev`.
* AI edits real project files instead of proprietary runtime scripts.
* The editor provides a runtime only for previewing and hot reloading.
* Package installation is managed through an approval workflow.
* Future features (terrain generation, multiplayer, shaders, physics, ECS, etc.) can be added without architectural changes.

---

# High Level Architecture

Current

```
AI

↓

setup(ctx)

↓

GameScriptRunner

↓

Babylon Scene
```

New

```
AI

↓

Standard Babylon Project

↓

Editor Runtime

↓

Vite Dev Server

↓

Browser Preview
```

The editor runtime is NOT part of the exported game.

---

# Design Goals

The project itself should never depend on Koye.

The runtime belongs only to the editor.

The AI should write normal Babylon.js code.

Users should be able to:

```
npm install

npm run dev
```

outside Koye.

---

# New Project Structure

Every project created by Koye should have the following structure.

```
project/

package.json

package-lock.json

vite.config.ts

tsconfig.json

index.html

README.md

public/

assets/

src/

    main.ts

    app.ts

    game/

        world/

        entities/

        systems/

        ui/

        audio/

        effects/

        physics/

        input/

        scenes/

        utilities/

    generated/

    config/

.editor/

    runtime.json

    ai-memory.json

    dependency-requests.json

    build-cache/

.koye/

    project.json

    metadata.json

    conversation.json
```

---

# Runtime Responsibility

The runtime should only provide:

* Live Preview
* Hot Reload
* Error Reporting
* Asset Sync
* Build Monitoring
* AI Integration

The runtime must never own gameplay.

---

# Babylon Runtime

Create a dedicated runtime layer.

```
src/editor-runtime/

    BabylonRuntime.ts

    ProjectLoader.ts

    AssetLoader.ts

    RuntimeLogger.ts

    RuntimeErrors.ts

    RuntimeOverlay.ts

    ModuleReloader.ts

    DependencyManager.ts

    PackageInstaller.ts

    AIBridge.ts

    Sandbox.ts
```

This folder is editor-only.

It is never exported.

---

# Remove Custom Script Runtime

The following concepts should be deprecated.

```
setup(ctx)

start()

destroy()

GameScriptRunner

compileScript()

new Function()

Script Attachments
```

Instead the AI edits actual project files.

Example

```
src/game/player/Player.ts

src/game/world/Terrain.ts

src/game/ui/HUD.ts

src/game/enemies/Goblin.ts
```

---

# AI Coding Target

The AI should now assume it is writing inside a standard Babylon project.

Example

```
src/

main.ts

↓

imports App.ts

↓

App.ts

↓

creates Game

↓

Game creates Scene

↓

Scene loads Player

↓

Player imports Weapon

↓

etc.
```

No proprietary runtime syntax.

---

# Editor Runtime

The runtime loads the project.

```
Project

↓

Compile

↓

Watch Files

↓

Hot Reload

↓

Render
```

The runtime never modifies gameplay.

---

# AI File Editing

Instead of generating one script, the AI edits files.

Example

```
Player.ts

World.ts

Inventory.ts

Enemy.ts

Terrain.ts
```

The planner determines which files need modification.

---

# Package Installation Workflow

The AI is NOT allowed to install packages directly.

Instead it submits a request.

Example

```
{
    "tool": "request_package_install",
    "packages": [
        {
            "name": "simplex-noise",
            "reason": "Procedural terrain generation"
        }
    ]
}
```

---

# Dependency Approval UI

The editor displays:

```
AI wants to install

simplex-noise

Reason

Generate procedural terrain.

[Approve]

[Reject]
```

---

# Approved Packages

If approved

```
DependencyManager

↓

package.json updated

↓

npm install

↓

Restart Dev Server

↓

Refresh Preview
```

---

# Package Detection

Create

```
DependencyScanner.ts
```

Responsibilities

* Parse imports
* Compare package.json
* Detect missing packages
* Create installation requests

Example

```
import SimplexNoise from "simplex-noise"
```

↓

```
Missing package

simplex-noise
```

↓

```
Request Installation
```

---

# Dependency Manager

Create

```
DependencyManager.ts
```

Responsibilities

* Read package.json
* Modify dependencies
* Remove dependencies
* Lock versions
* Detect duplicates
* Generate install requests

---

# Package Installer

Create

```
PackageInstaller.ts
```

Responsibilities

* Execute npm install
* Track progress
* Return logs
* Report failures
* Restart preview

---

# Runtime Validator

Create

```
RuntimeValidator.ts
```

Responsibilities

Reject AI generated code that attempts to

Create Engine

Create Scene

Create duplicate render loop

Access forbidden browser APIs

Modify editor runtime

Read outside project

Execute unsafe code

---

# Project File Watcher

Create

```
ProjectWatcher.ts
```

Responsibilities

Watch

```
src/

assets/

package.json

vite.config.ts
```

When files change

↓

Hot Reload

---

# Error System

Create

```
RuntimeErrors.ts
```

Responsibilities

Capture

Build errors

TypeScript errors

Runtime errors

Import failures

Missing assets

Package installation failures

Display them in editor.

---

# Asset Manager

Create

```
AssetManager.ts
```

Responsibilities

Load

Images

GLB

Audio

Video

Fonts

HDR

Textures

Sprites

Materials

---

# Terrain Generation Support

The architecture should support procedural generation.

Create

```
src/game/world/

Terrain.ts

BiomeGenerator.ts

NoiseGenerator.ts

RoadGenerator.ts

RiverGenerator.ts

VegetationGenerator.ts
```

These are standard project files.

---

# AI World Generation Pipeline

Future pipeline

```
Prompt

↓

Research

↓

World Planner

↓

Terrain Planner

↓

Biome Planner

↓

Road Planner

↓

Entity Planner

↓

Code Generator

↓

Babylon Project
```

---

# Runtime API

The runtime exposes editor APIs only.

```
EditorAPI

reload()

highlightFile()

showErrors()

requestPackageInstall()

openAsset()

refreshPreview()
```

Gameplay never depends on these.

---

# File Editing Strategy

Planner

↓

Determine affected files

↓

Generate patch

↓

Apply patch

↓

Type check

↓

Hot reload

↓

Verify

---

# Export

Exported project contains

```
package.json

vite.config.ts

src/

assets/

public/
```

It must NOT contain

```
.editor/

editor-runtime/

AI runtime

Hot reload runtime

Package installer

Conversation history
```

---

# Migration Phases

## Phase 1

Create new Babylon project template.

---

## Phase 2

Create editor runtime.

---

## Phase 3

Implement Dependency Manager.

---

## Phase 4

Implement Package Approval workflow.

---

## Phase 5

Implement Dependency Scanner.

---

## Phase 6

Replace GameScriptRunner with Module Loader.

---

## Phase 7

AI generates standard Babylon project files.

---

## Phase 8

Remove setup(ctx) architecture.

---

## Phase 9

Implement hot reload.

---

## Phase 10

Implement project export.

---

# Success Criteria

A generated project should satisfy all of the following:

✓ Runs with `npm install`

✓ Runs with `npm run dev`

✓ Can be opened in VS Code

✓ Does not require Koye runtime

✓ Uses standard Babylon.js project structure

✓ AI edits project files instead of proprietary scripts

✓ New npm packages require explicit user approval

✓ Approved packages are automatically installed

✓ Missing imports are automatically detected

✓ Hot reload works after code or dependency changes

✓ Build and runtime errors are surfaced in the editor

✓ Projects remain fully portable and editable outside the Koye platform

---

