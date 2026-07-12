

# PARALIUM V2 - TRUE AGENTIC GAME CREATION SYSTEM

## PURPOSE

PARALIUM is no longer a sequence of predefined steps.

The purpose of PARALIUM V2 is to function as an autonomous game development organization operating inside the platform.

The system should:

* Understand user goals.
* Gather missing information.
* Make planning decisions.
* Generate assets.
* Generate code.
* Test outputs.
* Fix problems.
* Continue operating until a playable prototype exists.

The system must focus on achieving a goal rather than executing a fixed workflow.

---

# CORE PHILOSOPHY

Current System:

User Idea → Questions → Images → Plan → Assets → Code → Test

Problem:

The AI follows predefined rules regardless of project requirements.

Future System:

Goal → Planning → Decision Making → Execution → Evaluation → Adaptation

The AI must decide what needs to happen next.

Not the developer.

---

# PARALIUM BRAIN

Every project must contain a central project brain.

This becomes the source of truth for the entire system.

The brain stores:

* User idea
* Decisions
* Planning outputs
* References
* Asset status
* Coding status
* Error history
* Testing results
* Agent memory
* Project progress

All agents must read from and write to the brain.

No agent should operate independently.

---

# LONG TERM MEMORY

The platform should maintain multiple memory layers.

## User Memory

Stores:

* Design preferences
* Art style preferences
* Preferred game genres
* Previous project decisions

## Project Memory

Stores:

* Current project state
* Previous tasks
* Generated plans
* Generated assets
* Completed systems

## Agent Memory

Stores:

* Previous failures
* Successful fixes
* Reusable solutions
* Learned project context

Memory must survive page refreshes and future sessions.

---

# DISCOVERY AGENT

Current:

Ask predefined questions.

Future:

Determine what information is required.

The discovery agent must:

* Analyze user idea.
* Detect missing information.
* Generate adaptive questions.
* Evaluate confidence level.
* Continue questioning until confidence threshold is reached.

Questions should not be fixed.

Different game genres require different information.

Example:

Racing game:

* Vehicle systems
* Track design
* Physics style

MMORPG:

* Classes
* Progression
* Economy

Puzzle game:

* Core mechanics
* Difficulty curve

The agent decides.

---

# CONFIDENCE ENGINE

Every major decision should have confidence scores.

Examples:

Gameplay confidence:
0-100

UI confidence:
0-100

Asset confidence:
0-100

Narrative confidence:
0-100

When confidence is low:

The system gathers more information.

When confidence is high:

The system proceeds.

This prevents weak assumptions.

---

# REFERENCE RESEARCH AGENT

Current:

Always search three games.

Future:

Determine the best references.

Responsibilities:

* Identify similar games.
* Identify similar mechanics.
* Identify similar art styles.
* Identify similar progression systems.
* Identify similar interfaces.

The agent decides how many references are needed.

Not hardcoded.

---

# DESIGN DISCOVERY SYSTEM

The image reference system remains.

Enhancements:

The system should analyze:

* UI layouts
* Visual hierarchy
* Color usage
* Typography
* Navigation patterns
* Interaction patterns

The user is selecting design direction.

Not merely selecting screenshots.

The selected references become permanent project memory.

---

# DESIGN DNA

After selections are complete:

Generate a Design DNA document.

Contains:

* Color language
* Art direction
* Interface direction
* Camera style
* Animation style
* Environment style
* Character style

All future generations must follow the Design DNA.

This ensures consistency.

---

# PROJECT PLANNING AGENT

After discovery:

Generate:

game-plan.md

The plan must include:

## Vision

Project goals.

## Prototype Scope

Minimum playable experience.

## Core Loop

Player actions.

## Systems

Required systems.

## Assets

Required assets.

## Scenes

Required scenes.

## Technical Requirements

Implementation requirements.

## Risk Analysis

Potential blockers.

## Success Criteria

Definition of completion.

---

# TASK GRAPH SYSTEM

Remove sequential tasks.

Replace with dependency graphs.

Tasks become nodes.

Dependencies become edges.

Example:

Movement System

Weapon System

Enemy AI

Inventory

HUD

Tasks execute based on dependency completion.

Not task numbering.

Benefits:

* Parallel execution
* Better scalability
* Dynamic planning
* Faster generation

---

# EXECUTIVE AGENT

