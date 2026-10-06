import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, BankSyncRule, Category, Transaction } from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_RULES,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';
import {
  ParsedCsvResult,
  parseMutasiCsv,
  simulateBankSync,
} from '../services/bankSyncService';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  rules: BankSyncRule[];
  selectedMonth: number;
  selectedYear: number;
  isSyncingAll: boolean;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  syncAccount: (accountId: string) => Promise<number>;
  syncAllAccounts: () => Promise<number>;
  connectAccount: (accountData: Omit<Account, 'id' | 'lastSyncedAt' | 'syncStatus'>) => void;
  disconnectAccount: (accountId: string) => void;
  toggleAutoSync: (accountId: string) => void;
  importMutasiText: (csvText: string, targetAccountId: string) => ParsedCsvResult;
  batchAddTransactions: (txs: Transaction[], balanceAdj: number, accountId: string) => void;
  updateCategoryBudget: (categoryId: string, newBudget: number) => void;
  addRule: (keyword: string, categoryId: string) => void;
  deleteRule: (id: string) => void;
  resetToDemoData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'arthaku_transactions_v1',
  ACCOUNTS: 'arthaku_accounts_v1',
  CATEGORIES: 'arthaku_categories_v1',
  RULES: 'arthaku_rules_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [rules, setRules] = useState<BankSyncRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RULES);
    return saved ? JSON.parse(saved) : INITIAL_RULES;
  });

  // Current active date default
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Oktober
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  }, [rules]);

  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === txData.accountId) {
          const delta = txData.type === 'expense' ? -txData.amount : txData.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );

    showToast('Transaksi berhasil dicatat ke dalam pembukuan');
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
    showToast('Transaksi berhasil diperbarui');
  };

  const deleteTransaction = (id: string) => {
    const existing = transactions.find((t) => t.id === id);
    if (existing) {
      // Revert account balance
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === existing.accountId) {
            const revertDelta = existing.type === 'expense' ? existing.amount : -existing.amount;
            return { ...acc, balance: acc.balance + revertDelta };
          }
          return acc;
        })
      );
    }
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    showToast('Transaksi telah dihapus', 'info');
  };

  const syncAccount = async (accountId: string): Promise<number> => {
    const targetAccount = accounts.find((a) => a.id === accountId);
    if (!targetAccount) return 0;

    // Set account status to syncing
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, syncStatus: 'syncing' } : a))
    );

    return new Promise((resolve) => {
      setTimeout(() => {
        const { newTransactions, balanceAdjustment } = simulateBankSync(targetAccount, rules);

        setTransactions((prev) => [...newTransactions, ...prev]);

        setAccounts((prev) =>
          prev.map((a) => {
            if (a.id === accountId) {
              return {
                ...a,
                balance: a.balance + balanceAdjustment,
                lastSyncedAt: new Date().toISOString(),
                syncStatus: 'connected',
              };
            }
            return a;
          })
        );

        showToast(
          `Berhasil sinkronisasi ${targetAccount.name}! ${newTransactions.length} mutasi terbaru ditemukan.`,
          'success'
        );
        resolve(newTransactions.length);
      }, 1200);
    });
  };

  const syncAllAccounts = async (): Promise<number> => {
    setIsSyncingAll(true);
    let totalSynced = 0;

    for (const acc of accounts) {
      if (acc.syncStatus === 'connected' && acc.type !== 'cash') {
        const count = await syncAccount(acc.id);
        totalSynced += count;
      }
    }

    setIsSyncingAll(false);
    return totalSynced;
  };

  const connectAccount = (
    accountData: Omit<Account, 'id' | 'lastSyncedAt' | 'syncStatus'>
  ) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc_${Date.now()}`,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'connected',
    };
    setAccounts((prev) => [...prev, newAccount]);
    showToast(`Rekening ${newAccount.name} berhasil dihubungkan!`);
  };

  const disconnectAccount = (accountId: string) => {
    const target = accounts.find((a) => a.id === accountId);
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    showToast(`Rekening ${target?.name || ''} telah diputuskan`, 'info');
  };

  const toggleAutoSync = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, isAutoSync: !a.isAutoSync } : a))
    );
  };

  const importMutasiText = (csvText: string, targetAccountId: string): ParsedCsvResult => {
    return parseMutasiCsv(csvText, targetAccountId, rules);
  };

  const batchAddTransactions = (
    txs: Transaction[],
    balanceAdj: number,
    accountId: string
  ) => {
    setTransactions((prev) => [...txs, ...prev]);
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === accountId) {
          return {
            ...a,
            balance: a.balance + balanceAdj,
            lastSyncedAt: new Date().toISOString(),
          };
        }
        return a;
      })
    );
    showToast(`Berhasil menambahkan ${txs.length} transaksi dari mutasi bank.`);
  };

  const updateCategoryBudget = (categoryId: string, newBudget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, budgetMonthly: newBudget } : c))
    );
    showToast('Anggaran bulanan berhasil diperbarui');
  };

  const addRule = (keyword: string, categoryId: string) => {
    const newRule: BankSyncRule = {
      id: `rule_${Date.now()}`,
      keyword: keyword.trim().toUpperCase(),
      categoryId,
      priority: 1,
    };
    setRules((prev) => [newRule, ...prev]);
    showToast(`Aturan auto-kategori untuk kata '${keyword}' berhasil disimpan.`);
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    showToast('Aturan auto-kategori dihapus', 'info');
  };

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setAccounts(INITIAL_ACCOUNTS);
    setCategories(INITIAL_CATEGORIES);
    setRules(INITIAL_RULES);
    showToast('Data telah direset kembali ke simulasi awal', 'info');
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        categories,
        rules,
        selectedMonth,
        selectedYear,
        isSyncingAll,
        toasts,
        dismissToast,
        showToast,
        setSelectedMonth,
        setSelectedYear,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        syncAccount,
        syncAllAccounts,
        connectAccount,
        disconnectAccount,
        toggleAutoSync,
        importMutasiText,
        batchAddTransactions,
        updateCategoryBudget,
        addRule,
        deleteRule,
        resetToDemoData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
