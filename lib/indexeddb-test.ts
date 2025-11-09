import { db, Task } from './db';

async function testIndexedDB() {
  try {
    // Add a new task
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

    // Get all tasks
    const allTasks = await db.tasks.toArray();
    console.log('All tasks in IndexedDB:', allTasks);

    // Update a task
    await db.tasks.update('task-123', { status: 'completed', offline_changes: true, updated_at: new Date().toISOString() });
    const updatedTask = await db.tasks.get('task-123');
    console.log('Updated task in IndexedDB:', updatedTask);

    // Delete a task
    await db.tasks.delete('task-123');
    const remainingTasks = await db.tasks.toArray();
    console.log('Remaining tasks after deletion:', remainingTasks);

  } catch (error) {
    console.error('IndexedDB test failed:', error);
  }
}

// You can call this function from a script or a component to test
// testIndexedDB();
