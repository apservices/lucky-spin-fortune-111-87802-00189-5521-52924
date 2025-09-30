/**
 * Compliance Declaration Page
 * Official compliance statement for regulatory purposes
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, CheckCircle, FileText, Award, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const ComplianceDeclaration: React.FC = () => {
  const navigate = useNavigate();

  const handleDownloadCertificate = () => {
    // Generate a compliance certificate PDF
    const certificateData = {
      company: "Zodiac Fortune Entertainment Ltda.",
      product: "Zodiac Fortune - Jogo Recreativo",
      date: new Date().toLocaleDateString('pt-BR'),
      certifications: [
        "Jogo 100% recreativo - sem apostas reais",
        "Conformidade com legislação brasileira",
        "LGPD - Proteção de dados implementada",
        "Controles de idade verificados (+18)",
        "Sistema de jogo responsável ativo"
      ]
    };

    const blob = new Blob([JSON.stringify(certificateData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado_conformidade_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Declaração de Conformidade</h1>
                <p className="text-muted-foreground">Certificação Oficial de Compliance</p>
              </div>
            </div>
          </div>
          
          <Button onClick={handleDownloadCertificate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Baixar Certificado
          </Button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Main Declaration */}
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-2">
                CERTIFICAÇÃO OFICIAL
              </h2>
              <Badge variant="outline" className="text-lg px-4 py-1">
                100% RECREATIVO
              </Badge>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-lg font-medium">
                Declaramos oficialmente que o <strong>Zodiac Fortune</strong> é um 
                jogo de entretenimento digital 100% recreativo, desenvolvido em 
                conformidade com todas as leis brasileiras aplicáveis.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="flex items-center space-x-3 p-4 bg-background rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="font-medium">Sem apostas reais</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-background rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="font-medium">Apenas entretenimento</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-background rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="font-medium">Moedas sem valor real</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-background rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="font-medium">Restrição +18 anos</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed Compliance */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Declaração Detalhada de Conformidade
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-primary mb-2">1. NATUREZA DO PRODUTO</h4>
                <p className="text-sm text-muted-foreground">
                  O Zodiac Fortune é classificado como um jogo de entretenimento digital 
                  que simula máquinas caça-níqueis usando exclusivamente moedas virtuais 
                  sem qualquer valor monetário real ou possibilidade de conversão.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-2">2. AUSÊNCIA DE APOSTAS REAIS</h4>
                <ul className="list-disc ml-6 space-y-1 text-sm text-muted-foreground">
                  <li>NÃO há depósito de dinheiro real pelos usuários</li>
                  <li>NÃO há saque ou conversão de moedas virtuais</li>
                  <li>NÃO há possibilidade de ganhar dinheiro real</li>
                  <li>NÃO há transações financeiras de qualquer natureza</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-2">3. CONFORMIDADE REGULATÓRIA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Lei Brasileira</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Em conformidade com todas as leis federais, estaduais e 
                      municipais do Brasil para entretenimento digital.
                    </p>
                  </Card>

                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">LGPD</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Proteção de dados implementada conforme Lei Geral 
                      de Proteção de Dados (LGPD 13.709/2018).
                    </p>
                  </Card>

                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-800">ECA</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Proteção de menores implementada conforme Estatuto 
                      da Criança e do Adolescente.
                    </p>
                  </Card>

                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-800">CDC</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Transparência e informação clara conforme Código 
                      de Defesa do Consumidor.
                    </p>
                  </Card>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-2">4. CONTROLES IMPLEMENTADOS</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-medium">Verificação de Idade</span>
                      <p className="text-xs text-muted-foreground">
                        Sistema robusto de verificação +18 com re-validação periódica
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-medium">Jogo Responsável</span>
                      <p className="text-xs text-muted-foreground">
                        Alertas automáticos, pausas obrigatórias e limites de tempo
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-medium">Auditoria Completa</span>
                      <p className="text-xs text-muted-foreground">
                        Log detalhado de todas as ações para transparência total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Company Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Informações da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Razão Social</h4>
                <p className="text-sm text-muted-foreground">
                  Zodiac Fortune Entertainment Ltda.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">CNPJ</h4>
                <p className="text-sm text-muted-foreground">
                  XX.XXX.XXX/0001-XX
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Endereço</h4>
                <p className="text-sm text-muted-foreground">
                  São Paulo, SP, Brasil
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Responsável Legal</h4>
                <p className="text-sm text-muted-foreground">
                  [Nome do Responsável]
                </p>
              </div>
            </div>
          </Card>

          {/* Certification Footer */}
          <Card className="p-6 bg-primary/5 border-primary text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold text-primary">
                  CERTIFICADO DE CONFORMIDADE
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Este documento certifica que o Zodiac Fortune está em plena conformidade 
                com todas as leis brasileiras aplicáveis para jogos de entretenimento digital.
              </p>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Emitido em: {new Date().toLocaleDateString('pt-BR')} | 
                  Válido até: {new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Documento ID: COMP-{Date.now().toString(36).toUpperCase()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ComplianceDeclaration;