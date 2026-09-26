import { db } from './firebase';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  writeBatch
} from 'firebase/firestore';

export const ADMIN_CREDENTIALS = {
  username: 'meriem',
  password: 'wahiba1976',
  name: 'الأستاذة مريم (مديرة الأكاديمية)'
};

export const DEMO_STUDENT = {
  username: 'meryaacademy',
  password: '4111971',
  name: 'طالبة أكاديمية مريا التجريبية'
};

export interface CourseModuleUnit {
  id: string;
  order: number;
  unitCode: string;
  title: string;
  subtitle: string;
  badge: string;
  progressText: string;
  videoUrl: string;
  description: string;
}

// Exactly the 7 lessons requested by the user, with empty videoUrl: ""
export const EXACT_7_LESSONS = [
  {
    id: 'lesson-1',
    order: 1,
    unitCode: 'الوحدة 01',
    title: 'انشاء مواقع الكترونية بالذكاء الاصطناعي',
    subtitle: 'تطبيقات الويب الذكية وهياكل الأتمتة المتقدمة',
    badge: 'متاح',
    progressText: 'الوحدة 1',
    videoUrl: '',
    description: 'شرح مفصل لطرق إنشاء وبرمجة المواقع الإلكترونية بالذكاء الاصطناعي وتطبيقات الأتمتة الحديثة.'
  },
  {
    id: 'lesson-2',
    order: 2,
    unitCode: 'الوحدة 02',
    title: 'أكثر من 10 مواقع لإنشاء web sites',
    subtitle: 'منصات البناء السريع والأدوات المجانية المتاحة',
    badge: 'متاح',
    progressText: 'الوحدة 2',
    videoUrl: '',
    description: 'استعراض تطبيقي لأقوى منصات وأدوات بناء مواقع الويب الجاهزة والسريعة دون خبرة برمجية.'
  },
  {
    id: 'lesson-3',
    order: 3,
    unitCode: 'الوحدة 03',
    title: 'تصميم هوية بصرية brand identity',
    subtitle: 'ابتكار الشعار والألوان وأنظمة الهوية المتكاملة',
    badge: 'متاح',
    progressText: 'الوحدة 3',
    videoUrl: '',
    description: 'كيفية تأسيس هوية بصرية متكاملة للمشاريع والشركات والشعارات الاحترافية.'
  },
  {
    id: 'lesson-4',
    order: 4,
    unitCode: 'الوحدة 04',
    title: 'تصميم اعلانات Ad creative (images + videos)',
    subtitle: 'صناعة محتوى إعلاني عالي التأثير والتحويل',
    badge: 'متاح',
    progressText: 'الوحدة 4',
    videoUrl: '',
    description: 'أسرار تصميم صور وفيديوهات إعلانية مبتكرة وموجهة للحملات الترويجية والتسويقية.'
  },
  {
    id: 'lesson-5',
    order: 5,
    unitCode: 'الوحدة 05',
    title: 'فيديوهات بالذكاء الاصطناعي + ادوات IA للتصميم',
    subtitle: 'تقنيات توليد الفيديو وأدوات الذكاء الاصطناعي الاحترافية',
    badge: 'متاح',
    progressText: 'الوحدة 5',
    videoUrl: '',
    description: 'صناعة وإنتاج مقاطع الفيديو الرقمية الذكية مع أهم أدوات ومنصات الذكاء الاصطناعي للتصميم.'
  },
  {
    id: 'lesson-6',
    order: 6,
    unitCode: 'الوحدة 06',
    title: 'كيفية الحصول على أول عميل لك',
    subtitle: 'استراتيجيات إطلاق الخدمات واستقطاب أول العملاء',
    badge: 'متاح',
    progressText: 'الوحدة 6',
    videoUrl: '',
    description: 'خطوات واستراتيجيات عملية مجربة للحصول على أول عميل مدفوع والبدء بتقديم خدماتك بثقة.'
  },
  {
    id: 'lesson-7',
    order: 7,
    unitCode: 'الوحدة 07',
    title: 'prompt engineering basics',
    subtitle: 'أساسيات صياغة الأوامر وهندسة التلقين الذكية',
    badge: 'متاح',
    progressText: 'الوحدة 7',
    videoUrl: '',
    resourceUrl: 'https://prompt-sigma-flame.vercel.app/',
    description: 'القواعد الذهبية لهندسة الأوامر (Prompt Engineering) لتحقيق أعلى دقة وجودة من نماذج الذكاء الاصطناعي.'
  }
];

export async function seedInitialDataIfNeeded() {
  try {
    // 1. Check students
    const studentsRef = collection(db, 'students');
    const studentSnapshot = await getDocs(studentsRef);

    if (studentSnapshot.empty) {
      const demoRef = doc(db, 'students', 'demo-meryaacademy');
      await setDoc(demoRef, {
        name: DEMO_STUDENT.name,
        username: DEMO_STUDENT.username.toLowerCase(),
        dateJoined: new Date().toLocaleDateString('ar-DZ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        createdAt: Date.now(),
        progress: 0,
        completedLessons: []
      });
    }

    // 2. Sync / ensure exact 7 lessons exist in the collection
    const lessonsRef = collection(db, 'lessons');
    const lessonSnapshot = await getDocs(lessonsRef);

    // If lessons don't match the exact 7, or if collection has old placeholder lessons,
    // ensure all 7 lessons exist with accurate order and empty videoUrl if not previously set by admin.
    const existingMap = new Map<string, any>();
    lessonSnapshot.forEach((d) => {
      existingMap.set(d.id, d.data());
    });

    const batch = writeBatch(db);
    let hasChanges = false;

    EXACT_7_LESSONS.forEach((lesson) => {
      const existing = existingMap.get(lesson.id);
      const lRef = doc(db, 'lessons', lesson.id);

      if (!existing) {
        // Create new
        const newDocData: any = {
          title: lesson.title,
          description: lesson.description,
          videoUrl: '', // strictly empty as requested
          order: lesson.order,
          duration: '30 دقيقة',
          dateAdded: new Date().toLocaleDateString('ar-DZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          createdAt: Date.now() + lesson.order
        };
        if (lesson.id === 'lesson-7' && lesson.resourceUrl) {
          newDocData.resourceUrl = lesson.resourceUrl;
        }
        batch.set(lRef, newDocData);
        hasChanges = true;
      } else {
        // If title or order differs from the exact 7 specification, update it while preserving any videoUrl the admin may have typed
        const updatePayload: any = {};
        if (existing.title !== lesson.title) updatePayload.title = lesson.title;
        if (existing.order !== lesson.order) updatePayload.order = lesson.order;
        if (existing.description !== lesson.description) updatePayload.description = lesson.description;

        // For lesson-7, ensure resourceUrl is set to the provided website link
        if (lesson.id === 'lesson-7' && lesson.resourceUrl && existing.resourceUrl !== lesson.resourceUrl) {
          updatePayload.resourceUrl = lesson.resourceUrl;
        }

        if (Object.keys(updatePayload).length > 0) {
          batch.update(lRef, updatePayload);
          hasChanges = true;
        }
      }
    });

    // Also clean up any old legacy lessons that aren't part of lesson-1 through lesson-7
    lessonSnapshot.forEach((d) => {
      const id = d.id;
      const isOneOf7 = EXACT_7_LESSONS.some((l) => l.id === id);
      if (!isOneOf7) {
        batch.delete(doc(db, 'lessons', id));
        hasChanges = true;
      }
    });

    if (hasChanges) {
      await batch.commit();
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}
