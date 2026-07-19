import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import Analysis from "../pages/Analysis";
import Encounter from "../pages/Encounter";
import Validation from "../pages/Validation";
import Transactions from "../pages/Transactions";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-analysis" element={<Analysis />} />
        <Route path="/encounters" element={<Encounter />} />
        <Route path="/validation" element={<Validation />} />
        <Route path="/transactions" element={<Transactions />} />
      </Route>
    </Routes>
  );
}