
import React, { useState, useCallback } from 'react';
import { AppStatus, Presentation } from './types';
import { generatePresentationContent, generateSlideImage } from './services/geminiService';
import PresentationView from './components/PresentationView';
import { Search, Sparkles, Loader2, BookOpen, Globe, Palette } from 'lucide-react';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setStatus(AppStatus.GENERATING);
    setError(null);

    try {
      const result = await generatePresentationContent(topic);
      setPresentation(result);
      setStatus(AppStatus.PRESENTING);
      
      // Gradually generate images for each slide in background
      result.slides.forEach(async (slide) => {
        const imageUrl = await generateSlideImage(slide.title, topic);
        if (imageUrl) {
          setPresentation(prev => {
            if (!prev) return null;
            return {
              ...prev,
              slides: prev.slides.map(s => s.id === slide.id ? { ...s, imageUrl } : s)
            };
          });
        }
      });

    } catch (err) {
      console.error(err);
      setError('Failed to generate presentation. Please try again later.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleRefreshImage = useCallback(async (slideId: string) => {
    if (!presentation) return;
    const slide = presentation.slides.find(s => s.id === slideId);
    if (!slide) return;

    const imageUrl = await generateSlideImage(slide.title, presentation.topic);
    if (imageUrl) {
      setPresentation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          slides: prev.slides.map(s => s.id === slideId ? { ...s, imageUrl } : s)
        };
      });
    }
  }, [presentation]);

  const reset = () => {
    setPresentation(null);
    setStatus(AppStatus.IDLE);
    setTopic('');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="h-16 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center text-white font-bold">H</div>
          <span className="text-xl font-bold tracking-tight serif-font text-stone-800">HeritageFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <a href="#" className="hover:text-red-800 transition-colors">浏览</a>
          <a href="#" className="hover:text-red-800 transition-colors">保护计划</a>
          <a href="#" className="hover:text-red-800 transition-colors">关于</a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-6xl mx-auto w-full">
        {status === AppStatus.IDLE || status === AppStatus.GENERATING || status === AppStatus.ERROR ? (
          <div className="w-full max-w-2xl text-center space-y-12 py-12">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black text-stone-900 leading-tight serif-font">
                数字化传承，<br />
                <span className="text-red-800">让非遗</span> 触手可及
              </h1>
              <p className="text-xl text-stone-500 max-w-lg mx-auto leading-relaxed">
                利用 AI 快速生成关于“非物质文化遗产”的精美演示文稿，探索、分享与致敬人类文化瑰宝。
              </p>
            </div>

            <form onSubmit={handleGenerate} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl border border-stone-100">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <Search className="text-stone-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="输入非遗项目，如：昆曲、剪纸、中医针灸..."
                    className="w-full py-4 text-lg bg-transparent border-none focus:outline-none text-stone-800"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={status === AppStatus.GENERATING}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={status === AppStatus.GENERATING || !topic.trim()}
                  className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg"
                >
                  {status === AppStatus.GENERATING ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>正在构建内容...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="text-amber-400 group-hover:scale-125 transition-transform" />
                      <span>一键生成演示</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="p-4 bg-red-50 text-red-800 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              <div className="p-6 bg-white rounded-2xl border border-stone-100 text-left space-y-3 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <h3 className="font-bold text-stone-800">详尽历史挖掘</h3>
                <p className="text-sm text-stone-500 leading-relaxed">自动索引全球非遗数据库，梳理清晰的时代脉络与演变过程。</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-stone-100 text-left space-y-3 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
                  <Palette size={20} />
                </div>
                <h3 className="font-bold text-stone-800">精美视觉设计</h3>
                <p className="text-sm text-stone-500 leading-relaxed">融合中国传统色彩美学，每一页幻灯片都是艺术品的呈现。</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-stone-100 text-left space-y-3 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 bg-green-50 text-green-700 rounded-lg flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <h3 className="font-bold text-stone-800">保护现状概览</h3>
                <p className="text-sm text-stone-500 leading-relaxed">提供最新的保护措施与传承现状分析，激发更多公众关注。</p>
              </div>
            </div>
          </div>
        ) : null}

        {status === AppStatus.PRESENTING && presentation && (
          <PresentationView 
            presentation={presentation} 
            onClose={reset}
            onRefreshImage={handleRefreshImage}
          />
        )}
      </main>

      <footer className="py-12 px-6 border-t border-stone-200 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="font-bold serif-font text-stone-800">HeritageFlow</h4>
            <p className="text-sm text-stone-500 mt-2">© 2024 非物质文化遗产数字化平台. All rights reserved.</p>
          </div>
          <div className="flex gap-12 text-sm text-stone-400 uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-red-800 transition-colors">Twitter</a>
            <a href="#" className="hover:text-red-800 transition-colors">GitHub</a>
            <a href="#" className="hover:text-red-800 transition-colors">Dribbble</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
