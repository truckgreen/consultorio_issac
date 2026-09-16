import { MedicalRecordDocument } from '../types';

export interface InvoiceReceiptParams {
  receiptNumber: string;
  date: string;
  patientName: string;
  patientDocumentId?: string;
  patientPhone?: string;
  patientEmail?: string;
  serviceTitle: string;
  specialistName?: string;
  amount: number | string;
  currency?: string;
  paymentMethod?: string;
  paymentReference?: string;
  sessionDetails?: string;
  appointmentCode: string;
}

/**
 * Creates a valid, standard PDF-1.4 Data URL representing an official Medical Invoice / Tax Receipt (Recibo de Pago Clínico)
 * Suitable for insurance reimbursement (Reembolso de Seguros Médicos) and patient records.
 */
export function generateInvoiceReceiptPdfDataUrl(params: InvoiceReceiptParams): string {
  const {
    receiptNumber,
    date,
    patientName,
    patientDocumentId = 'V-Pendiente',
    patientPhone = 'N/A',
    patientEmail = 'N/A',
    serviceTitle,
    specialistName = 'Lic. Isaac Jewsiejew / Equipo EQUILIBRA',
    amount,
    currency = 'USD ($)',
    paymentMethod = 'Pago Digital / Transferencia / Efectivo',
    paymentReference = 'REF-DIGITAL',
    sessionDetails = 'Atención Fisioterapéutica y Rehabilitación Física Especializada',
    appointmentCode,
  } = params;

  // Escape PDF special characters
  const escapePdfText = (txt: string) =>
    (txt || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const amountFormatted = typeof amount === 'number' ? `$${amount.toFixed(2)}` : String(amount).includes('$') ? amount : `$${amount}`;

  const streamContent = `BT
/F1 16 Tf
40 760 Td
(CENTRO DE FISIOTERAPIA Y REHABILITACION EQUILIBRA C.A.) Tj
/F2 9 Tf
0 -18 Td
(RIF: J-40891230-1 | Sede: Av. Fco de Miranda, Centro Empresarial Sabana Grande, Caracas) Tj
0 -14 Td
(Telefono: +58 424-2724617 | Correo: contacto@equilibra.com.ve | www.equilibra.com.ve) Tj
/F1 13 Tf
0 -28 Td
(RECIBO OFICIAL DE COBRO Y ATENCION MEDICA / FISIOTERAPEUTICA) Tj
/F2 10 Tf
0 -20 Td
(Nro. Recibo: ${escapePdfText(receiptNumber)}      Fecha de Emision: ${escapePdfText(date)}) Tj
0 -16 Td
(Codigo de Cita: ${escapePdfText(appointmentCode)}      Forma de Pago: ${escapePdfText(paymentMethod)}) Tj
0 -16 Td
(Referencia de Transaccion: ${escapePdfText(paymentReference)}) Tj
/F1 11 Tf
0 -26 Td
(DATOS DEL PACIENTE / BENEFICIARIO:) Tj
/F2 10 Tf
0 -16 Td
(Nombre: ${escapePdfText(patientName)}       Doc. Identidad / CI: ${escapePdfText(patientDocumentId)}) Tj
0 -16 Td
(Telefono: ${escapePdfText(patientPhone)}       Email: ${escapePdfText(patientEmail)}) Tj
/F1 11 Tf
0 -26 Td
(DETALLE DE LOS SERVICIOS PRESTADOS:) Tj
/F2 10 Tf
0 -16 Td
(Servicio: ${escapePdfText(serviceTitle)}) Tj
0 -16 Td
(Especialista Asignado: ${escapePdfText(specialistName)}) Tj
0 -16 Td
(Concepto: ${escapePdfText(sessionDetails)}) Tj
/F1 12 Tf
0 -28 Td
(TOTAL CANCELADO: ${escapePdfText(amountFormatted)} ${escapePdfText(currency)}) Tj
/F2 8.5 Tf
0 -26 Td
(ESTE COMPROBANTE ES VALIDO PARA REEMBOLSOS ANTE EMPRESAS DE SEGUROS MEDICOS Y AUDITORIA.) Tj
0 -14 Td
(Firma y Sello de Administracion Clinica EQUILIBRA C.A. - Emitido digitalmente desde el Portal del Paciente.) Tj
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
0000000370 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
${450 + streamLength}
%%EOF`;

  const base64 = btoa(unescape(encodeURIComponent(pdfBody)));
  return `data:application/pdf;base64,${base64}`;
}

export function downloadInvoiceReceiptPdf(params: InvoiceReceiptParams): void {
  const pdfDataUrl = generateInvoiceReceiptPdfDataUrl(params);
  const link = document.createElement('a');
  link.href = pdfDataUrl;
  link.download = `Recibo_EQUILIBRA_${params.receiptNumber || params.appointmentCode}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
