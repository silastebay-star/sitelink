import { db, Task, Message, Permit, Zone, Asset } from './db';

async function testIndexedDB() {
  try {
    // --- Task Operations ---
    const newTask: Task = {
      id: 'task-123',
      title: 'Complete PWA setup',
      description: 'Implement IndexedDB and service worker for offline support.',
      status: 'in_progress',
      assigned_to_id: 'worker-abc',
      zone_id: 'zone-xyz',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      offline_changes: true,
    };
    await db.tasks.add(newTask);
    console.log('Task added to IndexedDB:', newTask);

    const allTasks = await db.tasks.toArray();
    console.log('All tasks in IndexedDB:', allTasks);

    await db.tasks.update('task-123', { status: 'completed', offline_changes: true, updated_at: new Date().toISOString() });
    const updatedTask = await db.tasks.get('task-123');
    console.log('Updated task in IndexedDB:', updatedTask);

    // --- Message Operations ---
    const newMessage: Message = {
      id: 'msg-456',
      chat_id: 'chat-1',
      sender_id: 'user-1',
      content: 'Hello team, new task assigned!',
      sent_at: new Date().toISOString(),
      status: 'sent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      offline_changes: true,
    };
    await db.messages.add(newMessage);
    console.log('Message added to IndexedDB:', newMessage);

    const allMessages = await db.messages.toArray();
    console.log('All messages in IndexedDB:', allMessages);

    // --- Permit Operations ---
    const newPermit: Permit = {
      id: 'permit-789',
      title: 'Hot Work Permit',
      description: 'Hot work required in Zone A for welding.',
      status: 'pending_approval',
      permit_type: 'Hot Work',
      issued_by_id: 'supervisor-1',
      issued_to_id: 'worker-abc',
      zone_id: 'zone-xyz',
      valid_from: new Date().toISOString(),
      valid_to: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      offline_changes: true,
    };
    await db.permits.add(newPermit);
    console.log('Permit added to IndexedDB:', newPermit);

    const allPermits = await db.permits.toArray();
    console.log('All permits in IndexedDB:', allPermits);

    // --- Zone Operations ---
    const newZone: Zone = {
      id: 'zone-xyz',
      name: 'Zone A',
      description: 'Main construction area',
      geometry: '{"type":"Polygon","coordinates":[[[0,0],[0,1],[1,1],[1,0],[0,0]]]}', // Example GeoJSON
      site_id: 'site-alpha',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      offline_changes: true,
    };
    await db.zones.add(newZone);
    console.log('Zone added to IndexedDB:', newZone);

    const allZones = await db.zones.toArray();
    console.log('All zones in IndexedDB:', allZones);

    // --- Asset Operations ---
    const newAsset: Asset = {
      id: 'asset-101',
      name: 'Excavator 001',
      description: 'Heavy machinery for digging.',
      asset_type: 'Excavator',
      location: 'zone-xyz',
      status: 'in_use',
      assigned_to_id: 'worker-abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      offline_changes: true,
    };
    await db.assets.add(newAsset);
    console.log('Asset added to IndexedDB:', newAsset);

    const allAssets = await db.assets.toArray();
    console.log('All assets in IndexedDB:', allAssets);

    // Clean up (optional, for testing purposes)
    await db.tasks.clear();
    await db.messages.clear();
    await db.permits.clear();
    await db.zones.clear();
    await db.assets.clear();
    console.log('IndexedDB cleared.');

  } catch (error) {
    console.error('IndexedDB test failed:', error);
  }
}

// You can call this function from a script or a component to test
// testIndexedDB();
