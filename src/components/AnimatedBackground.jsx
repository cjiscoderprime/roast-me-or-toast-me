import { motion, useReducedMotion } from "motion/react";
import "./AnimatedBackground.css";

const particles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 47 + 13) % 100}%`,
  top: `${(i * 31 + 9) % 100}%`,
  duration: 5 + (i % 5),
  delay: (i % 7) * -1.1,
  size: 2 + (i % 3) * 2,
}));

export default function AnimatedBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="animated-background" aria-hidden="true">
      <div className="ambient-glow glow-one" />
      <div className="ambient-glow glow-two" />

      {!reducedMotion && particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="background-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -32, 0],
            opacity: [0.12, 0.65, 0.12],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}