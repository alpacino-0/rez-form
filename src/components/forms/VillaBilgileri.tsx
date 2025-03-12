import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Form doğrulama şeması
const villaBilgileriSchema = z.object({
  villaAd: z.string().min(3, 'Villa adı en az 3 karakter olmalıdır'),
  villaSahip: z.string().min(3, 'Villa sahibi adı en az 3 karakter olmalıdır'),
  villaTelefon: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
  villaAdres: z.string().min(10, 'Adres en az 10 karakter olmalıdır').optional(),
});

export type VillaBilgileriFormValues = z.infer<typeof villaBilgileriSchema>;

interface VillaBilgileriProps {
  defaultValues?: Partial<VillaBilgileriFormValues>;
  onSubmit: (data: VillaBilgileriFormValues) => void;
  onBack: () => void;
}

const VillaBilgileri = ({ defaultValues, onSubmit, onBack }: VillaBilgileriProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VillaBilgileriFormValues>({
    resolver: zodResolver(villaBilgileriSchema),
    defaultValues: defaultValues || {
      villaAd: '',
      villaSahip: '',
      villaTelefon: '',
      villaAdres: '',
    },
  });

  // Telefon formatı
  const formatTelefon = (value: string) => {
    const cleaned = value.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+90')) {
      return cleaned.slice(0, 13);
    }
    return cleaned.slice(0, 10);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Villa Bilgileri</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Villa Adı"
          placeholder="Örn: Villa Karbelen"
          {...register('villaAd')}
          error={errors.villaAd?.message}
        />
        
        <Input
          label="Villa Sahibi"
          placeholder="Örn: Ahmet Yılmaz"
          {...register('villaSahip')}
          error={errors.villaSahip?.message}
        />
        
        <Input
          label="Villa Sahibi Telefonu"
          placeholder="+90 5XX XXX XX XX"
          {...register('villaTelefon', {
            onChange: (e) => {
              e.target.value = formatTelefon(e.target.value);
            },
          })}
          error={errors.villaTelefon?.message}
        />
        
        <div className="mb-4">
          <label htmlFor="villaAdres" className="block text-sm font-medium text-gray-700 mb-1">
            Villa Adresi
          </label>
          <textarea
            id="villaAdres"
            rows={3}
            className={`w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.villaAdres ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Villa adres bilgileri"
            {...register('villaAdres')}
          />
          {errors.villaAdres && (
            <p className="mt-1 text-sm text-red-600">{errors.villaAdres.message}</p>
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

export default VillaBilgileri; 