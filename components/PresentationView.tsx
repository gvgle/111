
import React, { useState, useEffect } from 'react';
import { Slide, Presentation } from '../types';
import { ChevronLeft, ChevronRight, Maximize, X, Download, Play, Edit3, Image as ImageIcon } from 'lucide-react';

interface PresentationViewProps {
  presentation: Presentation;
  onClose: () => void;
  onRefreshImage: (slideId: string) => void;
}

const PresentationView: React.FC<PresentationViewProps> = ({ presentation, onClose, onRefreshImage }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const currentSlide = presentation.slides[currentSlideIndex];

  const nextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex]);

  const renderSlideContent = (slide: Slide) => {
    switch (slide.layout) {
      case 'split':
        return (
          <div className="flex h-full gap-8">
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-4xl font-bold mb-8 serif-font text-stone-800">{slide.title}</h2>
              <ul className="space-y-4">
                {slide.content.map((item, idx) => (
                  <li key={idx} className="flex items-start text-xl text-stone-600 leading-relaxed">
                    <span className="text-red-800 mr-3 mt-1.5 h-2 w-2 rounded-full bg-red-800 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl relative group bg-stone-100 flex items-center justify-center">
              {slide.imageUrl ? (
                <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-stone-400">
                   <ImageIcon size={48} className="mb-2 opacity-50" />
                   <p className="text-sm">Generating Visual Heritage...</p>
                </div>
              )}
              <button 
                onClick={() => onRefreshImage(slide.id)}
                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                title="Regenerate Image"
              >
                <ImageIcon size={18} />
              </button>
            </div>
          </div>
        );
      case 'full-image':
        return (
          <div className="relative h-full rounded-xl overflow-hidden shadow-2xl bg-stone-900">
            {slide.imageUrl && (
              <img src={slide.imageUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 z-10">
              <h2 className="text-6xl font-bold mb-8 serif-font text-white drop-shadow-lg">{slide.title}</h2>
              <div className="max-w-2xl bg-black/40 backdrop-blur-sm p-6 rounded-lg">
                <ul className="space-y-4">
                  {slide.content.map((item, idx) => (
                    <li key={idx} className="text-xl text-white/90 font-light">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      case 'centered':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-12 serif-font text-red-900">{slide.title}</h2>
            <div className="space-y-6">
               {slide.content.map((item, idx) => (
                 <p key={idx} className="text-2xl text-stone-700 leading-relaxed italic">"{item}"</p>
               ))}
            </div>
            <div className="mt-12 w-24 h-1 bg-red-800/30" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900 z-50 flex flex-col">
      {/* Header Controls */}
      <div className="h-16 flex items-center justify-between px-6 bg-stone-800 text-white/80 border-b border-stone-700">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="h-6 w-px bg-stone-700 mx-2" />
          <h1 className="font-semibold text-white truncate max-w-xs">{presentation.topic}</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm font-mono opacity-60">
            {currentSlideIndex + 1} / {presentation.slides.length}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleFullscreen} className="p-2 hover:bg-stone-700 rounded-lg transition-colors">
              <Maximize size={20} />
            </button>
            <button className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-900/20">
              <Download size={18} />
              <span>导出 PPT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Container */}
      <div className="flex-1 overflow-hidden p-8 flex items-center justify-center bg-stone-100">
        <div className="w-full max-w-7xl slide-aspect bg-white shadow-2xl rounded-2xl overflow-hidden p-12 transition-all duration-500 ease-in-out">
          {renderSlideContent(currentSlide)}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="h-20 flex items-center justify-center gap-4 bg-stone-800 border-t border-stone-700">
        <button 
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          className="p-3 bg-stone-700 hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-full text-white transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        
        <div className="flex gap-2 mx-8">
          {presentation.slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlideIndex ? 'w-8 bg-red-600' : 'w-2.5 bg-stone-600 hover:bg-stone-500'}`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          disabled={currentSlideIndex === presentation.slides.length - 1}
          className="p-3 bg-stone-700 hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-full text-white transition-colors"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
};

export default PresentationView;
