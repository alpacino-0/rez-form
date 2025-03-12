import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Form doğrulama şeması
const konaklayanSchema = z.object({
  isimSoyisim: z.string().min(3, 'İsim ve soyisim en az 3 karakter olmalıdır'),
  tcKimlikNo: z.string()
    .min(11, 'TC Kimlik No 11 haneli olmalıdır')
    .max(11, 'TC Kimlik No 11 haneli olmalıdır')
    .regex(/^[0-9]+$/, 'TC Kimlik No sadece rakamlardan oluşmalıdır'),
  kategori: z.enum(['Yetişkin', 'Çocuk', 'Bebek']),
});

const konaklamaBilgileriSchema = z.object({
  girisTarihi: z.string().min(1, 'Giriş tarihi seçilmelidir'),
  cikisTarihi: z.string().min(1, 'Çıkış tarihi seçilmelidir'),
  kisiSayisi: z.coerce.number().min(1, 'En az 1 kişi olmalıdır').max(20, 'En fazla 20 kişi olabilir'),
  konaklayanlar: z.array(konaklayanSchema).min(1, 'En az bir kişi eklenmelidir'),
});

export type KonaklamaBilgileriFormValues = z.infer<typeof konaklamaBilgileriSchema>;

interface KonaklamaBilgileriProps {
  defaultValues?: Partial<KonaklamaBilgileriFormValues>;
  onSubmit: (data: KonaklamaBilgileriFormValues) => void;
  onBack: () => void;
}

const KonaklamaBilgileri = ({ defaultValues, onSubmit, onBack }: KonaklamaBilgileriProps) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KonaklamaBilgileriFormValues>({
    resolver: zodResolver(konaklamaBilgileriSchema),
    defaultValues: defaultValues || {
      girisTarihi: '',
      cikisTarihi: '',
      kisiSayisi: 1,
      konaklayanlar: [{ isimSoyisim: '', tcKimlikNo: '', kategori: 'Yetişkin' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'konaklayanlar',
  });

  const kisiSayisi = watch('kisiSayisi');

  // TC Kimlik No formatı
  const formatTcKimlik = (value: string) => {
    return value.replace(/[^0-9]/g, '').slice(0, 11);
  };

  // Kişi sayısı değiştiğinde konaklayan listesini güncelle
  const handleKisiSayisiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setValue('kisiSayisi', value);
      
      // Mevcut konaklayan sayısı
      const mevcutKisiSayisi = fields.length;
      
      // Kişi sayısı artırıldıysa yeni kişiler ekle
      if (value > mevcutKisiSayisi) {
        for (let i = mevcutKisiSayisi; i < value; i++) {
          append({ isimSoyisim: '', tcKimlikNo: '', kategori: 'Yetişkin' });
        }
      } 
      // Kişi sayısı azaltıldıysa fazla kişileri çıkar
      else if (value < mevcutKisiSayisi) {
        for (let i = mevcutKisiSayisi - 1; i >= value; i--) {
          remove(i);
        }
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Konaklama Bilgileri</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Giriş Tarihi"
            type="date"
            {...register('girisTarihi')}
            error={errors.girisTarihi?.message}
            helperText="16:00'dan sonra giriş"
          />
          
          <Input
            label="Çıkış Tarihi"
            type="date"
            {...register('cikisTarihi')}
            error={errors.cikisTarihi?.message}
            helperText="10:00'dan önce çıkış"
          />
        </div>
        
        <Input
          label="Toplam Kişi Sayısı"
          type="number"
          min={1}
          max={20}
          {...register('kisiSayisi', {
            onChange: handleKisiSayisiChange,
          })}
          error={errors.kisiSayisi?.message}
        />
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Konaklayanların Listesi</h3>
          
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 mb-4 border border-gray-200 rounded-md bg-gray-50">
              <h4 className="font-medium mb-3">Konaklayan {index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <Input
                  label="İsim Soyisim"
                  {...register(`konaklayanlar.${index}.isimSoyisim`)}
                  error={errors.konaklayanlar?.[index]?.isimSoyisim?.message}
                />
                
                <Input
                  label="TC Kimlik / Pasaport No"
                  {...register(`konaklayanlar.${index}.tcKimlikNo`, {
                    onChange: (e) => {
                      e.target.value = formatTcKimlik(e.target.value);
                    },
                  })}
                  error={errors.konaklayanlar?.[index]?.tcKimlikNo?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register(`konaklayanlar.${index}.kategori`)}
                >
                  <option value="Yetişkin">Yetişkin</option>
                  <option value="Çocuk">Çocuk</option>
                  <option value="Bebek">Bebek</option>
                </select>
                {errors.konaklayanlar?.[index]?.kategori && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.konaklayanlar?.[index]?.kategori?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {errors.konaklayanlar && !Array.isArray(errors.konaklayanlar) && (
            <p className="mt-1 text-sm text-red-600">{errors.konaklayanlar.message}</p>
          )}
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
            Devam Et
          </Button>
        </div>
      </form>
    </div>
  );
};

export default KonaklamaBilgileri; 