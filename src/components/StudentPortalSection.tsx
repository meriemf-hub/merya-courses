import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Clock, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, AuthUser } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface StudentPortalSectionProps {
  user: AuthUser;
  lessons: Lesson[];
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
  onUpdateCompletedLessons?: (lessonId: string, completed: boolean) => void;
}

export const StudentPortalSection: React.FC<StudentPortalSectionProps> = ({
  user,
  lessons,
  selectedLesson,
  onSelectLesson,
  onUpdateCompletedLessons
}) => {
  const isAdmin = user.role === 'admin';
  const activeLesson = selectedLesson || (lessons.length > 0 ? lessons[0] : null);

  // Helper to safely format embeddable video URL for Google Drive preview, YouTube, Vimeo, etc.
  // Google Drive links will be converted to /preview format to embed inline without external downloads.
  const getEmbedUrl = (rawUrl?: string): string => {
    if (!rawUrl) return '';
    const url = rawUrl.trim();
    if (!url) return '';

    try {
      // 1. Google Drive Links:
      // Examples:
      // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      // https://drive.google.com/file/d/FILE_ID/preview
      // https://drive.google.com/open?id=FILE_ID
      if (url.includes('drive.google.com')) {
        if (url.includes('/file/d/')) {
          const parts = url.split('/file/d/');
          if (parts[1]) {
            const fileId = parts[1].split('/')[0].split('?')[0];
            return `https://drive.google.com/file/d/${fileId}/preview`;
          }
        } else if (url.includes('id=')) {
          const urlObj = new URL(url);
          const id = urlObj.searchParams.get('id');
          if (id) {
            return `https://drive.google.com/file/d/${id}/preview`;
          }
        }
      }

      // 2. YouTube Links:
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}?rel=0`;
      }
      if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts[1]) {
          const v = parts[1].split('?')[0];
          return `https://www.youtube.com/embed/${v}?rel=0`;
        }
      }

      // 3. Vimeo Links:
      if (url.includes('vimeo.com/')) {
        const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
        if (vimeoId && !isNaN(Number(vimeoId))) {
          return `https://player.vimeo.com/video/${vimeoId}`;
        }
      }

      // Already an embed/preview link or direct https link
      return url;
    } catch {
      return url;
    }
  };

  const isCompleted = (lessonId: string) => {
    return user.completedLessons?.includes(lessonId) || false;
  };

  const toggleLessonCompletion = async (lessonId: string) => {
    if (isAdmin) return; // Read-only preview for admin

    const currentCompleted = isCompleted(lessonId);
    const newStatus = !currentCompleted;

    if (newStatus) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    if (onUpdateCompletedLessons) {
      onUpdateCompletedLessons(lessonId, newStatus);
    }

    if (user.id) {
      try {
        const studentRef = doc(db, 'students', user.id);
        await updateDoc(studentRef, {
          completedLessons: newStatus ? arrayUnion(lessonId) : arrayRemove(lessonId)
        });
      } catch (e) {
        console.error('Error updating student progress:', e);
      }
    }
  };

  if (lessons.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] space-y-4">
        <div className="w-16 h-16 rounded-full bg-purple-50 text-[#630ed4] mx-auto flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#121c28]">بوابة الطالب - لا توجد دروس حالياً</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          {isAdmin
            ? 'يمكنك إضافة وتعديل روابط الفيديوهات من قسم «إدارة الدروس» لتظهر هنا فوراً وفي بوابة جميع الطالبات.'
            : 'لم تقم الإدارة بنشر الدروس بعد، يرجى مراجعة المنصة قريباً.'}
        </p>
      </div>
    );
  }

  const rawVideoUrl = activeLesson?.videoUrl ? activeLesson.videoUrl.trim() : '';
  const embedUrl = getEmbedUrl(rawVideoUrl);
  const hasValidVideo = Boolean(embedUrl && embedUrl.length > 0);

  // Prev / next lessons
  const currentIndex = lessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="space-y-6">
      {/* Admin Preview Notice */}
      {isAdmin && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm text-[#630ed4] font-semibold">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 shrink-0" />
            <span>
              أنتِ في وضع المعاينة (بوابة الطالب كما تظهر للطلاب تماماً). لإضافة وتعديل روابط الفيديوهات انتقلي إلى «إدارة الدروس».
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#630ed4] text-white">
            معاينة الإدارة
          </span>
        </div>
      )}

      {/* Main Learning Hub: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Video Player + Lesson Content) - Takes 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {activeLesson ? (
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)]">
              {/* Inline Embedded Video Player Frame:
                  - Strictly embeds using <iframe> directly pointing to videoUrl
                  - No opening in separate tab or window
                  - No download button or target="_blank"
                  - If videoUrl is empty, shows a small "قريبًا" (Coming soon) badge
              */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                {hasValidVideo ? (
                  <iframe
                    src={embedUrl}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <Play className="w-7 h-7 translate-x-0.5" />
                    </div>
                    {/* Small "قريبًا" (Coming soon) badge */}
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>قريبًا</span>
                    </div>
                    <p className="text-xs text-gray-400 max-w-sm">
                      سيتم رفع وعرض مقطع الفيديو التوضيحي الخاص بهذا الدرس قريباً
                    </p>
                  </div>
                )}
              </div>

              {/* Lesson Details below player */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-[#630ed4] text-xs font-extrabold">
                        الدرس {activeLesson.order}
                      </span>
                      {hasValidVideo ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          جاهز للمشاهدة
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          قريبًا
                        </span>
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1 font-medium mr-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{activeLesson.duration || '30 دقيقة'}</span>
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#121c28]">
                      {activeLesson.title}
                    </h1>
                  </div>

                  {/* Complete Lesson Button (for student) */}
                  {!isAdmin && (
                    <button
                      onClick={() => toggleLessonCompletion(activeLesson.id)}
                      className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                        isCompleted(activeLesson.id)
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-[#eef4ff] text-[#630ed4] hover:bg-purple-100 border border-[#dfe9fa]'
                      }`}
                    >
                      {isCompleted(activeLesson.id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تم إكمال الدرس ✓</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          <span>تحديد كمكتمل</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Lesson Description */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-sm text-[#121c28] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#630ed4]" />
                    <span>محتوى وشرح الدرس:</span>
                  </h3>
                  <div className="text-sm text-[#4a4455] leading-relaxed whitespace-pre-line bg-[#f8f9ff] p-5 rounded-2xl border border-[#eef4ff]">
                    {activeLesson.description || 'تفاصيل وشرح هذا الدرس ستكون متاحة للمتابعة والتطبيق العملي.'}
                  </div>
                </div>

                {/* Prev / Next Navigation Controls */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  {prevLesson ? (
                    <button
                      onClick={() => onSelectLesson(prevLesson)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#630ed4] px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>الدرس السابق ({prevLesson.order})</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {nextLesson && (
                    <button
                      onClick={() => onSelectLesson(nextLesson)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#630ed4] hover:bg-[#6e3aca] px-5 py-2.5 rounded-full transition-all shadow-sm cursor-pointer"
                    >
                      <span>الدرس التالي ({nextLesson.order})</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column: Playlist of Lessons (1 col) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-[#121c28]">فهرس دروس المساق</h3>
              <p className="text-xs text-gray-500">{lessons.length} دروس معتمدة</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="محدث مباشرة" />
          </div>

          {/* Lessons List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {lessons.map((les) => {
              const isSelected = activeLesson?.id === les.id;
              const completed = isCompleted(les.id);
              const hasVideo = Boolean(les.videoUrl && les.videoUrl.trim() !== '');

              return (
                <div
                  key={les.id}
                  onClick={() => onSelectLesson(les)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-purple-50/70 border-[#630ed4] shadow-sm ring-1 ring-[#630ed4]/20'
                      : completed
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                      : 'bg-[#f8f9ff] border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#630ed4] text-white shadow-sm'
                          : completed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-purple-100 text-[#630ed4]'
                      }`}
                    >
                      {completed ? <CheckCircle2 className="w-4 h-4" /> : les.order}
                    </div>

                    <div className="space-y-0.5">
                      <h4
                        className={`text-xs font-extrabold line-clamp-1 ${
                          isSelected ? 'text-[#630ed4]' : 'text-[#121c28]'
                        }`}
                      >
                        {les.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400 font-medium">
                          الدرس {les.order}
                        </span>
                        {!hasVideo && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            قريبًا
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {isSelected && (
                    <span className="text-[11px] font-bold text-[#630ed4] bg-white px-2 py-0.5 rounded-full border border-purple-200 shrink-0">
                      يُعرض الآن
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
