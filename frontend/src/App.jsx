import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewAnalysis from "./pages/NewAnalysis";
import DiagnosisValidation from "./pages/DiagnosisValidation";
import Transactions from "./pages/Transactions";
import Encounters from "./pages/Encounters";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import MasterICD10 from "./pages/MasterICD10";
import MasterINACBG from "./pages/MasterINACBG";
import NotFound from "./pages/NotFound";

import MainLayout from "./layouts/MainLayout";

function App() {
    return (
        <Routes>

            {/* Login tanpa Sidebar */}
            <Route path="/" element={<Login />} />

            {/* Semua halaman memakai Layout */}
            <Route
                path="/dashboard"
                element={
                    <MainLayout>
                        <Dashboard />
                    </MainLayout>
                }
            />

            <Route
                path="/analysis"
                element={
                    <MainLayout>
                        <NewAnalysis />
                    </MainLayout>
                }
            />

            <Route
                path="/diagnosis"
                element={
                    <MainLayout>
                        <DiagnosisValidation />
                    </MainLayout>
                }
            />

            <Route
                path="/transactions"
                element={
                    <MainLayout>
                        <Transactions />
                    </MainLayout>
                }
            />

            <Route
                path="/encounters"
                element={
                    <MainLayout>
                        <Encounters />
                    </MainLayout>
                }
            />

            <Route
                path="/settings"
                element={
                    <MainLayout>
                        <Settings />
                    </MainLayout>
                }
            />

            <Route
                path="/users"
                element={
                    <MainLayout>
                        <Users />
                    </MainLayout>
                }
            />

            <Route
                path="/master/icd10"
                element={
                    <MainLayout>
                        <MasterICD10 />
                    </MainLayout>
                }
            />

            <Route
                path="/master/inacbg"
                element={
                    <MainLayout>
                        <MasterINACBG />
                    </MainLayout>
                }
            />

            <Route path="*" element={<NotFound />} />

        </Routes>
    );
}

export default App;