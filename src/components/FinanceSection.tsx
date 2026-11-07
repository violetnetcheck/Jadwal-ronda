/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  Printer,
  X,
} from 'lucide-react';

export const FinanceSection: React.FC = () => {
  const { user, state, updateFeeStatus, addExpense, recordFee } = useApp();

  const [activeTab, setActiveTab] = useState<'iuran' | 'transaksi'>('iuran');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'LUNAS' | 'BELUM LUNAS'>('all');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);

  // Fee Form
  const [feeName, setFeeName] = useState(user.name || '');
  const [feeBlock, setFeeBlock] = useState('Blok A No. 01');
  const [feeAmount, setFeeAmount] = useState('25000');
  const [feeMonth, setFeeMonth] = useState('November 2026');
  const [feeStatus, setFeeStatus] = useState<'LUNAS' | 'BELUM LUNAS'>('LUNAS');
  const [isSubmittingFee, setIsSubmittingFee] = useState(false);

  // Expense form
  const [expCategory, setExpCategory] = useState('Operasional Ronda');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [isSubmittingExp, setIsSubmittingExp] = useState(false);

  const fees = state?.citizenFees || [];
  const transactions = state?.cashTransactions || [];

  // Financial calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'PEMASUKAN')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'PENGELUARAN')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const paidCount = fees.filter((f) => f.status === 'LUNAS').length;
  const totalHouseholds = fees.length;
  const collectionRate = totalHouseholds > 0 ? Math.round((paidCount / totalHouseholds) * 100) : 0;

  // Filtered fees
  const filteredFees = fees.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.block.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeName.trim()) {
      alert('Nama warga / KK wajib diisi');
      return;
    }
    const amt = parseInt(feeAmount.replace(/\D/g, ''), 10) || 25000;
    setIsSubmittingFee(true);
    await recordFee(feeName.trim(), feeBlock.trim(), amt, feeMonth.trim(), feeStatus);
    setIsSubmittingFee(false);
    setIsFeeModalOpen(false);
    setFeeName('');
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(expAmount.replace(/\D/g, ''), 10);
    if (!amountNum || amountNum <= 0) {
      alert('Masukkan nominal pengeluaran yang valid');
      return;
    }
    if (!expDesc.trim()) {
      alert('Masukkan keterangan pengeluaran');
      return;
    }

    setIsSubmittingExp(true);
    await addExpense({
      category: expCategory,
      amount: amountNum,
      description: expDesc.trim(),
    });
    setIsSubmittingExp(false);
    setIsExpenseModalOpen(false);
    setExpAmount('');
    setExpDesc('');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Kas Keuangan Warga RT.01 RW.02
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Transparansi Siskamling Babakan Pandan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Buku Kas Ronda & Iuran Keamanan Bulanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Pencatatan iuran keamanan bulanan warga RT.01 serta transparansi pemasukan dan pengeluaran kas lingkungan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-300 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Rekap</span>
          </button>

          <button
            onClick={() => setIsFeeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Iuran Warga</span>
          </button>

          {user.role === 'rt_rw' && (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pengeluaran RT</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Saldo Kas Siskamling</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-900 font-mono tabular-nums">
            Rp {currentBalance.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Saldo aktif siap guna di kas RT</p>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Pemasukan</span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-900 font-mono tabular-nums">
            Rp {totalIncome.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Iuran warga & donasi sukarela</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Pengeluaran</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-900 font-mono tabular-nums">
            Rp {totalExpense.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Operasional senter, kopi, perbaikan</p>
        </div>

        {/* Collection Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Tingkat Iuran Warga</span>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {paidCount} / {totalHouseholds} KK
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {collectionRate}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Switcher & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('iuran')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'iuran'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status Iuran Warga ({fees.length} KK)
            </button>
            <button
              onClick={() => setActiveTab('transaksi')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'transaksi'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Arus Kas & Transaksi ({transactions.length})
            </button>
          </div>

          {activeTab === 'iuran' && (
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setStatusFilter('LUNAS')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    statusFilter === 'LUNAS' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Lunas
                </button>
                <button
                  onClick={() => setStatusFilter('BELUM LUNAS')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    statusFilter === 'BELUM LUNAS' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Belum Lunas
                </button>
              </div>

              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari warga / blok..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Iuran Warga Table */}
        {activeTab === 'iuran' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold w-12 text-center">No</th>
                  <th className="py-3 px-4 font-semibold">Nama Warga / Kepala Keluarga</th>
                  <th className="py-3 px-4 font-semibold">Blok Rumah</th>
                  <th className="py-3 px-4 font-semibold">Periode & Nominal</th>
                  <th className="py-3 px-4 font-semibold">Status Iuran</th>
                  <th className="py-3 px-4 font-semibold">Tanggal Bayar / Kwitansi</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center">
                      <div className="max-w-md mx-auto space-y-2">
                        <p className="text-slate-800 font-bold text-sm">
                          Belum Ada Data Iuran Warga yang Dicatat
                        </p>
                        <p className="text-slate-500 text-xs">
                          Gunakan tombol &quot;Catat Iuran Warga&quot; di bagian atas untuk mencatat pembayaran iuran warga RT.01 secara resmi.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFees.map((fee, idx) => (
                    <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-400 text-center font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {fee.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {fee.block}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-800">
                        Rp {fee.amount.toLocaleString('id-ID')} <span className="text-[11px] text-slate-500 font-sans">({fee.month})</span>
                      </td>
                      <td className="py-3 px-4">
                        {fee.status === 'LUNAS' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Lunas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            Belum Lunas
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {fee.paidAt ? (
                          <span>
                            {fee.paidAt} <span className="font-mono text-slate-400">({fee.receiptNumber})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Menunggu Pembayaran</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {fee.status === 'BELUM LUNAS' ? (
                          <button
                            onClick={() => updateFeeStatus(fee.id, 'LUNAS')}
                            className="px-3 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors cursor-pointer"
                          >
                            Tandai Lunas
                          </button>
                        ) : (
                          <button
                            onClick={() => updateFeeStatus(fee.id, 'BELUM LUNAS')}
                            className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Batalkan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Arus Transaksi Kas Table */}
        {activeTab === 'transaksi' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tanggal</th>
                  <th className="py-3 px-4 font-semibold">Tipe</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Deskripsi Transaksi</th>
                  <th className="py-3 px-4 font-semibold">Pencatat</th>
                  <th className="py-3 px-4 font-semibold text-right">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-slate-500 text-xs">
                      Belum ada transaksi kas yang dicatat.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            tx.type === 'PEMASUKAN'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.type === 'PEMASUKAN' ? '+' : '-'} {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {tx.recordedBy}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                          tx.type === 'PEMASUKAN' ? 'text-blue-700' : 'text-amber-800'
                        }`}
                      >
                        {tx.type === 'PEMASUKAN' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Catat Iuran Warga */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-base">Catat Iuran Keamanan Warga</h3>
              </div>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="text-teal-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFeeSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Warga / Kepala Keluarga</label>
                <input
                  type="text"
                  required
                  value={feeName}
                  onChange={(e) => setFeeName(e.target.value)}
                  placeholder="Contoh: Bpk. Ahmad Dahlan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Blok Rumah</label>
                  <input
                    type="text"
                    required
                    value={feeBlock}
                    onChange={(e) => setFeeBlock(e.target.value)}
                    placeholder="Contoh: Blok B No. 04"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    min={5000}
                    step={5000}
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Bulan Iuran</label>
                  <input
                    type="text"
                    required
                    value={feeMonth}
                    onChange={(e) => setFeeMonth(e.target.value)}
                    placeholder="November 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status Pembayaran</label>
                  <select
                    value={feeStatus}
                    onChange={(e) => setFeeStatus(e.target.value as 'LUNAS' | 'BELUM LUNAS')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  >
                    <option value="LUNAS">LUNAS (Kwitansi Aktif)</option>
                    <option value="BELUM LUNAS">BELUM LUNAS</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingFee}
                className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmittingFee ? 'Menyimpan...' : 'Simpan Catatan Iuran'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengeluaran */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Catat Pengeluaran Kas RT</h3>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Kategori Pengeluaran</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="Operasional Ronda">Operasional Ronda (Baterai Senter, Peluit, Jas Hujan)</option>
                  <option value="Konsumsi Petugas">Konsumsi Petugas (Kopi, Teh, Gula, Gorengan)</option>
                  <option value="Penerangan Lingkungan">Penerangan Lingkungan (Bohlam PJU, Kabel)</option>
                  <option value="Pemeliharaan Pos">Pemeliharaan & Kebersihan Pos Ronda</option>
                  <option value="ATK & Buku Tamu">ATK, Buku Tamu, Fotocopy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nominal Pengeluaran (Rp)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={5000}
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="Contoh: 75000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Keterangan Lengkap</label>
                <textarea
                  required
                  rows={3}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Contoh: Pembelian baterai senter patroli 6 pcs di warung Pak Haji..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingExp}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmittingExp ? 'Menyimpan...' : 'Simpan Transaksi Pengeluaran'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
