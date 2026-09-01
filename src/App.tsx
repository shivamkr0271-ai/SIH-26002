/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/layout/Layout';
import CommandCenter from './pages/CommandCenter';
import MapPage from './pages/MapPage';
import RouteIntelligence from './pages/RouteIntelligence';
import FleetTracking from './pages/FleetTracking';
import Alerts from './pages/Alerts';
import SupplyChain from './pages/SupplyChain';
import FieldReports from './pages/FieldReports';
import Districts from './pages/Districts';
import Analytics from './pages/Analytics';
import AiAssistant from './pages/AiAssistant';
import Login from './pages/Login';
import Settings from './pages/Settings';

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<CommandCenter />} />
          <Route path="map" element={<MapPage />} />
          <Route path="route" element={<RouteIntelligence />} />
          <Route path="route-intelligence" element={<RouteIntelligence />} />
          <Route path="fleet" element={<FleetTracking />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="supply" element={<SupplyChain />} />
          <Route path="reports" element={<FieldReports />} />
          <Route path="districts" element={<Districts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai" element={<AiAssistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

