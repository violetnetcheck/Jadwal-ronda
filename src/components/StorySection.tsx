/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { CitizenStory } from '../types/index.ts';
import {
  Plus,
  Image as ImageIcon,
  Video,
  Type,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Send,
  UploadCloud,
  Play,
  Pause,
  Sparkles,
} from 'lucide-react';

const GRADIENT_PRESETS = [
  { name: 'Emerald Babakan', class: 'from-emerald-700 via-teal-800 to-slate-900' },
  { name: 'Sunset Emas', class: 'from-amber-600 via-orange-700 to-slate-900' },
  { name: 'Langit Malam', class: 'from-blue-700 via-indigo-900 to-slate-950' },
  { name: 'Siskamling Siaga', class: 'from-rose-700 via-red-800 to-slate-950' },
  { name: 'Ungu Sauyunan', class: 'from-purple-700 via-violet-900 to-slate-950' },
];

export const StorySection: React.FC = () => {
  const { user, state, createStory, likeStory, deleteStory } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);

  // Story Creation State
  const [storyType, setStoryType] = useState<'text' | 'image' | 'video'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].class);
  const [mediaDataUrl, setMediaDataUrl] = useState<string | undefined>(undefined);
  const [mediaCaption, setMediaCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  const stories = state?.stories || [];

  // Story Viewer Timer
  useEffect(() => {
    if (activeStoryIdx === null) return;
    const currentStory = stories[activeStoryIdx];
    if (!currentStory) return;

    // If it's a video, let the video duration control or 12 seconds
    const duration = currentStory.type === 'video' ? 14000 : 6000;
    const timer = setTimeout(() => {
      if (activeStoryIdx < stories.length - 1) {
        setActiveStoryIdx((prev) => (prev !== null ? prev + 1 : null));
      } else {
        setActiveStoryIdx(null);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [activeStoryIdx, stories]);

  // Handle Media file upload (image or video)
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (storyType === 'text' && !textContent.trim()) {
      alert('Tuliskan pesan status Anda');
      return;
    }
    if ((storyType === 'image' || storyType === 'video') && !mediaDataUrl) {
      alert(`Pilih file ${storyType === 'image' ? 'gambar' : 'video'} terlebih dahulu`);
      return;
    }

    setIsSubmitting(true);
    await createStory({
      type: storyType,
      content: storyType === 'text' ? textContent.trim() : mediaCaption.trim() || undefined,
      mediaUrl: mediaDataUrl,
      bgGradient: selectedGradient,
    });

    setIsSubmitting(false);
    setIsCreateOpen(false);
    setTextContent('');
    setMediaDataUrl(undefined);
    setMediaCaption('');
  };

  const currentViewedStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Story & Kabar Warga RT.01 RW.02
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          {stories.length} Story Warga Aktif
        </span>
      </div>

      {/* Horizontal Story Avatar Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
        {/* 1. Add Story Button */}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
        >
          <div className="relative w-14 h-14 rounded-full border-2 border-dashed border-emerald-600 group-hover:border-emerald-800 flex items-center justify-center bg-emerald-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user.name.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[11px] border border-white font-bold">
              +
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-800 max-w-[64px] truncate">
            Buat Story
          </span>
        </button>

        {/* 2. Story items */}
        {stories.map((story, idx) => (
          <button
            key={story.id}
            type="button"
            onClick={() => setActiveStoryIdx(idx)}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-emerald-600 to-teal-500 group-hover:scale-105 transition-transform shadow-xs">
              <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                {story.type === 'image' && story.mediaUrl ? (
                  <img
                    src={story.mediaUrl}
                    alt={story.authorName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : story.type === 'video' ? (
                  <div className="w-full h-full bg-slate-900 text-amber-300 rounded-full flex items-center justify-center text-xs font-bold">
                    <Video className="w-5 h-5 text-amber-400" />
                  </div>
                ) : (
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${story.bgGradient || 'from-emerald-700 to-slate-900'} text-white flex items-center justify-center text-xs font-bold`}>
                    {story.authorName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-700 max-w-[68px] truncate">
              {story.authorName.replace('Bpk. ', '').replace('Kang ', '')}
            </span>
          </button>
        ))}
      </div>

      {/* Modal: Buat Story (Teks, Gambar, Video) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Buat Story Warga Lingkungan</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Story Type Selector: Teks, Gambar, Video */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setStoryType('text');
                    setMediaDataUrl(undefined);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    storyType === 'text'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Type className="w-4 h-4 text-emerald-700" />
                  <span>Story Teks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStoryType('image');
                    setMediaDataUrl(undefined);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    storyType === 'image'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <span>Story Gambar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStoryType('video');
                    setMediaDataUrl(undefined);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    storyType === 'video'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-4 h-4 text-emerald-700" />
                  <span>Story Video</span>
                </button>
              </div>

              {/* Form Content per Type */}
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* 1. TEXT STORY */}
                {storyType === 'text' && (
                  <div className="space-y-3">
                    {/* Live Preview Canvas */}
                    <div
                      className={`h-48 rounded-2xl bg-gradient-to-br ${selectedGradient} p-5 flex flex-col justify-center items-center text-center text-white shadow-inner relative`}
                    >
                      <p className="text-sm sm:text-base font-bold leading-relaxed whitespace-pre-wrap max-w-sm">
                        {textContent.trim() || 'Ketik status kabar Anda di sini...'}
                      </p>
                      <span className="absolute bottom-3 right-4 text-[10px] text-white/70">
                        {user.name}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Teks Kabar / Info Warga</label>
                      <textarea
                        required
                        rows={3}
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Contoh: Kerja bakti hari Minggu pagi di selokan gang Dahlia. Jangan lupa bawa cangkul!"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Gradient Presets */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Pilih Warna Latar</label>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {GRADIENT_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setSelectedGradient(preset.class)}
                            className={`w-7 h-7 rounded-full bg-gradient-to-br ${preset.class} shrink-0 transition-transform ${
                              selectedGradient === preset.class
                                ? 'scale-125 ring-2 ring-emerald-500'
                                : 'hover:scale-110'
                            }`}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. IMAGE STORY */}
                {storyType === 'image' && (
                  <div className="space-y-3">
                    {mediaDataUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-56">
                        <img
                          src={mediaDataUrl}
                          alt="Preview"
                          className="w-full h-52 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaDataUrl(undefined)}
                          className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors"
                      >
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-800">
                          Pilih Foto dari Galeri atau Kamera
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG (Maks 10MB)</p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMediaChange}
                    />

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Keterangan / Caption Foto</label>
                      <input
                        type="text"
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        placeholder="Contoh: Kondisi jalan gang mawar setelah kerja bakti..."
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* 3. VIDEO STORY */}
                {storyType === 'video' && (
                  <div className="space-y-3">
                    {mediaDataUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-56 bg-black">
                        <video
                          src={mediaDataUrl}
                          controls
                          className="w-full h-52 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaDataUrl(undefined)}
                          className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors"
                      >
                        <Video className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-800">
                          Upload File Video Warga (MP4/WebM)
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Video dokumentasi kegiatan ronda atau lingkungan (Maks 20MB)
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleMediaChange}
                    />

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Keterangan Video</label>
                      <input
                        type="text"
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        placeholder="Contoh: Putaran ronda jam 02.00 malam di portal timur..."
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-xs sm:text-sm rounded-2xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mengunggah Story...' : 'Bagikan Story Warga'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Story Viewer */}
      {currentViewedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-sm sm:max-w-md h-[580px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-700">
            {/* Top Bar with Progress line */}
            <div className="p-4 z-20 space-y-2 bg-gradient-to-b from-black/80 to-transparent">
              <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden">
                <div className="bg-white h-full animate-[progress_6s_linear]" />
              </div>

              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    {currentViewedStory.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{currentViewedStory.authorName}</span>
                      {currentViewedStory.authorRole === 'rt_rw' && (
                        <span className="text-[9px] bg-amber-400 text-amber-950 px-1 rounded font-extrabold">
                          RT/RW
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-300">
                      {currentViewedStory.timestamp} · {currentViewedStory.authorAge} Thn
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {(user.role === 'rt_rw' || user.name === currentViewedStory.authorName) && (
                    <button
                      onClick={() => {
                        deleteStory(currentViewedStory.id);
                        setActiveStoryIdx(null);
                      }}
                      className="p-1.5 text-slate-300 hover:text-red-400 rounded-full"
                      title="Hapus Story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setActiveStoryIdx(null)}
                    className="p-1.5 text-slate-300 hover:text-white rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Story Content */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {currentViewedStory.type === 'image' && currentViewedStory.mediaUrl ? (
                <img
                  src={currentViewedStory.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-contain"
                />
              ) : currentViewedStory.type === 'video' && currentViewedStory.mediaUrl ? (
                <video
                  ref={videoPlayerRef}
                  src={currentViewedStory.mediaUrl}
                  autoPlay
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${
                    currentViewedStory.bgGradient || 'from-emerald-700 via-teal-800 to-slate-900'
                  } p-8 flex items-center justify-center text-center text-white`}
                >
                  <p className="text-base sm:text-lg font-extrabold leading-relaxed whitespace-pre-wrap">
                    {currentViewedStory.content}
                  </p>
                </div>
              )}

              {/* Prev / Next Click Handlers */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeStoryIdx !== null && activeStoryIdx > 0) {
                    setActiveStoryIdx(activeStoryIdx - 1);
                  }
                }}
                disabled={activeStoryIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full disabled:opacity-0 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeStoryIdx !== null && activeStoryIdx < stories.length - 1) {
                    setActiveStoryIdx(activeStoryIdx + 1);
                  } else {
                    setActiveStoryIdx(null);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Caption & Like Bar */}
            <div className="p-4 z-20 bg-gradient-to-t from-black/90 to-transparent space-y-2">
              {currentViewedStory.content && currentViewedStory.type !== 'text' && (
                <p className="text-xs text-white bg-black/40 p-2.5 rounded-xl border border-white/10">
                  {currentViewedStory.content}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => likeStory(currentViewedStory.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-bounce" />
                  <span className="font-mono tabular-nums">{currentViewedStory.likes} Suka</span>
                </button>

                <span className="text-[10px] text-slate-400">
                  RT.01 RW.02 Babakan Pandan
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
