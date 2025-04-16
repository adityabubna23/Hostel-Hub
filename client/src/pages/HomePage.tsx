import  { useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Function to handle navigation to login page
  const handleGetStarted = () => {
    navigate("/login");
  };

  // Effect to hide the Spline watermark after the component mounts
  useEffect(() => {
    const hideWatermark = () => {
      // Select the watermark element by targeting the specific Spline attribution element
      const watermarkElement = document.querySelector('[data-spline-attribution]');
      if (watermarkElement) {
        (watermarkElement as HTMLElement).style.display = 'none';
      }
    };

    // Set a timeout to ensure the Spline scene has loaded
    const timeoutId = setTimeout(hideWatermark, 1000);
    
    // Cleanup on unmount
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative h-screen w-full bg-gray-100" ref={containerRef}>
      {/* Spline Design */}
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/KfQOL13f4jMEBNuM/scene.splinecode" />
      </div>
      
      {/* Get Started Button - positioned in a way that doesn't interfere with 3D interaction */}
      <div className="absolute bottom-8 right-8 z-10">
        <button
          onClick={handleGetStarted}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}