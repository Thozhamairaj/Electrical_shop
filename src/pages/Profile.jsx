import { useState, useEffect } from 'react';
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
                <h1>My Profile</h1>
                <div className="profile-header">
                    <img src={user.imageUrl} alt={user.fullName} className="profile-img" />
                    <div className="profile-info">
                        <h2>{user.fullName}</h2>
                        <p>{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            placeholder="+91 1234567890"
                            value={profile.phoneNumber}
                            onChange={handleChange}
                        />
                        <small>Store your phone number for easy contact during orders.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Delivery Address</label>
                        <textarea
                            id="address"
                            name="address"
                            rows="3"
                            value={profile.address}
                            onChange={handleChange}
                            placeholder="Street, City, State, ZIP"
                        ></textarea>
                    </div>

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" disabled={saving} className="save-btn">
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
