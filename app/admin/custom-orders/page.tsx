'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CustomOrderRequest, CustomOrderStatus } from '@/lib/types';
import {
  Wand2,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';

const CUSTOM_STATUSES: CustomOrderStatus[] = [
  'PENDING_REVIEW',
  'QUOTED',
  'QUOTE_ACCEPTED',
  'QUOTE_REJECTED',
  'PAYMENT_PENDING',
  'PAID_IN_PRODUCTION',
  'QUALITY_CHECK',
  'COMPLETED',
  'CANCELLED',
];

export default function AdminCustomOrdersPage() {
  const [requests, setRequests] = useState<CustomOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState<CustomOrderRequest | null>(null);

  // Quote form state
  const [quoteAmount, setQuoteAmount] = useState<number>(2499);
  const [estimatedPrepDays, setEstimatedPrepDays] = useState<number>(7);
  const [breakdown, setBreakdown] = useState('');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [selectedStatus, setSelectedStatus] = useState<CustomOrderStatus>('QUOTED');
  const [saving, setSaving] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    fetch('/api/custom-orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.customOrders) setRequests(data.customOrders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openQuoteModal = (req: CustomOrderRequest) => {
    setActiveRequest(req);
    setSelectedStatus(req.status);
    if (req.quotation) {
      setQuoteAmount(req.quotation.quoteAmount);
      setEstimatedPrepDays(req.quotation.estimatedPrepDays);
      setBreakdown(req.quotation.breakdown);
      setValidUntil(req.quotation.validUntil);
    } else {
      setQuoteAmount(2499);
      setEstimatedPrepDays(7);
      setBreakdown(`Handmade ${req.productType} in requested colors (${req.preferredColors}). Includes gift packaging.`);
      setValidUntil(new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]);
    }
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    setSaving(true);
    await fetch('/api/custom-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: activeRequest.id,
        status: selectedStatus,
        quotation: {
          quoteAmount: Number(quoteAmount),
          estimatedPrepDays: Number(estimatedPrepDays),
          breakdown,
          validUntil,
        },
      }),
    });
    setSaving(false);
    setActiveRequest(null);
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Custom Crochet Requests & Quotation Studio
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer bespoke briefs, evaluate reference photos, and issue quotes.
        </p>
      </div>

      {/* REQUESTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Request ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Creation Type</th>
                <th className="py-3 px-6">Palette & Specs</th>
                <th className="py-3 px-6">Delivery Target</th>
                <th className="py-3 px-6">Quotation (₹)</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">#{req.requestNumber}</td>

                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900">{req.customerName}</p>
                    <p className="text-[11px] text-slate-400">{req.email}</p>
                    <p className="text-[11px] text-slate-400">{req.phone}</p>
                  </td>

                  <td className="py-4 px-6">
                    <p className="font-bold text-purple-900">{req.productType}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{req.description}</p>
                  </td>

                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-800">{req.preferredColors}</p>
                    <span className="text-[11px] text-slate-400">Qty: {req.quantity} • {req.preferredSize}</span>
                  </td>

                  <td className="py-4 px-6 font-medium text-slate-800">{req.requiredDeliveryDate}</td>

                  <td className="py-4 px-6">
                    {req.quotation ? (
                      <div>
                        <span className="font-bold text-emerald-800 text-sm">
                          ₹{req.quotation.quoteAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {req.quotation.estimatedPrepDays} days crafting
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                        Awaiting Quote
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => openQuoteModal(req)}
                      className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs"
                    >
                      {req.quotation ? 'Edit Quote' : 'Create Quote'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUOTATION MODAL */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Custom Quotation: #{activeRequest.requestNumber}
                </h3>
                <p className="text-xs text-slate-500">Customer: {activeRequest.customerName}</p>
              </div>
              <button onClick={() => setActiveRequest(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Brief review */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <p><strong>Design:</strong> {activeRequest.productType}</p>
              <p><strong>Brief:</strong> {activeRequest.description}</p>
              <p><strong>Color Theme:</strong> {activeRequest.preferredColors}</p>
              {activeRequest.referenceImages.length > 0 && (
                <div className="pt-1">
                  <span className="font-bold text-slate-700">Reference:</span>
                  <a
                    href={activeRequest.referenceImages[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-700 underline ml-1 font-semibold"
                  >
                    View Reference Photo ↗
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveQuote} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quote Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Crafting Days *</label>
                  <input
                    type="number"
                    required
                    value={estimatedPrepDays}
                    onChange={(e) => setEstimatedPrepDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Price Breakdown & Inclusions *</label>
                <textarea
                  required
                  rows={3}
                  value={breakdown}
                  onChange={(e) => setBreakdown(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quote Valid Until</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Update Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as CustomOrderStatus)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-medium"
                  >
                    {CUSTOM_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Send Quotation to Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
