import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
    return (
        <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
            {/* Frozen Left Sidebar */}
            <div style={{ height: "100vh", flexShrink: 0 }}>
                <Sidebar />
            </div>

            {/* Right Pane: Header (Frozen) + Scrollable Main Content */}
            <div
                className="d-flex flex-column flex-grow-1"
                style={{
                    height: "100vh",
                    background: "var(--sc-bg)",
                    overflow: "hidden"
                }}
            >
                {/* Frozen Top Navbar */}
                <Navbar />

                {/* Independent Scrollable Content Area */}
                <div className="flex-grow-1 p-4 sc-animate-in" style={{ overflowY: "auto" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}