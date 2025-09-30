/**
 * Age Verification System
 * Ensures only users 18+ can access the game
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Shield, Calendar, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgeVerificationProps {
  onVerified: () => void;
}

interface VerificationData {
  birthDate: string;
  confirmed: boolean;
  timestamp: number;
  deviceId: string;
}

export const AgeVerification: React.FC<AgeVerificationProps> = ({ onVerified }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    checkExistingVerification();
  }, []);

  const generateDeviceId = (): string => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };

  const checkExistingVerification = () => {
    const verification = localStorage.getItem('age_verification');
    if (verification) {
      try {
        const data = JSON.parse(verification);
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        // Re-verify every 30 days or if device changed
        if (data.timestamp > thirtyDaysAgo && data.deviceId === generateDeviceId() && data.confirmed) {
          setIsVerified(true);
          onVerified();
          return;
        }
      } catch (error) {
        console.error('Error parsing verification data:', error);
        localStorage.removeItem('age_verification');
      }
    }
  };

  const handleVerification = () => {
    if (!confirmed) {
      return;
    }

    // Save verification
    const verificationData = {
      confirmed: true,
      timestamp: Date.now(),
      deviceId: generateDeviceId()
    };
    
    localStorage.setItem('age_verification', JSON.stringify(verificationData));
    setIsVerified(true);
    onVerified();
  };

  if (isVerified) {
    return null;
  }


  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary mb-4">
              Confirme ter acima de 18 anos
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <Label htmlFor="confirm" className="text-sm leading-relaxed">
                Confirmo que tenho 18 anos ou mais
              </Label>
            </div>

            <Button
              onClick={handleVerification}
              className="w-full"
              size="lg"
              disabled={!confirmed}
            >
              Continuar
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Esta verificação está em conformidade com as leis brasileiras de proteção ao menor
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};