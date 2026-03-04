import React, { useEffect, useState } from 'react';
import './myorders.css';
import { useStore } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {
    const { url, token } = useStore();
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            setError(null);
            const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
            setData(response.data.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders. Please try again.');
            setData([]);
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            {error && <p className="error-message" style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}
            <div className="container">
                {data.length === 0 && !error && <p>No orders found.</p>}
                {data.map((order, index) => {
                    return (
                        <div key={index} className='my-orders-order'>
                            <img src={assets.parcel_icon} alt="Parcel Icon" />
                            <p>{order.items.map((item, index) => {
                                if (index === order.items.length - 1) {
                                    return item.name + " x " + item.quantity;
                                } else {
                                    return item.name + " x " + item.quantity + ", ";
                                }
                            })}</p>
                            <p>${order.amount}.00</p>
                            <p>Items: {order.items.length}</p>
                            <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                            <button onClick={fetchOrders}>Track Order</button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default MyOrders;
