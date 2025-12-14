import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/adminService';
import { Plus, Edit2, Trash2, X, Search, Tag, Layers } from 'lucide-react';
import './CategoryManagement.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const result = await getCategories();
        if (result.success) {
            setCategories(result.data);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAddClick = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description || '' });
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            const result = await deleteCategory(id);
            if (result.success) {
                fetchCategories();
            } else {
                alert(result.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        let result;
        if (editingCategory) {
            result = await updateCategory(editingCategory.id, formData);
        } else {
            result = await createCategory(formData);
        }

        if (result.success) {
            setShowModal(false);
            fetchCategories();
        } else {
            alert(result.message);
        }
        setSubmitting(false);
    };

    return (
        <div className="category-management-container">
            <div className="category-header">
                <h1>Category Management</h1>
                <button className="btn-primary" onClick={handleAddClick}>
                    <Plus size={20} /> Add Category
                </button>
            </div>

            <div className="category-stats-grid">
                <div className="category-stat-card">
                    <div className="stat-icon blue">
                        <Layers size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Categories</h3>
                        <p>{categories.length}</p>
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading categories...</div>
            ) : filteredCategories.length === 0 ? (
                <div className="empty-state">
                    <Tag size={48} />
                    <h3>No categories found</h3>
                    <p>Try adjusting your search or add a new category.</p>
                </div>
            ) : (
                <div className="categories-table-container">
                    <table className="categories-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr key={category.id}>
                                    <td className="category-name">{category.name}</td>
                                    <td className="category-description">{category.description || '-'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon edit"
                                                onClick={() => handleEditClick(category)}
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                onClick={() => handleDeleteClick(category.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Category Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Software Development"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the category..."
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
