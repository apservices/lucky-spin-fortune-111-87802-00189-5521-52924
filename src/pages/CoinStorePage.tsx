/**
 * Virtual Coin Store Page - Complete coin management system
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Coins, 
  Calendar, 
  Target, 
  Trophy, 
  Users, 
  Filter, 
  Download, 
  Search,
  TrendingUp,
  TrendingDown,
  Gift,
  Award,
  ShoppingCart,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { TransactionFilter, COIN_PACKAGES } from '@/types/transactions';
import { formatBrazilianCurrency, formatCompactNumber, formatBrazilianDateTime } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

const CoinStorePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { addCoins } = useGameActions();
  const { toast } = useToast();
  const { transactions, addTransaction, filterTransactions, getStats, exportToCsv } = useTransactionHistory();

  // Filter states
  const [filter, setFilter] = useState<TransactionFilter>({ type: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  // Get filtered transactions
  const filteredTransactions = useMemo(() => {
    return filterTransactions({ ...filter, search: searchTerm });
  }, [filterTransactions, filter, searchTerm]);

  // Get statistics
  const stats = useMemo(() => getStats(), [getStats]);

  // Handle virtual purchase
  const handleVirtualPurchase = (packageId: string) => {
    const coinPackage = COIN_PACKAGES.find(p => p.id === packageId);
    if (!coinPackage) return;

    const totalCoins = coinPackage.coins + (coinPackage.bonus?.extraCoins || 0);
    addCoins(totalCoins);

    // Add transaction to history
    addTransaction({
      type: 'ganho',
      amount: totalCoins,
      description: `Pacote ${coinPackage.name} adquirido (SIMULAÇÃO)`,
      source: 'purchase',
      category: 'Compra Virtual'
    });

    toast({
      title: "Compra Simulada!",
      description: `${formatCompactNumber(totalCoins)} moedas virtuais adicionadas ao seu saldo`,
    });
  };

  // Transaction type colors
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'ganho': return 'text-green-500';
      case 'bonus': return 'text-blue-500';
      case 'conquista': return 'text-yellow-500';
      case 'gasto': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Transaction type icons
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'ganho': return <TrendingUp className="w-4 h-4" />;
      case 'bonus': return <Gift className="w-4 h-4" />;
      case 'conquista': return <Award className="w-4 h-4" />;
      case 'gasto': return <TrendingDown className="w-4 h-4" />;
      default: return <Coins className="w-4 h-4" />;
    }
  };

  return (
    <ParticleBackground className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen p-4 relative z-10">
        
        {/* Header */}
        <motion.header 
          className="flex items-center gap-4 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Loja de Moedas Virtuais
            </h1>
            <p className="text-gray-400">Gerencie suas moedas virtuais sem valor real</p>
          </div>
        </motion.header>

        {/* Balance Section */}
        <motion.div
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <Coins className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Saldo Atual</p>
                    <div className="flex items-center gap-2">
                      {showBalance ? (
                        <h2 className="text-3xl font-bold text-white">
                          {formatCompactNumber(state.coins)}
                        </h2>
                      ) : (
                        <h2 className="text-3xl font-bold text-white">****</h2>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-gray-400 hover:text-white"
                      >
                        {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-yellow-500/80 mt-1">
                      ⚠️ Moedas virtuais sem valor monetário real
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Nível</p>
                  <p className="text-xl font-bold text-white">{state.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="acquire" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="acquire">Adquirir</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            {/* Acquire Coins Tab */}
            <TabsContent value="acquire" className="space-y-6">
              {/* Acquisition Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors cursor-pointer"
                      onClick={() => navigate('/daily-rewards')}>
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Bônus Diários</h3>
                    <p className="text-sm text-gray-400">Calendário de recompensas</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors cursor-pointer"
                      onClick={() => navigate('/missions')}>
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Missões</h3>
                    <p className="text-sm text-gray-400">Complete desafios</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors cursor-pointer"
                      onClick={() => navigate('/achievements')}>
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Conquistas</h3>
                    <p className="text-sm text-gray-400">Desbloqueie troféus</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors cursor-pointer"
                      onClick={() => navigate('/referrals')}>
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Convites</h3>
                    <p className="text-sm text-gray-400">Convide amigos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Virtual Packages */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Pacotes Virtuais (Simulação)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {COIN_PACKAGES.map((pkg) => (
                    <Card key={pkg.id} className={`bg-card/50 backdrop-blur-sm border-2 transition-all hover:scale-105 ${
                      pkg.tier === 'bronze' ? 'border-orange-500/50' :
                      pkg.tier === 'prata' ? 'border-gray-400/50' :
                      pkg.tier === 'ouro' ? 'border-yellow-500/50' :
                      'border-blue-500/50'
                    }`}>
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-lg ${
                          pkg.tier === 'bronze' ? 'text-orange-500' :
                          pkg.tier === 'prata' ? 'text-gray-400' :
                          pkg.tier === 'ouro' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`}>
                          {pkg.name}
                        </CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <p className="text-2xl font-bold text-white">
                            {formatCompactNumber(pkg.coins)}
                          </p>
                          {pkg.bonus && (
                            <p className="text-sm text-green-500">
                              {pkg.bonus.description}
                            </p>
                          )}
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => handleVirtualPurchase(pkg.id)}
                        >
                          Simular Compra
                        </Button>
                        <p className="text-xs text-center text-gray-500 mt-2">
                          ⚠️ Simulação - Sem cobrança real
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Transaction History Tab */}
            <TabsContent value="history" className="space-y-6">
              {/* Filters */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                      <Input
                        placeholder="Buscar transações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <Select value={filter.type || 'all'} onValueChange={(value) => 
                      setFilter({...filter, type: value as any})
                    }>
                      <SelectTrigger className="w-[180px] bg-background/50">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="ganho">Ganhos</SelectItem>
                        <SelectItem value="gasto">Gastos</SelectItem>
                        <SelectItem value="bonus">Bônus</SelectItem>
                        <SelectItem value="conquista">Conquistas</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => exportToCsv(filteredTransactions)}
                      className="bg-background/50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction List */}
              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Nenhuma transação encontrada</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTransactions.slice(0, 50).map((transaction) => (
                    <Card key={transaction.id} className="bg-card/30 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)} bg-current/10`}>
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{transaction.description}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>{formatBrazilianDateTime(transaction.timestamp)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.type === 'gasto' ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {transaction.type === 'gasto' ? '-' : '+'}
                              {formatCompactNumber(Math.abs(transaction.amount))}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Total Ganhos</p>
                    <p className="text-xl font-bold text-green-500">
                      {formatCompactNumber(stats.totalGanhos)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/10 border-red-500/30">
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Total Gastos</p>
                    <p className="text-xl font-bold text-red-500">
                      {formatCompactNumber(stats.totalGastos)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <Coins className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Saldo Líquido</p>
                    <p className={`text-xl font-bold ${
                      stats.saldoLiquido >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatCompactNumber(stats.saldoLiquido)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-500/10 border-purple-500/30">
                  <CardContent className="p-4 text-center">
                    <Filter className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Transações</p>
                    <p className="text-xl font-bold text-purple-500">
                      {stats.totalTransactions}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

      </div>
    </ParticleBackground>
  );
};

export default CoinStorePage;