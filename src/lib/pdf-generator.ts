import type { KiraciBilgileriFormValues } from '@/components/forms/KiraciBilgileri';
import type { VillaBilgileriFormValues } from '@/components/forms/VillaBilgileri';
import type { KonaklamaBilgileriFormValues } from '@/components/forms/KonaklamaBilgileri';
import type { OdemeBilgileriFormValues } from '@/components/forms/OdemeBilgileri';

// Form verilerini içeren tip
interface FormData {
  kiraciBilgileri: KiraciBilgileriFormValues | null;
  villaBilgileri: VillaBilgileriFormValues | null;
  konaklamaBilgileri: KonaklamaBilgileriFormValues | null;
  odemeBilgileri: OdemeBilgileriFormValues | null;
}

/**
 * Rastgele bir rezervasyon numarası oluşturur
 */
function generateReservationNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `REZ-${year}-${randomNum}`;
}

/**
 * Form verilerinden PDF oluşturur ve blob URL döndürür
 */
export async function generatePDF(formData: FormData): Promise<string> {
  if (!formData.kiraciBilgileri || !formData.villaBilgileri || 
      !formData.konaklamaBilgileri || !formData.odemeBilgileri) {
    throw new Error('Eksik form verileri');
  }

  // Client tarafında dinamik olarak jsPDF ve jspdf-autotable'ı import et
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default;
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default;

  // jsPDF örneği oluştur
  const doc = new jsPDF();
  
  // Tip güvenliği için any kullanıyoruz
  const docWithTable = doc as unknown as { lastAutoTable: { finalY: number } };
  
  const reservationNumber = generateReservationNumber();
  const currentDate = new Date().toLocaleDateString('tr-TR');
  
  // Başlık
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text('Rezervasyon Formu', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Rezervasyon No: ${reservationNumber}`, 105, 30, { align: 'center' });
  doc.text(`Tarih: ${currentDate}`, 105, 35, { align: 'center' });
  
  // Kiracı Bilgileri
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text('Kiracı Bilgileri', 14, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // autoTable fonksiyonunu doğrudan çağır
  autoTable(doc, {
    startY: 50,
    head: [['Bilgi', 'Değer']],
    body: [
      ['İsim Soyisim', formData.kiraciBilgileri.isimSoyisim],
      ['TC Kimlik No', formData.kiraciBilgileri.tcKimlikNo],
      ['Telefon', formData.kiraciBilgileri.telefon],
      ['E-posta', formData.kiraciBilgileri.eposta],
      ['Adres', formData.kiraciBilgileri.adres || '-'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    styles: { overflow: 'linebreak', cellWidth: 'auto' },
    columnStyles: { 0: { cellWidth: 40 } },
  });
  
  // Villa Bilgileri
  const currentY = docWithTable.lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text('Villa Bilgileri', 14, currentY);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Bilgi', 'Değer']],
    body: [
      ['Villa Adı', formData.villaBilgileri.villaAd],
      ['Villa Sahibi', formData.villaBilgileri.villaSahip],
      ['Telefon', formData.villaBilgileri.villaTelefon],
      ['Adres', formData.villaBilgileri.villaAdres || '-'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    styles: { overflow: 'linebreak', cellWidth: 'auto' },
    columnStyles: { 0: { cellWidth: 40 } },
  });
  
  // Konaklama Bilgileri
  const currentY2 = docWithTable.lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text('Konaklama Bilgileri', 14, currentY2);
  
  autoTable(doc, {
    startY: currentY2 + 5,
    head: [['Bilgi', 'Değer']],
    body: [
      ['Giriş Tarihi', formData.konaklamaBilgileri.girisTarihi],
      ['Çıkış Tarihi', formData.konaklamaBilgileri.cikisTarihi],
      ['Kişi Sayısı', formData.konaklamaBilgileri.kisiSayisi.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    styles: { overflow: 'linebreak', cellWidth: 'auto' },
    columnStyles: { 0: { cellWidth: 40 } },
  });
  
  // Konaklayanlar Listesi
  const currentY3 = docWithTable.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  doc.text('Konaklayanlar Listesi', 14, currentY3);
  
  const konaklayanlarData = formData.konaklamaBilgileri.konaklayanlar.map(
    (k, index) => [
      (index + 1).toString(),
      k.isimSoyisim,
      k.tcKimlikNo,
      k.kategori,
    ]
  );
  
  autoTable(doc, {
    startY: currentY3 + 5,
    head: [['#', 'İsim Soyisim', 'TC Kimlik No', 'Kategori']],
    body: konaklayanlarData,
    theme: 'grid',
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    styles: { overflow: 'linebreak', cellWidth: 'auto' },
  });
  
  // Ödeme Bilgileri
  const currentY4 = docWithTable.lastAutoTable.finalY + 10;
  
  // Yeni sayfa ekle
  if (currentY4 > 250) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text('Ödeme Bilgileri', 14, 20);
    
    autoTable(doc, {
      startY: 25,
      head: [['Bilgi', 'Değer']],
      body: [
        ['Toplam Tutar', `${formData.odemeBilgileri.toplamTutar} TL`],
        ['Ön Ödeme', `${formData.odemeBilgileri.onOdeme} TL`],
        ['Kalan Ödeme', `${formData.odemeBilgileri.kalanOdeme} TL`],
        ['Hasar Depozitosu', `${formData.odemeBilgileri.hasarDepozitosu} TL`],
        ['Ödeme Tarihi', formData.odemeBilgileri.odemeTarihi],
        ['Ödeme Yöntemi', formData.odemeBilgileri.odemeYontemi],
        ['Ödeme Notu', formData.odemeBilgileri.odemeNotu || '-'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      styles: { overflow: 'linebreak', cellWidth: 'auto' },
      columnStyles: { 0: { cellWidth: 40 } },
    });
  } else {
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text('Ödeme Bilgileri', 14, currentY4);
    
    autoTable(doc, {
      startY: currentY4 + 5,
      head: [['Bilgi', 'Değer']],
      body: [
        ['Toplam Tutar', `${formData.odemeBilgileri.toplamTutar} TL`],
        ['Ön Ödeme', `${formData.odemeBilgileri.onOdeme} TL`],
        ['Kalan Ödeme', `${formData.odemeBilgileri.kalanOdeme} TL`],
        ['Hasar Depozitosu', `${formData.odemeBilgileri.hasarDepozitosu} TL`],
        ['Ödeme Tarihi', formData.odemeBilgileri.odemeTarihi],
        ['Ödeme Yöntemi', formData.odemeBilgileri.odemeYontemi],
        ['Ödeme Notu', formData.odemeBilgileri.odemeNotu || '-'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      styles: { overflow: 'linebreak', cellWidth: 'auto' },
      columnStyles: { 0: { cellWidth: 40 } },
    });
  }
  
  // Önemli Notlar
  const currentY5 = docWithTable.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  doc.text('Önemli Notlar', 14, currentY5);
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  const notes = [
    '1. Giriş saati 15:00, çıkış saati 11:00\'dir.',
    '2. Hasar depozitosu, çıkış sırasında villa kontrolü sonrası iade edilecektir.',
    '3. Rezervasyon iptal koşulları için lütfen sözleşmeyi inceleyiniz.',
    '4. Acil durumlar için: +90 555 123 45 67',
  ];
  
  for (const [index, note] of notes.entries()) {
    doc.text(note, 14, currentY5 + 5 + (index * 5));
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Sayfa ${i} / ${pageCount} - Rezervasyon No: ${reservationNumber}`,
      105,
      285,
      { align: 'center' }
    );
  }
  
  // PDF'i blob olarak oluştur ve URL döndür
  const pdfBlob = doc.output('blob');
  return URL.createObjectURL(pdfBlob);
} 