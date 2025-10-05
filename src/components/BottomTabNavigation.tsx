import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Wallet, Gift, User, Sparkles } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string | number;
}

const tabs: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'wallet', label: 'Carteira', icon: Wallet, path: '/coin-store' },
  { id: 'bonus', label: 'Bônus', icon: Gift, path: '/daily-rewards', badge: '!' },
  { id: 'profile', label: 'Perfil', icon: User, path: '/settings' }
];

export const BottomTabNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-xl border-t border-fortune-gold/20 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all"
                whileTap={{ scale: 0.9 }}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-fortune-gold/20 to-fortune-ember/20 rounded-2xl"
                    transition={{ type: 'spring', damping: 20 }}
                  />
                )}
                
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 transition-all ${
                      active 
                        ? 'text-fortune-gold drop-shadow-[0_0_8px_hsl(var(--fortune-gold))]' 
                        : 'text-gray-400'
                    }`}
                  />
                  {tab.badge && (
                    <motion.span 
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {tab.badge}
                    </motion.span>
                  )}
                </div>
                
                <span className={`text-xs font-medium transition-colors ${
                  active ? 'text-fortune-gold' : 'text-gray-400'
                }`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};
