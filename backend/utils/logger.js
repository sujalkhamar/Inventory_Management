const Activity = require('../models/Activity');

const logActivity = async (userId, action, details = '', referenceId = null) => {
    try {
        await Activity.create({
            user: userId,
            action,
            details,
            referenceId
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = logActivity;
