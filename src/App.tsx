import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { AuthUser, Student, Lesson } from './types';
import { LoginModal } from './components/LoginModal';
import { OverviewSection } from './components/OverviewSection';
import { StudentsListSection } from './components/StudentsListSection';
import { LessonsManagementSection } from './components/LessonsManagementSection';
import { StudentPortalSection } from './components/StudentPortalSection';
import { seedInitialDataIfNeeded } from './seedData';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('merya_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize seed data once
  useEffect(() => {
    seedInitialDataIfNeeded();
  }, []);

  // Real-time listener for students collection
  useEffect(() => {
    const studentsRef = collection(db, 'students');
    const unsubscribe = onSnapshot(
      studentsRef,
      (snapshot) => {
        const studentList: Student[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          studentList.push({
            id: doc.id,
            name: data.name || '',
            username: data.username || '',
            dateJoined: data.dateJoined || '',
            createdAt: data.createdAt || 0,
            progress: typeof data.progress === 'number' ? data.progress : 0,
            completedLessons: data.completedLessons || []
          });
        });
        // Sort by newest first
        studentList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setStudents(studentList);

        // Keep current student's completed lessons synchronized
        if (currentUser && currentUser.role === 'student' && currentUser.id) {
          const updatedSelf = studentList.find((s) => s.id === currentUser.id);
          if (updatedSelf) {
            setCurrentUser((prev) =>
              prev ? { ...prev, completedLessons: updatedSelf.completedLessons } : null
            );
          }
        }
      },
      (error) => {
        console.error('Firestore students listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.id]);

  // Real-time listener for lessons collection (LIVE SYNC)
  useEffect(() => {
    const lessonsRef = collection(db, 'lessons');
    const unsubscribe = onSnapshot(
      lessonsRef,
      (snapshot) => {
        const lessonList: Lesson[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          lessonList.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            videoUrl: data.videoUrl || '',
            resourceUrl: data.resourceUrl || '',
            order: Number(data.order) || 1,
            duration: data.duration || '30 دقيقة',
            dateAdded: data.dateAdded || '',
            createdAt: data.createdAt || 0
          });
        });
        // Sort by order ascending
        lessonList.sort((a, b) => a.order - b.order);
        setLessons(lessonList);

        // Update selected lesson if currently selected was modified
        setSelectedLesson((prev) => {
          if (!prev) return lessonList[0] || null;
          const stillExists = lessonList.find((l) => l.id === prev.id);
          return stillExists || lessonList[0] || null;
        });
      },
      (error) => {
        console.error('Firestore lessons listener error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('merya_user');
    setCurrentUser(null);
    setActiveTab('overview');
  };

  const handleUpdateStudentCompleted = (lessonId: string, completed: boolean) => {
    if (!currentUser || currentUser.role !== 'student') return;
    const currentCompleted = currentUser.completedLessons || [];
    const newCompleted = completed
      ? Array.from(new Set([...currentCompleted, lessonId]))
      : currentCompleted.filter((id) => id !== lessonId);

    const updated = { ...currentUser, completedLessons: newCompleted };
    setCurrentUser(updated);
    sessionStorage.setItem('merya_user', JSON.stringify(updated));
  };

  // ROUTE PROTECTION: If not logged in, render LoginModal
  if (!currentUser) {
    return <LoginModal onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const isAdmin = currentUser.role === 'admin';

  // Navigation Items according to specifications:
  // Admin: 4 sections: نظرة عامة, بوابة الطالبة, قائمة الطلاب, إدارة الدروس
  // Student: 2 sections: نظرة عامة, بوابة الطالب
  const navItems = isAdmin
    ? [
        { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
        { id: 'student_portal', label: 'بوابة الطالبة', icon: GraduationCap },
        { id: 'students_list', label: 'قائمة الطلاب', icon: Users, badge: students.length },
        { id: 'lessons_management', label: 'إدارة الدروس', icon: BookOpen, badge: lessons.length }
      ]
    : [
        { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
        { id: 'student_portal', label: 'بوابة الطالب', icon: GraduationCap }
      ];

  // Route protection enforcement:
  // If student tries to open admin tabs, immediately revert to 'overview'
  const isProtectedAdminTab = activeTab === 'students_list' || activeTab === 'lessons_management';
  const effectiveTab = !isAdmin && isProtectedAdminTab ? 'overview' : activeTab;

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col selection:bg-purple-100 selection:text-purple-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5eeff] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#630ed4] flex items-center justify-center text-white shadow-md shadow-purple-900/10">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-[#121c28] tracking-tight">
                  أكاديمية Merya
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#630ed4]">
                  {isAdmin ? 'لوحة الإدارة' : 'حساب الطالبة'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">المنصة التعليمية المتكاملة</p>
            </div>
          </div>

          {/* Desktop Center Pill Navigation */}
          <nav className="hidden md:flex items-center bg-[#f8f9ff] p-1.5 rounded-full border border-[#dfe9fa]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#630ed4] text-white shadow-sm'
                      : 'text-[#4a4455] hover:text-[#630ed4] hover:bg-purple-50/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-white/25 text-white' : 'bg-purple-100 text-[#630ed4]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-left items-end">
              <span className="text-xs font-extrabold text-[#121c28]">{currentUser.name}</span>
              <span className="text-[11px] text-gray-500 font-mono">@{currentUser.username}</span>
            </div>

            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="p-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer border border-red-100"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-3 space-y-2">
            <div className="text-xs text-gray-500 pb-1">
              مرحباً، <span className="font-bold text-[#121c28]">{currentUser.name}</span> ({currentUser.username})
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center justify-between ${
                    isActive
                      ? 'bg-[#630ed4] text-white'
                      : 'bg-white text-[#4a4455] border border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black/10">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {effectiveTab === 'overview' && (
          <OverviewSection
            user={currentUser}
            students={students}
            lessons={lessons}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
          />
        )}

        {effectiveTab === 'student_portal' && (
          <StudentPortalSection
            user={currentUser}
            lessons={lessons}
            selectedLesson={selectedLesson}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
            onUpdateCompletedLessons={handleUpdateStudentCompleted}
          />
        )}

        {/* Admin-only Routes */}
        {isAdmin && effectiveTab === 'students_list' && (
          <StudentsListSection students={students} />
        )}

        {isAdmin && effectiveTab === 'lessons_management' && (
          <LessonsManagementSection
            lessons={lessons}
            onPreviewLesson={(lesson) => {
              setSelectedLesson(lesson);
              setActiveTab('student_portal');
            }}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#e5eeff] py-6 px-4 text-center text-xs text-gray-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-[#121c28]">أكاديمية Merya</span>
            <span>— جميع الحقوق محفوظة {new Date().getFullYear()}</span>
          </div>
          <div className="text-[11px] text-gray-400">
            النظام مدعوم بقاعدة بيانات سحابية حية للمزامنة الفورية
          </div>
        </div>
      </footer>
    </div>
  );
}
