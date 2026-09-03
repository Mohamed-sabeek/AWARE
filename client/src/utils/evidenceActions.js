import { jsPDF } from 'jspdf';
import { getEvidenceImageUrl } from './imageUrl';

/**
 * Load image URL and convert to Base64 for jsPDF embedding
 */
const loadImageAsBase64 = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({ dataUrl, width: canvas.width, height: canvas.height });
      } catch (err) {
        console.warn('Could not extract image dataUrl:', err);
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
};

/**
 * Generates an official AWARE Digital Evidence PDF Report and triggers download
 */
export const generateEvidencePDF = async (evidence) => {
  if (!evidence) throw new Error('No evidence record provided.');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AWARE', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Automated Warning and Air Pollution Reporting & Evidence System', margin, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(96, 165, 250); // blue-400
  doc.text('DIGITAL EVIDENCE REPORT', pageWidth - margin, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const genDate = new Date().toLocaleString('en-US');
  doc.text(`Generated: ${genDate}`, pageWidth - margin, 20, { align: 'right' });

  let y = 38;

  // Evidence Overview Header Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`EVIDENCE ID: ${evidence.evidenceId || 'EVT-RECORD'}`, margin + 4, y + 9);

  const statusText = (evidence.status || 'Verified').toUpperCase();
  doc.setFontSize(8.5);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`STATUS: ${statusText}`, pageWidth - margin - 4, y + 9, { align: 'right' });

  y += 20;

  // Metadata Table Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('INCIDENT METADATA & TELEMETRY', margin, y);
  y += 4;

  const metadataItems = [
    { label: 'Device ID', value: evidence.sensorId || evidence.deviceId || 'ESP32-CAM-001' },
    { label: 'Detection Type', value: evidence.detectionType || 'Threshold Exceeded' },
    { 
      label: 'Sensor Voltage', 
      value: evidence.voltage !== undefined && evidence.voltage !== null ? `${Number(evidence.voltage).toFixed(3)} V` : 'Not available' 
    },
    { 
      label: 'Timestamp', 
      value: evidence.createdAt ? new Date(evidence.createdAt).toLocaleString('en-US') : 'Not available' 
    },
    { 
      label: 'Location Name', 
      value: evidence.locationName || evidence.location || 'Location not configured' 
    },
    { 
      label: 'Latitude', 
      value: evidence.latitude !== null && evidence.latitude !== undefined ? Number(evidence.latitude).toFixed(6) : 'Not available' 
    },
    { 
      label: 'Longitude', 
      value: evidence.longitude !== null && evidence.longitude !== undefined ? Number(evidence.longitude).toFixed(6) : 'Not available' 
    },
    { 
      label: 'AI Confidence', 
      value: evidence.confidence ? `${evidence.confidence}%` : 'Not available' 
    }
  ];

  const colWidth = (contentWidth - 4) / 2;
  const rowHeight = 9;

  for (let i = 0; i < metadataItems.length; i += 2) {
    const item1 = metadataItems[i];
    const item2 = metadataItems[i + 1];

    // Background zebra
    if ((i / 2) % 2 === 0) {
      doc.setFillColor(248, 251, 255);
      doc.rect(margin, y - 2, contentWidth, rowHeight, 'F');
    }

    // Col 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(item1.label + ':', margin + 3, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(String(item1.value), margin + 34, y + 4);

    // Col 2
    if (item2) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(item2.label + ':', margin + colWidth + 5, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(String(item2.value), margin + colWidth + 36, y + 4);
    }

    y += rowHeight;
  }

  y += 6;

  // Captured Image Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('CAPTURED EVIDENCE FRAME', margin, y);
  y += 4;

  const imageBoxHeight = 110;
  const rawImageUrl = getEvidenceImageUrl(evidence.imageUrl);

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, imageBoxHeight, 3, 3, 'FD');

  let imageLoaded = false;
  if (rawImageUrl) {
    try {
      const imgObj = await loadImageAsBase64(rawImageUrl);
      if (imgObj && imgObj.dataUrl) {
        // Compute aspect fit
        const imgAspect = imgObj.width / imgObj.height;
        const boxAspect = contentWidth / imageBoxHeight;

        let renderW = contentWidth - 4;
        let renderH = (contentWidth - 4) / imgAspect;

        if (renderH > imageBoxHeight - 4) {
          renderH = imageBoxHeight - 4;
          renderW = renderH * imgAspect;
        }

        const imgX = margin + (contentWidth - renderW) / 2;
        const imgY = y + (imageBoxHeight - renderH) / 2;

        doc.addImage(imgObj.dataUrl, 'JPEG', imgX, imgY, renderW, renderH, undefined, 'FAST');
        imageLoaded = true;
      }
    } catch (err) {
      console.warn('PDF image embedding fallback:', err);
    }
  }

  if (!imageLoaded) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Evidence image unavailable', margin + contentWidth / 2, y + imageBoxHeight / 2, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(evidence.imageUrl || 'No image stream record', margin + contentWidth / 2, y + imageBoxHeight / 2 + 6, { align: 'center' });
  }

  y += imageBoxHeight + 8;

  // Footer / Chain of Custody Note
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('AWARE Environmental Evidence System • Immutable Hardware Telemetry Snapshot', margin, pageHeight - 10);
  doc.text('Official Audit Record', pageWidth - margin, pageHeight - 10, { align: 'right' });

  // Save PDF
  const cleanId = (evidence.evidenceId || 'EVT-RECORD').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `AWARE_Evidence_${cleanId}.pdf`;
  doc.save(filename);

  return filename;
};

/**
 * Downloads the actual evidence JPEG image
 */
export const downloadEvidenceImage = async (evidence) => {
  if (!evidence) return;
  const rawUrl = getEvidenceImageUrl(evidence.imageUrl);
  if (!rawUrl) throw new Error('Evidence image URL is unavailable.');

  const cleanId = (evidence.evidenceId || 'EVT-RECORD').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `AWARE_Evidence_${cleanId}.jpg`;

  try {
    const res = await fetch(rawUrl);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (err) {
    // Fallback direct link download
    const a = document.createElement('a');
    a.href = rawUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

/**
 * Shares evidence via Web Share API or falls back to clipboard
 */
export const shareEvidence = async (evidence) => {
  if (!evidence) return { success: false, message: 'No evidence selected.' };

  const locationText = evidence.locationName || evidence.location || 'Location not configured';
  const voltageText = evidence.voltage !== undefined && evidence.voltage !== null ? `${Number(evidence.voltage).toFixed(3)} V` : 'N/A';
  const timestampText = evidence.createdAt ? new Date(evidence.createdAt).toLocaleString('en-US') : 'N/A';

  const shareText = `AWARE Environmental Incident
Evidence ID: ${evidence.evidenceId || 'EVT-RECORD'}
Device: ${evidence.sensorId || evidence.deviceId || 'ESP32-CAM-001'}
Location: ${locationText}
Sensor Voltage: ${voltageText}
Detection: ${evidence.detectionType || 'Incident'}
Timestamp: ${timestampText}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `AWARE Evidence: ${evidence.evidenceId}`,
        text: shareText,
        url: window.location.href
      });
      return { success: true, method: 'native', message: 'Shared successfully.' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
    }
  }

  // Graceful fallback: Copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareText);
      return { 
        success: true, 
        method: 'clipboard', 
        message: 'Evidence summary copied to clipboard!' 
      };
    } catch (clipErr) {
      console.warn('Clipboard write error:', clipErr);
    }
  }

  return { 
    success: true, 
    method: 'fallback', 
    message: 'Summary ready for sharing.' 
  };
};
