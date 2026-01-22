
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

// Free image hosting API (ImgBB) - you can get a free API key at https://api.imgbb.com/
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY'; // Optional: for file uploads

interface ImageEditorModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (productId: string, newImageUrl: string) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ product, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'ai'>('url');
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!product) return null;

  // Handle direct URL input (simplest method - works great with picsum, unsplash, etc.)
  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput.trim());
      setUploadError(null);
    }
  };

  // Handle file upload - convert to hosted URL via ImgBB or use data URL for small images
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB for data URL storage)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File terlalu besar. Maksimal 2MB atau gunakan URL gambar.');
      return;
    }

    setLoading(true);
    setUploadError(null);

    try {
      // Try ImgBB upload first if API key is configured
      if (IMGBB_API_KEY !== 'YOUR_IMGBB_API_KEY') {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        if (data.success) {
          setPreviewUrl(data.data.url);
          setLoading(false);
          return;
        }
      }

      // Fallback: Use data URL (works for smaller images)
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Check if base64 is too long (limit for JSON storage)
        if (dataUrl.length > 500000) {
          setUploadError('Gambar terlalu besar. Gunakan URL langsung atau kompres gambar.');
          setLoading(false);
          return;
        }
        setPreviewUrl(dataUrl);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadError('Upload gagal. Coba gunakan URL gambar.');
      setLoading(false);
    }
  };

  const generateWithAI = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("API Key tidak ditemukan. Gunakan tab 'URL Gambar' untuk memasukkan link gambar manual.");
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'High quality professional food photography of ' + product.name + ', ' + product.description + '. Professional lighting, appetizing, depth of field.',
      });

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
      alert("Gagal membuat gambar otomatis. Coba gunakan URL gambar manual.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (previewUrl) {
      onSave(product.id, previewUrl);
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

          {/* Preview Image */}
          <div className="aspect-[4/3] bg-slate-100 rounded-2xl mb-6 overflow-hidden relative group border-2 border-dashed border-slate-200">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                <p className="text-green-700 font-bold animate-pulse">Memproses...</p>
              </div>
            ) : (
              <img
                src={previewUrl || product.image}
                className="w-full h-full object-cover"
                alt="Preview"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?grayscale';
                }}
              />
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'url' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <i className="fas fa-link mr-1"></i> URL Gambar
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'upload' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <i className="fas fa-upload mr-1"></i> Upload
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'ai' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <i className="fas fa-wand-magic-sparkles mr-1"></i> AI
            </button>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === 'url' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">Masukkan URL gambar (dari Unsplash, Picsum, Google, dll):</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://picsum.photos/400/300"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleUrlSubmit}
                    className="px-4 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  💡 Tips: Gunakan <a href="https://picsum.photos" target="_blank" className="text-green-600 underline">picsum.photos</a> atau <a href="https://unsplash.com" target="_blank" className="text-green-600 underline">unsplash.com</a> untuk gambar gratis
                </p>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                  <i className="fas fa-cloud-upload-alt text-2xl text-slate-400 mb-2"></i>
                  <span className="text-sm font-bold text-slate-600">Klik untuk upload gambar</span>
                  <span className="text-xs text-slate-400 mt-1">Maksimal 2MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                {uploadError && (
                  <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{uploadError}</p>
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-3">
                <button
                  onClick={generateWithAI}
                  disabled={loading}
                  className="w-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl hover:border-green-500 transition-all"
                >
                  <i className="fas fa-wand-magic-sparkles text-2xl text-green-600 mb-2"></i>
                  <span className="text-sm font-bold text-green-700">Generate dengan AI</span>
                  <span className="text-xs text-green-500 mt-1">Buat gambar otomatis berdasarkan deskripsi produk</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  ⚠️ Membutuhkan API Key yang dikonfigurasi
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
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
