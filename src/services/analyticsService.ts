import { Category, MonthlyAnalysisSummary, Transaction } from '../types/finance';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactRupiah(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${amount}`;
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthNumber - 1] || '';
}

export function calculateMonthlyAnalysis(
  transactions: Transaction[],
  categories: Category[],
  month: number, // 1 - 12
  year: number
): MonthlyAnalysisSummary {
  // Current month filter
  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  // Previous month filter for comparison
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
  });

  let totalIncome = 0;
  let totalExpense = 0;

  // Day maps for trends
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyDataMap: { [day: number]: { expense: number; income: number } } = {};
  for (let i = 1; i <= daysInMonth; i++) {
    dailyDataMap[i] = { expense: 0, income: 0 };
  }

  // Category totals
  const currentCategoryTotals: { [catId: string]: number } = {};
  const prevCategoryTotals: { [catId: string]: number } = {};

  currentMonthTransactions.forEach((t) => {
    const day = new Date(t.date).getDate();
    if (t.type === 'income') {
      totalIncome += t.amount;
      if (dailyDataMap[day]) dailyDataMap[day].income += t.amount;
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
      if (dailyDataMap[day]) dailyDataMap[day].expense += t.amount;
      currentCategoryTotals[t.categoryId] = (currentCategoryTotals[t.categoryId] || 0) + t.amount;
    }
  });

  prevMonthTransactions.forEach((t) => {
    if (t.type === 'expense') {
      prevCategoryTotals[t.categoryId] = (prevCategoryTotals[t.categoryId] || 0) + t.amount;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Average daily expense
  // If viewing current calendar month, count days up to today or daysInMonth
  const today = new Date();
  const isCurrentActiveCalendarMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
  const daysCounted = isCurrentActiveCalendarMonth ? Math.max(1, today.getDate()) : daysInMonth;
  const avgDailyExpense = Math.round(totalExpense / daysCounted);

  // Highest expense day
  let highestExpenseDay: { date: string; amount: number; description: string } | null = null;
  let maxDaySpend = 0;

  Object.entries(dailyDataMap).forEach(([dayStr, val]) => {
    if (val.expense > maxDaySpend) {
      maxDaySpend = val.expense;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`;
      const highestTx = currentMonthTransactions
        .filter((t) => t.type === 'expense' && t.date === dateStr)
        .sort((a, b) => b.amount - a.amount)[0];

      highestExpenseDay = {
        date: dateStr,
        amount: val.expense,
        description: highestTx ? highestTx.description : 'Pengeluaran harian gabungan',
      };
    }
  });

  // Category breakdown
  const categoryBreakdown = categories
    .filter((cat) => cat.type === 'expense')
    .map((cat) => {
      const amount = currentCategoryTotals[cat.id] || 0;
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      const prevAmount = prevCategoryTotals[cat.id] || 0;

      let diffFromLastMonthPercent: number | undefined = undefined;
      if (prevAmount > 0) {
        diffFromLastMonthPercent = Math.round(((amount - prevAmount) / prevAmount) * 100);
      } else if (amount > 0) {
        diffFromLastMonthPercent = 100;
      }

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        iconName: cat.iconName,
        color: cat.color,
        group: cat.group,
        amount,
        percentage: Math.round(percentage * 10) / 10,
        budget: cat.budgetMonthly || 0,
        diffFromLastMonthPercent,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 50/30/20 rule breakdown
  let needsAmount = 0;
  let wantsAmount = 0;
  let savingsCategoryAmount = 0;

  categoryBreakdown.forEach((item) => {
    if (item.group === 'needs') needsAmount += item.amount;
    else if (item.group === 'wants') wantsAmount += item.amount;
    else if (item.group === 'savings') savingsCategoryAmount += item.amount;
  });

  // In 50/30/20, actual financial savings = netSavings if positive, or allocated investment/savings categories
  const effectiveSavings = Math.max(netSavings, savingsCategoryAmount);
  const baseFor503020 = totalIncome > 0 ? totalIncome : (needsAmount + wantsAmount + effectiveSavings);

  const needsPct = baseFor503020 > 0 ? Math.round((needsAmount / baseFor503020) * 100) : 0;
  const wantsPct = baseFor503020 > 0 ? Math.round((wantsAmount / baseFor503020) * 100) : 0;
  const savingsPct = baseFor503020 > 0 ? Math.max(0, Math.round((effectiveSavings / baseFor503020) * 100)) : 0;

  // Daily trends list
  const dailyTrends = Object.entries(dailyDataMap).map(([dayStr, data]) => {
    const day = parseInt(dayStr, 10);
    return {
      day,
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      expense: data.expense,
      income: data.income,
    };
  });

  // Intelligent insights generation
  const insights: MonthlyAnalysisSummary['insights'] = [];

  // Insight 1: Savings rate
  if (savingsRate >= 20) {
    insights.push({
      id: 'ins_savings_good',
      type: 'positive',
      title: 'Tingkat Tabungan Sangat Sehat',
      description: `Rasio tabungan dan investasi Anda mencapai ${savingsRate}% dari total penghasilan, melebihi anjuran standar finansial (minimal 20%).`,
      badge: `${savingsRate}% Terselamatkan`,
    });
  } else if (savingsRate > 0) {
    insights.push({
      id: 'ins_savings_low',
      type: 'warning',
      title: 'Tingkat Tabungan Di Bawah Target',
      description: `Rasio tabungan Anda bulan ini sebesar ${savingsRate}%. Idealnya alokasikan minimal 20% (${formatRupiah(totalIncome * 0.2)}) di awal gajian.`,
      badge: 'Perlu Ditingkatkan',
    });
  } else {
    insights.push({
      id: 'ins_deficit',
      type: 'warning',
      title: 'Arus Kas Mengalami Defisit',
      description: `Pengeluaran bulan ini melebihi pemasukan sebesar ${formatRupiah(Math.abs(netSavings))}. Periksa pos belanja gaya hidup untuk menyeimbangkan kembali neraca.`,
      badge: 'Defisit Bulanan',
    });
  }

  // Insight 2: Top expense category
  const topCategory = categoryBreakdown[0];
  if (topCategory && topCategory.amount > 0) {
    insights.push({
      id: 'ins_top_spend',
      type: 'tip',
      title: `Porsi Terbesar: ${topCategory.categoryName}`,
      description: `Pengeluaran ini menyerap ${topCategory.percentage}% (${formatRupiah(topCategory.amount)}) dari total biaya Anda. ${
        topCategory.budget > 0 && topCategory.amount > topCategory.budget
          ? `Telah melebihi batas anggaran (${formatRupiah(topCategory.budget)}).`
          : 'Masih berada dalam batas anggaran yang wajar.'
      }`,
      badge: `${topCategory.percentage}% Pengeluaran`,
    });
  }

  // Insight 3: Dining out / Wants check
  const diningOut = categoryBreakdown.find((c) => c.categoryId === 'cat_dining_out');
  if (diningOut && diningOut.amount > 1000000) {
    insights.push({
      id: 'ins_dining',
      type: 'tip',
      title: 'Kebocoran Halus: Makan Luar & Kopi',
      description: `Pengeluaran di kafe & pesan makanan mencapai ${formatRupiah(diningOut.amount)}. Memasak sendiri di rumah 2-3 hari seminggu berpotensi menghemat hingga ${formatRupiah(diningOut.amount * 0.35)}/bulan.`,
      badge: 'Potensi Hemat',
    });
  }

  // Insight 4: 50/30/20 balance
  if (wantsPct > 35) {
    insights.push({
      id: 'ins_wants_high',
      type: 'warning',
      title: 'Pos Keinginan (Wants) Di Atas 30%',
      description: `Belanja keinginan mencapai ${wantsPct}%. Coba evaluasi pengeluaran impulsif atau tunda pembelian non-kritis selama 30 hari ke depan.`,
      badge: `${wantsPct}% vs Target 30%`,
    });
  } else {
    insights.push({
      id: 'ins_needs_balanced',
      type: 'positive',
      title: 'Struktur Pengeluaran Proporsional',
      description: `Alokasi kebutuhan primer (${needsPct}%) dan gaya hidup (${wantsPct}%) Anda berada pada koridor aman prinsip 50/30/20.`,
      badge: 'Finansial Seimbang',
    });
  }

  return {
    month,
    year,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    avgDailyExpense,
    highestExpenseDay,
    categoryBreakdown,
    budget503020: {
      needs: { amount: needsAmount, percentage: needsPct, target: 50 },
      wants: { amount: wantsAmount, percentage: wantsPct, target: 30 },
      savings: { amount: effectiveSavings, percentage: savingsPct, target: 20 },
    },
    dailyTrends,
    insights,
  };
}
