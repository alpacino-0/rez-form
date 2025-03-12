import Link from "next/link";
import { CheckCircle, FileText, Save, Wifi } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <main className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Villa Rezervasyon Formu</h1>
          <p className="text-gray-600">
            Villa rezervasyonlarınızı hızlı ve kolay bir şekilde oluşturun.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Rezervasyon Formunun Özellikleri</h2>
          <ul className="text-left max-w-md mx-auto space-y-4">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>Kolay ve hızlı rezervasyon oluşturma</span>
            </li>
            <li className="flex items-start">
              <FileText className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>Otomatik PDF oluşturma</span>
            </li>
            <li className="flex items-start">
              <Save className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>Form verilerinin otomatik kaydedilmesi</span>
            </li>
            <li className="flex items-start">
              <Wifi className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>Offline çalışabilme desteği</span>
            </li>
          </ul>
        </div>
        
        <Link 
          href="/rezervasyon" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Rezervasyon Oluştur
        </Link>
      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Villa Rezervasyon Sistemi. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
