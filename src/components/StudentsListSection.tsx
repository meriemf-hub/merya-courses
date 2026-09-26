import React, { useState } from 'react';
import { 
  Users, 
  Trash2, 
  Search, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  UserCheck,
  Shield,
  GraduationCap
} from 'lucide-react';
import { Student } from '../types';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';

interface StudentsListSectionProps {
  students: Student[];
}

export const StudentsListSection: React.FC<StudentsListSectionProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter students by name or username
  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.username.toLowerCase().includes(term)
    );
  });

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteDoc(doc(db, 'students', studentToDelete.id));
      setStudentToDelete(null);
    } catch (err: any) {
      console.error('Error deleting student:', err);
      setDeleteError('فشل حذف الطالبة: ' + (err.message || ''));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#630ed4] text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>صلاحيات الإدارة المباشرة</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#121c28]">
            قائمة الطالبات المسجلات ({students.length})
          </h2>
          <p className="text-sm text-[#6b7280] mt-1">
            جميع الطالبات اللاتي قمن بإنشاء حساب في الأكاديمية يتم إدراجهن هنا فوراً وبشكل لحظي وتلقائي.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو اسم المستخدم..."
            className="w-full pr-10 pl-4 py-2.5 rounded-full border border-gray-200 text-sm text-[#121c28] focus:border-[#630ed4] focus:ring-3 focus:ring-purple-100 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {deleteError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-200">
          {deleteError}
        </div>
      )}

      {/* Students Table / Grid */}
      <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-[0_2px_12px_rgba(99,14,212,0.04)] overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-[#630ed4] mx-auto flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#121c28]">لا توجد نتائج مطابقة</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm
                ? 'لم نجد طالبة تطابق مصطلح البحث، جربي مصطلحاً آخر.'
                : 'لم تقم أي طالبة بإنشاء حساب بعد.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#e5eeff] text-xs font-bold text-[#6b7280]">
                  <th className="py-4 px-6">الطالبة</th>
                  <th className="py-4 px-6">اسم المستخدم</th>
                  <th className="py-4 px-6">تاريخ الانضمام</th>
                  <th className="py-4 px-6">الدروس المكتملة</th>
                  <th className="py-4 px-6 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredStudents.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-[#fcfaff] transition-colors group"
                  >
                    {/* Student Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-[#630ed4] font-extrabold flex items-center justify-center text-sm shadow-sm">
                          {st.name.charAt(0) || 'ط'}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#121c28]">{st.name}</div>
                          <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>حساب نشط</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold">
                        @{st.username}
                      </span>
                    </td>

                    {/* Date Joined */}
                    <td className="py-4 px-6 text-gray-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{st.dateJoined || 'حديثاً'}</span>
                      </div>
                    </td>

                    {/* Completed count */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#630ed4] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                        <CheckCircle className="w-3.5 h-3.5 text-[#005b3d]" />
                        <span>{st.completedLessons?.length || 0} درس</span>
                      </span>
                    </td>

                    {/* Actions: Delete Button */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setStudentToDelete(st)}
                        title="حذف الطالبة من الأكاديمية"
                        className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs font-bold">حذف</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Delete */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-[#121c28]">
                تأكيد حذف حساب الطالبة؟
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                هل أنتِ متأكدة من حذف الطالبة <span className="font-bold text-red-600">"{studentToDelete.name}"</span> (اسم المستخدم: <span className="font-mono font-bold">@{studentToDelete.username}</span>)؟ لن تتمكن الطالبة من تسجيل الدخول بعد الآن.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-colors text-sm shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، حذف الحساب</span>
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
