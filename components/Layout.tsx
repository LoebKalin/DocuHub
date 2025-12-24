
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { LayoutDashboard, FileUp, Users, LogOut, FileText, Menu, X, ChevronRight } from 'lucide-react';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  if (!user) return <Outlet />;

  const isAdmin = user.role === UserRole.ADMIN;

  const navItems = isAdmin 
    ? [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Upload PDFs', path: '/admin/upload-pdf', icon: <FileUp size={20} /> },
        { name: 'Upload Users', path: '/admin/upload-users', icon: <Users size={20} /> },
      ]
    : [
        { name: 'My Documents', path: '/user', icon: <FileText size={20} /> },
      ];

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#2d2a75] text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10 mb-4">
          <div className={`flex items-center space-x-3 truncate ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shrink-0">D</div>
            {isSidebarOpen && <span className="font-bold text-xl tracking-tight">DocuHub</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white/15 text-white shadow-lg' 
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <div className="flex items-center justify-between flex-1 ml-3">
                    <span className="font-medium text-sm">{item.name}</span>
                    {isActive && <ChevronRight size={14} className="opacity-50" />}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section at Bottom */}
        <div className="p-4 mt-auto">
          <div className={`bg-[#3a378c] rounded-2xl p-4 shadow-inner mb-3 overflow-hidden ${!isSidebarOpen && 'p-2'}`}>
            <p className={`text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-2 ${!isSidebarOpen && 'hidden'}`}>Logged in as</p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-400/20 rounded-lg flex items-center justify-center text-indigo-200 shrink-0">
                <Users size={16} />
              </div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate leading-tight">{user.id}</p>
                  <p className="text-[11px] text-indigo-300 font-medium truncate">{user.department}</p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className={`flex items-center w-full p-3 text-red-300 hover:bg-red-500/20 hover:text-white rounded-xl transition-all group ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            {isSidebarOpen && <span className="ml-3 font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
