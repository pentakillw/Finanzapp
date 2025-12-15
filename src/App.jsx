import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import CalendarPage from './pages/CalendarPage';
import Debts from './pages/Debts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import RequireAuth from './components/RequireAuth';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function App() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RequireAuth />}> 
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="debts" element={<Debts />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </ThemeProvider>
  );
}

export default App;
