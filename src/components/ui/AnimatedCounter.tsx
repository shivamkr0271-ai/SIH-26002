import { useEffect, useState } from 'react';

export default function AnimatedCounter({ value, duration = 1000 }: { value: string, duration?: number }) {
  const [displayValue, setDisplayValue] = useState("0");
  
  useEffect(() => {
    let start = 0;
    const isPercent = value.includes('%');
    const targetValue = parseFloat(value.replace(/,/g, '').replace('%', ''));
    if (isNaN(targetValue)) {
      setDisplayValue(value);
      return;
    }
    
    const startTime = performance.now();
    
    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = targetValue * easeProgress;
      
      let formatted = "";
      if (current % 1 !== 0 || isPercent) {
        formatted = current.toFixed(1);
      } else {
        formatted = Math.floor(current).toString();
      }
      
      // Add back commas and percent
      if (value.includes(',')) {
        formatted = Number(formatted).toLocaleString('en-US');
      }
      if (isPercent) formatted += '%';
      
      setDisplayValue(formatted);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(value);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }, [value, duration]);
  
  return <span>{displayValue}</span>;
}
