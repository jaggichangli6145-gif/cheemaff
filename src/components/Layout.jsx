import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#070707] text-gray-100">
      <TopBar />
      <main className="flex-1 pb-24 max-w-6xl w-full mx-auto px-4 pt-4 sm:pt-6">
        {children || <Outlet />}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
