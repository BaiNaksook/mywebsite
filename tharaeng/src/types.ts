import type { Timestamp } from 'firebase/firestore';

export type CategoryId = 'flood' | 'garbage' | 'road' | 'light' | 'other';
export type ReportStatus = 'open' | 'in_progress' | 'resolved';

export interface Volunteer {
  uid: string;
  name: string;
  joinedAt: Date | null;
}

export interface Resolution {
  note: string;
  photoId: string | null;
  byUid: string;
  byName: string;
  at: Date | null;
}

export interface Report {
  id: string;
  reporterUid: string;
  reporterName: string;
  category: CategoryId;
  placeName: string;
  description: string;
  lat: number;
  lng: number;
  photoId: string | null;
  status: ReportStatus;
  volunteers: Volunteer[];
  resolution: Resolution | null;
  hidden: boolean;
  reopenCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type HistoryType = 'created' | 'joined' | 'left' | 'resolved' | 'reopened' | 'hidden' | 'unhidden';

export interface HistoryEvent {
  id: string;
  type: HistoryType;
  byUid: string;
  byName: string;
  at: Date | null;
  note: string | null;
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus;
}

export type TimestampLike = Timestamp | null | undefined;
