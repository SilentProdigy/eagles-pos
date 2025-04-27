const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://business-app-pwa-d0236-default-rtdb.firebaseio.com'
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// API Endpoints
app.get('/api/stores', async (req, res) => {
  try {
    const snapshot = await db.collection('stores').get();
    const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stores/:storeId/products', async (req, res) => {
  try {
    const { storeId } = req.params;
    const snapshot = await db.collection('stores').doc(storeId).collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const { storeId, items, total } = req.body;
    
    // Update inventory
    const batch = db.batch();
    items.forEach(item => {
      const productRef = db.collection('stores').doc(storeId).collection('products').doc(item.id);
      batch.update(productRef, { stock: admin.firestore.FieldValue.increment(-1) });
    });
    
    // Record sale
    const saleRef = db.collection('sales').doc();
    batch.set(saleRef, {
      storeId,
      items,
      total,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });
    
    await batch.commit();
    res.json({ success: true, saleId: saleRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync endpoint for offline operations
app.post('/api/sync', async (req, res) => {
  try {
    const { operations } = req.body;
    const results = [];
    
    for (const op of operations) {
      if (op.type === 'checkout') {
        const { cart, currentStore } = op.data;
        const batch = db.batch();
        
        cart.forEach(item => {
          const productRef = db.collection('stores').doc(currentStore).collection('products').doc(item.id);
          batch.update(productRef, { stock: admin.firestore.FieldValue.increment(-1) });
        });
        
        const saleRef = db.collection('sales').doc();
        batch.set(saleRef, {
          storeId: currentStore,
          items: cart,
          total: cart.reduce((sum, item) => sum + item.price, 0),
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          status: 'completed'
        });
        
        await batch.commit();
        results.push({ opId: op.id, success: true });
      }
    }
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));