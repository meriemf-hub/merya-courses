export interface Student {
  id: string;
  name: string;
  username: string;
  dateJoined: string; // ISO date string or formatted date
  createdAt?: number;
  progress?: number;
  completedLessons?: string[]; // IDs of completed lessons
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  resourceUrl?: string;
  order: number;
  duration?: string;
  dateAdded: string;
  createdAt?: number;
}

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  role: UserRole;
  username: string;
  name: string;
  id?: string;
  progress?: number;
  completedLessons?: string[];
}
