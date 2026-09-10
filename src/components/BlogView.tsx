import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Clock, User, Tag, ArrowRight, X, Sparkles, BookOpen, Share2 } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogViewProps {
  posts: BlogPost[];
  onBookService?: (categoryOrTitle?: string) => void;
}

export default function BlogView({
  posts,
  onBookService
}: BlogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map((p) => p.category)));
    return ['all', ...cats];
  }, [posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchQuery = !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="space-y-10 pb-16" id="blog-page-container">
      
      {/* 1. Header Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-[#a06b3e] font-bold text-xs rounded-full border border-amber-200/60 font-mono uppercase tracking-widest">
          <BookOpen className="h-3.5 w-3.5 mr-1 text-[#dfa069]" />
          BK KUAFÖR & GÜZELLİK BLOGU
        </span>
        <h1 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl text-gray-950 tracking-tight">
          Saç Modası, Kérastase Ritüelleri & Bakım Sırları
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          En son balyaj trendleri, yapay zeka destekli saç analizi, solaryum rehberi, gelin saçı tüyoları ve uzman stilistlerimizin önerilerini inceleyin.
        </p>
      </div>

      {/* 2. Search and Category Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Categories */}
          <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-1">
            <div className="flex items-center gap-2 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0f0f11] text-[#ebd6b8] shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'Tüm Makaleler' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Blogda ara (Örn: Balyaj, Kérastase)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-150 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dfa069]/20 focus:border-[#dfa069] focus:bg-white"
            />
          </div>

        </div>
      </div>

      {/* 3. Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto" id="blog-posts-grid">
        <AnimatePresence>
          {filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100">
              <span className="text-4xl">📝</span>
              <h4 className="font-sans font-bold text-lg text-gray-900 mt-2">Aranan Kriterde Yazı Bulunamadı</h4>
              <p className="text-xs text-gray-400 mt-1">Farklı bir anahtar kelime veya kategori deneyebilirsiniz.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-150 shadow-sm hover:shadow-xl hover:border-[#dfa069]/40 transition-all flex flex-col group cursor-pointer"
                onClick={() => setActivePost(post)}
                id={`blog-card-${post.id}`}
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#0f0f11]/90 backdrop-blur-md rounded-full text-[10px] font-mono font-black text-[#dfa069] uppercase border border-[#dfa069]/20">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Meta info */}
                    <div className="flex items-center space-x-3 text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#dfa069]" />
                        {post.readTime} okuma
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-sans font-black text-lg text-gray-900 group-hover:text-[#a06b3e] transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Tags & Action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500 font-bold">
                      <User className="h-3 w-3 text-[#dfa069]" />
                      <span className="truncate max-w-32">{post.author.split('(')[0]}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-black text-[#a06b3e] group-hover:translate-x-1 transition-transform">
                      Devamını Oku <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 4. Full Post Reader Modal */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-200 my-8 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header Bar */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-amber-50 text-[#a06b3e] border border-amber-200 rounded-lg text-xs font-mono font-bold">
                    {activePost.category}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {activePost.readTime} okuma süresi
                  </span>
                </div>
                <button
                  onClick={() => setActivePost(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content Viewport */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                
                {/* Hero Image */}
                <div className="aspect-[16/8] rounded-2xl overflow-hidden shadow-inner bg-gray-100">
                  <img src={activePost.image} alt={activePost.title} className="w-full h-full object-cover" />
                </div>

                {/* Article Header */}
                <div className="space-y-3">
                  <h2 className="font-sans font-black text-2xl sm:text-3xl text-gray-950 leading-tight">
                    {activePost.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-gray-700">
                      <User className="h-3.5 w-3.5 text-[#dfa069]" />
                      {activePost.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {activePost.date}
                    </span>
                  </div>
                </div>

                {/* Article Body */}
                <div className="prose prose-sm max-w-none text-gray-700 space-y-4 text-xs sm:text-sm leading-relaxed border-t border-b border-gray-100 py-6">
                  {activePost.content.split('\n\n').map((para, pidx) => {
                    if (para.startsWith('# ')) {
                      return <h2 key={pidx} className="text-xl font-sans font-black text-gray-950 mt-4 mb-2">{para.replace('# ', '')}</h2>;
                    }
                    if (para.startsWith('### ')) {
                      return <h3 key={pidx} className="text-base font-sans font-bold text-gray-900 mt-4 mb-1">{para.replace('### ', '')}</h3>;
                    }
                    return <p key={pidx} className="text-gray-700">{para}</p>;
                  })}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <Tag className="h-3.5 w-3.5 text-gray-400 mr-1" />
                  {activePost.tags.map((t, tidx) => (
                    <span key={tidx} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Bottom Call to Action */}
                <div className="bg-gradient-to-r from-[#121216] to-[#1c1c22] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-sans font-black text-base text-[#ebd6b8]">Bu İşlem İçin Randevu Almak İster misiniz?</h4>
                    <p className="text-xs text-gray-400">Uzman stilistlerimizle görüşmek için anında rezervasyon oluşturun.</p>
                  </div>
                  {onBookService && (
                    <button
                      onClick={() => {
                        setActivePost(null);
                        onBookService(activePost.category);
                      }}
                      className="px-5 py-3 bg-gradient-to-r from-[#dfa069] to-[#cba358] text-gray-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 shrink-0 transition-all cursor-pointer shadow-lg"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Hemen Randevu Al</span>
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
