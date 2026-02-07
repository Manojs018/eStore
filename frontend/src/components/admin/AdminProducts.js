import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

// Mock data for initial view/fallback
const MOCK_PRODUCTS = [
    { _id: '1', name: 'Wireless Headphones', price: 199.99, category: 'Electronics', stock: 45, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
    { _id: '2', name: 'Smart Watch', price: 299.99, category: 'Wearables', stock: 30, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' },
];

const AdminProducts = () => {
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        stock: '',
        description: '',
        imageUrl: ''
    });

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            stock: product.stock,
            description: product.description || '',
            imageUrl: product.imageUrl || ''
        });
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p._id !== id));
            toast.success('Product deleted successfully');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentProduct) {
            // Update existing
            setProducts(products.map(p => p._id === currentProduct._id ? { ...p, ...formData } : p));
            toast.success('Product updated successfully');
        } else {
            // Add new
            const newProduct = {
                _id: Date.now().toString(),
                ...formData
            };
            setProducts([newProduct, ...products]);
            toast.success('Product added successfully');
        }
        setIsEditing(false);
        setCurrentProduct(null);
        setFormData({ name: '', price: '', category: '', stock: '', description: '', imageUrl: '' });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Products Management</h2>
                <button
                    onClick={() => {
                        setIsEditing(true);
                        setCurrentProduct(null);
                        setFormData({ name: '', price: '', category: '', stock: '', description: '', imageUrl: '' });
                    }}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90"
                >
                    Add Product
                </button>
            </div>

            {isEditing ? (
                <div className="bg-gray-50 p-4 rounded mb-6">
                    <h3 className="font-semibold mb-4">{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
                                <input
                                    id="price"
                                    type="number"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    id="category"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Wearables">Wearables</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="Photography">Photography</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium mb-1">Stock</label>
                                <input
                                    id="stock"
                                    type="number"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">Image URL</label>
                                <input
                                    id="imageUrl"
                                    type="url"
                                    className="w-full p-2 border rounded"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    id="description"
                                    className="w-full p-2 border rounded h-24"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90"
                            >
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                                <th className="p-3">Image</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <img src={product.imageUrl || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                    </td>
                                    <td className="p-3 font-medium">{product.name}</td>
                                    <td className="p-3 text-sm bg-blue-100 text-blue-800 w-fit px-2 py-1 rounded-full text-center inline-block my-2">{product.category}</td>
                                    <td className="p-3">${product.price}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="p-3 space-x-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
