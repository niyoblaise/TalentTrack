import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, getJob, updateJob } from '../../services/jobService';
import { getCategories } from '../../services/categoryService';
import './Jobs.css';

const JobForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        salaryRange: '',
        location: '',
        type: 'Full-Time',
        deadline: '',
        categoryId: ''
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeForm = async () => {
            // Always fetch categories first
            await fetchCategories();

            // Then fetch job data if in edit mode
            if (isEditMode) {
                await fetchJob();
            }
        };

        initializeForm();
    }, [id]);

    const fetchCategories = async () => {
        const result = await getCategories();
        if (result.success) {
            setCategories(result.data);
            // Set default category only if not in edit mode and no category is set
            if (!isEditMode && result.data.length > 0 && !formData.categoryId) {
                setFormData(prev => ({ ...prev, categoryId: result.data[0].id }));
            }
        }
    };

    const fetchJob = async () => {
        const result = await getJob(id);
        if (result.success) {
            const job = result.data;
            setFormData({
                title: job.title,
                description: job.description,
                requirements: job.requirements,
                salaryRange: job.salaryRange,
                location: job.location,
                type: job.type,
                deadline: job.deadline.split('T')[0],
                categoryId: job.categoryId // This will now properly populate
            });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const apiCall = isEditMode ? updateJob : createJob;
        const args = isEditMode ? [id, formData] : [formData];

        const result = await apiCall(...args);

        if (result.success) {
            navigate('/employer/jobs');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="job-form-container">
            <h1>{isEditMode ? 'Edit Job' : 'Post New Job'}</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="job-form">
                <div className="form-group">
                    <label>Job Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="type here....."
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option>Full-Time</option>
                            <option>Part-Time</option>
                            <option>Contract</option>
                            <option>Remote</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Gatsata"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Salary Range</label>
                        <input
                            type="text"
                            name="salaryRange"
                            value={formData.salaryRange}
                            onChange={handleChange}
                            placeholder="e.g. RWF800k - RWF1.2M"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Application Deadline</label>
                    <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Requirements</label>
                    <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        rows="5"
                        placeholder="List the required skills, experience, and qualifications..."
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/employer/jobs')} className="btn-outline">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : (isEditMode ? 'Update Job' : 'Post Job')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobForm;
