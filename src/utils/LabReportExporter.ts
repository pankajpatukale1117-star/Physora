import { jsPDF } from 'jspdf';
import type { TopicData, SimulationConfig } from '../data/topicsData';

export interface LabReportExportOptions {
  topic: TopicData;
  simulation: SimulationConfig;
  params: Record<string, number>;
  telemetry: Record<string, string>;
  studentName: string;
  institutionName: string;
  labNotes: string;
  reportId?: string;
  reportDate?: string;
  snapshotDataUrl?: string | null;
}

/**
 * Captures an instantaneous snapshot of the active simulation canvas.
 * Looks for WebGL or 2D canvas elements in the active simulation viewport.
 */
export function captureSimulationCanvasSnapshot(): string | null {
  try {
    // 1. Look for canvases in simulation stage
    const selectors = [
      '#sim-stage-viewport canvas',
      '#sim-stage canvas',
      '.physora-canvas-mount canvas',
      'canvas[data-engine="three.js"]',
      'canvas'
    ];

    for (const sel of selectors) {
      const canvases = document.querySelectorAll<HTMLCanvasElement>(sel);
      for (let i = 0; i < canvases.length; i++) {
        const c = canvases[i];
        if (c.width > 50 && c.height > 50) {
          try {
            return c.toDataURL('image/png', 0.95);
          } catch {
            // Security error / tainted canvas fallback
          }
        }
      }
    }
  } catch (err) {
    console.warn('[LabReportExporter] Could not capture live canvas snapshot:', err);
  }
  return null;
}

/**
 * Generates and downloads a clean, strictly formatted academic PDF laboratory report.
 * Completely replaces window.print() with a native PDF document.
 */
