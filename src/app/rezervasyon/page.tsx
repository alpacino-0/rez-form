'use client';

import { useState, useEffect } from 'react';
import KiraciBilgileri from '@/components/forms/KiraciBilgileri';
import type { KiraciBilgileriFormValues } from '@/components/forms/KiraciBilgileri';
import VillaBilgileri from '@/components/forms/VillaBilgileri';
import type { VillaBilgileriFormValues } from '@/components/forms/VillaBilgileri';
import KonaklamaBilgileri from '@/components/forms/KonaklamaBilgileri';
import type { KonaklamaBilgileriFormValues } from '@/components/forms/KonaklamaBilgileri';
import OdemeBilgileri from '@/components/forms/OdemeBilgileri';
import type { OdemeBilgileriFormValues } from '@/components/forms/OdemeBilgileri';
import Button from '@/components/ui/Button';
import { CheckCircle, FileDown, Loader } from 'lucide-react';
import { generatePDF } from '@/lib/pdf-generator';

// Adım listesi
enum FormStep {
  KiraciBilgileri = 0,
  VillaBilgileri = 1,
  KonaklamaBilgileri = 2,
  OdemeBilgileri = 3,
  COMPLETED = 4,
}

// Tüm form verilerini içeren tip
interface FormData {
  kiraciBilgileri: KiraciBilgileriFormValues | null;
  villaBilgileri: VillaBilgileriFormValues | null;
  konaklamaBilgileri: KonaklamaBilgileriFormValues | null;
  odemeBilgileri: OdemeBilgileriFormValues | null;
}

// LocalStorage anahtar adı
const STORAGE_KEY = 'rezervasyon_form_data';

const ReservationPage = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.KiraciBilgileri);
  const [formData, setFormData] = useState<FormData>({
    kiraciBilgileri: null,
    villaBilgileri: null,
    konaklamaBilgileri: null,
    odemeBilgileri: null,
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sayfa yüklendiğinde localStorage'dan verileri al
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Form verileri yüklenirken hata oluştu:', error);
      }
    }
  }, []);

  // Form verileri değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (
      formData.kiraciBilgileri ||
      formData.villaBilgileri ||
      formData.konaklamaBilgileri ||
      formData.odemeBilgileri
    ) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  // Kiracı bilgileri form gönderimi
  const handleKiraciBilgileriSubmit = (data: KiraciBilgileriFormValues) => {
    setFormData(prev => ({ ...prev, kiraciBilgileri: data }));
    setCurrentStep(FormStep.VillaBilgileri);
  };

  // Villa bilgileri form gönderimi
  const handleVillaBilgileriSubmit = (data: VillaBilgileriFormValues) => {
    setFormData(prev => ({ ...prev, villaBilgileri: data }));
    setCurrentStep(FormStep.KonaklamaBilgileri);
  };

  // Konaklama bilgileri form gönderimi
  const handleKonaklamaBilgileriSubmit = (data: KonaklamaBilgileriFormValues) => {
    setFormData(prev => ({ ...prev, konaklamaBilgileri: data }));
    setCurrentStep(FormStep.OdemeBilgileri);
  };

  // Ödeme bilgileri form gönderimi
  const handleOdemeBilgileriSubmit = async (data: OdemeBilgileriFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Form verilerini güncelle
      const updatedFormData = {
        ...formData,
        odemeBilgileri: data
      };
      
      setFormData(updatedFormData);
      
      // Tüm form verileri dolu mu kontrol et
      if (
        updatedFormData.kiraciBilgileri &&
        updatedFormData.villaBilgileri &&
        updatedFormData.konaklamaBilgileri &&
        updatedFormData.odemeBilgileri
      ) {
        // PDF oluştur - asenkron fonksiyon olduğu için await kullan
        const pdfBlobUrl = await generatePDF({
          kiraciBilgileri: updatedFormData.kiraciBilgileri,
          villaBilgileri: updatedFormData.villaBilgileri,
          konaklamaBilgileri: updatedFormData.konaklamaBilgileri,
          odemeBilgileri: updatedFormData.odemeBilgileri,
        });
        
        // PDF URL'ini ayarla
        setPdfUrl(pdfBlobUrl);
      } else {
        console.error('Form verileri eksik, PDF oluşturulamadı');
        alert('Form verileri eksik, PDF oluşturulamadı. Lütfen tüm adımları tamamlayın.');
      }
      
      // Tamamlandı adımına geç
      setCurrentStep(FormStep.COMPLETED);
    } catch (error) {
      console.error('PDF oluşturulurken hata oluştu:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Önceki adıma dön
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Formu sıfırla
  const handleReset = () => {
    setFormData({
      kiraciBilgileri: null,
      villaBilgileri: null,
      konaklamaBilgileri: null,
      odemeBilgileri: null,
    });
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(FormStep.KiraciBilgileri);
    setPdfUrl(null);
  };

  // İlerleme çubuğu
  const renderProgressBar = () => {
    const steps = [
      { id: FormStep.KiraciBilgileri, label: 'Kiracı Bilgileri' },
      { id: FormStep.VillaBilgileri, label: 'Villa Bilgileri' },
      { id: FormStep.KonaklamaBilgileri, label: 'Konaklama Detayları' },
      { id: FormStep.OdemeBilgileri, label: 'Ödeme Bilgileri' },
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, idx) => (
            <div 
              key={`step-${idx}`}
              className={`flex flex-col items-center ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full mb-2 ${
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-sm">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 relative">
      <h1 className="text-3xl font-bold text-center mb-8">Rezervasyon Formu</h1>
      
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader className="animate-spin h-8 w-8 text-blue-500 mb-4" />
            <p className="text-lg font-medium">İşleminiz gerçekleştiriliyor...</p>
          </div>
        </div>
      )}
      
      {currentStep < FormStep.COMPLETED && renderProgressBar()}
      
      {currentStep === FormStep.KiraciBilgileri && (
        <KiraciBilgileri
          defaultValues={formData.kiraciBilgileri || undefined}
          onSubmit={handleKiraciBilgileriSubmit}
        />
      )}
      
      {currentStep === FormStep.VillaBilgileri && (
        <VillaBilgileri
          defaultValues={formData.villaBilgileri || undefined}
          onSubmit={handleVillaBilgileriSubmit}
          onBack={handleBack}
        />
      )}
      
      {currentStep === FormStep.KonaklamaBilgileri && (
        <KonaklamaBilgileri
          defaultValues={formData.konaklamaBilgileri || undefined}
          onSubmit={handleKonaklamaBilgileriSubmit}
          onBack={handleBack}
        />
      )}
      
      {currentStep === FormStep.OdemeBilgileri && (
        <OdemeBilgileri
          defaultValues={formData.odemeBilgileri || undefined}
          onSubmit={handleOdemeBilgileriSubmit}
          onBack={handleBack}
        />
      )}
      
      {currentStep === FormStep.COMPLETED && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Rezervasyon Tamamlandı!</h2>
          <p className="mb-4 text-center">Rezervasyon formunuz başarıyla oluşturuldu.</p>
          {pdfUrl && (
            <div className="flex flex-col items-center">
              <a 
                href={pdfUrl} 
                download="rezervasyon-formu.pdf" 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-4"
              >
                Rezervasyon Formunu İndir
              </a>
              <iframe 
                src={pdfUrl} 
                className="w-full h-[500px] border border-gray-300 rounded"
                title="Rezervasyon Formu"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationPage; 