import React from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Video,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { Student, Lesson, AuthUser } from '../types';
import { EXACT_7_LESSONS } from '../seedData';

interface OverviewSectionProps {
  user: AuthUser;
  students: Student[];
  lessons: Lesson[];
  onNavigate: (tab: string) => void;
  onSelectLesson?: (lesson: Lesson) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  user,
  students,
  lessons,
  onNavigate,
  onSelectLesson
}) => {
  const isAdmin = user.role === 'admin';

  if (isAdmin) {
    // Admin Overview
    const recentStudents = [...students].slice(0, 5);
    const recentLessons = [...lessons].slice(0, 4);

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-l from-[#630ed4] via-[#6e3aca] to-[#430994] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>لوحة تحكم الإدارة الكاملة</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                مرحباً بكِ، {user.name} 👋
              </h1>
              <p className="text-purple-100 text-sm sm:text-base max-w-xl">
                إليك نظرة عامة شاملة حول نشاط أكاديمية Merya، أعداد الطالبات المسجلات، والدروس التفاعلية المفعلة.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('lessons_management')}
                className="px-5 py-2.5 rounded-full bg-white text-[#630ed4] font-bold text-sm hover:bg-purple-50 transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>إدارة الدروس</span>
              </button>
              <button
                onClick={() => onNavigate('students_list')}
                className="px-5 py-2.5 rounded-full bg-white/15 text-white border border-white/30 font-bold text-sm hover:bg-white/25 transition-all backdrop-blur-sm active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>قائمة الطلاب ({students.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#6b7280]">إجمالي الطالبات المسجلات</span>
              <div className="text-3xl font-extrabold text-[#121c28]">{students.length}</div>
              <span className="text-xs font-semibold text-[#005b3d] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>تسجيل فوري متزامن</span>
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#630ed4]">
              <Users className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#6b7280]">إجمالي الدروس في المساق</span>
              <div className="text-3xl font-extrabold text-[#121c28]">{lessons.length}</div>
              <span className="text-xs font-semibold text-[#630ed4] flex items-center gap-1">
                <Video className="w-3.5 h-3.5" />
                <span>تحديث وتعديل فوري للروابط</span>
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#005b3d]">
              <BookOpen className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] flex items-center justify-between sm:col-span-2 lg:col-span-1">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#6b7280]">حالة المزامنة الحية (Live Sync)</span>
              <div className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span>متصلة باللحظة</span>
              </div>
              <p className="text-xs text-[#6b7280]">
                أي رابط فيديو يتم لصقه يظهر للطلاب فوراً
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Recent Students & Recent Lessons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#630ed4]" />
                <h3 className="font-extrabold text-lg text-[#121c28]">آخر الطالبات المسجلات</h3>
              </div>
              <button
                onClick={() => onNavigate('students_list')}
                className="text-xs font-bold text-[#630ed4] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            {recentStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm font-medium">
                لم يتم تسجيل طالبات حتى الآن
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentStudents.map((st) => (
                  <div key={st.id} className="py-3 flex items-center justify-between hover:bg-[#f8f9ff] px-3 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-[#630ed4] font-bold flex items-center justify-center text-sm">
                        {st.name.charAt(0) || 'ط'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#121c28]">{st.name}</div>
                        <div className="text-xs text-gray-500 font-mono">@{st.username}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{st.dateJoined}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#005b3d]" />
                <h3 className="font-extrabold text-lg text-[#121c28]">الدروس المتاحة في المساق ({lessons.length})</h3>
              </div>
              <button
                onClick={() => onNavigate('lessons_management')}
                className="text-xs font-bold text-[#630ed4] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>إدارة الدروس</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            {lessons.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm font-medium">
                جاري تهيئة الدروس...
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((les) => (
                  <div
                    key={les.id}
                    onClick={() => {
                      if (onSelectLesson) onSelectLesson(les);
                      onNavigate('student_portal');
                    }}
                    className="p-3.5 rounded-2xl border border-gray-100 bg-[#f8f9ff] hover:border-purple-200 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#630ed4] flex items-center justify-center font-bold text-sm">
                        {les.order}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#121c28] line-clamp-1">{les.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {les.videoUrl ? 'رابط الفيديو مرفق' : 'بانتظار إضافة رابط الفيديو (قريباً)'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-[#630ed4] font-bold border border-purple-100 whitespace-nowrap">
                      معاينة
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Student Personal Overview:
  // - Keeps the greeting and button exactly as requested:
  //   "أهلاً بكِ في رحلتكِ التعليمية، [Name]! 🌟"
  //   "تابعي تقدمك الشخصي في المنهج، شاهدي الدروس المصورة، وأكملي التطبيقات العملية خطوة بخطوة."
  //   "الانتقال إلى الدروس الآن"
  // - Completely REMOVED the "شهادة إتمام" (Certificate of Completion) section/card as instructed.
  return (
    <div className="space-y-8">
      {/* 1. Student Welcome Card - Preserved Exactly as Requested */}
      <div className="bg-gradient-to-l from-[#630ed4] to-[#6e3aca] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide backdrop-blur-sm">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>أكاديمية Merya التعليمية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              أهلاً بكِ في رحلتكِ التعليمية، {user.name}! 🌟
            </h1>
            <p className="text-purple-100 text-sm sm:text-base max-w-xl">
              تابعي تقدمك الشخصي في المنهج، شاهدي الدروس المصورة، وأكملي التطبيقات العملية خطوة بخطوة.
            </p>
          </div>

          <button
            onClick={() => onNavigate('student_portal')}
            className="px-6 py-3 rounded-full bg-white text-[#630ed4] font-bold text-base hover:bg-purple-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            <span>الانتقال إلى الدروس الآن</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Course Introduction (Certificate section completely removed) */}
      <div className="text-center space-y-4 max-w-4xl mx-auto px-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121c28] tracking-tight">
          مقدمة عن الكورس ومحتوى التدريب التفاعلي
        </h2>
        <p className="text-sm sm:text-base text-[#4a4455] leading-relaxed max-w-3xl mx-auto">
          مرحباً بكم في مسار الذكاء الاصطناعي وتطبيقات الأتمتة المتقدمة. صُمم هذا المساق التعليمي بعناية لنقلك من الأساسيات وحتى احتراف أحدث أدوات الذكاء الاصطناعي التوليدي، وتصميم الهويات البصرية، وبناء المواقع الإلكترونية السريعة، وصناعة المحتوى، وإطلاق خدماتك للعملاء بأساليب عملية مثبتة.
        </p>

        {/* Highlights Pills (Certificate REMOVED completely) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Badge 1: 7 وحدات تطبيقية مكثفة */}
          <div className="bg-white border border-[#e5eeff] px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#121c28]">
            <Layers className="w-4 h-4 text-[#630ed4]" />
            <span>7 وحدات تطبيقية مكثفة</span>
          </div>

          {/* Badge 2: مشاريع وتطبيقات واقعية */}
          <div className="bg-white border border-[#e5eeff] px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#121c28]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>مشاريع وتطبيقات واقعية</span>
          </div>
        </div>
      </div>

      {/* 3. Main Course Curriculum Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5eeff] shadow-[0_4px_24px_rgba(99,14,212,0.06)] space-y-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#630ed4] text-white flex items-center justify-center shadow-md shadow-purple-900/10">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#121c28]">قائمة محتوى الكورس</h3>
              <p className="text-xs text-[#6b7280]">المنهج الدراسي الكامل والوحدات التدريبية المعتمدة</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 text-[#630ed4] text-xs font-extrabold border border-purple-200 self-start sm:self-auto">
            <span>7 وحدات تدريبية</span>
          </div>
        </div>

        {/* The 7 lessons list */}
        <div className="space-y-3.5">
          {EXACT_7_LESSONS.map((item) => {
            // Find live lesson data if updated in Firestore
            const liveLesson = lessons.find((l) => l.order === item.order);
            const titleToDisplay = liveLesson?.title || item.title;
            const hasVideo = Boolean(liveLesson?.videoUrl && liveLesson.videoUrl.trim() !== '');

            return (
              <div
                key={item.id}
                onClick={() => {
                  const matchedLesson = liveLesson || {
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    videoUrl: '',
                    order: item.order,
                    duration: '30 دقيقة',
                    dateAdded: '2026-09-01'
                  };
                  if (onSelectLesson) onSelectLesson(matchedLesson);
                  onNavigate('student_portal');
                }}
                className="p-4 sm:p-5 rounded-2xl border border-[#e5eeff] bg-[#f8f9ff]/70 hover:bg-white hover:border-[#630ed4] hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Right Side (Icon + Title + Subtitle) */}
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#630ed4] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <span className="font-mono">{item.order}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-base text-[#121c28] group-hover:text-[#630ed4] transition-colors">
                        {titleToDisplay}
                      </h4>
                      {/* Status badge: either 'متاح' with video, or 'قريباً' if videoUrl is empty */}
                      {hasVideo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>جاهز للمشاهدة</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>قريبًا</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#6b7280] font-medium flex items-center gap-1.5">
                      <span className="font-bold text-[#630ed4]">{item.unitCode}</span>
                      <span>•</span>
                      <span>{item.subtitle}</span>
                    </div>
                  </div>
                </div>

                {/* Left Side: Unit Indicator + Arrow */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="px-3 py-1 rounded-full bg-purple-100 text-[#630ed4] text-xs font-extrabold flex items-center gap-1.5 border border-purple-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>الدرس {item.order}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#630ed4] group-hover:border-[#630ed4] transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
