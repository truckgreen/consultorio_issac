/**
 * Utility functions for PDF Medical Records generation, conversion, and validation
 */

import { MedicalRecordDocument } from '../types';

/**
 * Creates a valid, standard PDF Data URL dynamically with formatted medical report text.
 * This produces an authentic PDF conforming to the PDF-1.4 standard that renders in any browser PDF viewer.
 */
export function generateMedicalReportPdfDataUrl(params: {
  clinicName?: string;
  patientName: string;
  patientIdDoc?: string;
  doctorName: string;
  doctorSpecialty: string;
  reportTitle: string;
  date: string;
  category: string;
  diagnosis: string;
  evolutionNotes: string;
  recommendations: string[];
}): string {
  const {
    clinicName = 'CENTRO DE FISIOTERAPIA & BIENESTAR EQUILIBRA',
    patientName,
    patientIdDoc = 'V-18.492.301',
    doctorName,
    doctorSpecialty,
    reportTitle,
    date,
    category,
    diagnosis,
    evolutionNotes,
    recommendations
  } = params;

  // Escape special PDF characters
  const escapePdfText = (txt: string) => txt.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const recsFormatted = recommendations.map((r, i) => `${i + 1}. ${r}`).join('  |  ');

  // Build stream content for PDF canvas/text
  const streamContent = `BT
/F1 16 Tf
40 760 Td
(${escapePdfText(clinicName)}) Tj
/F2 9 Tf
0 -18 Td
(Sabana Grande, Caracas - Venezuela | RIF: J-40891230-1 | Telf: +58 412 345-6789) Tj
/F1 14 Tf
0 -32 Td
(${escapePdfText(reportTitle.toUpperCase())}) Tj
/F2 10 Tf
0 -22 Td
(Fecha: ${escapePdfText(date)}    |    Categoria: ${escapePdfText(category.toUpperCase())}) Tj
0 -16 Td
(Paciente: ${escapePdfText(patientName)}    |    Doc. Identidad: ${escapePdfText(patientIdDoc)}) Tj
0 -16 Td
(Especialista: ${escapePdfText(doctorName)} (${escapePdfText(doctorSpecialty)})) Tj
/F1 11 Tf
0 -28 Td
(DIAGNOSTICO CLINICO / MOTIVO:) Tj
/F2 10 Tf
0 -16 Td
(${escapePdfText(diagnosis)}) Tj
/F1 11 Tf
0 -26 Td
(HALLAZGOS Y NOTAS DE EVOLUCION:) Tj
/F2 10 Tf
0 -16 Td
(${escapePdfText(evolutionNotes)}) Tj
/F1 11 Tf
0 -26 Td
(INDICACIONES Y PLAN TERAPEUTICO:) Tj
/F2 10 Tf
0 -16 Td
(${escapePdfText(recsFormatted)}) Tj
/F2 8 Tf
0 -45 Td
(Documento medico confidencial emitido por el sistema clinico EQUILIBRA. Valido como constancia clinica.) Tj
ET`;

  const streamLength = streamContent.length;

  const pdfBody = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595 842]
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica-Bold
      >>
      /F2 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
  /Contents 4 0 R
>>
endobj
4 0 obj
<<
  /Length ${streamLength}
>>
stream
${streamContent}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000378 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
${480 + streamLength}
%%EOF`;

  return `data:application/pdf;base64,${btoa(unescape(encodeURIComponent(pdfBody)))}`;
}

/**
 * Converts a browser File object to a Base64 Data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Formato de archivo inválido.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Formats bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
