import { useState } from 'react';
import { X, HeartHandshake, Copy, Check, QrCode, ShieldCheck, KeyRound } from 'lucide-react';
import {
  useConnectCareCircle,
  useGenerateInviteCode,
} from '../../../services/api/careCircle';
import { RelationshipType } from '../../../types/domain';

interface ConnectRelativeModalProps {
  onClose: () => void;
}

const RELATIONSHIPS: RelationshipType[] = [
  'Parent',
  'Grandparent',
  'Sibling',
  'Child',
  'Spouse',
  'Relative',
];

export default function ConnectRelativeModal({ onClose }: ConnectRelativeModalProps) {
  const [activeTab, setActiveTab] = useState<'enter' | 'share'>('enter');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('Parent');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const connectMutation = useConnectCareCircle();
  const generateMutation = useGenerateInviteCode();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim() || inviteCodeInput.trim().length < 6) {
      setErrorMsg('Please enter a valid 6-character code');
      return;
    }

    setErrorMsg(null);
    try {
      await connectMutation.mutateAsync({
        inviteCode: inviteCodeInput.trim().toUpperCase(),
        relationshipType,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to connect');
    }
  };

  const handleGenerate = async () => {
    setErrorMsg(null);
    try {
      const res = await generateMutation.mutateAsync(relationshipType);
      setGeneratedCode(res.inviteCode);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to generate code');
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HeartHandshake size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Connect Family</h3>
              <p className="text-[11px] text-slate-500">Diaspora Remote Health Monitoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('enter');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === 'enter' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            Enter Relative's Code
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('share');
              setErrorMsg(null);
              if (!generatedCode) handleGenerate();
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === 'share' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            Share My Code
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl border border-clay/30 bg-clay/5 p-3 text-xs text-clay font-medium">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Enter Code */}
        {activeTab === 'enter' && (
          <form onSubmit={handleConnect} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                6-Character Pairing Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. YC9X4A"
                className="w-full text-center font-mono text-xl font-bold uppercase tracking-widest rounded-xl border border-slate-200 bg-slate-50 py-3 text-slate-900 focus:bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-[10px] text-slate-500 text-center">
                Ask your parent or relative back home for their 6-character code.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Relationship to You
              </label>
              <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-start gap-2">
              <ShieldCheck size={16} className="text-fern flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-tight">
                Pairing enables read-only tracking of Blood Pressure and Blood Glucose logs with real-time crisis escalation.
              </p>
            </div>

            <button
              type="submit"
              disabled={connectMutation.isPending}
              className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md transition-all active:scale-98 hover:bg-primary/95 disabled:opacity-50"
            >
              {connectMutation.isPending ? 'Connecting...' : 'Connect to Relative'}
            </button>
          </form>
        )}

        {/* Tab 2: Share Code */}
        {activeTab === 'share' && (
          <div className="mt-4 space-y-4">
            <div className="text-center">
              <p className="text-xs text-slate-600">
                Share this pairing code with your family member so they can connect:
              </p>

              <div className="my-4 flex items-center justify-center">
                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 px-6 py-4">
                  <span className="font-mono text-3xl font-black tracking-widest text-primary tabular-nums">
                    {generateMutation.isPending ? '...' : generatedCode || '------'}
                  </span>
                </div>
              </div>

              {generatedCode && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mx-auto flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-fern" />
                      <span className="text-fern">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Pairing Code</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-start gap-2">
              <KeyRound size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-tight">
                This code can only be used once. Once accepted, your relative can remotely view your vitals and receive crisis alerts.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
