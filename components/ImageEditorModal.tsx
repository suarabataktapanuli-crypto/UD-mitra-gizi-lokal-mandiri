
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

interface ImageEditorModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (productId: string, newImageUrl: string) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ product, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!product) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateWithAI = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("API Key tidak ditemukan. Fitur AI tidak dapat digunakan di lingkungan static tanpa konfigurasi secret.");
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'High quality professional food photography of ' + product.name + ', ' + product.description + '. Professional lighting, appetizing, depth of field.',
      });

      // Find image part in response
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const newUrl = `data:image/png;base64,${part.inlineData.data}`;
            setPreviewUrl(newUrl);
            break;
          }
        }
      }
    } catch (err) {
      console.error("AI Generation failed", err);
      alert("Gagal membuat gambar otomatis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800">Edit Foto Produk</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <i className="fas fa-times text-slate-400"></i>
            </button>
          </div>

          <div className="aspect-[4/3] bg-slate-100 rounded-2xl mb-6 overflow-hidden relative group border-2 border-dashed border-slate-200">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                <p className="text-green-700 font-bold animate-pulse">Memproses Gizi Visual...</p>
              </div>
            ) : (
              <img 
                src={previewUrl || product.image} 
                className="w-full h-full object-cover" 
                alt="Preview"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <label className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group">
              <i className="fas fa-upload text-slate-400 group-hover:text-green-600 mb-2"></i>
              <span className="text-xs font-bold text-slate-600 group-hover:text-green-700">Upload File</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            <button 
              onClick={generateWithAI}
              className="flex flex-col items-center justify-center p-4 bg-green-50 border-2 border-green-100 rounded-2xl hover:border-green-500 hover:bg-green-100 transition-all group"
            >
              <i className="fas fa-wand-magic-sparkles text-green-600 mb-2"></i>
              <span className="text-xs font-bold text-green-700">AI Auto-Generate</span>
            </button>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-700"
            >
              Batal
            </button>
            <button 
              onClick={() => previewUrl && onSave(product.id, previewUrl)}
              disabled={!previewUrl}
              className={`flex-1 py-4 rounded-2xl font-bold shadow-lg transition-all ${previewUrl ? 'bg-green-600 text-white shadow-green-200 hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
