
import React from 'react';

interface CircularProgressProps {
    percentage: number;
    strokeWidth: number;
    size: number;
    children: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, strokeWidth, size, children }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const angle = (percentage / 100) * 360;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
            >
                 <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                </defs>
                {/* Background Circle */}
                <circle
                    stroke="rgba(255, 255, 255, 0.1)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <g className="-rotate-90 origin-center">
                    <circle
                        stroke="url(#progressGradient)"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    />
                </g>
                 {/* Progress Handle */}
                 <g style={{ transform: `rotate(${angle - 90}deg)`, transformOrigin: 'center center', transition: 'transform 0.5s ease-in-out' }}>
                    <circle
                        cx={size/2 + radius}
                        cy={size/2}
                        r={strokeWidth / 2}
                        fill="white"
                    />
                 </g>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-white">
                {children}
            </div>
        </div>
    );
};

export default CircularProgress;