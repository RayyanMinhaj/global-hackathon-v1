import React, { useState } from 'react';
import { useAppData, useLoading, useShowNotification, useNotification } from '../hooks';

const Home: React.FC = () => {
  const {
    data,
    setData,
    searchQuery,
    setSearchQuery,
    filteredData,
    selectedItem,
    setSelectedItem
  } = useAppData();
  const [isLoading, setIsLoading] = useLoading();
  const showNotification = useShowNotification();
  const notification = useNotification();
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      showNotification({
        type: 'error',
        message: 'Please enter a valid item name'
      });
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: newItemName,
      createdAt: new Date().toISOString()
    };

    setData([...data, newItem]);
    setNewItemName('');
    showNotification({
      type: 'success',
      message: `Added "${newItemName}" successfully!`
    });
  };

  const handleDeleteItem = (id: string) => {
    const item = data.find(item => item.id === id);
    setData(data.filter(item => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    showNotification({
      type: 'success',
      message: `Deleted "${item?.name}" successfully!`
    });
  };

  const loadSampleData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sampleData = [
      { id: '1', name: 'Sample Item 1', category: 'Category A' },
      { id: '2', name: 'Sample Item 2', category: 'Category B' },
      { id: '3', name: 'Sample Item 3', category: 'Category A' },
      { id: '4', name: 'Sample Item 4', category: 'Category C' },
    ];
    
    setData(sampleData);
    setIsLoading(false);
    showNotification({
      type: 'success',
      message: 'Sample data loaded successfully!'
    });
  };

  return (
    <div className="page">
      <h1>Welcome to the Hackathon App</h1>
      <p>This is the home page showcasing Jotai state management.</p>
      
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="features">
        <h2>Features</h2>
        <ul>
          <li>React Router for navigation</li>
          <li>Flask backend with logging</li>
          <li>Modern UI with CSS</li>
          <li>TypeScript support</li>
          <li>✨ Jotai state management</li>
        </ul>
      </div>

      <div className="data-management">
        <h2>Data Management Demo</h2>
        
        <div className="controls">
          <button 
            onClick={loadSampleData} 
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Loading...' : 'Load Sample Data'}
          </button>
          
          <div className="add-item">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter item name"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <button onClick={handleAddItem} className="btn-secondary">
              Add Item
            </button>
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="search-input"
          />
        </div>

        <div className="data-display">
          <h3>Items ({filteredData.length})</h3>
          {filteredData.length === 0 ? (
            <p>No items found. Add some items or load sample data.</p>
          ) : (
            <ul className="item-list">
              {filteredData.map((item) => (
                <li 
                  key={item.id} 
                  className={`item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <span>{item.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedItem && (
          <div className="selected-item">
            <h3>Selected Item</h3>
            <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
