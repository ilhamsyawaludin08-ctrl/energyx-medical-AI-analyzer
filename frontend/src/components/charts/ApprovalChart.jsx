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
        },
        {
            label: "Rejected",
            data: [20, 12, 8, 5, 9, 4],
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top",
        },
    },
};

export default function ApprovalChart() {
    return <Bar data={data} options={options} />;
}