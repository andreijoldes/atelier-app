// Generare PDF pentru deviz — utilizează jsPDF (client-side)
// Structura: Header → Piese (tabel) → Manoperă (tabel) → Totaluri
// Titlu fișier: [Nr_Inmatriculare]_[Data_Programarii].pdf
// Font: Roboto (suportă diacritice românești: ă, â, î, ș, ț)

import { jsPDF } from 'jspdf';
import { robotoRegular, robotoBold } from './robotoFont';

/**
 * Formatare preț în RON
 */
function formatPret(valoare) {
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valoare) + ' RON';
}

/**
 * Înregistrează fontul Roboto în instanța jsPDF (Regular + Bold)
 */
function registerRobotoFont(doc) {
  doc.addFileToVFS('Roboto-Regular.ttf', robotoRegular);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

  doc.addFileToVFS('Roboto-Bold.ttf', robotoBold);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

  doc.setFont('Roboto', 'normal');
}

/**
 * Generează și descarcă PDF-ul devizului
 * @param {Object} params
 * @param {Object} params.programare - Datele programării (cu clienti, masini expandate)
 * @param {Array}  params.piese     - Lista de piese [{descriere, cantitate, pret_unitar}]
 * @param {Array}  params.manopera  - Lista de manoperă [{descriere, cantitate, pret_unitar}]
 * @param {Object} params.totaluri  - {piese, manopera, total}
 */
export function genereazaPDF({ programare, piese, manopera, totaluri }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20; // pozitia verticală curentă

  // Înregistrează fontul Roboto cu suport diacritice
  registerRobotoFont(doc);

  // ===== HEADER =====
  doc.setFontSize(22);
  doc.setFont('Roboto', 'bold');
  doc.text('DEVIZ', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(100);
  doc.text('Atelier Auto Manager', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Linie separator
  doc.setDrawColor(37, 99, 235); // primary color
  doc.setLineWidth(0.8);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // ===== INFO CLIENT & MAȘINĂ =====
  doc.setTextColor(15, 23, 42); // foreground
  doc.setFontSize(11);
  doc.setFont('Roboto', 'bold');
  doc.text('Client:', 14, y);
  doc.setFont('Roboto', 'normal');
  doc.text(programare.clienti?.nume || '—', 45, y);
  y += 7;

  doc.setFont('Roboto', 'bold');
  doc.text('Mașina:', 14, y);
  doc.setFont('Roboto', 'normal');
  const masina = programare.masini;
  doc.text(
    masina ? `${masina.marca} ${masina.model}` : '—',
    45, y
  );
  if (masina?.numar_inmatriculare) {
    doc.text(`| Nr: ${masina.numar_inmatriculare}`, 110, y);
  }
  y += 7;

  doc.setFont('Roboto', 'bold');
  doc.text('Data:', 14, y);
  doc.setFont('Roboto', 'normal');
  doc.text(
    new Date(programare.data_programare).toLocaleDateString('ro-RO', {
      day: '2-digit', month: 'long', year: 'numeric'
    }),
    45, y
  );
  y += 12;

  // ===== SECȚIUNEA PIESE =====
  if (piese.length > 0) {
    doc.setFontSize(13);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('PIESE', 14, y);
    y += 8;

    // Header tabel piese
    doc.setFontSize(9);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Descriere', 14, y);
    doc.text('Cant.', 120, y, { align: 'right' });
    doc.text('Preț unitar', 155, y, { align: 'right' });
    doc.text('Total', pageWidth - 14, y, { align: 'right' });
    y += 2;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    // Rânduri piese
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    piese.forEach((p) => {
      // Verifică dacă trebuie pagină nouă
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(p.descriere || '—', 14, y);
      doc.text(String(p.cantitate), 120, y, { align: 'right' });
      doc.text(formatPret(p.pret_unitar), 155, y, { align: 'right' });
      doc.text(formatPret(p.cantitate * p.pret_unitar), pageWidth - 14, y, { align: 'right' });
      y += 7;
    });

    // Subtotal piese
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.line(120, y, pageWidth - 14, y);
    y += 6;
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.text('Subtotal Piese:', 120, y, { align: 'right' });
    doc.text(formatPret(totaluri.piese), pageWidth - 14, y, { align: 'right' });
    y += 12;
  }

  // ===== SECȚIUNEA MANOPERĂ =====
  if (manopera.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(217, 119, 6); // amber/warning
    doc.text('MANOPERĂ', 14, y);
    y += 8;

    // Header tabel manoperă
    doc.setFontSize(9);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Operațiune', 14, y);
    doc.text('Cant.', 120, y, { align: 'right' });
    doc.text('Preț', 155, y, { align: 'right' });
    doc.text('Total', pageWidth - 14, y, { align: 'right' });
    y += 2;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    // Rânduri manoperă
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    manopera.forEach((m) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(m.descriere || '—', 14, y);
      doc.text(String(m.cantitate), 120, y, { align: 'right' });
      doc.text(formatPret(m.pret_unitar), 155, y, { align: 'right' });
      doc.text(formatPret(m.cantitate * m.pret_unitar), pageWidth - 14, y, { align: 'right' });
      y += 7;
    });

    // Subtotal manoperă
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.line(120, y, pageWidth - 14, y);
    y += 6;
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.text('Subtotal Manoperă:', 120, y, { align: 'right' });
    doc.text(formatPret(totaluri.manopera), pageWidth - 14, y, { align: 'right' });
    y += 14;
  }

  // ===== TOTAL GENERAL =====
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.line(100, y, pageWidth - 14, y);
  y += 8;
  doc.setFontSize(14);
  doc.setFont('Roboto', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('TOTAL GENERAL:', 100, y);
  doc.text(formatPret(totaluri.total), pageWidth - 14, y, { align: 'right' });
  y += 15;

  // ===== FOOTER =====
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('Roboto', 'normal');
  doc.text(
    `Generat la ${new Date().toLocaleDateString('ro-RO')} — Atelier Auto Manager`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  // ===== SALVARE =====
  // Titlu fișier: [Nr_Inmatriculare]_[Data_Programarii].pdf
  const nrInm = (masina?.numar_inmatriculare || 'FARA_NR').replace(/\s+/g, '_');
  const dataStr = new Date(programare.data_programare)
    .toLocaleDateString('ro-RO')
    .replace(/\./g, '-');
  const numeFisier = `${nrInm}_${dataStr}.pdf`;

  doc.save(numeFisier);
  return numeFisier;
}
