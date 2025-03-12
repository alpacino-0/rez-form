import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Form doğrulama şeması
const kiraciBilgileriSchema = z.object({
  isimSoyisim: z.string().min(3, 'İsim ve soyisim en az 3 karakter olmalıdır'),
  tcKimlikNo: z.string()
    .min(11, 'TC Kimlik No 11 haneli olmalıdır')
    .max(11, 'TC Kimlik No 11 haneli olmalıdır')
    .regex(/^[0-9]+$/, 'TC Kimlik No sadece rakamlardan oluşmalıdır'),
  telefon: z.string()
    .min(10, 'Telefon numarası en az 10 haneli olmalıdır')
    .regex(/^[0-9+]+$/, 'Geçerli bir telefon numarası giriniz'),
  eposta: z.string().email('Geçerli bir e-posta adresi giriniz'),
  adres: z.string().min(10, 'Adres en az 10 karakter olmalıdır').optional(),
});

export type KiraciBilgileriFormValues = z.infer<typeof kiraciBilgileriSchema>;

interface KiraciBilgileriProps {
  defaultValues?: Partial<KiraciBilgileriFormValues>;
  onSubmit: (data: KiraciBilgileriFormValues) => void;
  onBack?: () => void;
}

const KiraciBilgileri = ({ defaultValues, onSubmit, onBack }: KiraciBilgileriProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KiraciBilgileriFormValues>({
    resolver: zodResolver(kiraciBilgileriSchema),
    defaultValues: defaultValues || {
      isimSoyisim: '',
      tcKimlikNo: '',
      telefon: '',
      eposta: '',
      adres: '',
    },
  });

  const formatTcKimlik = (value: string) => {
    return value.replace(/[^0-9]/g, '').slice(0, 11);
  };

  const formatTelefon = (value: string) => {
    const cleaned = value.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+90')) {
      return cleaned.slice(0, 13);
    }
    return cleaned.slice(0, 10);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Kiracı Bilgileri</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="İsim Soyisim"
          placeholder="Adınız ve soyadınız"
          {...register('isimSoyisim')}
          error={errors.isimSoyisim?.message}
        />
        
        <Input
          label="TC Kimlik / Pasaport No"
          placeholder="11 haneli TC Kimlik No veya Pasaport No"
          {...register('tcKimlikNo', {
            onChange: (e) => {
              e.target.value = formatTcKimlik(e.target.value);
            },
          })}
          error={errors.tcKimlikNo?.message}
        />
        
        <Input
          label="Telefon"
          placeholder="+90 5XX XXX XX XX"
          {...register('telefon', {
            onChange: (e) => {
              e.target.value = formatTelefon(e.target.value);
            },
          })}
          error={errors.telefon?.message}
        />
        
        <Input
          label="E-posta"
          type="email"
          placeholder="ornek@email.com"
          {...register('eposta')}
          error={errors.eposta?.message}
        />
        
        <div className="mb-4">
          <label htmlFor="adres" className="block text-sm font-medium text-gray-700 mb-1">
            Adres
          </label>
          <textarea
            id="adres"
            rows={3}
            className={`w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.adres ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Adres bilgileriniz"
            {...register('adres')}
          />
          {errors.adres && (
            <p className="mt-1 text-sm text-red-600">{errors.adres.message}</p>
          )}
        </div>
        
        <div className="flex justify-between pt-4">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              Geri
            </Button>
          )}
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="ml-auto"
          >
            Devam Et
          </Button>
        </div>
      </form>
    </div>
  );
};

export default KiraciBilgileri; 