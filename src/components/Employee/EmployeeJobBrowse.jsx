import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllJobs } from '../../services/jobService';
import { getCategories } from '../../services/categoryService';
import { Search, MapPin, Briefcase, Calendar, Filter, X } from 'lucide-react';
import './EmployeeJobs.css';

const EmployeeJobBrowse = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isEmployer = location.pathname.startsWith('/employer');

    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        type: '',
        location: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    useEffect(() => {
        fetchData();

        // Subscribe to real-time updates
        const handleJobUpdate = () => {
            console.log("Job update received, refreshing list...");
            fetchData();
        };

        import('../../services/signalRService').then(module => {
            const signalRService = module.default;
            signalRService.connect();
            signalRService.onJobUpdate(handleJobUpdate);
        });

        return () => {
            import('../../services/signalRService').then(module => {
                const signalRService = module.default;
                signalRService.offJobUpdate(handleJobUpdate);
            });
        };
    }, [debouncedSearch, filters.category, filters.type]); // Re-fetch when debounced search or other filters change

    // Initial category fetch
    useEffect(() => {
        const fetchCats = async () => {
            const result = await getCategories();
            if (result.success) setCategories(result.data);
        };
        fetchCats();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Pass filters to getAllJobs
        const activeFilters = {
            search: debouncedSearch,
            category: filters.category,
            type: filters.type
        };

        const jobsResult = await getAllJobs(activeFilters);

        if (jobsResult.success) {
            // Client-side filtering for location (since API might not support it yet or we want mixed approach)
            // But ideally API handles it. For now, let's filter location client-side if API doesn't.
            // My API update included search (title/desc/location), category, type.
            // So 'search' param covers location too in the backend query: 
            // j.Location.Contains(search)

            // However, the UI has a separate Location input. 
            // If the user types in "Location" input, it's not passed to API 'search'.
            // I should update getAllJobs to accept location or handle it here.
            // Since I didn't add 'location' param to API, I will filter client side for location ONLY.

            let fetchedJobs = jobsResult.data;

            // Filter only approved jobs (unless employer viewing their own? No, this is Browse Jobs)
            // Actually, for Employer "All Jobs" (EmployeeJobBrowse used by Employer), they might want to see all?
            // The original code filtered: const approvedJobs = jobsResult.data.filter(job => job.isApproved);
            // Let's keep that.

            let approvedJobs = fetchedJobs.filter(job => job.isApproved);

            if (filters.location) {
                approvedJobs = approvedJobs.filter(job => job.location.toLowerCase().includes(filters.location.toLowerCase()));
            }

            setJobs(approvedJobs);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ search: '', category: '', type: '', location: '' });
    };

    const hasActiveFilters = filters.search || filters.category || filters.type || filters.location;

    return (
        <div className="employee-jobs-container">
            <div className="jobs-header">
                <div>
                    <h1>{isEmployer ? 'All Jobs' : 'Browse Jobs'}</h1>
                    <p className="subtitle">{jobs.length} opportunities available</p>
                </div>
                <button
                    className="filter-toggle-btn"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={18} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-section">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search by job title, description..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Category</label>
                            <select name="category" value={filters.category} onChange={handleFilterChange}>
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Job Type</label>
                            <select name="type" value={filters.type} onChange={handleFilterChange}>
                                <option value="">All Types</option>
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="Enter location..."
                                value={filters.location}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            <X size={16} />
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* Jobs Grid */}
            <div className="jobs-grid">
                {loading ? <p>Loading...</p> : jobs.length === 0 ? (
                    <div className="empty-state">
                        <Briefcase size={48} />
                        <h3>No jobs found</h3>
                        <p>Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    jobs.map(job => (
                        <div
                            key={job.id}
                            className="job-card"
                            onClick={() => navigate(isEmployer ? `/employer/view-job/${job.id}` : `/employee/jobs/${job.id}`)}
                        >
                            <div className="job-card-header">
                                <div>
                                    <h3>{job.title}</h3>
                                    <p className="company-name">{job.employerName}</p>
                                </div>
                                <span className="category-badge">{job.categoryName}</span>
                            </div>

                            <p className="job-description">{job.description.substring(0, 150)}...</p>

                            <div className="job-meta">
                                <span className="meta-item">
                                    <Briefcase size={16} />
                                    {job.type}
                                </span>
                                <span className="meta-item">
                                    <MapPin size={16} />
                                    {job.location}
                                </span>
                                <span className="meta-item">
                                    <Calendar size={16} />
                                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="job-footer">
                                <span className="salary">{job.salaryRange}</span>
                                <span className="applicants">{job.applicantCount} applicants</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmployeeJobBrowse;
