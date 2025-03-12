import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Form doğrulama şeması
const odemeBilgileriSchema = z.object({
  toplamTutar: z.coerce.number().min(1, 'Toplam tutar girilmelidir'),
  onOdeme: z.coerce.number().min(0, 'Ön ödeme 0 veya daha büyük olmalıdır'),
  kalanOdeme: z.coerce.number().min(0, 'Kalan ödeme 0 veya daha büyük olmalıdır'),
  hasarDepozitosu: z.coerce.number().min(0, 'Hasar depozitosu 0 veya daha büyük olmalıdır'),
  odemeTarihi: z.string().min(1, 'Ödeme tarihi seçilmelidir'),
  odemeYontemi: z.enum(['Banka Havalesi', 'Kredi Kartı', 'Nakit']),
  odemeNotu: z.string().optional(),
});

export type OdemeBilgileriFormValues = z.infer<typeof odemeBilgileriSchema>;

interface OdemeBilgileriProps {
  defaultValues?: Partial<OdemeBilgileriFormValues>;
  onSubmit: (data: OdemeBilgileriFormValues) => void;
  onBack: () => void;
}

const OdemeBilgileri = ({ defaultValues, onSubmit, onBack }: OdemeBilgileriProps) => {
  const [toplamOdeme, setToplamOdeme] = useState(0);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OdemeBilgileriFormValues>({
    resolver: zodResolver(odemeBilgileriSchema),
    defaultValues: defaultValues || {
      toplamTutar: 0,
      onOdeme: 0,
      kalanOdeme: 0,
      hasarDepozitosu: 5000, // Varsayılan değer
      odemeTarihi: '',
      odemeYontemi: 'Banka Havalesi',
      odemeNotu: '',
    },
  });

  const toplamTutar = watch('toplamTutar');
  const onOdeme = watch('onOdeme');
  const hasarDepozitosu = watch('hasarDepozitosu');

  // Toplam tutar veya ön ödeme değiştiğinde kalan ödemeyi otomatik hesapla
  useEffect(() => {
    const kalan = toplamTutar - onOdeme;
    setValue('kalanOdeme', kalan >= 0 ? kalan : 0);
    
    // Villaya girişte yapılacak toplam ödeme (kalan ödeme + hasar depozitosu)
    setToplamOdeme(kalan + hasarDepozitosu);
  }, [toplamTutar, onOdeme, hasarDepozitosu, setValue]);

  // Para formatı
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Ödeme Bilgileri</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Toplam Tutar (₺)"
            type="number"
            min={0}
            step={100}
            {...register('toplamTutar')}
            error={errors.toplamTutar?.message}
          />
          
          <Input
            label="Ön Ödeme (₺)"
            type="number"
            min={0}
            step={100}
            {...register('onOdeme')}
            error={errors.onOdeme?.message}
            helperText="İade edilmez"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Kalan Ödeme (₺)"
            type="number"
            min={0}
            disabled
            {...register('kalanOdeme')}
            error={errors.kalanOdeme?.message}
          />
          
          <Input
            label="Hasar Depozitosu (₺)"
            type="number"
            min={0}
            {...register('hasarDepozitosu')}
            error={errors.hasarDepozitosu?.message}
            helperText="Hasar olmadığında iade edilir"
          />
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <h3 className="font-medium text-blue-800 mb-2">Villaya Girişte Yapılacak Toplam Ödeme</h3>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(toplamOdeme)}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ödeme Tarihi"
            type="date"
            {...register('odemeTarihi')}
            error={errors.odemeTarihi?.message}
          />
          
          <div>
            <label htmlFor="odemeYontemi" className="block text-sm font-medium text-gray-700 mb-1">
              Ödeme Yöntemi
            </label>
            <select
              id="odemeYontemi"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register('odemeYontemi')}
            >
              <option value="Banka Havalesi">Banka Havalesi</option>
              <option value="Kredi Kartı">Kredi Kartı</option>
              <option value="Nakit">Nakit</option>
            </select>
            {errors.odemeYontemi && (
              <p className="mt-1 text-sm text-red-600">{errors.odemeYontemi.message}</p>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="odemeNotu" className="block text-sm font-medium text-gray-700 mb-1">
            Ödeme Notu
          </label>
          <textarea
            id="odemeNotu"
            rows={3}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ödeme ile ilgili notlar"
            {...register('odemeNotu')}
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Geri
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            Tamamla
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OdemeBilgileri; 