/**
 * Legal FAQ Page
 * Frequently asked questions about legal aspects
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  HelpCircle, 
  Search, 
  DollarSign, 
  Shield, 
  Users, 
  Scale,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'money' | 'legal' | 'age' | 'safety';
  important: boolean;
}

const LegalFAQ: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const faqs: FAQItem[] = [
    {
      id: 'money-real',
      question: 'Este jogo envolve dinheiro real?',
      answer: 'NÃO. O Zodiac Fortune é um jogo 100% recreativo que utiliza apenas moedas virtuais sem qualquer valor monetário real. Você não pode depositar dinheiro real, nem sacar ou converter as moedas virtuais.',
      category: 'money',
      important: true
    },
    {
      id: 'withdraw-coins',
      question: 'Posso sacar as moedas virtuais que ganhei?',
      answer: 'NÃO. As moedas virtuais são apenas para entretenimento dentro do jogo e não podem ser sacadas, convertidas ou trocadas por dinheiro real, produtos ou serviços.',
      category: 'money',
      important: true
    },
    {
      id: 'age-restriction',
      question: 'É seguro para menores de idade?',
      answer: 'NÃO. Este aplicativo é destinado APENAS para maiores de 18 anos, mesmo sendo recreativo. Implementamos verificação de idade rigorosa para garantir o cumprimento desta restrição.',
      category: 'age',
      important: true
    },
    {
      id: 'regulation',
      question: 'O jogo é regulamentado?',
      answer: 'Como entretenimento recreativo, estamos em conformidade com todas as leis brasileiras aplicáveis. Não necessitamos de licenças de jogos de apostas pois NÃO oferecemos apostas com dinheiro real.',
      category: 'legal',
      important: true
    },
    {
      id: 'data-collection',
      question: 'Que dados pessoais vocês coletam?',
      answer: 'Coletamos apenas dados técnicos necessários para o funcionamento do jogo (progresso, configurações, performance). NÃO coletamos CPF, RG, endereço, telefone ou dados bancários. Consulte nossa Política de Privacidade para detalhes completos.',
      category: 'safety',
      important: false
    },
    {
      id: 'sell-account',
      question: 'Posso vender minha conta do jogo?',
      answer: 'NÃO. É estritamente proibido vender, comprar, trocar ou transferir contas ou moedas virtuais por dinheiro real ou outros bens. Contas encontradas em violação serão permanentemente suspensas.',
      category: 'legal',
      important: false
    },
    {
      id: 'gambling-addiction',
      question: 'O jogo pode causar dependência?',
      answer: 'Implementamos controles rigorosos de jogo responsável, incluindo alertas de tempo, pausas obrigatórias e limites de uso. Embora seja recreativo, recomendamos sempre jogar com moderação.',
      category: 'safety',
      important: false
    },
    {
      id: 'multiple-accounts',
      question: 'Posso ter múltiplas contas?',
      answer: 'Cada pessoa deve ter apenas uma conta. Múltiplas contas podem ser criadas para burlar controles de idade ou limites, o que é proibido e resultará no bloqueio de todas as contas.',
      category: 'legal',
      important: false
    },
    {
      id: 'parental-control',
      question: 'Como impedir que meu filho acesse o jogo?',
      answer: 'Configure controles parentais no dispositivo, monitore o uso de aplicativos e converse com seu filho sobre os riscos. O jogo possui verificação de idade, mas a supervisão familiar é essencial.',
      category: 'age',
      important: false
    },
    {
      id: 'win-guarantee',
      question: 'Existe garantia de vitórias no jogo?',
      answer: 'NÃO. Todos os resultados são gerados por algoritmos de sorte virtual. Não há padrões, estratégias garantidas ou formas de "hackear" o jogo. É puramente baseado na sorte.',
      category: 'money',
      important: false
    }
  ];

  const categories = [
    { id: 'all', name: 'Todas', icon: HelpCircle },
    { id: 'money', name: 'Dinheiro Real', icon: DollarSign },
    { id: 'age', name: 'Idade', icon: Users },
    { id: 'legal', name: 'Legal', icon: Scale },
    { id: 'safety', name: 'Segurança', icon: Shield }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'money': return 'text-green-600 bg-green-100';
      case 'age': return 'text-blue-600 bg-blue-100';
      case 'legal': return 'text-purple-600 bg-purple-100';
      case 'safety': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
            <HelpCircle className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">FAQ Legal</h1>
              <p className="text-muted-foreground">Perguntas frequentes sobre aspectos legais</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar pergunta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Important Questions First */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-500" />
            Perguntas Mais Importantes
          </h2>
          <div className="space-y-3">
            {filteredFAQs.filter(faq => faq.important).map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-red-200 bg-red-50/50">
                  <Button
                    variant="ghost"
                    className="w-full p-4 justify-between text-left h-auto"
                    onClick={() => toggleExpanded(faq.id)}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-start space-x-3">
                        <Badge className={`${getCategoryColor(faq.category)} text-xs`}>
                          {categories.find(c => c.id === faq.category)?.name}
                        </Badge>
                        <span className="font-medium text-sm">{faq.question}</span>
                      </div>
                    </div>
                    {expandedItems.has(faq.id) ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </Button>
                  
                  <AnimatePresence>
                    {expandedItems.has(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Questions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Todas as Perguntas</h2>
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <Button
                    variant="ghost"
                    className="w-full p-4 justify-between text-left h-auto"
                    onClick={() => toggleExpanded(faq.id)}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-start space-x-3">
                        <Badge className={`${getCategoryColor(faq.category)} text-xs`}>
                          {categories.find(c => c.id === faq.category)?.name}
                        </Badge>
                        <span className="font-medium text-sm">{faq.question}</span>
                        {faq.important && (
                          <Badge variant="destructive" className="text-xs">
                            Importante
                          </Badge>
                        )}
                      </div>
                    </div>
                    {expandedItems.has(faq.id) ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </Button>
                  
                  <AnimatePresence>
                    {expandedItems.has(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <Card className="p-8 text-center">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhuma pergunta encontrada</h3>
              <p className="text-muted-foreground text-sm">
                Tente ajustar sua busca ou categoria selecionada.
              </p>
            </Card>
          )}
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6 bg-primary/5 border-primary">
            <h3 className="font-semibold text-primary mb-2">
              Não encontrou sua resposta?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Entre em contato conosco para esclarecimentos legais adicionais:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email Legal:</strong> legal@zodiacfortune.com.br</p>
              <p><strong>Privacidade:</strong> privacidade@zodiacfortune.com.br</p>
              <p><strong>Suporte:</strong> suporte@zodiacfortune.com.br</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalFAQ;