
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { enhanceNote } from './geminiService.ts';
import { Note, AppStats } from './types.ts';
import { dbService } from './dbService.ts';
import { NoteCard } from './components/NoteCard.tsx';
import { Toast, ToastType } from './components/Toast.tsx';

type Language = 'ar' | 'en';

const translations = {
  ar: {
    title: 'المدون السحابي الذكي',
    subtitle: 'مزامنة عالمية فورية عبر Firebase',
    placeholder: 'أضف فكرة جديدة للسحابة...',
    button: 'تخزين ذكي',
    search: 'بحث سحابي سريع...',
    stats: 'تحليلات البيانات',
    totalNotes: 'ملاحظاتك السحابية',
    activeDb: 'Firebase Firestore',
    saveSuccess: 'تمت المزامنة بنجاح',
    deleteInfo: 'تم حذف البيانات سحابياً',
    noResults: 'لا توجد ملاحظات سحابية',
    connectionError: 'خطأ في الاتصال بالسحابة - تحقق من الإعدادات',
    online: 'متصل بالسحابة',
    offline: 'جاري الاتصال...'
  },
  en: {
    title: 'Cloud Smart Notes',
    subtitle: 'Global Real-time Sync via Firebase',
    placeholder: 'Add a new idea to the cloud...',
    button: 'Cloud Save',
    search: 'Fast cloud search...',
    stats: 'Data Analytics',
    totalNotes: 'Cloud Notes',
    activeDb: 'Firebase Firestore',
    saveSuccess: 'Synced successfully',
    deleteInfo: 'Deleted from cloud',
    noResults: 'No cloud notes found',
    connectionError: 'Connection Error - Check Firebase Config',
    online: 'Cloud Connected',
    offline: 'Connecting...'
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('app_lang') as Language) || 'ar');
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    let unsubscribe: () => void;
    try {
      unsubscribe = dbService.subscribeToNotes((data) => {
        setNotes(data);
        setFetching(false);
        setIsOnline(true);
      });
    } catch (err) {
      console.error("Firebase Subscription Error:", err);
      setToast({ message: t.connectionError, type: 'error' });
      setFetching(false);
      setIsOnline(false);
    }
    return () => unsubscribe && unsubscribe();
  }, [t.connectionError]);

  const stats = useMemo((): AppStats => {
    const cats: { [key: string]: number } = {};
    notes.forEach(n => {
      cats[n.ai_category] = (cats[n.ai_category] || 0) + 1;
    });
    return { total: notes.length, categories: cats };
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.ai_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tempId = crypto.randomUUID();
    
    const newNote: Note = {
      id: tempId,
      content: input,
      ai_title: lang === 'ar' ? 'تحليل ذكي...' : 'AI Analysis...',
      ai_category: lang === 'ar' ? 'جاري الرفع' : 'Uploading',
      created_at: new Date().toISOString()
    };

    setInput('');

    try {
      const aiData = await enhanceNote(input, lang);
      const finalNote = { ...newNote, ai_title: aiData.title, ai_category: aiData.category };
      await dbService.save(finalNote);
      setToast({ message: t.saveSuccess, type: 'success' });
    } catch (err) {
      await dbService.save(newNote);
      setToast({ message: 'Saved with local sync', type: 'info' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dbService.delete(id);
      setToast({ message: t.deleteInfo, type: 'info' });
    } catch (err) {
      setToast({ message: 'Error deleting', type: 'error' });
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-all duration-500 ${lang === 'ar' ? 'lang-ar' : 'lang-en'}`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <nav className="sticky top-0 z-40 glass border-b border-white/20 px-6 py-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 ${isOnline ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-400'}`}>
              <i className={`fas ${isOnline ? 'fa-cloud' : 'fa-cloud-slash'}`}></i>
            </div>
            <div>
              <h2 className="font-black text-slate-800 leading-none">{t.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  {isOnline ? t.online : t.offline}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-4 py-2 rounded-xl glass hover:bg-white text-xs font-black transition-all border-white/50 text-slate-600"
          >
            {lang === 'ar' ? 'ENGLISH' : 'العربية'}
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass p-6 rounded-[2rem] border-white/40 shadow-xl shadow-indigo-500/5">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <i className="fas fa-chart-line text-indigo-500"></i>
              {t.stats}
            </h3>
            <div className="space-y-4">
              <div className="bg-white/60 p-5 rounded-2xl border border-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">{t.totalNotes}</span>
                <span className="text-4xl font-black text-indigo-600">{stats.total}</span>
              </div>
              <div className="space-y-1">
                {Object.entries(stats.categories).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center p-3 px-4 rounded-xl hover:bg-white/80 transition-colors">
                    <span className="text-xs font-bold text-slate-600">{cat}</span>
                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-lg font-black">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-8">
          <section className="glass p-4 rounded-[3rem] shadow-2xl shadow-indigo-500/10 border-white/80">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="w-full h-40 p-8 rounded-[2.5rem] bg-white/50 border-none focus:ring-0 text-slate-800 text-xl resize-none placeholder:text-slate-300 font-medium"
              />
              <div className="flex justify-between items-center p-4">
                <div className="flex gap-2 text-slate-200 text-lg px-4">
                  <i className="fas fa-sparkles"></i>
                  <i className="fas fa-lock"></i>
                  <i className="fas fa-globe"></i>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !input.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-30"
                >
                  {isSubmitting ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-plus"></i>}
                  <span className="text-sm font-bold">{isSubmitting ? '...' : t.button}</span>
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-6">
            <div className="relative">
              <i className="fas fa-search absolute right-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full pl-6 pr-14 py-5 rounded-[2rem] bg-white/80 border-none shadow-sm focus:ring-4 focus:ring-indigo-50 text-slate-600 font-medium text-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {fetching ? (
                <div className="col-span-full py-20 text-center">
                  <i className="fas fa-spinner animate-spin text-4xl text-indigo-400"></i>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="col-span-full py-32 text-center glass rounded-[3rem] border-dashed border-2 border-slate-100">
                  <i className="fas fa-inbox text-slate-100 text-6xl mb-6"></i>
                  <p className="text-slate-400 font-black">{t.noResults}</p>
                </div>
              ) : (
                filteredNotes.map(note => (
                  <NoteCard key={note.id} note={note} onDelete={handleDelete} lang={lang} />
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
