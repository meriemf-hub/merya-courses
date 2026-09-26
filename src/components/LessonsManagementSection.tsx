import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Video, 
  Calendar, 
  AlertCircle, 
  X, 
  Save, 
  Sparkles, 
  PlayCircle,
  HelpCircle,
  Link2,
  Check,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Lesson } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

interface LessonsManagementSectionProps {
  lessons: Lesson[];
  onPreviewLesson: (lesson: Lesson) => void;
}

export const LessonsManagementSection: React.FC<LessonsManagementSectionProps> = ({
  lessons,
  onPreviewLesson
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  // Form states for full edit modal
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [order, setOrder] = useState<number>(lessons.length + 1);
  const [duration, setDuration] = useState('30 دقيقة');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Inline Video Link editing state for instantaneous pasting
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickUrl, setQuickUrl] = useState('');
  const [quickSaving, setQuickSaving] = useState(false);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingLesson(null);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setResourceUrl('');
    setOrder(lessons.length + 1);
    setDuration('30 دقيقة');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setDescription(lesson.description);
    setVideoUrl(lesson.videoUrl || '');
    setResourceUrl(lesson.resourceUrl || '');
    setOrder(lesson.order);
    setDuration(lesson.duration || '30 دقيقة');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('يرجى إدخال عنوان الدرس');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const lessonsRef = collection(db, 'lessons');
      const dateStr = new Date().toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (editingLesson) {
        const lessonDoc = doc(db, 'lessons', editingLesson.id);
        const payload: any = {
          title: title.trim(),
          description: description.trim(),
          videoUrl: videoUrl.trim(), // Can be empty or google drive /preview
          order: Number(order) || 1,
          duration: duration.trim()
        };
        // Update resourceUrl (optional)
        if (resourceUrl.trim()) {
          payload.resourceUrl = resourceUrl.trim();
        } else {
          payload.resourceUrl = '';
        }

        await updateDoc(lessonDoc, payload);
      } else {
        const payload: any = {
          title: title.trim(),
          description: description.trim(),
          videoUrl: videoUrl.trim(),
          order: Number(order) || (lessons.length + 1),
          duration: duration.trim(),
          dateAdded: dateStr,
          createdAt: Date.now()
        };
        if (resourceUrl.trim()) {
          payload.resourceUrl = resourceUrl.trim();
        }
        await addDoc(lessonsRef, payload);
      }

      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving lesson:', err);
      setErrorMsg('فشل حفظ الدرس: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  // Instant direct video link save function per lesson card
  const handleQuickVideoSave = async (lesson: Lesson) => {
    setQuickSaving(true);
    try {
      const lessonDoc = doc(db, 'lessons', lesson.id);
      await updateDoc(lessonDoc, {
        videoUrl: quickUrl.trim()
      });
      setQuickEditId(null);
      setSavedSuccessId(lesson.id);
      setTimeout(() => setSavedSuccessId(null), 3000);
    } catch (err: any) {
      console.error('Error saving video link:', err);
      alert('فشل حفظ رابط الفيديو: ' + (err.message || ''));
    } finally {
      setQuickSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'lessons', lessonToDelete.id));
      setLessonToDelete(null);
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      alert('فشل حذف الدرس: ' + (err.message || ''));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#005b3d] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مزامنة فورية حية (Live Real-Time Sync)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#121c28]">
            إدارة دروس ومحاضرات المساق ({lessons.length} دروس)
          </h2>
          <p className="text-sm text-[#6b7280] mt-1 max-w-2xl leading-relaxed">
            الدروس الـ 7 مسجلة ومعتمدة بالترتيب الدقيق. يمكنكِ لصق رابط الفيديو المباشر (مثل رابط معاينة Google Drive بصيغة <span className="font-mono text-purple-700 font-semibold" dir="ltr">.../preview</span> أو YouTube) لكل درس وسينعكس فوراً ولحظياً في بوابة جميع الطلاب دون الحاجة لإعادة تحميل الصفحة.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-6 py-3.5 rounded-full bg-[#630ed4] hover:bg-[#6e3aca] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة درس إضافي</span>
        </button>
      </div>

      {/* Quick notice about video links & Google Drive */}
      <div className="bg-[#eef4ff] border border-[#dfe9fa] rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-[#4a4455]">
        <Video className="w-5 h-5 text-[#630ed4] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#121c28]">كيفية لصق روابط Google Drive: </span>
          يمكنكِ لصق رابط ملف جوجل درايف مباشرة في حقل «رابط الفيديو»، وسيتم تضمينه تلقائياً داخل المشغل المدمج في «بوابة الطالب» بدون إمكانية تنزيل أو فتح في نوافذ خارجية.
        </div>
      </div>

      {/* Lessons List Grid */}
      {lessons.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-[#e5eeff] space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-[#630ed4] mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#121c28]">جاري جلب الدروس...</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((les) => {
            const isEditingThisVideo = quickEditId === les.id;
            const hasVideo = Boolean(les.videoUrl && les.videoUrl.trim() !== '');

            return (
              <div
                key={les.id}
                className="bg-white rounded-3xl border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] hover:shadow-lg hover:border-purple-200 transition-all p-5 flex flex-col justify-between gap-4 group"
              >
                {/* Header: Lesson Order & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#630ed4] font-extrabold text-sm flex items-center justify-center">
                      {les.order}
                    </span>
                    {hasVideo ? (
                      <span className="text-xs font-bold text-[#005b3d] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        الفيديو مرفق
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        قريبًا (بدون فيديو)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(les)}
                      title="تعديل تفاصيل الدرس"
                      className="p-2 rounded-xl text-gray-600 hover:text-[#630ed4] hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setLessonToDelete(les)}
                      title="حذف الدرس"
                      className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base text-[#121c28] group-hover:text-[#630ed4] transition-colors leading-snug">
                    {les.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {les.description || 'وصف المحتوى والشرح التفاعلي'}
                  </p>
                </div>

                {/* Video URL Quick Management Block:
                    Provides an easy-to-use input field for videoUrl per lesson
                    that saves instantly and updates the student's portal in real time.
                */}
                <div className="bg-[#f8f9ff] p-3.5 rounded-2xl border border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#630ed4] flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>رابط الفيديو (Google Drive / Embed)</span>
                    </span>
                    {savedSuccessId === les.id && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>تم الحفظ فوراً!</span>
                      </span>
                    )}
                  </div>

                  {isEditingThisVideo ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        dir="ltr"
                        autoFocus
                        value={quickUrl}
                        onChange={(e) => setQuickUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../preview"
                        className="w-full px-3 py-1.5 rounded-xl border border-purple-300 text-xs font-mono bg-white text-left text-gray-800 outline-none focus:ring-2 focus:ring-purple-100"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuickEditId(null)}
                          className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          disabled={quickSaving}
                          onClick={() => handleQuickVideoSave(les)}
                          className="px-3 py-1 text-xs bg-[#630ed4] text-white font-bold rounded-lg hover:bg-[#6e3aca] cursor-pointer disabled:opacity-50"
                        >
                          {quickSaving ? 'جاري الحفظ...' : 'حفظ الرابط'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-gray-600 truncate font-mono bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 flex-1">
                        {hasVideo ? les.videoUrl : 'لم يتم لصق رابط بعد (قريبًا)'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickEditId(les.id);
                          setQuickUrl(les.videoUrl || '');
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-[#630ed4] bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-100 cursor-pointer whitespace-nowrap"
                      >
                        {hasVideo ? 'تعديل الرابط' : 'لصق الرابط'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Attached Resource URL badge if configured */}
                {les.resourceUrl && les.resourceUrl.trim() !== '' && (
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-[#630ed4]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold truncate">الموقع المرفق:</span>
                      <span className="font-mono text-[11px] truncate text-gray-600">{les.resourceUrl}</span>
                    </div>
                    <a
                      href={les.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-purple-100 rounded text-[#630ed4] shrink-0"
                      title="فتح الرابط"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Bottom preview button */}
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{les.dateAdded || 'المنهج الدراسي'}</span>
                  </span>

                  <button
                    onClick={() => onPreviewLesson(les)}
                    className="text-xs font-bold text-[#630ed4] hover:text-[#6e3aca] inline-flex items-center gap-1.5 cursor-pointer bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>معاينة في البوابة</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Full Add / Edit Lesson */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#e5eeff] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#630ed4] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#121c28]">
                    {editingLesson ? 'تعديل تفاصيل الدرس' : 'إضافة درس جديد'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    أي تعديل في رابط الفيديو أو المحتوى ينعكس مباشرة في بوابة الطلاب
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">ترتيب الدرس (الرقم)</label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#121c28] focus:border-[#630ed4] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">المدة التقديرية</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="مثال: 30 دقيقة"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#121c28] focus:border-[#630ed4] outline-none"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">عنوان الدرس</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان الدرس"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#121c28] focus:border-[#630ed4] outline-none font-bold"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">وصف وشرح الدرس</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="تفاصيل الدرس ومحاوره التعليمية..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#121c28] focus:border-[#630ed4] outline-none leading-relaxed"
                />
              </div>

              {/* Video URL (Optional / Can be empty) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>رابط الفيديو (Google Drive أو YouTube)</span>
                  <span className="text-[11px] text-gray-500 font-normal">اختياري - يترك فارغاً لعرض "قريباً"</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../preview"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm text-left font-mono text-[#121c28] focus:border-[#630ed4] outline-none"
                  />
                  <Video className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1 pt-1">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                  <span>الصقي الرابط مباشرة هنا لحفظه وتحديث بوابة الطلاب لحظياً.</span>
                </div>
              </div>

              {/* Resource URL (Optional - Attached website link) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#630ed4]" />
                    <span>رابط الموقع المرفق (Resource URL)</span>
                  </span>
                  <span className="text-[11px] text-gray-500 font-normal">اختياري - مثل مواقع التدريب والتطبيقات</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm text-left font-mono text-[#121c28] focus:border-[#630ed4] outline-none"
                  />
                  <Link2 className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1 pt-1">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                  <span>يظهر كزر مميز تحت مشغل الفيديو في بوابة الطالبة (مثل رابط منصة التدريب للدرس 7).</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#630ed4] hover:bg-[#6e3aca] text-white font-bold text-sm shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingLesson ? 'تحديث الدرس' : 'إضافة الدرس'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-[#121c28]">
                تأكيد حذف هذا الدرس؟
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                هل أنتِ متأكدة من حذف الدرس <span className="font-bold text-red-600">"{lessonToDelete.title}"</span>؟
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLessonToDelete(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteLesson}
                disabled={deleting}
                className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-colors text-sm shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، حذف الدرس</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
