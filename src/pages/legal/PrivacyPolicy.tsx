/**
 * Privacy Policy Page
 * LGPD Compliant Privacy Policy
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Database, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
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
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Política de Privacidade</h1>
              <p className="text-muted-foreground">Proteção de Dados - LGPD</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              1. DADOS COLETADOS
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                1.1. <strong>Dados de Jogo (Automáticos):</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Progresso no jogo (nível, XP, moedas virtuais)</li>
                <li>Estatísticas de gameplay (spins, vitórias, tempo de jogo)</li>
                <li>Configurações do jogo (tema, som, qualidade gráfica)</li>
                <li>Dados de performance (FPS, tempo de carregamento)</li>
              </ul>
              
              <p>
                1.2. <strong>Dados Técnicos (Automáticos):</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Informações do dispositivo (resolução, navegador, SO)</li>
                <li>Dados de sessão (tempo de uso, frequência de acesso)</li>
                <li>Logs de erro e performance</li>
                <li>Identificador anônimo do dispositivo</li>
              </ul>

              <p>
                1.3. <strong>Dados NÃO Coletados:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Nome, CPF, RG ou outros documentos pessoais</li>
                <li>Endereço residencial ou comercial</li>
                <li>Telefone ou email (exceto se fornecido voluntariamente para suporte)</li>
                <li>Dados bancários ou financeiros</li>
                <li>Localização geográfica precisa</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              2. FINALIDADE DO TRATAMENTO
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                2.1. Os dados são coletados exclusivamente para:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Funcionamento do jogo e salvamento de progresso</li>
                <li>Melhoria da experiência do usuário</li>
                <li>Otimização de performance técnica</li>
                <li>Identificação e correção de bugs</li>
                <li>Cumprimento de obrigações legais de auditoria</li>
              </ul>
              
              <p>
                2.2. <strong>Base Legal (LGPD):</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Execução de contrato (funcionamento do jogo)</li>
                <li>Interesse legítimo (melhoria do produto)</li>
                <li>Cumprimento de obrigação legal (logs de auditoria)</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">3. COMPARTILHAMENTO DE DADOS</h2>
            <div className="space-y-3 text-sm">
              <p>
                3.1. <strong>NÃO compartilhamos</strong> seus dados com terceiros para:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Fins comerciais ou publicitários</li>
                <li>Venda ou monetização de dados</li>
                <li>Análise de perfil para outros produtos</li>
              </ul>
              
              <p>
                3.2. Dados podem ser compartilhados apenas:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Com autoridades competentes, se exigido por lei</li>
                <li>Em caso de auditoria de conformidade regulatória</li>
                <li>Para proteção de direitos legais da empresa</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">4. ARMAZENAMENTO E RETENÇÃO</h2>
            <div className="space-y-3 text-sm">
              <p>
                4.1. <strong>Local de Armazenamento:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Dados salvos localmente no seu dispositivo</li>
                <li>Backup em servidores seguros no Brasil</li>
                <li>Criptografia de dados sensíveis</li>
              </ul>
              
              <p>
                4.2. <strong>Tempo de Retenção:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Dados de jogo: enquanto a conta estiver ativa</li>
                <li>Logs de auditoria: 2 anos (exigência legal)</li>
                <li>Dados técnicos: 1 ano para análise de performance</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              5. SEUS DIREITOS (LGPD)
            </h2>
            <div className="space-y-3 text-sm">
              <p>Você tem direito a:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Confirmação:</strong> Saber se tratamos seus dados</li>
                <li><strong>Acesso:</strong> Obter cópia dos dados que possuímos</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos ou incorretos</li>
                <li><strong>Anonimização:</strong> Tornar seus dados anônimos</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Eliminação:</strong> Excluir dados desnecessários</li>
                <li><strong>Oposição:</strong> Opor-se ao tratamento em certas situações</li>
              </ul>
              
              <p className="mt-3">
                <strong>Para exercer seus direitos, entre em contato:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Email: privacidade@zodiacfortune.com.br</li>
                <li>Prazo de resposta: até 15 dias úteis</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">6. SEGURANÇA DOS DADOS</h2>
            <div className="space-y-3 text-sm">
              <p>
                6.1. Medidas técnicas implementadas:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Anonimização de identificadores de usuário</li>
                <li>Controle de acesso restrito aos dados</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backup automático com criptografia</li>
              </ul>
              
              <p>
                6.2. Em caso de incidente de segurança, você será notificado 
                conforme exigido pela LGPD.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">7. COOKIES E TECNOLOGIAS</h2>
            <div className="space-y-3 text-sm">
              <p>
                7.1. Utilizamos apenas cookies essenciais:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Salvamento de configurações do jogo</li>
                <li>Manutenção de sessão ativa</li>
                <li>Preferências de idioma e tema</li>
              </ul>
              
              <p>
                7.2. <strong>NÃO utilizamos:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Cookies de rastreamento publicitário</li>
                <li>Analytics de terceiros</li>
                <li>Pixels de redes sociais</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">8. ALTERAÇÕES NA POLÍTICA</h2>
            <div className="space-y-3 text-sm">
              <p>
                8.1. Esta política pode ser atualizada para:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Adequação a novas leis ou regulamentações</li>
                <li>Melhoria na proteção da privacidade</li>
                <li>Mudanças técnicas no aplicativo</li>
              </ul>
              
              <p>
                8.2. Você será notificado sobre alterações significativas 
                na próxima vez que acessar o aplicativo.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary">
            <h2 className="text-xl font-semibold mb-4">9. ENCARREGADO DE DADOS (DPO)</h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Contato do Encarregado de Proteção de Dados:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Nome: [Nome do DPO]</li>
                <li>Email: dpo@zodiacfortune.com.br</li>
                <li>Endereço: São Paulo, SP, Brasil</li>
              </ul>
              
              <p className="mt-3">
                O DPO está disponível para esclarecimentos sobre tratamento 
                de dados e exercício de direitos do titular.
              </p>
            </div>
          </Card>

          <div className="text-center text-xs text-muted-foreground">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            <p>Esta política está em conformidade com a LGPD (Lei 13.709/2018)</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;