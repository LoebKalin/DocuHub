
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { getTranslation } from '../services/i18nService';
import { LayoutDashboard, Users, LogOut, FileText, ChevronRight, Settings } from 'lucide-react';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const handleLangChange = () => setTick(t => t + 1);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  if (!user) return <Outlet />;

  const isAdmin = user.role === UserRole.ADMIN;

  const navItems = isAdmin 
    ? [
        { name: getTranslation('nav_dashboard'), path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: getTranslation('nav_pdf_mgmt'), path: '/admin/upload-pdf', icon: <FileText size={20} /> },
        { name: getTranslation('nav_user_mgmt'), path: '/admin/upload-users', icon: <Users size={20} /> },
      ]
    : [
        { name: getTranslation('nav_my_docs'), path: '/user', icon: <FileText size={20} /> },
      ];

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] overflow-hidden transition-colors duration-300">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-[#2d2a75] dark:bg-[#1e1b4b] text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}>
        <div className="p-8 flex items-center justify-between">
          <div className={`flex items-center space-x-3 truncate ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-white shrink-0 text-xl shadow-lg">D</div>
            {isSidebarOpen && <span className="font-extrabold text-2xl tracking-tight">LDC~Hub</span>}
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 group ${
                  isActive ? 'sidebar-active text-white shadow-lg' : 'text-indigo-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <div className="flex items-center justify-between flex-1 ml-4">
                    <span className="font-bold text-[15px]">{item.name}</span>
                    {isActive && <ChevronRight size={16} className="opacity-80" />}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-6 space-y-2">
           <Link
             to="/settings"
             className={`flex items-center w-full p-4 text-indigo-100 hover:bg-white/10 hover:text-white rounded-2xl transition-all group ${location.pathname === '/settings' ? 'sidebar-active text-white shadow-lg' : ''} ${!isSidebarOpen && 'justify-center'}`}
           >
              <Settings size={20} />
              {isSidebarOpen && <span className="ml-4 font-bold text-[15px]">{getTranslation('nav_settings')}</span>}
           </Link>

           <div className={`bg-white/5 rounded-[28px] p-5 ${!isSidebarOpen && 'hidden'}`}>
              <p className="text-[10px] text-indigo-300 font-bold mb-3 uppercase tracking-wider">{getTranslation('logged_in_as')}</p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-400/20 rounded-xl flex items-center justify-center text-indigo-200">
                  <Users size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-sm text-white truncate leading-none mb-1">{user.id}</p>
                  <p className="text-xs text-indigo-300 font-bold opacity-80">{user.department}</p>
                </div>
              </div>
           </div>

           <button
             onClick={handleLogoutClick}
             className={`flex items-center w-full p-4 text-red-300 hover:bg-red-500/20 hover:text-white rounded-2xl transition-all ${!isSidebarOpen && 'justify-center'}`}
           >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-4 font-black text-[15px]">{getTranslation('nav_logout')}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto transition-colors duration-300">
        <div className="p-10 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
