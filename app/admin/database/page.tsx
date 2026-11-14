'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Download,
  Users,
  Package,
  ShoppingBag,
  Wand2,
  Tag,
  Bell,
  Code,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

type TableKey = 'orders' | 'products' | 'users' | 'customOrders' | 'coupons' | 'notifications';

export default function AdminDatabasePage() {
  const [activeTable, setActiveTable] = useState<TableKey>('orders');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inspectedRecord, setInspectedRecord] = useState<any | null>(null);

  const fetchTable = (table: TableKey) => {
    setLoading(true);
    fetch(`/api/analytics?table=${table}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.records) setRecords(data.records);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTable(activeTable);
    setSearch('');
    setInspectedRecord(null);
  }, [activeTable]);

  const filteredRecords = records.filter((r) => {
    const jsonStr = JSON.stringify(r).toLowerCase();
    return jsonStr.includes(search.toLowerCase());
  });

  const exportTableJSON = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LoopAndLove-DB-${activeTable}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-7 h-7 text-purple-700" /> Database Management & Records Inspector
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time inspection of raw database tables, foreign relationships, and order transaction records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTable(activeTable)}
            className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-2xs"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportTableJSON}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Table JSON
          </button>
        </div>
      </div>

      {/* TABLE TABS */}
      <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs text-xs font-semibold">
        <button
          onClick={() => setActiveTable('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            activeTable === 'orders' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> orders ({activeTable === 'orders' ? records.length : '...'})
        </button>
        <button
          onClick={() => setActiveTable('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            activeTable === 'products' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" /> products ({activeTable === 'products' ? records.length : '...'})
        </button>
        <button
          onClick={() => setActiveTable('customOrders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            activeTable === 'customOrders' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wand2 className="w-4 h-4" /> custom_orders ({activeTable === 'customOrders' ? records.length : '...'})
        </button>
        <button
          onClick={() => setActiveTable('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            activeTable === 'users' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> users ({activeTable === 'users' ? records.length : '...'})
        </button>
        <button
          onClick={() => setActiveTable('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            activeTable === 'coupons' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" /> coupons ({activeTable === 'coupons' ? records.length : '...'})
        </button>
        <button
          onClick={() => setActiveTable('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            activeTable === 'notifications' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" /> notifications ({activeTable === 'notifications' ? records.length : '...'})
        </button>
      </div>

      {/* SEARCH WITHIN TABLE */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={`Search across ${activeTable} records...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredRecords.length}</strong> of {records.length} records
        </span>
      </div>

      {/* TABLE VIEW & JSON INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Records list (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4"># / ID</th>
                  <th className="py-3 px-4">Primary Label</th>
                  <th className="py-3 px-4">Secondary Data</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredRecords.map((r, i) => (
                  <tr
                    key={r.id || i}
                    onClick={() => setInspectedRecord(r)}
                    className={`cursor-pointer transition-colors ${
                      inspectedRecord?.id === r.id ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 text-purple-700 truncate max-w-[120px]">
                      {r.orderNumber || r.requestNumber || r.sku || r.id}
                    </td>
                    <td className="py-3 px-4 truncate max-w-[180px] font-sans font-medium">
                      {r.customerName || r.name || r.title || r.code || r.email}
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[200px]">
                      {r.totalAmount ? `₹${r.totalAmount}` : r.category || r.role || r.status || r.discountValue}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button className="text-xs text-purple-700 hover:underline font-semibold">
                        View JSON →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live JSON Inspector (1 col) */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold text-white mb-4">
              <span className="flex items-center gap-1.5">
                <Code className="w-4 h-4 text-purple-400" /> Record Object Inspector
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase">
                {activeTable.slice(0, -1)}
              </span>
            </div>

            {inspectedRecord ? (
              <pre className="text-[11px] font-mono text-purple-200/90 overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {JSON.stringify(inspectedRecord, null, 2)}
              </pre>
            ) : (
              <div className="text-center py-24 text-slate-500 text-xs">
                Click any row in the table to inspect its full database schema and attributes in real-time.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400 text-center">
            🔒 Row-Level Security Protected • Sanitized Production Store
          </div>
        </div>
      </div>
    </div>
  );
}
