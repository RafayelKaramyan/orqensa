import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Color, OrthographicCamera } from 'three';
import { furniture, materials, tones, type RoomObject, type Scene } from '../domain/scene';
function Block({
  size,
  position,
  color,
  radius = 0,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  radius?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      {radius ? (
        <cylinderGeometry args={[radius, radius, size[1], 20]} />
      ) : (
        <boxGeometry args={size} />
      )}
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
function ObjectModel({ object, tone }: { object: RoomObject; tone: Scene['tone'] }) {
  const { kind } = object;
  const f = furniture[kind];
  const fabric = tones[tone].fabric;
  return (
    <group
      position={[object.x - 3, 0, object.z - 2.25]}
      rotation={[0, (-object.rotation * Math.PI) / 180, 0]}
    >
      {kind === 'plant' ? (
        <>
          <Block
            size={[0.35, 0.35, 0.35]}
            position={[0, 0.175, 0]}
            color="#b2a28c"
            radius={0.175}
          />
          <mesh position={[0, 0.72, 0]} castShadow>
            <sphereGeometry args={[0.27, 16, 12]} />
            <meshStandardMaterial color="#657951" roughness={1} />
          </mesh>
          <Block size={[0.04, 0.6, 0.04]} position={[0, 0.53, 0]} color="#74644a" />
        </>
      ) : kind === 'sofa' || kind === 'chair' ? (
        <>
          <Block size={[f.width, 0.29, f.depth]} position={[0, 0.245, 0]} color={fabric} />
          <Block
            size={[f.width, 0.3, 0.14]}
            position={[0, 0.54, -f.depth / 2 + 0.07]}
            color={fabric}
          />
          {[-1, 1].map((side) => (
            <Block
              key={side}
              size={[0.13, 0.26, f.depth]}
              position={[side * (f.width / 2 - 0.065), 0.5, 0]}
              color={fabric}
            />
          ))}
        </>
      ) : kind === 'shelf' ? (
        <>
          <Block
            size={[f.width, 0.08, f.depth]}
            position={[0, f.height - 0.04, 0]}
            color="#b5966f"
          />
          <Block size={[f.width, 0.08, f.depth]} position={[0, 0.1, 0]} color="#b5966f" />
          {[-1, 0, 1].map((x) => (
            <Block
              key={x}
              size={[0.045, f.height, f.depth]}
              position={[x * (f.width / 2 - 0.025), f.height / 2, 0]}
              color="#b5966f"
            />
          ))}
        </>
      ) : (
        <>
          <Block
            size={[f.width, 0.07, f.depth]}
            position={[0, f.height - 0.035, 0]}
            color="#c2a27b"
          />
          {[-1, 1].flatMap((x) =>
            [-1, 1].map((z) => (
              <Block
                key={`${x}-${z}`}
                size={[0.055, f.height - 0.07, 0.055]}
                position={[
                  x * (f.width / 2 - 0.09),
                  (f.height - 0.07) / 2,
                  z * (f.depth / 2 - 0.09),
                ]}
                color="#7a705e"
              />
            )),
          )}
        </>
      )}
    </group>
  );
}
function Invalidate({
  scene,
  angle,
  onUnavailable,
}: {
  scene: Scene;
  angle: number;
  onUnavailable: () => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onUnavailable]);
  useEffect(() => {
    const a = (angle * Math.PI) / 180;
    camera.position.set(Math.sin(a) * 8.5, 7.3, Math.cos(a) * 8.5);
    camera.lookAt(0, 0.3, 0);
    if (camera instanceof OrthographicCamera) {
      // eslint-disable-next-line react-hooks/immutability -- Three.js owns this mutable camera; synchronize its projection inside the effect.
      camera.zoom = Math.min(70, size.width / 8.6, size.height / 6.6);
    }
    camera.updateProjectionMatrix();
    invalidate();
  }, [angle, camera, invalidate, size.width, size.height]);
  useEffect(() => invalidate(), [scene, invalidate]);
  return null;
}
export default function ThreeRoom({
  scene,
  angle,
  onUnavailable,
}: {
  scene: Scene;
  angle: number;
  onUnavailable: () => void;
}) {
  const night = scene.light === 'evening';
  return (
    <div
      className="three-room"
      role="img"
      aria-label={`Isometric 3D study of ${scene.title}, ${materials[scene.material].name.toLowerCase()}, ${tones[scene.tone].name.toLowerCase()}, ${scene.light} light. Use the floor plan to arrange furniture.`}
    >
      <Canvas
        orthographic
        camera={{ position: [8, 7, 8], zoom: 55, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        shadows
        gl={{ antialias: true, powerPreference: 'low-power' }}
        onCreated={({ gl, scene: world }) => {
          gl.setClearColor(new Color('#e5e4dc'));
          world.background = new Color('#e5e4dc');
        }}
      >
        <ambientLight intensity={night ? 0.8 : 1.6} />
        <directionalLight
          position={[3, 8, 5]}
          intensity={night ? 1.8 : 2.5}
          color={night ? '#ffd3a0' : '#fff8e9'}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-normalBias={0.03}
        />
        <Block
          size={[6, 0.12, 4.5]}
          position={[0, -0.06, 0]}
          color={materials[scene.material].color}
        />
        <Block size={[6, 1.8, 0.1]} position={[0, 0.9, -2.3]} color={tones[scene.tone].wall} />
        <Block size={[0.1, 1.8, 4.5]} position={[-3.05, 0.9, 0]} color={tones[scene.tone].wall} />
        {scene.material === 'oak' &&
          Array.from({ length: 23 }, (_, i) => (
            <Block
              key={i}
              size={[0.008, 0.003, 4.5]}
              position={[-2.75 + i * 0.25, 0.003, 0]}
              color="#a1835e"
            />
          ))}
        {scene.objects.map((object) => (
          <ObjectModel key={object.id} object={object} tone={scene.tone} />
        ))}
        <Invalidate scene={scene} angle={angle} onUnavailable={onUnavailable} />
      </Canvas>
    </div>
  );
}
