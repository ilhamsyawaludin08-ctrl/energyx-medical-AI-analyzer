import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
    return (
        <div className="d-flex">

            <Sidebar />

            <div
                className="flex-grow-1"
                style={{
                    minHeight: "100vh",
                    background: "#f8fafc"
                }}
            >
                <Navbar />

                <div className="p-4">

                    {children}

                </div>

            </div>

        </div>
    );
}