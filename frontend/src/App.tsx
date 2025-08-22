import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContractList from './pages/ContractList';
import ContractDetail from './pages/ContractDetail';
import ContractCreate from './pages/ContractCreate';
import Settings from './pages/Settings';
import './App.css';

/**
 * 主应用组件
 * 配置路由和全局状态管理
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* 登录页面 */}
        <Route path="/login" element={<Login />} />
        
        {/* 受保护的路由 */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* 默认重定向到仪表板 */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* 仪表板 */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* 合同管理 */}
          <Route path="contracts" element={<ContractList />} />
          <Route path="contracts/new" element={<ContractCreate />} />
          <Route path="contracts/:id" element={<ContractDetail />} />
          
          {/* 系统设置 */}
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;