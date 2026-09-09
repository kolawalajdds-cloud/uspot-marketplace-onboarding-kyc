import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Plus, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import { BusinessFormData } from './types';

interface ImageGalleryTabProps {
  data: BusinessFormData;
  onChange: (updates: Partial<BusinessFormData>) => void;
}

export const ImageGalleryTab: React.FC<ImageGalleryTabProps> = ({ data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const availableSlots = 20 - data.images.length;
    if (availableSlots <= 0) return;

    const fileList = Array.from(files).slice(0, availableSlots);
    setIsUploading(true);

    try {
      const readPromises = fileList.map((file, idx) => {
        return new Promise<{ id: string; url: string; label: string; isCover: boolean }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            resolve({
              id: `img-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
              url: dataUrl || URL.createObjectURL(file),
              label: file.name.replace(/\.[^/.]+$/, ''),
              isCover: false,
            });
          };
          reader.onerror = () => {
            resolve({
              id: `img-${Date.now()}-${idx}`,
              url: URL.createObjectURL(file),
              label: file.name.replace(/\.[^/.]+$/, ''),
              isCover: false,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const newPhotos = await Promise.all(readPromises);
      const combined = [...data.images, ...newPhotos];
      if (combined.length > 0 && !combined.some((img) => img.isCover)) {
        combined[0].isCover = true;
      }
      onChange({ images: combined });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const setCoverImage = (id: string) => {
    const updated = data.images.map((img) => ({
      ...img,
      isCover: img.id === id,
    }));
    onChange({ images: updated });
  };

  const removeImage = (id: string) => {
    const updated = data.images.filter((img) => img.id !== id);
    // If the removed image was the cover, assign the first remaining as cover
    if (updated.length > 0 && !updated.some((i) => i.isCover)) {
      updated[0].isCover = true;
    }
    onChange({ images: updated });
  };

  const addSamplePhoto = () => {
    const samples = [
      {
        url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
        label: 'Main Collaborative Lounge',
      },
      {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        label: 'Conference Room Alpha',
      },
      {
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        label: 'Open Workspace Loft',
      },
      {
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        label: 'Artisan Espresso Station',
      },
    ];

    const pick = samples[data.images.length % samples.length];
    const newImages = [
      ...data.images,
      {
        id: `img-${Date.now()}`,
        url: pick.url,
        label: pick.label,
        isCover: data.images.length === 0,
      },
    ];
    onChange({ images: newImages });
  };

  return (
    <div id="tab-content-image-gallery" className="space-y-7">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Upload Dropzone matching Image 3 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
          isDragging
            ? 'border-black bg-slate-50 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base font-extrabold text-slate-900">
            Drag & Drop or Click to Upload
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload high-quality images of your space. We recommend architectural or well-lit interior shots.
          </p>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Recommended: 1080×1080px &nbsp;•&nbsp; Max size: 5MB
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="bg-black hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          {isUploading ? 'Uploading & Processing...' : 'Browse Files'}
        </button>
      </div>

      {/* Uploaded Images Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Uploaded Images
          </h2>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">
            {data.images.length} / 20 Photos Used
          </span>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Add Photo Card matching Image 3 */}
          <button
            type="button"
            onClick={addSamplePhoto}
            className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-2 p-4 text-slate-500 hover:text-slate-800 cursor-pointer shadow-2xs"
          >
            <div className="relative">
              <Camera className="w-6 h-6" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                +
              </span>
            </div>
            <span className="text-xs font-bold">Add Photo</span>
          </button>

          {/* Uploaded Image Cards */}
          {data.images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
            >
              <img
                src={img.url}
                alt={img.label}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Cover badge */}
              {img.isCover && (
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Cover Photo</span>
                </div>
              )}

              {/* Hover actions overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => setCoverImage(img.id)}
                      className="text-[10px] font-bold bg-white hover:bg-slate-100 text-slate-900 px-2.5 py-1 rounded-md transition-colors shadow-xs cursor-pointer"
                    >
                      Make Cover
                    </button>
                  )}
                  <span className="text-[10px] text-white/90 truncate font-medium max-w-[90px]">
                    {img.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
