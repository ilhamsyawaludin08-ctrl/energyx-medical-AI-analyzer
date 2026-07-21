import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
        {
            label: "Approved",
            data: [80, 88, 92, 95, 91, 96],
            backgroundColor: [
                'rgba(37, 99, 235, 0.85)',
                'rgba(37, 99, 235, 0.85)',
                'rgba(37, 99, 235, 0.85)',
                'rgba(37, 99, 235, 0.85)',
                'rgba(37, 99, 235, 0.85)',
                'rgba(37, 99, 235, 0.85)',
            ],
            hoverBackgroundColor: '#2563EB',
            borderRadius: 6,
            borderSkipped: false,
        },
        {
            label: "Rejected",
            data: [20, 12, 8, 5, 9, 4],
            backgroundColor: [
                'rgba(239, 68, 68, 0.85)',
                'rgba(239, 68, 68, 0.85)',
                'rgba(239, 68, 68, 0.85)',
                'rgba(239, 68, 68, 0.85)',
                'rgba(239, 68, 68, 0.85)',
                'rgba(239, 68, 68, 0.85)',
            ],
            hoverBackgroundColor: '#EF4444',
            borderRadius: 6,
            borderSkipped: false,
        },
    ],
};

const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            position: "top",
            align: "end",
            labels: {
                usePointStyle: true,
                pointStyle: 'rectRounded',
                padding: 20,
                font: {
                    size: 13,
                    weight: '600',
                },
                color: '#6b7280',
            },
        },
        tooltip: {
            backgroundColor: '#111827',
            titleFont: {
                size: 13,
                weight: '600',
            },
            bodyFont: {
                size: 12,
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            boxPadding: 4,
            callbacks: {
                label: function (context) {
                    return ` ${context.dataset.label}: ${context.parsed.y} klaim`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                font: {
                    size: 12,
                    weight: '500',
                },
                color: '#9ca3af',
            },
            border: {
                display: false,
            },
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.04)',
                drawBorder: false,
            },
            ticks: {
                font: {
                    size: 12,
                    weight: '500',
                },
                color: '#9ca3af',
                padding: 8,
            },
            border: {
                display: false,
            },
        },
    },
    barPercentage: 0.7,
    categoryPercentage: 0.6,
};

export default function ApprovalChart() {
    return <Bar data={data} options={options} />;
}