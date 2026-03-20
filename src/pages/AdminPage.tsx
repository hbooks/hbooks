import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formFields, setFormFields] = useState({ title: '', content: '', image: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get('/api/admin/items'); // Replace with your API path
                setData(result.data);
            } catch (err) {
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormFields({ ...formFields, [name]: value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        // Use FormData to handle image upload
        const formData = new FormData();
        formData.append('image', file);
        axios.post('/api/admin/upload', formData)
            .then(response => setFormFields({ ...formFields, image: response.data.url }))
            .catch(err => setError('Image upload failed.'));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/items', formFields);
            // Reset form fields after successful submission
            setFormFields({ title: '', content: '', image: '' });
            // Optionally, fetch data again to refresh
            const result = await axios.get('/api/admin/items');
            setData(result.data);
        } catch (err) {
            setError('Failed to create item.');
        }
    };  

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/admin/items/${id}`);
            // Refresh data after deletion
            setData(data.filter(item => item.id !== id));
        } catch (err) {
            setError('Failed to delete item.');
        }
    };

    return (
        <div className="admin-page">
            <h1>Admin Dashboard</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="Title" onChange={handleChange} value={formFields.title} required />
                <textarea name="content" placeholder="Content" onChange={handleChange} value={formFields.content} required></textarea>
                <input type="file" accept="image/*" onChange={handleImageUpload} required />
                <button type="submit">Create Item</button>
            </form>
            <div className="item-list">
                {data.map(item => (
                    <div key={item.id} className="item">
                        <h2>{item.title}</h2>
                        <p>{item.content}</p>
                        <button onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPage;
