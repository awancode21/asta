export type TransactionType = 'expense' | 'income' | 'transfer';

export type CategoryGroup = 'needs' | 'wants' | 'savings' | 'income';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  type: 'expense' | 'income';
  group: CategoryGroup;
  budgetMonthly: number;
}

export type BankCode = 'bca' | 'mandiri' | 'bri' | 'bni' | 'jago' | 'gopay' | 'ovo' | 'dana' | 'cash';

export interface Account {
  id: string;
  name: string;
  bankCode: BankCode;
  accountNumber: string;
  accountHolder: string;
  type: 'bank' | 'ewallet' | 'cash';
  balance: number;
  lastSyncedAt: string;
  isAutoSync: boolean;
  syncStatus: 'connected' | 'syncing' | 'error' | 'disconnected';
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  description: string;
  source: 'manual' | 'bank_sync' | 'import_csv';
  originalBankRawText?: string;
  isConfirmed: boolean;
  notes?: string;
  merchant?: string;
}

export interface BankSyncRule {
  id: string;
  keyword: string;
  categoryId: string;
  priority: number;
}

export interface MonthlyAnalysisSummary {
  month: number; // 1 - 12
  year: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // percentage (0 - 100)
  avgDailyExpense: number;
  highestExpenseDay: { date: string; amount: number; description: string } | null;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    iconName: string;
    color: string;
    group: CategoryGroup;
    amount: number;
    percentage: number;
    budget: number;
    diffFromLastMonthPercent?: number;
  }>;
  budget503020: {
    needs: { amount: number; percentage: number; target: number };
    wants: { amount: number; percentage: number; target: number };
    savings: { amount: number; percentage: number; target: number };
  };
  dailyTrends: Array<{
    day: number;
    dateStr: string;
    expense: number;
    income: number;
  }>;
  insights: Array<{
    id: string;
    type: 'positive' | 'warning' | 'tip';
    title: string;
    description: string;
    badge: string;
  }>;
}
