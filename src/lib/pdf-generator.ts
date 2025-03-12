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
 * Tarihi Türkçe formatla (16 Mayıs 2023 gibi)
 */
function formatTurkishDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('tr-TR', options);
}

/**
 * Sayıyı Türk Lirası formatına dönüştürür (1000 -> 1.000 ₺)
 */
function formatCurrency(amount: number): string {
  // Önce sayıyı formatlayalım (1000 -> 1.000)
  const formattedNumber = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  // Sonra ₺ simgesini sağa ekleyelim
  return `${formattedNumber} ₺`;
}

/**
 * Form verilerinden PDF oluşturur ve blob URL döndürür
 */
export async function generatePDF(formData: FormData): Promise<string> {
  if (!formData.kiraciBilgileri || !formData.villaBilgileri || 
      !formData.konaklamaBilgileri || !formData.odemeBilgileri) {
    throw new Error('Eksik form verileri');
  }

  // HTML2PDF'i dinamik olarak import et
  const html2pdf = (await import('html2pdf.js')).default;
  
  const reservationNumber = generateReservationNumber();
  const currentDate = formatTurkishDate(new Date().toISOString().split('T')[0]);
  
  // Konaklayanlar tablosunu oluştur - daha kompakt
  const konaklayanlarRows = formData.konaklamaBilgileri.konaklayanlar.map((k, index) => `
    <tr>
      <td class="text-center">${index + 1}</td>
      <td>${k.isimSoyisim}</td>
      <td>${k.tcKimlikNo}</td>
      <td class="text-center">${k.kategori}</td>
    </tr>
  `).join('');
  
  // Ödeme tutarlarını formatla
  const toplamTutar = formatCurrency(formData.odemeBilgileri.toplamTutar);
  const onOdeme = formatCurrency(formData.odemeBilgileri.onOdeme);
  const kalanOdeme = formatCurrency(formData.odemeBilgileri.kalanOdeme);
  const hasarDepozitosu = formatCurrency(formData.odemeBilgileri.hasarDepozitosu);
  const toplamOdeme = formatCurrency(formData.odemeBilgileri.kalanOdeme + formData.odemeBilgileri.hasarDepozitosu);
  
  // SVG iconu #180675 rengiyle kullan
  const iconSvg = '<svg width="557" height="333" viewBox="0 0 557 333" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 332.799V0H62.3861V332.799H121.83V0H184.64L308.277 213.692V0H370.334L493.943 213.692V0H557V332.799H490.44L371.333 126.113V332.799H306.525L185.667 126.113V332.799H121.83H62.3861H0Z" fill="#180675"/></svg>';
  
  // HTML şablonu oluştur
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body { 
          font-family: 'Inter', sans-serif; 
          margin: 0; 
          padding: 0; 
          color: #333;
          line-height: 1.4;
          font-size: 9pt;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          position: relative;
          min-height: 100vh;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 15px;
          padding-bottom: 70px; /* Alt bilgi için yer açıyoruz */
        }
        
        .header { 
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px; 
          border-bottom: 2px solid #180675;
          padding-bottom: 10px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
        }
        
        .header-title {
          margin-left: 10px;
        }
        
        .header h1 {
          color: #180675;
          margin: 0;
          font-size: 16pt;
          font-weight: 600;
        }
        
        .header p {
          margin: 0;
          color: #555;
          font-size: 9pt;
        }
        
        .logo {
          height: 35px;
        }
        
        .info-box { 
          background-color: #f8f9fa; 
          padding: 8px 12px; 
          border-radius: 4px; 
          margin-bottom: 12px;
          border-left: 3px solid #180675;
          display: flex;
          justify-content: space-between;
          font-size: 8pt;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .info-item {
          display: flex;
          align-items: center;
        }
        
        .info-icon {
          margin-right: 8px;
          color: #180675;
          width: 14px;
          height: 14px;
        }
        
        .section { 
          margin-bottom: 12px; 
        }
        
        .section-title { 
          background-color: #180675; 
          color: white; 
          padding: 6px 10px;
          border-radius: 3px;
          font-weight: 500;
          display: flex;
          align-items: center;
          font-size: 9pt;
          margin-bottom: 6px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .section-icon {
          margin-right: 6px;
          width: 12px;
          height: 12px;
          display: inline-block;
        }
        
        .two-columns {
          display: flex;
          gap: 12px;
        }
        
        .column {
          flex: 1;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 10px; 
          font-size: 8pt;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .compact-table {
          font-size: 8pt;
        }
        
        th { 
          background-color: #f0f0f0; 
          color: #333; 
          text-align: left; 
          padding: 5px 8px; 
          font-weight: 600;
          border-bottom: 1px solid #ddd;
        }
        
        td { 
          padding: 4px 8px; 
          border-bottom: 1px solid #eee; 
        }
        
        tr:nth-child(even) { 
          background-color: #f9f9f9; 
        }
        
        .text-center { 
          text-align: center; 
        }
        
        .compact-table td {
          padding: 4px 8px;
        }
        
        .payment-box {
          background-color: #f0f4ff;
          border: 1px solid #d0d9ff;
          border-radius: 4px;
          padding: 8px;
          margin-top: 10px;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .payment-box h3 {
          margin: 0 0 4px 0;
          font-size: 9pt;
          color: #180675;
        }
        
        .payment-highlight {
          font-size: 12pt;
          font-weight: 700;
          color: #180675;
          margin: 0;
        }
        
        .notes {
          background-color: #f9f9f9;
          padding: 8px 10px;
          border-radius: 4px;
          font-size: 7.5pt;
          border-left: 3px solid #180675;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .notes p {
          margin: 3px 0;
        }
        
        .footer-wrapper {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          background-color: #fff;
          border-top: 1px solid #ddd;
          padding: 8px 0;
        }
        
        .footer {
          text-align: center;
          font-size: 7pt;
          color: #666;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .footer p {
          margin: 2px 0;
        }
        
        .company-info {
          font-size: 7pt;
          color: #666;
          text-align: center;
          margin-top: 4px;
        }
        
        /* Tek sayfa için optimize edilmiş tablo */
        .konaklayanlar-table {
          font-size: 7.5pt;
        }
        
        .konaklayanlar-table th,
        .konaklayanlar-table td {
          padding: 3px 6px;
        }
        
        /* Üç sütunlu düzen */
        .three-columns {
          display: flex;
          gap: 8px;
        }
        
        .three-columns .column {
          flex: 1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-left">
            <img src="data:image/svg+xml;base64,${btoa(iconSvg)}" class="logo" alt="Logo">
            <div class="header-title">
              <h1>Rezervasyon Formu</h1>
              <p>INN ELEGANCE LLC</p>
            </div>
          </div>
          <div>
            <strong>Rezervasyon No:</strong> ${reservationNumber}
          </div>
        </div>
        
        <div class="info-box">
          <div class="info-item">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="#180675" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div>
              <strong>Tarih:</strong><br>
              ${currentDate}
            </div>
          </div>
          <div class="info-item">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="#180675" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <strong>Durum:</strong><br>
              Onaylandı
            </div>
          </div>
        </div>
        
        <div class="three-columns">
          <div class="column">
            <div class="section">
              <div class="section-title">
                <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Kiracı Bilgileri
              </div>
              <table class="compact-table">
                <tr><td width="40%"><strong>İsim Soyisim</strong></td><td>${formData.kiraciBilgileri.isimSoyisim}</td></tr>
                <tr><td><strong>TC Kimlik No</strong></td><td>${formData.kiraciBilgileri.tcKimlikNo}</td></tr>
                <tr><td><strong>Telefon</strong></td><td>${formData.kiraciBilgileri.telefon}</td></tr>
                <tr><td><strong>E-posta</strong></td><td>${formData.kiraciBilgileri.eposta}</td></tr>
              </table>
            </div>
          </div>
          
          <div class="column">
            <div class="section">
              <div class="section-title">
                <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Villa Bilgileri
              </div>
              <table class="compact-table">
                <tr><td width="40%"><strong>Villa Adı</strong></td><td>${formData.villaBilgileri.villaAd}</td></tr>
                <tr><td><strong>Villa Sahibi</strong></td><td>${formData.villaBilgileri.villaSahip}</td></tr>
                <tr><td><strong>Telefon</strong></td><td>${formData.villaBilgileri.villaTelefon}</td></tr>
              </table>
            </div>
          </div>
          
          <div class="column">
            <div class="section">
              <div class="section-title">
                <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Konaklama Bilgileri
              </div>
              <table class="compact-table">
                <tr><td width="40%"><strong>Giriş Tarihi</strong></td><td>${formatTurkishDate(formData.konaklamaBilgileri.girisTarihi)}</td></tr>
                <tr><td><strong>Çıkış Tarihi</strong></td><td>${formatTurkishDate(formData.konaklamaBilgileri.cikisTarihi)}</td></tr>
                <tr><td><strong>Kişi Sayısı</strong></td><td>${formData.konaklamaBilgileri.kisiSayisi.toString()}</td></tr>
              </table>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              <path d="M17 17H7a5 5 0 0 1 10 0z" />
            </svg>
            Ödeme Bilgileri
          </div>
          <div class="two-columns">
            <div class="column">
              <table class="compact-table">
                <tr><td width="40%"><strong>Toplam Tutar</strong></td><td>${toplamTutar}</td></tr>
                <tr><td><strong>Ön Ödeme</strong></td><td>${onOdeme}</td></tr>
                <tr><td><strong>Kalan Ödeme</strong></td><td>${kalanOdeme}</td></tr>
                <tr><td><strong>Hasar Depozitosu</strong></td><td>${hasarDepozitosu}</td></tr>
              </table>
            </div>
            <div class="column">
              <div class="payment-box">
                <h3>Villaya Girişte Yapılacak Toplam Ödeme</h3>
                <p class="payment-highlight">
                  ${toplamOdeme}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Konaklayanlar Listesi
          </div>
          <table class="konaklayanlar-table">
            <thead>
              <tr>
                <th width="5%" class="text-center">#</th>
                <th width="45%">İsim Soyisim</th>
                <th width="30%">TC Kimlik No</th>
                <th width="20%" class="text-center">Kategori</th>
              </tr>
            </thead>
            <tbody>
              ${konaklayanlarRows}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Önemli Notlar
          </div>
          <div class="notes">
            <p>1. Giriş saati 16:00, çıkış saati 10:00'dir.</p>
            <p>2. Hasar depozitosu, çıkış sırasında villa kontrolü sonrası iade edilecektir.</p>
            <p>3. Rezervasyon iptal koşulları için lütfen sözleşmeyi inceleyiniz.</p>
            <p>4. Acil durumlar için: +90 531 621 61 00</p>
          </div>
        </div>
      </div>
      
      <div class="footer-wrapper">
        <div class="footer">
          <p>Bu belge elektronik olarak oluşturulmuştur. Rezervasyon No: ${reservationNumber}</p>
          <p>© ${new Date().getFullYear()} INN ELEGANCE LLC - Tüm Hakları Saklıdır</p>
          <div class="company-info">
            INN ELEGANCE LLC | 7901 4TH ST N STE 300, ST. PETERSBURG, FL 33702 | LUXURY REDEFINED IN VACATION
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // HTML'i PDF'e dönüştür - daha yüksek kalite için ayarlar
  const options = {
    margin: [8, 8, 8, 8],
    filename: `Rezervasyon_${reservationNumber}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { 
      scale: 3, // Yüksek çözünürlük korundu
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true,
      precision: 16
    }
  };
  
  // PDF'i oluştur ve URL döndür
  const pdfBlob = await html2pdf().from(htmlContent).set(options).outputPdf('blob');
  return URL.createObjectURL(pdfBlob);
} 