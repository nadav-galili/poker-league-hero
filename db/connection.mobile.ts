// Mobile stub for database connection - prevents server-side imports in mobile builds

export function getDb() {
   throw new Error('Database access not available on mobile');
}

export function closeDb() {
   // No-op for mobile
}
