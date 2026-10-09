import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  Lock,
  Loader2
} from 'lucide-react';
import { MathView } from '../MathView';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { exportLabReportPdf } from '../../utils/LabReportExporter';
import type { TopicData, SimulationConfig } from '../../data/topicsData';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicData;
  simulation: SimulationConfig;
  params: Record<string, number>;
  telemetry: Record<string, string>;
  snapshotDataUrl?: string | null;
  onOpenPricing?: () => void;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  topic,
  simulation,
  params,
  telemetry,
  snapshotDataUrl,
  onOpenPricing
}) => {
  const { profile } = useAuth();
  const { canExportPdf, triggerPaywall, tier } = useSubscription();

  const [studentName, setStudentName] = useState(
    profile?.display_name || profile?.username || 'Student Investigator'
  );
  const [institutionName, setInstitutionName] = useState(
    profile?.institution_name || 'Department of Physics & Mathematics'
  );
  const [labNotes, setLabNotes] = useState(
    `Trial executed with active simulation parameters. The observed results align with the governing theoretical equations within computational tolerance.`
  );
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const reportId = `PHY-${topic.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleExportPdf = async () => {
    // Pro Tier Gate: Lock native PDF export behind Pro Upgrade modal
    if (!canExportPdf()) {
      if (onOpenPricing) {
        onOpenPricing();
      } else {
        triggerPaywall('pdf_export', 'PRO');
      }
      return;
    }

    try {
      setIsExporting(true);
      await exportLabReportPdf({
        topic,
        simulation,
        params,
        telemetry,
        studentName,
        institutionName,
        labNotes,
        reportId,
        reportDate,
        snapshotDataUrl
      });
    } catch (err) {
      console.error('[LabReportModal] PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySummary = () => {
    const summaryText = `
PHYSORA LABORATORY REPORT
Report ID: ${reportId}
Topic: ${topic.title} (${topic.category})
Simulation: ${simulation.name}
Investigator: ${studentName} (${institutionName})
Date: ${reportDate}

PARAMETERS:
${simulation.controls.map((c) => `- ${c.label}: ${params[c.id] ?? c.defaultValue} ${c.unit || ''}`).join('\n')}

TELEMETRY & MEASUREMENTS:
${Object.entries(telemetry).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

CONCLUSIONS:
${labNotes}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(10, 15, 30, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="physora-printable-modal"
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '94vh',
          background: 'var(--bg-card, #FFFFFF)',
          borderRadius: '20px',
          border: '1px solid var(--border-medium, #E2E8F0)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'physoraModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Action Bar */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle, #F1F5F9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-subtle, #F8FAFC)',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--electric-blue, #2563EB)" />
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Interactive Lab Report Exporter
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#10B98120',
                color: '#10B981',
                fontWeight: 700
              }}
            >
              Academic Standard
            </span>
            {tier === 'FREE' && (
              <span
                style={{
                  fontSize: '0.70rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#D97706',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Lock size={11} /> PDF Download: Pro Only
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleCopySummary}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.80rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>

            {/* Native PDF Download Button (Pro Tier Gated) */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                border: 'none',
                background: canExportPdf()
                  ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                  : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: canExportPdf()
                  ? '0 2px 8px rgba(37, 99, 235, 0.3)'
                  : '0 2px 8px rgba(124, 58, 237, 0.35)',
                opacity: isExporting ? 0.75 : 1
              }}
              title={
                canExportPdf()
                  ? 'Download formatted academic PDF laboratory report'
                  : 'Upgrade to Pro to export native PDF documents'
              }
            >
              {isExporting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : canExportPdf() ? (
                <Download size={15} />
              ) : (
                <Lock size={14} />
              )}
              <span>
                {isExporting
                  ? 'Generating PDF...'
                  : canExportPdf()
                  ? 'Download Academic PDF'
                  : 'Export PDF (Upgrade to Pro)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div
          id="physora-lab-report-document"
          style={{
            padding: '36px 48px',
            overflowY: 'auto',
            flex: 1,
            background: '#FFFFFF',
            color: '#0F172A',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)'
          }}
        >
          {/* Institution Header */}
          <div
            style={{
              borderBottom: '2px solid #0F172A',
              paddingBottom: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: '#00274C'
                  }}
                >
                  PHYSORA STEM LABORATORY REPORT
                </span>
              </div>
              <input
                type="text"
                className="report-input-field"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Institution / School Name"
                style={{
                  fontSize: '0.90rem',
                  color: '#475569',
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: '1px dashed #CBD5E1',
                  background: 'transparent',
                  width: '380px',
                  outline: 'none',
                  padding: '2px 0'
                }}
              />
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.80rem', color: '#64748B' }}>
              <div><strong>Report ID:</strong> {reportId}</div>
              <div><strong>Date:</strong> {reportDate}</div>
              <div><strong>Status:</strong> Verified Computational Model</div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748B' }}>
                Investigator
              </span>
              <input
                type="text"
                className="report-input-field"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={{
                  display: 'block',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  border: 'none',
                  borderBottom: '1px dashed #CBD5E1',
                  background: 'transparent',
                  width: '100%',
                  outline: 'none',
                  padding: '2px 0',
                  marginTop: '2px'
                }}
              />
            </div>

            <div>
              <span style={{ fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748B' }}>
                Subject / Curriculum
              </span>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>
                {topic.category} • {topic.title}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748B' }}>
                Experiment Module
              </span>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#00274C', marginTop: '3px' }}>
                {simulation.name}
              </div>
            </div>
          </div>

          {/* Scientific Objective & Theoretical Principle */}
          <div style={{ marginBottom: '22px' }}>
            <h4
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#1E293B',
                borderLeft: '3px solid #2563EB',
                paddingLeft: '8px',
                margin: '0 0 8px'
              }}
            >
              1. Experimental Objective & Theoretical Principle
            </h4>
            <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, margin: '0 0 10px' }}>
              {topic.conceptIntro || simulation.description}
            </p>

            {/* Key Governing Formula Display */}
            {topic.keyFormulas && topic.keyFormulas.length > 0 && (
              <div
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  margin: '8px 0'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
                  Governing Equation:
                </div>
                <div style={{ fontSize: '1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MathView math={topic.keyFormulas[0].formula} block={false} />
                  <span style={{ fontSize: '0.80rem', color: '#64748B' }}>
                    — {topic.keyFormulas[0].explanation}
                  </span>
                </div>
              </div>
            )}
            {/* Simulation Canvas Visual Snapshot if available */}
            {snapshotDataUrl && (
              <div style={{ margin: '14px 0', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
                <img
                  src={snapshotDataUrl}
                  alt="Laboratory State Snapshot"
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '240px', objectFit: 'contain', background: '#0F172A' }}
                />
              </div>
            )}
          </div>

          {/* Two-Column Parameters & Measurements Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Input Parameters (Independent Variables) */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderBottom: '1px solid #E2E8F0', fontWeight: 800, fontSize: '0.78rem', color: '#334155' }}>
                Independent Variables (Controls)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <tbody>
                  {simulation.controls.map((ctrl, i) => (
                    <tr key={ctrl.id} style={{ borderBottom: i < simulation.controls.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>{ctrl.label}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                        {params[ctrl.id] ?? ctrl.defaultValue} {ctrl.unit || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Telemetry Output (Dependent Variables) */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderBottom: '1px solid #E2E8F0', fontWeight: 800, fontSize: '0.78rem', color: '#334155' }}>
                Dependent Variables (Telemetry Observations)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <tbody>
                  {Object.entries(telemetry).length > 0 ? (
                    Object.entries(telemetry).map(([key, val]) => (
                      <tr key={key} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>{key}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#00274C', fontFamily: 'monospace' }}>
                          {val}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} style={{ padding: '12px', textAlign: 'center', color: '#94A3B8' }}>
                        Active telemetry synchronized with canvas state
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Observations & Scientific Conclusions */}
          <div style={{ marginBottom: '24px' }}>
            <h4
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#1E293B',
                borderLeft: '3px solid #10B981',
                paddingLeft: '8px',
                margin: '0 0 8px'
              }}
            >
              2. Student Observations & Scientific Conclusions
            </h4>
            <textarea
              className="report-textarea-field"
              rows={3}
              value={labNotes}
              onChange={(e) => setLabNotes(e.target.value)}
              placeholder="Record your observations, margin of error, and theoretical interpretations..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                lineHeight: 1.6,
                color: '#1E293B',
                background: '#F8FAFC',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Sign-off & Verification Footer */}
          <div
            style={{
              borderTop: '1px dashed #CBD5E1',
              paddingTop: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              fontSize: '0.80rem'
            }}
          >
            <div>
              <div style={{ borderBottom: '1px solid #94A3B8', height: '36px', marginBottom: '6px' }} />
              <span style={{ color: '#64748B' }}>Student / Investigator Signature</span>
            </div>

            <div>
              <div style={{ borderBottom: '1px solid #94A3B8', height: '36px', marginBottom: '6px' }} />
              <span style={{ color: '#64748B' }}>Faculty Evaluator / Laboratory Instructor</span>
            </div>
          </div>

          {/* Document Micro Footer */}
          <div
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '0.70rem',
              color: '#94A3B8'
            }}
          >
            Generated by Physora Laboratory Platform • Scientific Model Accuracy Verified • physora.vercel.app
          </div>
        </div>
      </div>
    </div>
  );
};
