import { Account, BankCode, BankSyncRule, Transaction } from '../types/finance';

export interface BankMetadata {
  code: BankCode;
  name: string;
  fullName: string;
  type: 'bank' | 'ewallet' | 'cash';
  color: string;
  badgeBg: string;
  accountFormatPlaceholder: string;
  authMethod: 'User ID & Password' | 'Nomor HP & PIN' | 'Open Banking API';
}

export const SUPPORTED_BANKS: BankMetadata[] = [
  {
    code: 'bca',
    name: 'BCA',
    fullName: 'PT Bank Central Asia Tbk (KlikBCA / myBCA)',
    type: 'bank',
    color: '#005baa',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    accountFormatPlaceholder: 'Contoh: 8830192841 (10 digit)',
    authMethod: 'User ID & Password',
  },
  {
    code: 'mandiri',
    name: 'Mandiri',
    fullName: 'PT Bank Mandiri (Persero) Tbk (Livin\' by Mandiri)',
    type: 'bank',
    color: '#002f6c',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    accountFormatPlaceholder: 'Contoh: 1370018920192 (13 digit)',
    authMethod: 'User ID & Password',
  },
  {
    code: 'bri',
    name: 'BRI',
    fullName: 'PT Bank Rakyat Indonesia (Persero) Tbk (BRImo)',
    type: 'bank',
    color: '#00529c',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accountFormatPlaceholder: 'Contoh: 020601002341508 (15 digit)',
    authMethod: 'User ID & Password',
  },
  {
    code: 'bni',
    name: 'BNI',
    fullName: 'PT Bank Negara Indonesia (Persero) Tbk (BNI Mobile)',
    type: 'bank',
    color: '#f05a22',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    accountFormatPlaceholder: 'Contoh: 0184920194 (10 digit)',
    authMethod: 'User ID & Password',
  },
  {
    code: 'jago',
    name: 'Bank Jago',
    fullName: 'PT Bank Jago Tbk (Kantong Jago)',
    type: 'bank',
    color: '#5b21b6',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    accountFormatPlaceholder: 'Contoh: 1029384756 (10 digit)',
    authMethod: 'Nomor HP & PIN',
  },
  {
    code: 'gopay',
    name: 'GoPay',
    fullName: 'GoPay (GoTo Financial)',
    type: 'ewallet',
    color: '#00aa13',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accountFormatPlaceholder: 'Contoh: 0812-xxxx-xxxx (No. HP)',
    authMethod: 'Nomor HP & PIN',
  },
  {
    code: 'ovo',
    name: 'OVO',
    fullName: 'OVO Cash & Points',
    type: 'ewallet',
    color: '#4c3494',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    accountFormatPlaceholder: 'Contoh: 0813-xxxx-xxxx (No. HP)',
    authMethod: 'Nomor HP & PIN',
  },
  {
    code: 'dana',
    name: 'DANA',
    fullName: 'DANA Indonesia E-Wallet',
    type: 'ewallet',
    color: '#118eea',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    accountFormatPlaceholder: 'Contoh: 0857-xxxx-xxxx (No. HP)',
    authMethod: 'Nomor HP & PIN',
  },
];

/**
 * Intelligent categorization matching based on keywords in merchant/bank mutasi descriptions
 */
