import { PieChart } from 'lucide-react';

interface StoryPieChartProps {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
    title?: string;
}

export function StoryPieChart({ data }: StoryPieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No stories to display</p>
                </div>
            </div>
        );
    }

    let currentAngle = 0;
    const radius = 120;
    const centerX = 150;
    const centerY = 150;

    return (
        <div className="flex items-center justify-center p-6">
            <div className="relative">
                <svg width="300" height="300" className="transform -rotate-90">
                    {data.map((item, index) => {
                        const percentage = item.value / total;
                        const angle = percentage * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;

                        // Calculate path points
                        const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                        const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

                        // Determine if the arc should be greater than 180 degrees
                        const largeArcFlag = angle > 180 ? 1 : 0;

                        const pathData = [
                            `M ${centerX} ${centerY}`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            'Z'
                        ].join(' ');

                        currentAngle += angle;

                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill={item.color}
                                stroke="white"
                                strokeWidth="2"
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                                data-tooltip={`${item.label}: ${item.value} stories (${Math.round(percentage * 100)}%)`}
                            >
                                <title>{`${item.label}: ${item.value} stories (${Math.round(percentage * 100)}%)`}</title>
                            </path>
                        );
                    })}
                </svg>

                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="truncate">{item.label}</span>
                            <span className="text-muted-foreground">({item.value})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
