# Villa Rezervasyon Formu Uygulaması

Bu proje, villa rezervasyonlarını hızlı ve kolay bir şekilde oluşturmak, yönetmek ve belgelendirmek için geliştirilmiş bir web uygulamasıdır. Next.js 15, React 19, TypeScript ve Tailwind CSS kullanılarak oluşturulmuştur.

## 🚀 Özellikler

- ✅ Adım adım rezervasyon formu
- ✅ Kiracı bilgileri, villa bilgileri, konaklama detayları ve ödeme bilgileri yönetimi
- ✅ Otomatik PDF oluşturma ve indirme
- ✅ Form verilerinin otomatik kaydedilmesi
- ✅ Tamamen mobil uyumlu tasarım
- ✅ TypeScript ile tip güvenliği

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript
- **Stil**: Tailwind CSS, DaisyUI
- **Form Yönetimi**: React Hook Form, Zod
- **PDF Oluşturma**: jsPDF, jsPDF-AutoTable
- **İkonlar**: Lucide React

## 🚀 Başlangıç

### Gereksinimler

- Node.js 18.0 veya daha yüksek
- npm, yarn, pnpm veya bun

### Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/kullaniciadi/rez-form-app.git
   cd rez-form-app
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   # veya
   yarn install
   # veya
   pnpm install
   # veya
   bun install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   # veya
   yarn dev
   # veya
   pnpm dev
   # veya
   bun dev
   ```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── rezervasyon/        # Rezervasyon formu sayfası
│   └── page.tsx            # Ana sayfa
├── components/             # Yeniden kullanılabilir bileşenler
│   ├── forms/              # Form bileşenleri
│   └── ui/                 # UI bileşenleri
├── lib/                    # Yardımcı fonksiyonlar ve servisler
│   └── pdf-generator.ts    # PDF oluşturma işlemleri
└── types/                  # TypeScript tipleri
```

## 📝 Kullanım

1. Ana sayfadan "Rezervasyon Oluştur" butonuna tıklayın
2. Adım adım formu doldurun:
   - Kiracı Bilgileri
   - Villa Bilgileri
   - Konaklama Bilgileri
   - Ödeme Bilgileri
3. Tamamlandığında, rezervasyon özeti görüntülenir
4. "PDF İndir" butonuyla rezervasyon belgesini indirin

## 🧪 Test

```bash
npm run test
# veya
yarn test
# veya
pnpm test
# veya
bun test
```

## 🚀 Dağıtım

Bu uygulamayı Vercel'de dağıtmak için:

[![Vercel ile Dağıt](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkullaniciadi%2Frez-form-app)

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Lütfen bir pull request göndermeden önce bir issue açın.
