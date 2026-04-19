'use client'

/**
 * SceneLighting — standard premium lighting rig for R3F scenes.
 * Matches the warm gold + cool blue atmosphere of the homepage hero world.
 *
 * Imports:
 *   <SceneLighting /> — full three-point rig
 *   <SceneLighting minimal /> — ambient + key only (for lightweight scenes)
 */

import { sceneColors } from '@/lib/three-config'

interface SceneLightingProps {
  /** Reduce to ambient + key for performance-sensitive contexts */
  minimal?: boolean
}

export default function SceneLighting({ minimal = false }: SceneLightingProps) {
  return (
    <>
      {/* Ambient — sets floor brightness */}
      <ambientLight
        color={sceneColors.ambient}
        intensity={0.6}
      />

      {/* Key light — cool, from upper-left */}
      <directionalLight
        color={sceneColors.coolKey}
        intensity={1.4}
        position={[-4, 6, 4]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {!minimal && (
        <>
          {/* Fill light — warm gold, from right */}
          <pointLight
            color={sceneColors.warmFill}
            intensity={0.8}
            position={[4, 2, 3]}
            distance={20}
            decay={2}
          />

          {/* Bounce light — warm, below-centre */}
          <pointLight
            color={sceneColors.warmFill}
            intensity={0.3}
            position={[0, -3, 2]}
            distance={12}
            decay={2}
          />

          {/* Rim — cool backlight for silhouette separation */}
          <directionalLight
            color={sceneColors.coolKey}
            intensity={0.5}
            position={[2, -1, -6]}
          />
        </>
      )}
    </>
  )
}
