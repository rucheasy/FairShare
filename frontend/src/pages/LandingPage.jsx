import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text3D, Center, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FloatingShapes = () => {
  const sphereRef = useRef();
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#a855f7" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
        <mesh ref={sphereRef} position={[2, 0, 0]}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshDistortMaterial color="#8b5cf6" attach="material" distort={0.4} speed={2} roughness={0.2} metalness={0.8} />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[-2, 1, -1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.5} />
        </mesh>
      </Float>
    </>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <FloatingShapes />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-purple-300">
            FairShare is here
          </div>
          
          <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
            Split Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              Not Harder.
            </span>
          </h1>
          
          <p className="mb-10 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            The premium expense management platform that makes settling debts with friends effortless, intelligent, and visually stunning.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 text-lg font-semibold text-white transition-all rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.7)]"
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </div>
      
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] top-[-20%] left-[-10%] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] bottom-[-20%] right-[-10%]"></div>
      </div>
    </div>
  );
};

export default LandingPage;
