import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Share2, Download, X, Sparkles, Trophy, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalization } from '@/hooks/useLocalization';
import html2canvas from 'html2canvas';

interface VictoryData {
  amount: number;
  multiplier: number;
  symbols: string[];
  playerName: string;
  level: number;
  timestamp: Date;
}

interface VictorySharingProps {
  victory: VictoryData | null;
  onClose: () => void;
  gameScreenshot?: string;
}

export const VictorySharing: React.FC<VictorySharingProps> = ({
  victory,
  onClose,
  gameScreenshot
}) => {
  const { formatCurrency, formatNumber, getExpression, symbols } = useLocalization();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const victoryCardRef = useRef<HTMLDivElement>(null);

  const generateVictoryImage = useCallback(async () => {
    if (!victoryCardRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(victoryCardRef.current, {
        backgroundColor: '#0a0f1a',
        scale: 2,
        width: 800,
        height: 600,
        useCORS: true
      });
      
      const imageData = canvas.toDataURL('image/png');
      setGeneratedImage(imageData);
      
      toast.success('📸 Imagem gerada! Pronta para compartilhar.');
    } catch (error) {
      console.error('Error generating victory image:', error);
      toast.error('Erro ao gerar imagem da vitória');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const shareVictory = useCallback(async () => {
    if (!victory) return;

    const shareText = `🎰 ${getExpression('celebration')} Acabei de ganhar ${formatCurrency(victory.amount)} no Zodiac Fortune! ${symbols.luck.sparkles} Multiplicador ${victory.multiplier}x! Jogue você também: `;
    const shareUrl = 'https://zodiacfortune.app';

    try {
      if (navigator.share && generatedImage) {
        // Convert base64 to blob for native sharing
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], 'victory.png', { type: 'image/png' });

        await navigator.share({
          title: 'Zodiac Fortune - Grande Vitória!',
          text: shareText,
          url: shareUrl,
          files: [file]
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Zodiac Fortune - Grande Vitória!',
          text: shareText,
          url: shareUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success('📋 Texto copiado! Cole no WhatsApp, Instagram ou Facebook.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
      window.open(whatsappUrl, '_blank');
    }
  }, [victory, formatCurrency, getExpression, symbols, generatedImage]);

  const downloadImage = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `zodiac-fortune-victory-${Date.now()}.png`;
    link.click();
    
    toast.success('💾 Imagem salva nos Downloads!');
  }, [generatedImage]);

  const shareToSocial = useCallback((platform: 'whatsapp' | 'instagram' | 'facebook') => {
    if (!victory) return;

    const shareText = `🎰 Grande vitória no Zodiac Fortune! ${formatCurrency(victory.amount)} com multiplicador ${victory.multiplier}x! ${symbols.luck.fire}`;
    const shareUrl = 'https://zodiacfortune.app';

    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    };

    if (platform === 'instagram') {
      toast.info('📸 Para Instagram: Salve a imagem e poste no seu Stories!');
      if (generatedImage) downloadImage();
    } else {
      window.open(urls[platform], '_blank');
    }
  }, [victory, formatCurrency, symbols, generatedImage, downloadImage]);

  if (!victory) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-fortune-gold/20 to-fortune-ember/20 border-fortune-gold/50 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6 space-y-6">
          {/* Victory Card for Screenshot */}
          <div 
            ref={victoryCardRef}
            className="bg-gradient-to-br from-fortune-gold/30 to-fortune-ember/30 p-8 rounded-xl border-2 border-fortune-gold/50 text-center space-y-4"
            style={{ width: '400px', height: '300px', margin: '0 auto' }}
          >
            <div className="flex justify-center space-x-2 text-4xl mb-4">
              {victory.symbols.map((symbol, i) => (
                <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                  {symbol}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <Badge className="bg-fortune-gold/30 text-fortune-gold border-fortune-gold/50 text-sm">
                GRANDE VITÓRIA!
              </Badge>
              <h3 className="text-4xl font-bold text-fortune-gold animate-glow-pulse">
                {formatCurrency(victory.amount)}
              </h3>
              <p className="text-lg text-fortune-ember font-semibold">
                Multiplicador {victory.multiplier}x {symbols.luck.lightning}
              </p>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-fortune-gold/30">
              <p className="text-sm text-fortune-gold font-medium">
                {victory.playerName} • Nível {victory.level}
              </p>
              <p className="text-xs text-muted-foreground">
                Zodiac Fortune Slot
              </p>
            </div>

            <div className="flex justify-center space-x-4 text-2xl">
              <Sparkles className="w-6 h-6 text-fortune-gold animate-pulse" />
              <Trophy className="w-6 h-6 text-fortune-ember animate-bounce" />
              <Coins className="w-6 h-6 text-fortune-gold animate-pulse" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {!generatedImage ? (
              <Button
                onClick={generateVictoryImage}
                disabled={isGenerating}
                className="w-full bg-gradient-gold hover:scale-105 transform transition-all"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isGenerating ? 'Gerando Imagem...' : 'Gerar Imagem da Vitória'}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={shareVictory}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  className="border-fortune-gold/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            )}

            {/* Social Media Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => shareToSocial('whatsapp')}
                variant="outline"
                size="sm"
                className="text-xs border-green-500/30 hover:bg-green-500/10"
              >
                📱 WhatsApp
              </Button>
              <Button
                onClick={() => shareToSocial('instagram')}
                variant="outline"
                size="sm"
                className="text-xs border-pink-500/30 hover:bg-pink-500/10"
              >
                📸 Instagram
              </Button>
              <Button
                onClick={() => shareToSocial('facebook')}
                variant="outline"
                size="sm"
                className="text-xs border-blue-500/30 hover:bg-blue-500/10"
              >
                📘 Facebook
              </Button>
            </div>

            {/* Pre-formatted Messages */}
            <Card className="p-3 bg-card/50 border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">Mensagem sugerida:</p>
              <p className="text-sm text-primary font-medium">
                "🎰 {getExpression('celebration')} Acabei de ganhar {formatCurrency(victory.amount)} no Zodiac Fortune! 
                Multiplicador {victory.multiplier}x! {symbols.luck.sparkles} Jogue você também!"
              </p>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};