function Dashboard() {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const [stores, setStores] = useState([]);
  
    useEffect(() => {
      if (currentUser) {
        // Load user data
        getDoc(doc(db, 'users', currentUser.uid)).then(docSnap => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            // Load stores if they exist
            if (docSnap.data().stores) {
              const storePromises = docSnap.data().stores.map(storeId => 
                getDoc(doc(db, 'stores', storeId))
              );
              Promise.all(storePromises).then(storeSnaps => {
                setStores(storeSnaps.map(snap => ({ id: snap.id, ...snap.data() })));
              });
            }
          }
        });
      }
    }, [currentUser]);
  
    if (!userData) return <CircularProgress />;
  
    return (
      <div>
        <h1>Welcome, {userData.email}</h1>
        <h2>Your Stores</h2>
        <div className="stores-list">
          {stores.length > 0 ? (
            stores.map(store => <StoreCard key={store.id} store={store} />)
          ) : (
            <p>You don't have any stores yet. Create your first store!</p>
          )}
        </div>
      </div>
    );
  }