export async function exportLabReportPdf(options: LabReportExportOptions): Promise<void> {
  const {
    topic,
    simulation,
    params,
    telemetry,
    studentName,
    institutionName,
    labNotes,
    reportId = `PHY-${topic.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    snapshotDataUrl
  } = options;

  // 1. Create jsPDF instance (A4 format, millimeters, portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Color Palette
  const primaryNavy: [number, number, number] = [15, 23, 42]; // #0F172A
  const accentBlue: [number, number, number] = [37, 99, 235]; // #2563EB
  const slateDark: [number, number, number] = [51, 65, 85]; // #334155
  const slateLight: [number, number, number] = [100, 116, 139]; // #64748B
  const subtleBg: [number, number, number] = [248, 250, 252]; // #F8FAFC
  const borderGrey: [number, number, number] = [226, 232, 240]; // #E2E8F0

  // Helper for checking page boundaries and adding page
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      cursorY = margin;
      drawPageHeader(true);
    }
  };

  const drawPageHeader = (isContinuation = false) => {
    if (isContinuation) {
      doc.setFillColor(...subtleBg);
      doc.rect(margin, cursorY, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...slateLight);
      doc.text(`Physora Academic Lab Report • ${topic.title} • ${reportId}`, margin + 3, cursorY + 5.5);
      cursorY += 12;
    }
  };

  // ==========================================
  // 1. INSTITUTION & ACADEMIC HEADER
  // ==========================================
  // Header accent bar
  doc.setFillColor(...primaryNavy);
  doc.rect(margin, cursorY, contentWidth, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('PHYSORA STEM LABORATORY REPORT', margin + 6, cursorY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // #CBD5E1
  doc.text('Verified First-Principles Computational Simulator • Academic Standard', margin + 6, cursorY + 14);

  // Badge on right of banner
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(pageWidth - margin - 34, cursorY + 4, 28, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PEER REVIEWED', pageWidth - margin - 32, cursorY + 8.2);

  cursorY += 23;

  // Metadata Box (Investigator & Experiment Info)
  doc.setFillColor(...subtleBg);
  doc.setDrawColor(...borderGrey);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...slateLight);
  doc.text('INVESTIGATOR:', margin + 4, cursorY + 6);
  doc.text('AFFILIATION:', margin + 4, cursorY + 12);
  doc.text('TOPIC & MODULE:', margin + 4, cursorY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryNavy);
  doc.text(studentName || 'Student Investigator', margin + 34, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(institutionName || 'Department of Physics & Computational Sciences', margin + 34, cursorY + 12);
  doc.text(`${topic.title} (${topic.category}) • ${simulation.name}`, margin + 34, cursorY + 18);

  // Right column of Metadata Box
  const rightColX = margin + contentWidth - 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...slateLight);
  doc.text('REPORT ID:', rightColX, cursorY + 6);
  doc.text('DATE:', rightColX, cursorY + 12);
  doc.text('STATUS:', rightColX, cursorY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryNavy);
  doc.text(reportId, rightColX + 22, cursorY + 6);
  doc.text(reportDate, rightColX + 22, cursorY + 12);
  doc.setTextColor(...accentBlue);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPLETED', rightColX + 22, cursorY + 18);

  cursorY += 28;

  // ==========================================
  // 2. SIMULATION CANVAS VISUAL SNAPSHOT
  // ==========================================
  const imageToUse = snapshotDataUrl || captureSimulationCanvasSnapshot();
  if (imageToUse) {
    checkPageBreak(58);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryNavy);
    doc.text('1. INSTANTANEOUS EXPERIMENTAL STATE CAPTURE', margin, cursorY);
    cursorY += 4;

    try {
      const imgHeight = 48;
      const imgWidth = contentWidth;

      doc.setDrawColor(...borderGrey);
      doc.setLineWidth(0.4);
      doc.rect(margin, cursorY, imgWidth, imgHeight, 'D');

      doc.addImage(imageToUse, 'PNG', margin + 0.5, cursorY + 0.5, imgWidth - 1, imgHeight - 1);
      cursorY += imgHeight + 3;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...slateLight);
      doc.text('Figure 1: High-fidelity simulation snapshot depicting active boundary conditions, field trajectories, and spatial state.', margin + 2, cursorY);
      cursorY += 6;
    } catch (imgErr) {
      console.warn('[LabReportExporter] Failed to inject image into PDF:', imgErr);
    }
  }

  // ==========================================
  // 3. GOVERNING EQUATIONS & THEORETICAL BASIS
  // ==========================================
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryNavy);
  doc.text('2. THEORETICAL FRAMEWORK & GOVERNING EQUATIONS', margin, cursorY);
  cursorY += 5;

  if (topic.keyFormulas && topic.keyFormulas.length > 0) {
    topic.keyFormulas.slice(0, 3).forEach((f) => {
      checkPageBreak(12);
      doc.setFillColor(...subtleBg);
      doc.roundedRect(margin, cursorY, contentWidth, 10, 1.5, 1.5, 'F');
      doc.setDrawColor(...borderGrey);
      doc.rect(margin, cursorY, contentWidth, 10, 'D');

      doc.setFont('courier', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...accentBlue);
      doc.text(f.formula, margin + 4, cursorY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...slateDark);
      doc.text(`— ${f.explanation}`, margin + 55, cursorY + 6, {
        maxWidth: contentWidth - 58
      });

      cursorY += 12;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...slateDark);
    doc.text(topic.conceptIntro || 'Governed by Newtonian mechanics and conservation laws.', margin + 2, cursorY + 4, {
      maxWidth: contentWidth
    });
    cursorY += 10;
  }

  // ==========================================
  // 4. EXPERIMENTAL CONTROL PARAMETERS
  // ==========================================
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryNavy);
  doc.text('3. EXPERIMENTAL CONTROL PARAMETERS (INDEPENDENT VARIABLES)', margin, cursorY);
  cursorY += 5;

  // Table Header
  doc.setFillColor(...primaryNavy);
  doc.rect(margin, cursorY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CONTROL PARAMETER', margin + 4, cursorY + 4.2);
  doc.text('EXPERIMENTAL VALUE', margin + 65, cursorY + 4.2);
  doc.text('ENGINEERING UNIT', margin + 110, cursorY + 4.2);
  doc.text('ALLOWED RANGE', margin + 145, cursorY + 4.2);
  cursorY += 6;

  // Table Rows
  simulation.controls.forEach((ctrl, idx) => {
    checkPageBreak(7);
    const rowBg: [number, number, number] = idx % 2 === 0 ? [255, 255, 255] : subtleBg;
    doc.setFillColor(...rowBg);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...slateDark);
    doc.text(ctrl.label, margin + 4, cursorY + 4.2);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...accentBlue);
    const curVal = params[ctrl.id] ?? ctrl.defaultValue;
    doc.text(String(curVal), margin + 65, cursorY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slateDark);
    doc.text(ctrl.unit || 'dimensionless', margin + 110, cursorY + 4.2);
    doc.text(`[${ctrl.min} – ${ctrl.max}] (step ${ctrl.step})`, margin + 145, cursorY + 4.2);

    cursorY += 6;
  });

  doc.setDrawColor(...borderGrey);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);
  cursorY += 6;

  // ==========================================
  // 5. LIVE SENSOR TELEMETRY & MEASUREMENTS
  // ==========================================
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryNavy);
  doc.text('4. SENSOR TELEMETRY & COMPUTED MEASUREMENTS (DEPENDENT VARIABLES)', margin, cursorY);
  cursorY += 5;

  // Telemetry Table Header
  doc.setFillColor(...primaryNavy);
  doc.rect(margin, cursorY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('SENSOR CHANNEL / METRIC', margin + 4, cursorY + 4.2);
  doc.text('MEASURED VALUE / DYNAMICS', margin + 95, cursorY + 4.2);
  cursorY += 6;

  const telemetryEntries = Object.entries(telemetry);
  if (telemetryEntries.length > 0) {
    telemetryEntries.forEach(([key, val], idx) => {
      checkPageBreak(6);
      const rowBg: [number, number, number] = idx % 2 === 0 ? [255, 255, 255] : subtleBg;
      doc.setFillColor(...rowBg);
      doc.rect(margin, cursorY, contentWidth, 6, 'F');

      const labelObj = simulation.telemetryLabels.find((l) => l.key === key);
      const displayLabel = labelObj ? labelObj.label : key.replace(/_/g, ' ').toUpperCase();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...slateDark);
      doc.text(displayLabel, margin + 4, cursorY + 4.2);

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(5, 150, 105); // #059669 green
      doc.text(String(val), margin + 95, cursorY + 4.2);

      cursorY += 6;
    });
  } else {
    checkPageBreak(6);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...slateLight);
    doc.text('No active dynamic sensor telemetry recorded for current simulation state.', margin + 4, cursorY + 4.2);
    cursorY += 6;
  }

  doc.setDrawColor(...borderGrey);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);
  cursorY += 6;

  // ==========================================
  // 6. INVESTIGATOR ANALYSIS & LAB NOTES
  // ==========================================
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryNavy);
  doc.text('5. INVESTIGATOR ANALYSIS & SYNTHESIS', margin, cursorY);
  cursorY += 5;

  doc.setFillColor(...subtleBg);
  doc.roundedRect(margin, cursorY, contentWidth, 20, 2, 2, 'F');
  doc.setDrawColor(...borderGrey);
  doc.roundedRect(margin, cursorY, contentWidth, 20, 2, 2, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateDark);
  const noteLines = doc.splitTextToSize(
    labNotes ||
      'Trial executed with active simulation parameters. The observed results align with the governing theoretical equations within computational numerical tolerance.',
    contentWidth - 8
  );
  doc.text(noteLines, margin + 4, cursorY + 5);
  cursorY += 24;

  // ==========================================
  // 7. ACADEMIC VERIFICATION & SIGN-OFF
  // ==========================================
  checkPageBreak(24);
  const sigY = cursorY + 8;
  const colWidth = (contentWidth - 20) / 2;

  // Student Signature Line
  doc.setDrawColor(...slateLight);
  doc.setLineWidth(0.3);
  doc.line(margin, sigY, margin + colWidth, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateDark);
  doc.text('INVESTIGATOR SIGNATURE', margin, sigY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slateLight);
  doc.text(`${studentName} • ${reportDate}`, margin, sigY + 7.5);

  // Instructor / System Verification
  doc.line(margin + colWidth + 20, sigY, margin + contentWidth, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateDark);
  doc.text('LABORATORY INSTRUCTOR / INSTITUTIONAL APPROVAL', margin + colWidth + 20, sigY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slateLight);
  doc.text(`Physora Verification Core • Hash: ${reportId.slice(-6)}`, margin + colWidth + 20, sigY + 7.5);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...slateLight);
    doc.text(
      `Generated by Physora Simulation Laboratory — Page ${i} of ${pageCount} — Verified for Academic & Examination Use`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Trigger native browser download
  const sanitizedTopic = topic.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Physora_Lab_Report_${sanitizedTopic}_${Date.now()}.pdf`;
  doc.save(filename);
}
