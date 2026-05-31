# Guide for Tripo Auto-Rigging and Animation

## Objective
This guide outlines the pipeline for generating a 3D character, ensuring it is riggable, applying a rig, and generating animations using the Tripo API.

## Tripo Pipeline Steps

### 1. Generation (Text-to-3D or Image-to-3D)
Generate a character in a **T-pose or A-pose**. This is critical for the auto-rigging process to work correctly.
- **Model Version**: Use `v2.5-20250123` or later for best topology.
- **Options**: Ensure you request a bipedal character if you intend to rig it as a human.

### 2. Pre-Rig Check (`animate_prerigcheck`)
Before attempting to rig a model, you MUST check if it is suitable.
- **Task**: `createPreRigCheck({ original_model_task_id: taskId })`
- **Purpose**: This validates if the model topology allows for skeletal rigging. It returns whether the model is `riggable` and what `rig_type` is most suitable (usually `biped`).

### 3. Auto-Rigging (`animate_rig`)
If the pre-rig check passes, apply the rig.
- **Task**: `createRiggingTask({ input_task_id: taskId, rig_type: "biped" })`
- **Output**: This generates a new task ID. The result of this task will be a `.glb` file containing the 3D model bound to a skeletal rig.

### 4. Animation Retargeting (`animate_retarget`)
Once rigged, you can apply animations from Tripo's preset library.
- **Task**: `triggerRetarget(rigTaskId, undefined, ["preset:idle", "preset:walk", "preset:run"])`
- **Presets**: 
  - Basic: `preset:idle`, `preset:walk`, `preset:run`
  - Action: `preset:dive`, `preset:jump`, `preset:slash`, `preset:shoot`, `preset:hurt`, `preset:fall`
- **Output**: This task produces a `.glb` containing the model, rig, and the requested animation clips baked into the file.
- **Best Practices**: You can batch up to 5 animation presets in a single retargeting task by passing them in the `animations` array.

## Workflow Example
1. Call `createTextTo3DTask("A stylized knight in T-pose")` -> gets `modelTaskID`.
2. Wait for completion, then call `createPreRigCheck({ original_model_task_id: modelTaskID })`.
3. If riggable, call `createRiggingTask({ input_task_id: modelTaskID, rig_type: "biped" })` -> gets `rigTaskID`.
4. Wait for completion, then call `triggerRetarget(rigTaskID, undefined, ["preset:idle", "preset:run"])` -> gets `animTaskID`.
5. The final `.glb` from `animTaskID` contains the fully animated character ready for use in Babylon.js.
