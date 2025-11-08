import React from 'react';

interface GraphProps {
  data: { month: string; total: number }[];
}

const Graph: React.FC<GraphProps> = ({ data }) => {
    if (data.length < 2) {
        return <div className="p-4 text-center text-gray-400">No hay suficientes datos para mostrar la gráfica. Se necesitan al menos 2 meses con gastos.</div>;
    }

    const width = 350;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxVal = Math.max(...data.map(d => d.total));
    const yAxisTicks = 4;

    const points = data.map((d, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartWidth,
        y: padding.top + chartHeight - (d.total / maxVal) * chartHeight,
        month: new Date(`${d.month}-02`).toLocaleDateString('es-ES', { month: 'short' }),
        total: d.total
    }));

    // Catmull-Rom to Bezier path for smooth curve
    const tension = 0.5;
    const pathD = points.map((p, i) => {
        if (i === 0) return `M ${p.x},${p.y}`;
        const p0 = points[i > 1 ? i - 2 : 0];
        const p1 = points[i - 1];
        const p2 = p;
        const p3 = points[i < points.length - 1 ? i + 1 : points.length - 1];
        const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
        const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
        const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
        const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;
        return `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }).join(' ');

    const lastPoint = points[points.length-1];

    return (
        <div className="p-4 flex flex-col items-center">
            <div className="w-full max-w-sm">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#818cf8" />
                             <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                    </defs>
                    
                    {/* Y-Axis Labels & Grid lines */}
                    {Array.from({ length: yAxisTicks + 1 }).map((_, i) => {
                        const value = maxVal * (i / yAxisTicks);
                        const yPos = padding.top + chartHeight - (chartHeight * (i / yAxisTicks));
                        return (
                            <g key={i}>
                                <text
                                    x={padding.left - 8}
                                    y={yPos + 4}
                                    textAnchor="end"
                                    className="text-xs fill-current text-gray-400"
                                >
                                    {value.toFixed(0)}
                                </text>
                                <line
                                    x1={padding.left} y1={yPos}
                                    x2={width - padding.right} y2={yPos}
                                    className="stroke-current text-slate-800/50"
                                    strokeWidth="1" strokeDasharray="2,3"
                                />
                            </g>
                        );
                    })}

                    {/* X-Axis Labels */}
                    {points.map((p, i) => (
                        <text
                            key={i}
                            x={p.x}
                            y={height - padding.bottom + 15}
                            textAnchor="middle"
                            className="text-xs fill-current text-gray-400 capitalize"
                        >
                            {p.month}
                        </text>
                    ))}


                    {/* Line Path */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    
                    {/* Final point handle */}
                    <circle cx={lastPoint.x} cy={lastPoint.y} r="6" fill="white" />
                    <circle cx={lastPoint.x} cy={lastPoint.y} r="10" fill="white" fillOpacity="0.3" />
                </svg>
            </div>
        </div>
    );
};

export default Graph;