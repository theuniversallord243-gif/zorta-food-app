// Simple Mock Store
// In a real app, this would be a database or context
// We'll use this generic object to simulate a db

export const MOCK_DB = {
    outlets: [],
    orders: [],
    currentUser: null
};

export const createOutlet = (data) => {
    const newOutlet = {
        id: 'outlet_' + Date.now(),
        ...data,
        menu: [],
        createdAt: new Date().toISOString()
    };
    MOCK_DB.outlets.push(newOutlet);
    return newOutlet;
};

export const getOutlet = (id) => {
    return MOCK_DB.outlets.find(o => o.id === id);
};

export const createOrder = (order) => {
    const newOrder = {
        id: 'ord_' + Math.floor(Math.random() * 10000),
        status: 'New', // New, Processing, Ready, Completed, Cancelled
        createdAt: new Date().toISOString(),
        ...order
    };
    MOCK_DB.orders.push(newOrder);
    return newOrder;
};
