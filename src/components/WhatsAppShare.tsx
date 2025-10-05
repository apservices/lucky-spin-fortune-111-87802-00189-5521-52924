import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppShareProps {
  winAmount?: number;
  gameType?: string;
}

export const WhatsAppShare: React.FC<WhatsAppShareProps> = ({ 
  winAmount = 0, 
  gameType = 'Fortune Tiger' 
}) => {
  const shareToWhatsApp = () => {
    const text = winAmount > 0
      ? `🐅 Acabei de ganhar ${winAmount.toLocaleString()} moedas no ${gameType}! 🎰✨\n\nJogue você também: ${window.location.origin}`
      : `🎮 Estou jogando ${gameType} - Zodiac Fortune Slots!\n\nVenha se divertir: ${window.location.origin}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    // Open WhatsApp
    window.open(url, '_blank');
    
    toast.success('🎉 Compartilhando vitória!', {
      description: 'Abrindo WhatsApp para compartilhar sua conquista!'
    });
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={shareToWhatsApp}
        className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Compartilhar no WhatsApp
      </Button>
    </motion.div>
  );
};
