import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react';
import { AuthUser } from '../types';
import { ADMIN_CREDENTIALS } from '../seedData';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { db, auth } from '../firebase';

interface LoginModalProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanFullName = fullName.trim();

    try {
      // 1. Check if Admin account (fixed, single account: meriem / wahiba1976)
      if (cleanUsername === ADMIN_CREDENTIALS.username.toLowerCase()) {
        if (cleanPassword === ADMIN_CREDENTIALS.password) {
          const authUser: AuthUser = {
            role: 'admin',
            username: ADMIN_CREDENTIALS.username,
            name: ADMIN_CREDENTIALS.name
          };
          sessionStorage.setItem('merya_user', JSON.stringify(authUser));
          onLoginSuccess(authUser);
          return;
        } else {
          setError('كلمة المرور غير صحيحة لحساب الإدارة');
          setLoading(false);
          return;
        }
      }

      // 2. Student input validation
      if (!cleanFullName) {
        setError('يرجى إدخال اسمك الكامل');
        setLoading(false);
        return;
      }

      if (cleanUsername.length < 3) {
        setError('اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل');
        setLoading(false);
        return;
      }

      if (cleanPassword.length < 6) {
        setError('كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل لحماية حسابك');
        setLoading(false);
        return;
      }

      // Generate a valid internal email for Firebase Auth based on the username
      const sanitizedUsername = cleanUsername.replace(/[^a-z0-9._-]/g, '');
      const authEmail = `${sanitizedUsername || 'student'}@meryaacademy.internal`;

      // Check if student profile document already exists in Firestore
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('username', '==', cleanUsername));
      const snap = await getDocs(q);

      const dateStr = new Date().toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (snap.empty) {
        // --- NEW STUDENT SIGN-UP FLOW ---
        // 1. Authenticate & create user securely using Firebase Authentication built-in password handler
        try {
          await createUserWithEmailAndPassword(auth, authEmail, cleanPassword);
        } catch (authErr: any) {
          if (authErr.code === 'auth/email-already-in-use') {
            await signInWithEmailAndPassword(auth, authEmail, cleanPassword);
          } else {
            throw authErr;
          }
        }

        // 2. Immediately write student record to Firestore WITHOUT the raw password!
        // Only: name, username, dateJoined, createdAt, progress, completedLessons
        const newDocRef = await addDoc(studentsRef, {
          name: cleanFullName,
          username: cleanUsername,
          dateJoined: dateStr,
          createdAt: Date.now(),
          progress: 0,
          completedLessons: []
        });

        const authUser: AuthUser = {
          role: 'student',
          username: cleanUsername,
          name: cleanFullName,
          id: newDocRef.id,
          progress: 0,
          completedLessons: []
        };
        sessionStorage.setItem('merya_user', JSON.stringify(authUser));
        onLoginSuccess(authUser);
        return;
      } else {
        // --- EXISTING STUDENT LOGIN FLOW ---
        // 1. Verify password securely against Firebase Authentication
        try {
          await signInWithEmailAndPassword(auth, authEmail, cleanPassword);
        } catch (authErr: any) {
          if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
            // Check if user account was created prior to Firebase Auth integration
            try {
              await createUserWithEmailAndPassword(auth, authEmail, cleanPassword);
            } catch {
              setError('كلمة المرور غير صحيحة لهذا الحساب');
              setLoading(false);
              return;
            }
          } else if (authErr.code === 'auth/wrong-password') {
            setError('كلمة المرور غير صحيحة لهذا الحساب');
            setLoading(false);
            return;
          } else {
            throw authErr;
          }
        }

        const studentDoc = snap.docs[0];
        const data = studentDoc.data();

        const authUser: AuthUser = {
          role: 'student',
          username: data.username,
          name: cleanFullName || data.name,
          id: studentDoc.id,
          progress: typeof data.progress === 'number' ? data.progress : 0,
          completedLessons: data.completedLessons || []
        };
        sessionStorage.setItem('merya_user', JSON.stringify(authUser));
        onLoginSuccess(authUser);
        return;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/weak-password') {
        setError('كلمة المرور يجب أن تحتوي على 6 خانات على الأقل');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('كلمة المرور غير صحيحة لهذا الحساب');
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول: ' + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] px-4 py-8 selection:bg-purple-100 selection:text-purple-800">
      <main className="w-full max-w-[480px] flex flex-col items-center">
        {/* Header Section matching reference image */}
        <header className="flex flex-col items-center text-center mb-6">
          {/* Graduation Cap Badge Icon */}
          <div className="w-[72px] h-[72px] bg-[#630ed4] rounded-full flex items-center justify-center shadow-lg shadow-purple-900/10 mb-5 ring-4 ring-purple-100 transition-transform hover:scale-105">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>

          {/* Main Title */}
          <h1 className="text-3xl font-extrabold text-[#121c28] tracking-tight mb-2">
            أكاديمية Merya
          </h1>

          {/* Subtitle */}
          <p className="text-[15px] font-medium text-[#6b7280]">
            سجّل الدخول باسم المستخدم وكلمة المرور الخاصة بك
          </p>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="w-full mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div className="leading-relaxed font-semibold">{error}</div>
          </div>
        )}

        {/* Form Container */}
        <div className="w-full bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_24px_rgba(99,14,212,0.06)] border border-[#e5eeff]">
          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            {/* Full Name Field: Empty by default so each student enters their own name */}
            <div className="space-y-2">
              <label className="block text-right text-[15px] font-bold text-[#121c28] pr-1">
                الاسم الكامل
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="w-full px-5 py-3.5 text-base text-[#121c28] bg-white rounded-full border-[1.5px] border-[#e2e8f0] shadow-sm focus:border-[#630ed4] focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-right text-[15px] font-bold text-[#121c28] pr-1">
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  dir="ltr"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-5 py-3.5 text-base text-[#121c28] bg-white rounded-full border-[1.5px] border-[#e2e8f0] shadow-sm focus:border-[#630ed4] focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-gray-400 text-left font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-right text-[15px] font-bold text-[#121c28] pr-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-12 pr-5 py-3.5 text-base text-[#121c28] bg-white rounded-full border-[1.5px] border-[#e2e8f0] shadow-sm focus:border-[#630ed4] focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-gray-400 text-left font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#630ed4] hover:bg-[#6e3aca] active:scale-[0.99] text-white text-lg font-bold shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <footer className="mt-8 text-center">
          <p className="text-[13.5px] font-medium text-gray-400">
            الحسابات محمية ومشفرة عبر Firebase Authentication
          </p>
        </footer>
      </main>
    </div>
  );
};