export function autoCategorizeDescription(description: string, rules: BankSyncRule[]): string {
  const upper = description.toUpperCase();

  // 1. Check custom user rules
  for (const rule of rules) {
    if (upper.includes(rule.keyword.toUpperCase())) {
      return rule.categoryId;
    }
  }

  // 2. Default fallback heuristics
  if (upper.includes('GAJI') || upper.includes('SALARY') || upper.includes('PAYROLL')) {
    return 'cat_salary';
  }
  if (upper.includes('FREELANCE') || upper.includes('INVOICE') || upper.includes('JASA')) {
    return 'cat_freelance';
  }
  if (upper.includes('BIBIT') || upper.includes('BAREKSA') || upper.includes('AJAIB') || upper.includes('STOCKBIT') || upper.includes('INVEST')) {
    return 'cat_investment';
  }
  if (upper.includes('PLN') || upper.includes('LISTRIK') || upper.includes('INDIHOME') || upper.includes('BIZNET') || upper.includes('AIR') || upper.includes('SEWA')) {
    return 'cat_housing_bills';
  }
  if (upper.includes('INDOMARET') || upper.includes('ALFAMART') || upper.includes('SUPERINDO') || upper.includes('HYPERMART') || upper.includes('SAYUR')) {
    return 'cat_food_grocery';
  }
  if (upper.includes('PERTAMINA') || upper.includes('SHELL') || upper.includes('BENSIN') || upper.includes('GRABRIDE') || upper.includes('GORIDE') || upper.includes('GOCAR') || upper.includes('MRT') || upper.includes('KRL')) {
    return 'cat_transport';
  }
  if (upper.includes('STARBUCKS') || upper.includes('KOPI') || upper.includes('COFFEE') || upper.includes('GOFOOD') || upper.includes('GRABFOOD') || upper.includes('RESTORAN') || upper.includes('CAFE') || upper.includes('WARUNG') || upper.includes('PADANG')) {
    return 'cat_dining_out';
  }
  if (upper.includes('SHOPEE') || upper.includes('TOKOPEDIA') || upper.includes('ZALORA') || upper.includes('UNIQLO') || upper.includes('MALL') || upper.includes('FASHION')) {
    return 'cat_shopping';
  }
  if (upper.includes('NETFLIX') || upper.includes('SPOTIFY') || upper.includes('YOUTUBE') || upper.includes('CINEMA') || upper.includes('XXI') || upper.includes('STEAM')) {
    return 'cat_entertainment';
  }
  if (upper.includes('APOTEK') || upper.includes('HALODOC') || upper.includes('DOKTER') || upper.includes('RUMAH SAKIT') || upper.includes('KLINIK')) {
    return 'cat_health';
  }

  return 'cat_dining_out'; // general default
}

/**
 * Simulates real-time bank sync pulling fresh transactions from the bank server
 */
export function simulateBankSync(
  account: Account,
  rules: BankSyncRule[]
): { newTransactions: Transaction[]; balanceAdjustment: number } {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);

  const sampleBankFeedPool: Array<{
    desc: string;
    rawText: string;
    amount: number;
    type: 'expense' | 'income';
    merchant: string;
  }> = [
    {
      desc: 'QRIS Pembayaran Minimarket Alfamart Segar',
      rawText: 'QRIS ALFAMART RAYA POS PANCORAN DEBET',
      amount: 47500,
      type: 'expense',
      merchant: 'Alfamart',
    },
    {
      desc: 'Bensin SPBU Pertamina Pertamax 92',
      rawText: 'DEBET EDC SPBU PERTAMINA KUNINGAN 34-12901',
      amount: 150000,
      type: 'expense',
      merchant: 'Pertamina',
    },
    {
      desc: 'Pesanan Makan Siang GrabFood Ayam Geprek',
      rawText: 'GRABFOOD TRANSAKSI ORDER INDONESIA DEBET',
      amount: 58000,
      type: 'expense',
      merchant: 'GrabFood',
    },
    {
      desc: 'Kopi Kenangan Flash Promo Kopi Susu',
      rawText: 'QRIS KOPI KENANGAN OUTLET BLOK M',
      amount: 32000,
      type: 'expense',
      merchant: 'Kopi Kenangan',
    },
    {
      desc: 'Transfer Masuk Reimbursement Kantor',
      rawText: 'TRSF CR REIMBURSE TRANSPORT OPERASIONAL HRD',
      amount: 450000,
      type: 'income',
      merchant: 'Kantor / HRD',
    },
    {
      desc: 'Belanja Keperluan Tokopedia Pay',
      rawText: 'AUTO DEBET TOKOPEDIA DIGITAL SERVIS',
      amount: 125000,
      type: 'expense',
      merchant: 'Tokopedia',
    },
  ];

  // Pick 1-2 random recent transactions
  const count = Math.floor(Math.random() * 2) + 1;
  const picked = [...sampleBankFeedPool].sort(() => 0.5 - Math.random()).slice(0, count);

  let balanceAdj = 0;
  const newTransactions: Transaction[] = picked.map((item, idx) => {
    const categoryId = autoCategorizeDescription(item.rawText, rules);
    if (item.type === 'expense') {
      balanceAdj -= item.amount;
    } else {
      balanceAdj += item.amount;
    }

    return {
      id: `sync_${account.bankCode}_${Date.now()}_${idx}`,
      date: dateStr,
      time: timeStr,
      amount: item.amount,
      type: item.type,
      categoryId,
      accountId: account.id,
      description: item.desc,
      source: 'bank_sync',
      originalBankRawText: item.rawText,
      isConfirmed: true,
      merchant: item.merchant,
    };
  });

  return { newTransactions, balanceAdjustment: balanceAdj };
}

