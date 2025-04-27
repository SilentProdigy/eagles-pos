class SyncManager {
    constructor() {
      this.pendingOperations = [];
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncPendingOperations();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
    
    async queueForSync(type, data) {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
          // Store the operation in cache
          const cache = await caches.open('pending-ops');
          const opId = Date.now().toString();
          await cache.put(
            new Request(`/pending-op-${opId}`),
            new Response(JSON.stringify({ id: opId, type, data }))
          );
          
          // Register for sync
          await registration.sync.register('sync-pending-operations');
        } catch (error) {
          console.error('Failed to queue operation:', error);
        }
      } else {
        // Fallback for browsers without background sync
        this.pendingOperations.push({ type, data });
        localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
      }
    }
    
    async syncPendingOperations() {
      if (this.isOnline) {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          // Background sync will handle this
          return;
        }
        
        // Manual sync for browsers without background sync
        const pendingOps = JSON.parse(localStorage.getItem('pendingOperations') || '[]');
        if (pendingOps.length > 0) {
          try {
            const response = await fetch('/api/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ operations: pendingOps })
            });
            
            if (response.ok) {
              localStorage.removeItem('pendingOperations');
              this.pendingOperations = [];
            }
          } catch (error) {
            console.error('Sync failed:', error);
          }
        }
      }
    }
  }
  
  export default new SyncManager();