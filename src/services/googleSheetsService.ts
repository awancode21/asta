import { Transaction, Category, Account } from '../types/finance';

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface CreateSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Creates a brand new Google Spreadsheet specifically formatted for ArthaKu personal finance
 */
export async function createFinanceSpreadsheet(
  accessToken: string,
  title: string,
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[]
): Promise<CreateSpreadsheetResult> {
  // 1. Create spreadsheet with 2 sheets
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
        locale: 'id_ID',
      },
      sheets: [
        {
          properties: {
            title: 'Transaksi Harian',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: 'Ringkasan Bulanan',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json();
    throw new Error(errorData?.error?.message || 'Gagal membuat Google Spreadsheet baru');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate Transaksi Harian
  const transactionHeaders = [
    'Tanggal',
    'Waktu',
    'Deskripsi Transaksi',
    'Kategori',
    'Rekening / Sumber',
    'Tipe',
    'Nominal (Rp)',
    'Sumber Pencatatan',
    'Catatan / Nota',
  ];

  const transactionRows = transactions.map((t) => {
    const cat = categories.find((c) => c.id === t.categoryId)?.name || 'Lainnya';
    const acc = accounts.find((a) => a.id === t.accountId)?.name || 'Rekening';
    const amountVal = t.type === 'expense' ? -t.amount : t.amount;

    return [
      t.date,
      t.time || '',
      t.description,
      cat,
      acc,
      t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
      amountVal,
      t.source === 'bank_sync' ? '⚡ Bank Sync' : t.source === 'import_csv' ? '📁 CSV Import' : 'Manual',
      t.notes || '',
    ];
  });

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Transaksi Harian'!A1:I?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: "'Transaksi Harian'!A1:I",
        majorDimension: 'ROWS',
        values: [transactionHeaders, ...transactionRows],
      }),
    }
  );

  // 3. Populate Ringkasan Bulanan tab
  const summaryHeaders = ['Kategori', 'Grup Alokasi', 'Batas Anggaran (Rp)', 'Warna Label'];
  const summaryRows = categories.map((c) => [
    c.name,
    c.group === 'needs' ? 'Kebutuhan (50%)' : c.group === 'wants' ? 'Keinginan (30%)' : c.group === 'savings' ? 'Tabungan/Investasi (20%)' : 'Pemasukan',
    c.budgetMonthly || 0,
    c.color,
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Ringkasan Bulanan'!A1:D?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: "'Ringkasan Bulanan'!A1:D",
        majorDimension: 'ROWS',
        values: [summaryHeaders, ...summaryRows],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

/**
 * Appends a new transaction row to an existing Google Spreadsheet
 */
export async function appendTransactionToSheet(
  accessToken: string,
  spreadsheetId: string,
  transaction: Transaction,
  categories: Category[],
  accounts: Account[],
  sheetTitle = 'Transaksi Harian'
) {
  const cat = categories.find((c) => c.id === transaction.categoryId)?.name || 'Lainnya';
  const acc = accounts.find((a) => a.id === transaction.accountId)?.name || 'Rekening';
  const amountVal = transaction.type === 'expense' ? -transaction.amount : transaction.amount;

  const row = [
    transaction.date,
    transaction.time || '',
    transaction.description,
    cat,
    acc,
    transaction.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
    amountVal,
    transaction.source === 'bank_sync' ? '⚡ Bank Sync' : transaction.source === 'import_csv' ? '📁 CSV Import' : 'Manual',
    transaction.notes || '',
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetTitle}'!A:I:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'${sheetTitle}'!A:I`,
        majorDimension: 'ROWS',
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.error?.message || 'Gagal menambahkan baris ke Google Sheets');
  }

  return await res.json();
}

/**
 * Full sync / overwrite all current transactions to Google Sheet
 */
export async function syncAllTransactionsToSheet(
  accessToken: string,
  spreadsheetId: string,
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  sheetTitle = 'Transaksi Harian'
) {
  const transactionHeaders = [
    'Tanggal',
    'Waktu',
    'Deskripsi Transaksi',
    'Kategori',
    'Rekening / Sumber',
    'Tipe',
    'Nominal (Rp)',
    'Sumber Pencatatan',
    'Catatan / Nota',
  ];

  const transactionRows = transactions.map((t) => {
    const cat = categories.find((c) => c.id === t.categoryId)?.name || 'Lainnya';
    const acc = accounts.find((a) => a.id === t.accountId)?.name || 'Rekening';
    const amountVal = t.type === 'expense' ? -t.amount : t.amount;

    return [
      t.date,
      t.time || '',
      t.description,
      cat,
      acc,
      t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
      amountVal,
      t.source === 'bank_sync' ? '⚡ Bank Sync' : t.source === 'import_csv' ? '📁 CSV Import' : 'Manual',
      t.notes || '',
    ];
  });

  // Clear existing values first
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetTitle}'!A1:I:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Write new values
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetTitle}'!A1:I?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'${sheetTitle}'!A1:I`,
        majorDimension: 'ROWS',
        values: [transactionHeaders, ...transactionRows],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Gagal menyinkronkan data ke Google Sheets');
  }

  return await res.json();
}

/**
 * List all Google Spreadsheets in the user's Google Drive
 */
export async function listDriveSpreadsheets(accessToken: string): Promise<DriveSpreadsheetFile[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=15`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Gagal memuat daftar Google Spreadsheet dari Drive');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetch rows from Google Sheet to import back into ArthaKu
 */
export async function fetchSheetRows(
  accessToken: string,
  spreadsheetId: string,
  range = 'A1:I500'
): Promise<string[][]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Gagal membaca isi Google Sheet');
  }

  const data = await res.json();
  return data.values || [];
}
