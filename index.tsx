import { useState, useEffect, useRef, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Menu,
  X,
  Settings,
  Sparkles,
  Copy,
  Check,
  Plus,
  Clock,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type UILang = 'bn' | 'hi' | 'en'
type Category = 'song' | 'story' | 'poem' | 'rhyme' | 'drama' | 'speech'
type Tone =
  | 'rabindra'
  | 'nazrul'
  | 'romantic'
  | 'modern'
  | 'patriotic'
  | 'humor'
  | 'childish'
type Length = 'short' | 'medium' | 'long'
type OutputLang =
  | 'Bengali'
  | 'English'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Chinese'
  | 'Japanese'
  | 'Korean'
  | 'Portuguese'
  | 'Russian'
  | 'Arabic'
  | 'Italian'
  | 'Hindi'
  | 'Urdu'
  | 'Tamil'
  | 'Telugu'
  | 'Gujarati'
  | 'Marathi'
  | 'Kannada'
  | 'Malayalam'
  | 'Punjabi'
  | 'Dutch'
  | 'Turkish'
  | 'Polish'
  | 'Swedish'
  | 'Norwegian'
  | 'Danish'
  | 'Finnish'
  | 'Greek'
  | 'Vietnamese'
  | 'Thai'
  | 'Indonesian'
  | 'Malay'
  | 'Filipino'
interface HistoryItem {
  id: string
  timestamp: number
  category: Category
  tone: Tone
  length: Length
  outputLanguage: OutputLang
  prompt: string
  output: string
}

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  bn: {
    title: 'সাহিত্যের ভান্ডার',
    subtitle: 'AI-চালিত সৃজনশীল লেখার মঞ্চ',
    modelBadge: 'মডেল: Gemini  ·  সৃজনশীল লেখার AI',
    category: 'বিভাগ',
    tone: 'সুর / ধরন',
    length: 'দৈর্ঘ্য',
    outputLang: 'আউটপুট ভাষা',
    promptLabel: 'আপনার ধারণা',
    promptPlaceholder: 'আপনার ধারণা বা বিষয় এখানে লিখুন...',
    generate: 'তৈরি করুন',
    generating: 'তৈরি হচ্ছে...',
    historyTitle: 'ইতিহাস',
    settings: 'সেটিংস',
    websiteLang: 'ওয়েবসাইটের ভাষা',
    newCreation: 'নতুন সৃষ্টি',
    welcome: 'সৃজনশীল লেখার জগতে স্বাগতম',
    welcomeSub:
      'আপনার ধারণা লিখুন, AI আপনার জন্য সুন্দর সাহিত্য তৈরি করবে',
    outputPlaceholder: 'আপনার সৃষ্টি এখানে প্রদর্শিত হবে...',
    copy: 'কপি',
    copied: 'কপি হয়েছে!',
    noHistory: 'এখনো কোনো ইতিহাস নেই',
    error: 'ত্রুটি হয়েছে। আবার চেষ্টা করুন।',
    save: 'সংরক্ষণ করুন',
    close: 'বন্ধ',
    categories: {
      song: 'গান',
      story: 'গল্প',
      poem: 'কবিতা',
      rhyme: 'ছড়া',
      drama: 'নাটক',
      speech: 'মঞ্চ বক্তৃতা',
    },
    tones: {
      rabindra: 'রবীন্দ্র শৈলী',
      nazrul: 'নজরুল শৈলী',
      romantic: 'রোমান্টিক',
      modern: 'আধুনিক',
      patriotic: 'দেশপ্রেমিক',
      humor: 'হাস্যরস',
      childish: 'শিশুসুলভ',
    },
    lengths: { short: 'সংক্ষিপ্ত', medium: 'মধ্যম', long: 'দীর্ঘ' },
    uiLangs: { bn: 'বাংলা', hi: 'হিন্দি', en: 'ইংরেজি' },
  },
  hi: {
    title: 'साहित्य का भंडार',
    subtitle: 'AI-संचालित रचनात्मक लेखन मंच',
    modelBadge: 'मॉडल: Gemini  ·  रचनात्मक लेखन AI',
    category: 'श्रेणी',
    tone: 'शैली / स्वर',
    length: 'लंबाई',
    outputLang: 'आउटपुट भाषा',
    promptLabel: 'आपका विचार',
    promptPlaceholder: 'अपना विचार या विषय यहाँ लिखें...',
    generate: 'उत्पन्न करें',
    generating: 'उत्पन्न हो रहा है...',
    historyTitle: 'इतिहास',
    settings: 'सेटिंग्स',
    websiteLang: 'वेबसाइट भाषा',
    newCreation: 'नई रचना',
    welcome: 'रचनात्मक लेखन की दुनिया में आपका स्वागत है',
    welcomeSub: 'अपना विचार दें, AI आपके लिए सुंदर साहित्य बनाएगा',
    outputPlaceholder: 'आपकी रचना यहाँ दिखाई देगी...',
    copy: 'कॉपी',
    copied: 'कॉपी हो गया!',
    noHistory: 'अभी तक कोई इतिहास नहीं',
    error: 'त्रुटि हुई। पुनः प्रयास करें।',
    save: 'सहेजें',
    close: 'बंद',
    categories: {
      song: 'गीत',
      story: 'कहानी',
      poem: 'कविता',
      rhyme: 'तुकबंदी',
      drama: 'नाटक',
      speech: 'मंच भाषण',
    },
    tones: {
      rabindra: 'रवींद्र शैली',
      nazrul: 'नजरुल शैली',
      romantic: 'रोमांटिक',
      modern: 'आधुनिक',
      patriotic: 'देशभक्ति',
      humor: 'हास्य',
      childish: 'बाल शैली',
    },
    lengths: { short: 'संक्षिप्त', medium: 'मध्यम', long: 'लंबा' },
    uiLangs: { bn: 'बंगाली', hi: 'हिंदी', en: 'अंग्रेज़ी' },
  },
  en: {
    title: 'Sahityer Bhaandar',
    subtitle: 'AI-Powered Creative Writing Platform',
    modelBadge: 'Model: Gemini  ·  Creative Writing AI',
    category: 'Category',
    tone: 'Tone / Style',
    length: 'Length',
    outputLang: 'Output Language',
    promptLabel: 'Your Idea',
    promptPlaceholder: 'Enter your idea or topic here...',
    generate: 'Generate',
    generating: 'Generating...',
    historyTitle: 'History',
    settings: 'Settings',
    websiteLang: 'Website Language',
    newCreation: 'New Creation',
    welcome: 'Welcome to Creative Writing',
    welcomeSub: 'Share your idea and AI will craft beautiful literature for you',
    outputPlaceholder: 'Your creation will appear here...',
    copy: 'Copy',
    copied: 'Copied!',
    noHistory: 'No history yet',
    error: 'An error occurred. Please try again.',
    save: 'Save',
    close: 'Close',
    categories: {
      song: 'Song',
      story: 'Story',
      poem: 'Poem',
      rhyme: 'Rhyme',
      drama: 'Drama',
      speech: 'Stage Speech',
    },
    tones: {
      rabindra: 'Rabindra Style',
      nazrul: 'Nazrul Style',
      romantic: 'Romantic',
      modern: 'Modern',
      patriotic: 'Patriotic',
      humor: 'Humor',
      childish: 'Childish',
    },
    lengths: { short: 'Short', medium: 'Medium', long: 'Long' },
    uiLangs: { bn: 'Bengali', hi: 'Hindi', en: 'English' },
  },
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────
const HISTORY_KEY = 'sahityer_bhaandar_history'
const UI_LANG_KEY = 'sahityer_bhaandar_ui_lang'

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 50)))
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function GoldSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full appearance-none bg-[#111] border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 cursor-pointer pr-8 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#111]">
            {o.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <svg
          className="w-4 h-4 text-[#D4AF37]/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-[#D4AF37]/70 uppercase tracking-wider mb-1">
      {children}
    </label>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
function SahityerBhaandar() {
  const [uiLang, setUiLang] = useState<UILang>('bn')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [category, setCategory] = useState<Category>('poem')
  const [tone, setTone] = useState<Tone>('rabindra')
  const [length, setLength] = useState<Length>('medium')
  const [outputLanguage, setOutputLanguage] = useState<OutputLang>('Bengali')
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const tx = translations[uiLang]

  // Load persisted data on mount
  useEffect(() => {
    setHistory(loadHistory())
    const saved = localStorage.getItem(UI_LANG_KEY) as UILang | null
    if (saved && ['bn', 'hi', 'en'].includes(saved)) setUiLang(saved)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return
    setIsLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category, tone, length, outputLanguage }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).message || 'Request failed')
      }

      const data = await res.json()
      const text: string = (data as any).text ?? ''
      setOutput(text)

      // Save to history
      const item: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        category,
        tone,
        length,
        outputLanguage,
        prompt,
        output: text,
      }
      const updated = [item, ...history]
      setHistory(updated)
      saveHistory(updated)

      // Scroll output into view
      setTimeout(
        () => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100,
      )
    } catch (e: any) {
      setError(tx.error)
    } finally {
      setIsLoading(false)
    }
  }, [prompt, category, tone, length, outputLanguage, isLoading, history, tx.error])

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleHistoryClick = (item: HistoryItem) => {
    setCategory(item.category)
    setTone(item.tone)
    setLength(item.length)
    setOutputLanguage(item.outputLanguage)
    setPrompt(item.prompt)
    setOutput(item.output)
    setSidebarOpen(false)
  }

  const handleNewCreation = () => {
    setPrompt('')
    setOutput('')
    setError('')
    setSidebarOpen(false)
  }

  const handleUiLangChange = (lang: UILang) => {
    setUiLang(lang)
    localStorage.setItem(UI_LANG_KEY, lang)
  }

  const categoryOptions = (
    Object.keys(tx.categories) as Category[]
  ).map((k) => ({ value: k, label: tx.categories[k] }))

  const toneOptions = (Object.keys(tx.tones) as Tone[]).map((k) => ({
    value: k,
    label: tx.tones[k],
  }))

  const lengthOptions = (Object.keys(tx.lengths) as Length[]).map((k) => ({
    value: k,
    label: tx.lengths[k],
  }))

  const outputLangOptions: { value: OutputLang; label: string }[] = [
  { value: 'Bengali', label: 'বাংলা (Bengali)' },

  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Español (Spanish)' },
  { value: 'French', label: 'Français (French)' },
  { value: 'German', label: 'Deutsch (German)' },
  { value: 'Chinese', label: '中文 (Chinese)' },
  { value: 'Japanese', label: '日本語 (Japanese)' },
  { value: 'Korean', label: '한국어 (Korean)' },
  { value: 'Portuguese', label: 'Português (Portuguese)' },
  { value: 'Russian', label: 'Русский (Russian)' },
  { value: 'Arabic', label: 'العربية (Arabic)' },
  { value: 'Italian', label: 'Italiano (Italian)' },

  { value: 'Hindi', label: 'हिंदी (Hindi)' },
  { value: 'Urdu', label: 'اردو (Urdu)' },
  { value: 'Tamil', label: 'தமிழ் (Tamil)' },
  { value: 'Telugu', label: 'తెలుగు (Telugu)' },
  { value: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { value: 'Marathi', label: 'मराठी (Marathi)' },
  { value: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'Malayalam', label: 'മലയാളം (Malayalam)' },
  { value: 'Punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },

  { value: 'Dutch', label: 'Nederlands (Dutch)' },
  { value: 'Turkish', label: 'Türkçe (Turkish)' },
  { value: 'Polish', label: 'Polski (Polish)' },
  { value: 'Swedish', label: 'Svenska (Swedish)' },
  { value: 'Norwegian', label: 'Norsk (Norwegian)' },
  { value: 'Danish', label: 'Dansk (Danish)' },
  { value: 'Finnish', label: 'Suomi (Finnish)' },
  { value: 'Greek', label: 'Ελληνικά (Greek)' },

  { value: 'Vietnamese', label: 'Tiếng Việt (Vietnamese)' },
  { value: 'Thai', label: 'ไทย (Thai)' },
  { value: 'Indonesian', label: 'Bahasa Indonesia (Indonesian)' },
  { value: 'Malay', label: 'Bahasa Melayu (Malay)' },
  { value: 'Filipino', label: 'Filipino' },
]

  return (
    <div className="sahitya-root flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* ── Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#0e0e0e] border-r border-[#D4AF37]/20 z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#D4AF37]/20">
          <span className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest">
            {tx.historyTitle}
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Creation Button */}
        <div className="px-3 py-3 border-b border-[#D4AF37]/10">
          <button
            onClick={handleNewCreation}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] text-sm hover:bg-[#D4AF37]/10 transition-all duration-200 font-medium"
          >
            <Plus className="w-4 h-4" />
            {tx.newCreation}
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-[#D4AF37]/30 px-4 text-center">
              <Clock className="w-8 h-8" />
              <span className="text-xs">{tx.noHistory}</span>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="w-full text-left px-4 py-3 hover:bg-[#D4AF37]/5 border-b border-[#D4AF37]/5 transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#D4AF37]/80 text-xs font-semibold uppercase tracking-wide">
                    {translations.en.categories[item.category]}
                  </span>
                  <span className="text-[#D4AF37]/30 text-xs">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2 group-hover:text-gray-300 transition-colors">
                  {item.prompt}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Bar ── */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#D4AF37]/20 bg-[#0a0a0a] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-[#D4AF37]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-2 text-[#D4AF37]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all hidden lg:flex"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#D4AF37] leading-tight">
                {tx.title}
              </h1>
              <p className="text-[10px] text-[#D4AF37]/50 uppercase tracking-widest hidden sm:block">
                {tx.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-[#D4AF37]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all"
            aria-label={tx.settings}
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* ── Model Badge ── */}
        <div className="flex justify-center py-2 bg-[#0a0a0a] border-b border-[#D4AF37]/10 flex-shrink-0">
          <div className="flex items-center gap-2 px-4 py-1 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/5">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[11px] text-[#D4AF37]/80 font-medium tracking-wide">
              {tx.modelBadge}
            </span>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {/* Welcome (shown only when no output) */}
            {!output && !isLoading && (
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">
                  {tx.welcome}
                </h2>
                <p className="text-gray-500 text-sm">{tx.welcomeSub}</p>
              </div>
            )}

            {/* ── Controls Grid ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <Label>{tx.category}</Label>
                <GoldSelect
                  value={category}
                  onChange={setCategory}
                  options={categoryOptions}
                />
              </div>
              <div>
                <Label>{tx.tone}</Label>
                <GoldSelect
                  value={tone}
                  onChange={setTone}
                  options={toneOptions}
                />
              </div>
              <div>
                <Label>{tx.length}</Label>
                <GoldSelect
                  value={length}
                  onChange={setLength}
                  options={lengthOptions}
                />
              </div>
              <div>
                <Label>{tx.outputLang}</Label>
                <GoldSelect
                  value={outputLanguage}
                  onChange={setOutputLanguage}
                  options={outputLangOptions}
                />
              </div>
            </div>

            {/* ── Prompt Input ── */}
            <div>
              <Label>{tx.promptLabel}</Label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={tx.promptPlaceholder}
                rows={3}
                disabled={isLoading}
                className="w-full bg-[#111] border border-[#D4AF37]/30 text-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 placeholder-gray-600 transition-colors disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate()
                }}
              />
            </div>

            {/* ── Generate Button ── */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isLoading
                  ? 'transparent'
                  : 'linear-gradient(135deg, #D4AF37 0%, #F5D060 50%, #D4AF37 100%)',
                color: isLoading ? '#D4AF37' : '#0a0a0a',
                border: isLoading ? '1px solid #D4AF37' : 'none',
                boxShadow: isLoading ? 'none' : '0 0 20px rgba(212,175,55,0.3)',
              }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  {tx.generating}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {tx.generate}
                </>
              )}
            </button>

            {/* ── Error ── */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* ── Output ── */}
            {(output || isLoading) && (
              <div ref={outputRef}>
                <div className="flex items-center justify-between mb-2">
                  <Label>
                    {tx.categories[category]} · {tx.tones[tone]}
                  </Label>
                  {output && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors px-2 py-1 rounded-md hover:bg-[#D4AF37]/10"
                    >
                      {copied ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied ? tx.copied : tx.copy}
                    </button>
                  )}
                </div>
                <div
                  className="w-full min-h-32 bg-[#111] border border-[#D4AF37]/20 rounded-xl px-5 py-4 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-serif"
                  style={{ fontFamily: "'Georgia', 'Noto Serif Bengali', serif" }}
                >
                  {isLoading && !output ? (
                    <div className="flex items-center gap-2 text-[#D4AF37]/50">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      <span className="text-xs">{tx.generating}</span>
                    </div>
                  ) : (
                    output || (
                      <span className="text-gray-600">{tx.outputPlaceholder}</span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Bottom spacer */}
            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* ── Settings Modal ── */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#D4AF37]/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#D4AF37] font-bold text-lg">{tx.settings}</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <Label>{tx.websiteLang}</Label>
              <div className="flex gap-2 mt-1">
                {(['bn', 'hi', 'en'] as UILang[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleUiLangChange(lang)}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all duration-200"
                    style={
                      uiLang === lang
                        ? {
                            background:
                              'linear-gradient(135deg, #D4AF37, #F5D060)',
                            color: '#0a0a0a',
                            border: '1px solid #D4AF37',
                          }
                        : {
                            background: 'transparent',
                            color: '#D4AF37',
                            border: '1px solid rgba(212,175,55,0.3)',
                          }
                    }
                  >
                    {tx.uiLangs[lang]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              className="mt-6 w-full py-2 rounded-lg text-sm font-medium text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors"
            >
              {tx.close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: SahityerBhaandar,
})
