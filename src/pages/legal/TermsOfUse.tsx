/**
 * Terms of Use Page
 * Legal document specific to recreational gaming
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scale, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfUse: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center mb-6"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <Scale className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Termos de Uso</h1>
              <p className="text-muted-foreground">Zodiac Fortune - Jogo Recreativo</p>
            </div>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-6 border-primary bg-primary/5">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-primary mb-2">
                  AVISO IMPORTANTE - JOGO RECREATIVO
                </h3>
                <p className="text-sm text-foreground">
                  Este aplicativo é um jogo de entretenimento recreativo que utiliza apenas 
                  moedas virtuais sem qualquer valor monetário real. NÃO é um jogo de apostas 
                  com dinheiro real e NÃO oferece a possibilidade de ganhar dinheiro real ou 
                  prêmios do mundo real.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Terms Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">1. NATUREZA RECREATIVA</h2>
            <div className="space-y-3 text-sm">
              <p>
                1.1. O Zodiac Fortune é um jogo de entretenimento digital que simula 
                máquinas caça-níqueis tradicionais usando apenas moedas virtuais.
              </p>
              <p>
                1.2. As "moedas virtuais" utilizadas no jogo NÃO possuem valor monetário 
                real e não podem ser convertidas, trocadas ou vendidas por dinheiro real.
              </p>
              <p>
                1.3. O jogo destina-se exclusivamente ao entretenimento e não constitui 
                qualquer forma de jogo de apostas com dinheiro real.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">2. RESTRIÇÃO ETÁRIA</h2>
            <div className="space-y-3 text-sm">
              <p>
                2.1. Este aplicativo é destinado APENAS para maiores de 18 anos.
              </p>
              <p>
                2.2. O usuário declara e garante que possui idade mínima de 18 anos 
                completos na data de acesso ao aplicativo.
              </p>
              <p>
                2.3. Menores de idade são PROIBIDOS de usar este aplicativo, mesmo 
                que seja recreativo.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">3. MOEDAS VIRTUAIS</h2>
            <div className="space-y-3 text-sm">
              <p>
                3.1. As moedas virtuais são fornecidas gratuitamente através de:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Bônus diários de login</li>
                <li>Recompensas por missões e conquistas</li>
                <li>Progressão de nível</li>
                <li>Sistema de indicação de amigos</li>
              </ul>
              <p>
                3.2. É ESTRITAMENTE PROIBIDO vender, comprar, trocar ou transferir 
                contas ou moedas virtuais por dinheiro real ou outros bens.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">4. LIMITES E CONTROLES</h2>
            <div className="space-y-3 text-sm">
              <p>
                4.1. O jogo implementa controles automáticos para promover o uso responsável:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Limites diários de apostas virtuais</li>
                <li>Pausas obrigatórias após períodos prolongados</li>
                <li>Alertas de tempo de jogo</li>
                <li>Cooldown entre jogadas</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">5. JURISDIÇÃO E LEI APLICÁVEL</h2>
            <div className="space-y-3 text-sm">
              <p>
                5.1. Estes termos são regidos pelas leis da República Federativa do Brasil.
              </p>
              <p>
                5.2. Qualquer disputa será resolvida nos tribunais competentes do Brasil.
              </p>
              <p>
                5.3. O jogo está em conformidade com a legislação brasileira para 
                entretenimento digital recreativo.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">6. MODIFICAÇÕES</h2>
            <div className="space-y-3 text-sm">
              <p>
                6.1. Estes termos podem ser modificados a qualquer momento, com 
                notificação prévia aos usuários.
              </p>
              <p>
                6.2. O uso continuado do aplicativo após as modificações constitui 
                aceitação dos novos termos.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">7. CONTATO</h2>
            <div className="space-y-3 text-sm">
              <p>
                Para dúvidas sobre estes termos ou sobre o jogo, entre em contato:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Email: legal@zodiacfortune.com.br</li>
                <li>Telefone: (11) 99999-9999</li>
                <li>Endereço: São Paulo, SP, Brasil</li>
              </ul>
            </div>
          </Card>

          {/* Acceptance */}
          <Card className="p-6 bg-primary/5 border-primary">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold text-primary">ACEITAÇÃO DOS TERMOS</h3>
                <p className="text-sm mt-1">
                  Ao usar este aplicativo, você confirma ter lido, entendido e 
                  concordado com todos os termos acima descritos.
                </p>
              </div>
            </div>
          </Card>

          <div className="text-center text-xs text-muted-foreground">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            <p>Versão 1.0 - Zodiac Fortune</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfUse;