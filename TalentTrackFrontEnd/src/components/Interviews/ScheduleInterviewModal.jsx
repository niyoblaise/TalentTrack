import React, { useState } from 'react';
import { scheduleInterview } from '../../services/interviewService';

const ScheduleInterviewModal = ({ applicationId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        scheduledDate: '',
        meetingLink: '',
        location: 'Remote'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (new Date(formData.scheduledDate) <= new Date()) {
            setError('Interview date must be in the future.');
            setLoading(false);
            return;
        }

        const payload = {
            applicationId: parseInt(applicationId),
            ...formData
        };

        const result = await scheduleInterview(payload);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Schedule Interview</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Date & Time</label>
                        <input
                            type="datetime-local"
                            name="scheduledDate"
                            value={formData.scheduledDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Meeting Link / Location</label>
                        <input
                            type="text"
                            name="meetingLink"
                            value={formData.meetingLink}
                            onChange={handleChange}
                            placeholder="https://zoom.us/..."
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Scheduling...' : 'Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleInterviewModal;
