import { useState, FormEvent } from 'react';
import { Lock, ShieldAlert, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { loginAdmin } from '../utils/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToHome }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() && !password.trim()) {
      setError('Kullanıcı adı ve şifre alanları boş bırakılamaz!');
      return;
    }
    if (!username.trim()) {
      setError('Lütfen kullanıcı adınızı giriniz!');
      return;
    }
    if (!password.trim()) {
      setError('Lütfen şifrenizi giriniz!');
      return;
    }

    setLoading(true);

    try {
      await loginAdmin(username.trim(), password);
      onLoginSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-[#131317] rounded-3xl p-6 sm:p-10 border border-[#2d2d35] shadow-2xl text-white animate-fadeIn" id="admin-login-card">
      <div className="text-center space-y-3">
        <div className="h-14 w-14 bg-gradient-to-tr from-[#dfa069] to-[#cba358] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#dfa069]/10">
          <Lock className="h-6 w-6 text-gray-950 stroke-[2.2]" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-[#dfa069] font-black uppercase font-mono tracking-widest block">Yetkili Giriş Modülü</span>
          <h2 className="font-sans font-black text-2xl text-[#ebd6b8] tracking-tight">L'Étoile Yönetici Girişi</h2>
          <p className="text-[#8e8d97] text-xs max-w-xs mx-auto">
            Salon yönetimi, randevu onayları, mesaj ve web içerik yönetimi için lütfen kimliğinizi doğrulayın.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-xs" id="admin-login-form">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2.5 animate-shake" id="login-error-alert">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] text-[#63626c] font-black uppercase font-mono block">Kullanıcı Adı *</label>
          <input
            id="login-username"
            type="text"
            placeholder="Kullanıcı adınızı girin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="w-full bg-[#1e1e24] border border-[#2d2d35] rounded-xl px-4 py-3 text-white placeholder-gray-550 focus:border-[#dfa069]/50 focus:ring-1 focus:ring-[#dfa069]/50 transition-all outline-none font-sans font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-[#63626c] font-black uppercase font-mono block">Şifre *</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-[#1e1e24] border border-[#2d2d35] rounded-xl pl-4 pr-11 py-3 text-white placeholder-gray-550 focus:border-[#dfa069]/50 focus:ring-1 focus:ring-[#dfa069]/50 transition-all outline-none font-sans font-medium"
            />
            <button
              type="button"
              id="toggle-password-visibility"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          id="login-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#dfa069] to-[#cba358] text-[#0f0f11] font-black tracking-wider text-xs uppercase rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0f0f11]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Verify ediliyor...</span>
            </>
          ) : (
            <span>GİRİŞ YAP</span>
          )}
        </button>

        <button
          id="login-back-btn"
          type="button"
          onClick={onBackToHome}
          disabled={loading}
          className="w-full py-2.5 bg-transparent text-[#ebd6b8]/75 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Ana Sayfaya Geri Dön</span>
        </button>
      </form>
    </div>
  );
}
