const Activity = require('../models/Activity');

const logActivity = async (userId, action, details = '') => {
    try {
        await Activity.create({
            user: userId,
            action,
            details
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = logActivity;
