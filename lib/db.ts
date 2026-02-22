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

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  read_at?: string; // Optional
  status: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  updated_at: string;
  offline_changes: boolean;
}

export interface Permit {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'active' | 'closed' | 'expired';
  permit_type: string;
  issued_by_id: string;
  issued_to_id: string;
  zone_id: string;
  valid_from: string;
  valid_to: string;
  created_at: string;
  updated_at: string;
  offline_changes: boolean;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  geometry: string; // GeoJSON string
  site_id: string;
  created_at: string;
  updated_at: string;
  offline_changes: boolean;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  asset_type: string;
  location: string;
  status: 'available' | 'in_use' | 'under_maintenance' | 'out_of_service';
  assigned_to_id?: string; // Optional
  created_at: string;
  updated_at: string;
  offline_changes: boolean;
}

export class AppDB extends Dexie {
  tasks!: Table<Task>;
  messages!: Table<Message>;
  permits!: Table<Permit>;
  zones!: Table<Zone>;
  assets!: Table<Asset>;

  constructor() {
    super('RapidSiteConnectDB');
    this.version(1).stores({
      tasks: 'id, title, status, assigned_to_id, zone_id, updated_at, offline_changes',
      messages: 'id, chat_id, sender_id, sent_at, status, updated_at, offline_changes',
      permits: 'id, title, status, permit_type, issued_by_id, issued_to_id, zone_id, valid_from, valid_to, updated_at, offline_changes',
      zones: 'id, name, site_id, updated_at, offline_changes',
      assets: 'id, name, asset_type, status, assigned_to_id, updated_at, offline_changes',
    });
  }
}

export const db = new AppDB();
