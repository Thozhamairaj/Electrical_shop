import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { userService } from '../services/userService';
import './Profile.css';

const Profile = () => {
    const { isLoaded, isSignedIn, user } = useUser();
    const [profile, setProfile] = useState({
        name: '',
        phoneNumber: '',
        address: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            if (isLoaded && isSignedIn && user) {
                try {
                    const data = await userService.getUserProfile(user.id);
                    if (data) {
                        setProfile({
                            name: data.name || user.fullName || '',
                            phoneNumber: data.phoneNumber || '',
                            address: data.address || '',
                        });
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProfile();
    }, [isLoaded, isSignedIn, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await userService.updateUserProfile(user.id, profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (!isLoaded || loading) {
        return <div className="profile-loading">Loading...</div>;
    }

    if (!isSignedIn) {
        return <div className="profile-error">Please sign in to view your profile.</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header-premium">
                    <div className="avatar-wrapper">
                        <img src={user.imageUrl} alt={user.fullName} className="profile-img-premium" />
                        <div className="avatar-ring"></div>
                    </div>
                    <div className="profile-header-text">
                        <h1>My Profile</h1>
                        <p className="profile-email-sub">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form-premium">
                    <div className="profile-section">
                        <div className="section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <h3>Personal Information</h3>
                        </div>
                        <div className="form-group-premium">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <div className="section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            <h3>Contact Details</h3>
                        </div>
                        <div className="form-group-premium">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <div className="input-with-icon">
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder="+91 12345 67890"
                                    value={profile.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                            <small className="form-help-text">Used for order delivery and contact.</small>
                        </div>
                    </div>

                    <div className="profile-section">
                        <div className="section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <h3>Shipping Address</h3>
                        </div>
                        <div className="form-group-premium">
                            <label htmlFor="address">Default Address</label>
                            <textarea
                                id="address"
                                name="address"
                                rows="3"
                                value={profile.address}
                                onChange={handleChange}
                                placeholder="Street, City, State, ZIP"
                            ></textarea>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`message-premium ${message.type}`}>
                            {message.type === 'success' ? '✓ ' : '✕ '}
                            {message.text}
                        </div>
                    )}

                    <div className="profile-actions">
                        <Link to="/my-reviews" className="save-btn-premium profile-reviews-link">
                            View My Reviews
                        </Link>
                        <button type="submit" disabled={saving} className="save-btn-premium">
                            {saving ? (
                                <span className="btn-loader"></span>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
