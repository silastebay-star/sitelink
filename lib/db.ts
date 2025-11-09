import Dexie, { Table } from 'dexie';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to_id: string;
  zone_id: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  offline_changes: boolean;
}

export class AppDB extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super('RapidSiteConnectDB');
    this.version(1).stores({
      tasks: 'id, title, status, assigned_to_id, zone_id, updated_at, offline_changes',
    });
  }
}

export const db = new AppDB();
