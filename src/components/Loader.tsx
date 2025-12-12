import { useEffect, useState } from "react";

const Loader = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 2) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        {/* Outer rotating ring */}
        <div
          className="w-24 h-24 border-4 border-muted rounded-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            borderTopColor: "hsl(var(--primary))",
            borderRightColor: "hsl(var(--accent))",
          }}
        />
        
        {/* Inner rotating ring */}
        <div
          className="absolute inset-3 border-4 border-muted rounded-full"
          style={{
            transform: `rotate(${-rotation * 1.5}deg)`,
            borderBottomColor: "hsl(var(--accent))",
            borderLeftColor: "hsl(var(--primary))",
          }}
        />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-primary rounded-full shadow-glow" />
        </div>
        
        {/* Animated dots */}
        <div className="absolute -inset-8 flex items-center justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-accent rounded-full"
              style={{
                transform: `rotate(${rotation + i * 90}deg) translateY(-40px)`,
                opacity: 0.6 + Math.sin((rotation + i * 90) * Math.PI / 180) * 0.4,
              }}
            />
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Loader;
