/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { ChatMessage } from '../types/index.ts';
import { VoiceRecorder } from '../utils/audio.ts';
import {
  Send,
  Mic,
  Image as ImageIcon,
  Video,
  CheckCheck,
  Shield,
  Volume2,
  Play,
  Pause,
  X,
  AlertCircle,
  Phone,
  Radio,
  FileVideo,
} from 'lucide-react';

export const SiskamlingChat: React.FC = () => {
  const { user, state, sendChatMessage, setTyping } = useApp();

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [selectedVideo, setSelectedVideo] = useState<string | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceRecorder] = useState(() => new VoiceRecorder());
  const [activePlayingAudioId, setActivePlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const messages = state?.chatMessages || [];
  const typingUsers = state?.typingUsers || [];
  const otherTypingUsers = typingUsers.filter((u) => u.name !== user.name);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTypingUsers]);

  // Handle typing debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  // Media (Image or Video) Selection
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isVideo) {
          setSelectedVideo(reader.result as string);
          setSelectedImage(undefined);
        } else {
          setSelectedImage(reader.result as string);
          setSelectedVideo(undefined);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Voice Note Recording
  const handleStartRecording = async () => {
    setRecordSeconds(0);
    const started = await voiceRecorder.start((sec) => {
      setRecordSeconds(sec);
    });
    if (started) {
      setIsRecording(true);
    } else {
      alert('Tidak dapat mengakses mikrofon perangkat.');
    }
  };

  // Stop & Send Voice Note
  const handleStopAndSendVoice = async () => {
    setIsRecording(false);
    const audioData = await voiceRecorder.stop();
    if (audioData) {
      await sendChatMessage(
        undefined,
        undefined,
        undefined,
        audioData.audioUrl,
        audioData.duration,
        false
      );
    }
  };

  // Cancel Voice Note
  const handleCancelVoice = () => {
    voiceRecorder.cancel();
    setIsRecording(false);
    setRecordSeconds(0);
  };

  // Send Message (Text, Image, Video)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage && !selectedVideo) return;

    const textToSend = inputText.trim();
    const imageToSend = selectedImage;
    const videoToSend = selectedVideo;

    setInputText('');
    setSelectedImage(undefined);
    setSelectedVideo(undefined);
    setTyping(false);

    await sendChatMessage(
      textToSend || undefined,
      imageToSend,
      videoToSend,
      undefined,
      undefined,
      false
    );
  };

  // Quick message template click
  const handleSendQuick = async (text: string) => {
    await sendChatMessage(text, undefined, undefined, undefined, undefined, false);
  };

  // Play audio voice note
  const handleTogglePlayAudio = (id: string, audioUrl: string) => {
    if (activePlayingAudioId === id) {
      audioElementRef.current?.pause();
      setActivePlayingAudioId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setActivePlayingAudioId(null);
      audio.play();
      setActivePlayingAudioId(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px] max-h-[85vh]">
      {/* WhatsApp Styled Top Header */}
      <div className="bg-emerald-900 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-950 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/assets/aistudio/IMG-20261107-WA0006_2005fda4.jpg"
              alt="Logo Siskamling"
              className="w-10 h-10 rounded-full border border-amber-400 bg-white object-contain p-0.5"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-sm sm:text-base leading-tight">
                Grup Ronda & Warga RT.01 RW.02
              </h2>
            </div>
            <p className="text-[11px] text-emerald-200 flex items-center gap-1">
              {otherTypingUsers.length > 0 ? (
                <span className="text-amber-300 font-semibold flex items-center gap-1 animate-pulse">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                  {otherTypingUsers.map((u) => u.name).join(', ')} sedang mengetik...
                </span>
              ) : (
                <span>30 Petugas Aktif · Babakan Pandan</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick info right */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[11px] bg-emerald-800/80 border border-emerald-700 px-2.5 py-1 rounded-full text-emerald-100">
            Kanal Komunikasi Cepat 24 Jam
          </span>
        </div>
      </div>

      {/* Pinned Broadcast Banner */}
      <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-900 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-bold text-[10px] uppercase tracking-wider bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded shrink-0">
            Info Penting
          </span>
          <span className="truncate">
            Portal gang dikunci jam 23:00 WIB. Hubungi pos ronda jika ada tamu lewat.
          </span>
        </div>
        <span className="text-[10px] text-emerald-700 font-medium shrink-0 ml-2">
          Sauyunan Nyunda
        </span>
      </div>

      {/* Message Stream */}
      <div
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#e5ddd5]/30 relative"
        style={{
          backgroundImage:
            'radial-gradient(#064e3b12 1px, transparent 1px), radial-gradient(#064e3b08 1px, #f8fafc 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.senderName === user.name;
          const isSystem = msg.isUrgent || msg.senderName.includes('DARURAT');

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md max-w-lg text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 font-bold">
                    <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>{msg.senderName}</span>
                  </div>
                  <p className="text-white/95 leading-relaxed">{msg.text}</p>
                  <div className="text-[10px] text-red-200">{msg.timestamp}</div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-2xs relative space-y-2 ${
                  isOwn
                    ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none border border-emerald-200/50'
                    : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/80'
                }`}
              >
                {/* Sender Header */}
                {!isOwn && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-extrabold text-emerald-800">
                      {msg.senderName}
                    </span>
                    {msg.senderRole === 'rt_rw' && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1 rounded">
                        Pengurus RT
                      </span>
                    )}
                    <span className="text-slate-400 text-[10px]">· {msg.senderAddress}</span>
                  </div>
                )}

                {/* Attached Image */}
                {msg.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200/60 max-w-xs">
                    <img
                      src={msg.imageUrl}
                      alt="Lampiran Foto"
                      className="w-full max-h-60 object-cover"
                    />
                  </div>
                )}

                {/* Attached Video */}
                {msg.videoUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200/60 max-w-sm bg-black">
                    <video
                      src={msg.videoUrl}
                      controls
                      playsInline
                      className="w-full max-h-64 object-contain"
                    />
                  </div>
                )}

                {/* Voice Note Audio Player */}
                {msg.audioUrl && (
                  <div className="flex items-center gap-2.5 p-2 bg-emerald-100/60 rounded-xl min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => handleTogglePlayAudio(msg.id, msg.audioUrl!)}
                      className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 hover:bg-emerald-800 transition-colors shadow-xs"
                    >
                      {activePlayingAudioId === msg.id ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-0.5 h-4">
                        {[40, 70, 90, 50, 80, 100, 60, 45, 90, 75, 40, 65, 85, 50].map(
                          (h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full ${
                                activePlayingAudioId === msg.id
                                  ? 'bg-emerald-700 animate-pulse'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ height: `${h}%` }}
                            />
                          )
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-emerald-900 font-mono">
                        <span>Pesan Suara</span>
                        <span>0:{msg.audioDuration ? String(msg.audioDuration).padStart(2, '0') : '05'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Message */}
                {msg.text && (
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}

                {/* Footer Timestamp & Status */}
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-0.5">
                  <span className="font-mono">{msg.timestamp}</span>
                  {isOwn && (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live typing indicator bubble */}
        {otherTypingUsers.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200 w-fit animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce delay-200" />
            <span className="text-[11px] text-slate-600 font-medium">
              {otherTypingUsers[0].name} sedang mengetik...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Security Phrase Templates */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        <span className="text-slate-400 font-bold uppercase text-[9px] shrink-0">Cepat:</span>
        {[
          'Situasi Pos Ronda Aman!',
          'Portal Timur Sudah Digembok',
          'Putaran Patroli Blok B Berangkat',
          'Ada Motor Lewat Tanpa Helm',
          'Kopi di Pos Masih Hangat!',
        ].map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => handleSendQuick(phrase)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-lg border border-slate-200 hover:border-emerald-300 font-medium whitespace-nowrap shrink-0 transition-colors"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Media (Image or Video) Preview before sending */}
      {(selectedImage || selectedVideo) && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-md border border-slate-300"
              />
            )}
            {selectedVideo && (
              <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center text-white">
                <FileVideo className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <span className="font-semibold text-emerald-900">
              {selectedVideo ? 'Video siap dikirim' : 'Foto siap dikirim'}
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedImage(undefined);
              setSelectedVideo(undefined);
            }}
            className="text-slate-400 hover:text-red-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Controls Bar: Video, Image, Audio Voice Note, Text */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between bg-red-50 border border-red-300 px-3 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-red-700 font-bold">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span>Merekam Pesan Suara... 0:{String(recordSeconds).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelVoice}
                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleStopAndSendVoice}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs"
              >
                Kirim Audio
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Attachment Button for Image or Video */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Kirim Foto atau Video"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMediaSelect}
            />

            {/* Text Input */}
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Ketik informasi cepat siskamling..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />

              {inputText.trim() || selectedImage || selectedVideo ? (
                <button
                  type="submit"
                  className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
                  title="Kirim Pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="p-2.5 bg-slate-100 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors border border-slate-200 shrink-0"
                  title="Rekam Pesan Suara (Voice Note)"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};