export interface ParsedCsvResult {
  transactions: Transaction[];
  errors: string[];
  totalParsed: number;
  totalExpense: number;
  totalIncome: number;
}

/**
 * Universal CSV / Mutasi text parser for Indonesian Bank Statements
 * Supports KlikBCA CSV, Mandiri Livin statement format, BRI, and generic CSV format.
 */
export function parseMutasiCsv(
  csvText: string,
  targetAccountId: string,
  rules: BankSyncRule[]
): ParsedCsvResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const transactions: Transaction[] = [];
  const errors: string[] = [];
  let totalExpense = 0;
  let totalIncome = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip general header lines
    if (
      line.toUpperCase().includes('SALDO AWAL') ||
      line.toUpperCase().includes('NOMOR REKENING') ||
      line.toUpperCase().includes('PERIODE') ||
      line.toUpperCase().includes('TANGGAL,KETERANGAN') ||
      line.toUpperCase().includes('DATE,DESCRIPTION')
    ) {
      continue;
    }

    // Split by comma, tab, or semicolon
    let parts: string[] = [];
    if (line.includes('\t')) {
      parts = line.split('\t');
    } else if (line.includes(';')) {
      parts = line.split(';');
    } else {
      // Split with quotes handling
      parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    }

    parts = parts.map((p) => p.replace(/^"|"$/g, '').trim());

    if (parts.length < 3) continue;

    try {
      // Try detecting fields:
      // Typically: [Tanggal, Deskripsi, Nominal, Tipe (DB/CR) atau Saldo]
      const rawDate = parts[0];
      const rawDesc = parts[1];
      const rawAmount1 = parts[2];
      const rawAmount2 = parts[3] || '';

      // Clean date
      let parsedDate = '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        parsedDate = rawDate;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
        const [d, m, y] = rawDate.split('/');
        parsedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      } else if (/^\d{2}\/\d{2}$/.test(rawDate)) {
        const [d, m] = rawDate.split('/');
        parsedDate = `2026-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      } else {
        // Fallback to today
        parsedDate = new Date().toISOString().split('T')[0];
      }

      // Determine amount and type
      let type: 'expense' | 'income' = 'expense';
      let amount = 0;

      const cleanNum = (str: string) => {
        return parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
      };

      const combinedText = (rawDesc + ' ' + (rawAmount2 || '')).toUpperCase();
      const isCredit =
        combinedText.includes(' CR') ||
        combinedText.includes('CR ') ||
        combinedText.includes('KREDIT') ||
        parts.some((p) => p.toUpperCase() === 'CR');

      if (isCredit) {
        type = 'income';
        amount = cleanNum(rawAmount1);
      } else {
        type = 'expense';
        amount = Math.abs(cleanNum(rawAmount1));
      }

      if (amount <= 0 && rawAmount2) {
        amount = Math.abs(cleanNum(rawAmount2));
      }

      if (amount > 0) {
        const catId = autoCategorizeDescription(rawDesc, rules);
        if (type === 'expense') totalExpense += amount;
        else totalIncome += amount;

        transactions.push({
          id: `imp_${Date.now()}_${i}`,
          date: parsedDate,
          time: '12:00',
          amount,
          type,
          categoryId: catId,
          accountId: targetAccountId,
          description: rawDesc || 'Transaksi Mutasi Bank',
          source: 'import_csv',
          originalBankRawText: line,
          isConfirmed: true,
        });
      }
    } catch {
      errors.push(`Gagal memproses baris ${i + 1}: ${line}`);
    }
  }

  return {
    transactions,
    errors,
    totalParsed: transactions.length,
    totalExpense,
    totalIncome,
  };
}
