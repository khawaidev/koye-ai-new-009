/**
 * Snapshot Manager
 * 
 * Saves and restores Babylon.js scene state so the editor can
 * revert to the pre-play state when Stop is pressed.
 */

import type { Scene } from "@babylonjs/core"

export interface SceneSnapshot {
  meshStates: Map<string, {
    positionX: number
    positionY: number
    positionZ: number
    rotationX: number
    rotationY: number
    rotationZ: number
    scalingX: number
    scalingY: number
    scalingZ: number
    isVisible: boolean
  }>
}

export class SnapshotManager {
  /** Capture the current transform of every mesh in the scene */
  take(scene: Scene): SceneSnapshot {
    const meshStates = new Map<string, SceneSnapshot["meshStates"] extends Map<string, infer V> ? V : never>()

    for (const mesh of scene.meshes) {
      meshStates.set(mesh.id, {
        positionX: mesh.position.x,
        positionY: mesh.position.y,
        positionZ: mesh.position.z,
        rotationX: mesh.rotation.x,
        rotationY: mesh.rotation.y,
        rotationZ: mesh.rotation.z,
        scalingX: mesh.scaling.x,
        scalingY: mesh.scaling.y,
        scalingZ: mesh.scaling.z,
        isVisible: mesh.isVisible,
      })
    }

    return { meshStates }
  }

  /** Restore mesh transforms from a snapshot */
  restore(scene: Scene, snapshot: SceneSnapshot) {
    for (const mesh of scene.meshes) {
      const saved = snapshot.meshStates.get(mesh.id)
      if (saved) {
        mesh.position.set(saved.positionX, saved.positionY, saved.positionZ)
        mesh.rotation.set(saved.rotationX, saved.rotationY, saved.rotationZ)
        mesh.scaling.set(saved.scalingX, saved.scalingY, saved.scalingZ)
        mesh.isVisible = saved.isVisible
      }
    }
  }
}
