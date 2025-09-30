// Transaction history management hook

import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionFilter } from '@/types/transactions';
import { formatBrazilianDateTime } from '@/utils/formatters';

const STORAGE_KEY = 'zodiac_fortune_transactions';

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load transactions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const transactionsWithDates = parsed.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
        setTransactions(transactionsWithDates);
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save transactions to localStorage
  const saveTransactions = useCallback((newTransactions: Transaction[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Error saving transaction history:', error);
    }
  }, []);

  // Add new transaction
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    const updatedTransactions = [newTransaction, ...transactions].slice(0, 1000); // Keep last 1000 transactions
    saveTransactions(updatedTransactions);
  }, [transactions, saveTransactions]);

  // Filter transactions
  const filterTransactions = useCallback((filter: TransactionFilter): Transaction[] => {
    return transactions.filter(transaction => {
      // Type filter
      if (filter.type && filter.type !== 'all' && transaction.type !== filter.type) {
        return false;
      }

      // Date range filter
      if (filter.dateFrom && transaction.timestamp < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && transaction.timestamp > filter.dateTo) {
        return false;
      }

      // Amount filter
      if (filter.minAmount && Math.abs(transaction.amount) < filter.minAmount) {
        return false;
      }
      if (filter.maxAmount && Math.abs(transaction.amount) > filter.maxAmount) {
        return false;
      }

      // Source filter
      if (filter.source && transaction.source !== filter.source) {
        return false;
      }

      // Text search
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const searchableText = `${transaction.description} ${transaction.category}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions]);

  // Get transaction statistics
  const getStats = useCallback(() => {
    const totalGanhos = transactions
      .filter(t => t.type === 'ganho' || t.type === 'bonus' || t.type === 'conquista')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalGastos = transactions
      .filter(t => t.type === 'gasto')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const transactionsThisMonth = transactions.filter(t => {
      const now = new Date();
      const transactionDate = new Date(t.timestamp);
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear();
    });

    return {
      totalTransactions: transactions.length,
      totalGanhos,
      totalGastos,
      saldoLiquido: totalGanhos - totalGastos,
      transactionsThisMonth: transactionsThisMonth.length,
      lastTransaction: transactions[0] || null
    };
  }, [transactions]);

  // Export transactions as CSV
  const exportToCsv = useCallback((filteredTransactions?: Transaction[]) => {
    const dataToExport = filteredTransactions || transactions;
    
    const headers = ['Data', 'Tipo', 'Valor', 'Descrição', 'Origem', 'Categoria'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(t => [
        formatBrazilianDateTime(t.timestamp),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.amount.toString(),
        `"${t.description}"`,
        t.source,
        `"${t.category}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [transactions]);

  // Clear all transactions
  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTransactions([]);
  }, []);

  return {
    transactions,
    isLoading,
    addTransaction,
    filterTransactions,
    getStats,
    exportToCsv,
    clearHistory
  };
};