This becomes the manager of the entire project.

Responsibilities:

* Read project state
* Prioritize tasks
* Assign work
* Review outputs
* Update memory
* Schedule next actions

The executive agent never generates code.

It only manages.

Think of it as the project director.

---

# SPECIALIST AGENT SYSTEM

The platform should contain specialized workers.

## Discovery Agent

Requirement gathering.

## Planning Agent

Project planning.

## Research Agent

Reference gathering.

## Design Agent

Visual direction.

## Asset Agent

Asset generation planning.

## Coding Agent

Code generation.

## QA Agent

Testing.

## Debug Agent

Issue resolution.

## Review Agent

Quality control.

Each agent should have a clearly defined responsibility.

---

# PARALLEL EXECUTION ENGINE

The platform must support true parallel execution.

Examples:

Coding tasks running.

Asset tasks running.

Research tasks running.

Testing tasks running.

All simultaneously.

The executive agent manages dependencies.

---

# ASSET ORCHESTRATION SYSTEM

Current:

Generate everything immediately.

Future:

Generate assets when required.

Example:

Prototype stage:

Use placeholders.

Testing stage:

Generate essential assets.

Polish stage:

Generate final assets.

Benefits:

* Lower costs
* Faster iteration
* Faster prototypes

---

# ASSET PIPELINE

Required asset categories:

## Images

Concept art
UI
Icons
Textures

## 3D Models

Characters
Weapons
Props
Environment

## Animation

Character animation
Creature animation
Object animation

## Audio

Music
Sound effects
Voice lines

## Video

Cutscenes
Trailers
Marketing videos

Assets should be generated only when the project requires them.

---

# CODE GENERATION PIPELINE

The coding agent should operate in phases.

Phase 1:

Architecture understanding.

Phase 2:

File structure planning.

Phase 3:

Core systems generation.

Phase 4:

Feature implementation.

Phase 5:

Integration.

Phase 6:

Optimization.

Phase 7:

Testing.

Phase 8:

Refactoring.

The agent should understand the entire project before generating files.

---

# CONTINUOUS TESTING SYSTEM

Testing should occur throughout development.

Not at the end.

The QA agent should verify:

* Build success
* Runtime errors
* Missing assets
* Broken scenes
* Logic issues
* Performance issues

Results are stored in project memory.

---

# SELF HEALING SYSTEM

Errors should not directly trigger fixes.

Instead:

Error

↓

Classification

↓

Root Cause Analysis

↓

Fix Plan

↓

Fix Execution

↓

Retest

↓

Verification

The system should understand why failures occur.

Not simply retry.

---

# FAILURE MEMORY

Store:

* Error type
* Cause
* Resolution
* Time
* Affected files

Future agents can reuse previous fixes.

This improves reliability.

---

# PROJECT STATE MACHINE

Replace workflow states.

Use dynamic project states.

Examples:

Discovery

Research

Planning

Asset Generation

Code Generation

Testing

Optimization

Playable Prototype Ready

The executive agent decides transitions.

---

# REAL TIME TASK CENTER

Sidebar:

Brain

Memory

References

Design DNA

Tasks

Assets

Code

Tests

Logs

Errors

Users should see exactly what the system is doing.

Transparency builds trust.

---

# AGENT COMMUNICATION SYSTEM

Agents must communicate through structured messages.

No agent should directly modify another agent.

All communication passes through the project brain.

Benefits:

* Traceability
* Auditing
* Debugging
* Reliability

---

# SUCCESS DEFINITION

PARALIUM is successful when:

* Game launches successfully.
* Core gameplay loop works.
* Required assets exist.
* Critical errors are resolved.
* Prototype goals are achieved.
* User can immediately play the game.

Completion is measured by results.

Not by number of completed steps.

---

# FUTURE EXPANSION

The architecture must support future agents.

Examples:

Marketing Agent

Store Publishing Agent

Monetization Agent

Multiplayer Agent

Analytics Agent

Player Behavior Agent

Localization Agent

The system should allow new agents to be added without changing the core architecture.

---

# FINAL PRINCIPLE

PARALIUM is not a workflow.

PARALIUM is an autonomous game studio.

Every design decision should be evaluated using a single question:

"Does this make the system better at independently delivering a playable game prototype?"

If the answer is yes, it belongs in PARALIUM.

If the answer is no, it should be reconsidered.
