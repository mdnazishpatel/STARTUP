const User = require('../schemas/UserSchema');

const checkIdeaLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user can create more ideas
    if (!user.canCreateIdea()) {
      return res.status(403).json({
        success: false,
        error: `You've reached your idea limit! Free users can create up to ${user.maxIdeas} ideas.`,
        details: {
          current: user.ideaCount,
          max: user.maxIdeas,
          remaining: 0,
          isPremium: user.premium,
          upgradeRequired: true
        }
      });
    }
    
    // Add user to request for controller use
    req.userInfo = user;
    next();
    
  } catch (error) {
    console.error('Error in checkIdeaLimit middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking idea limits'
    });
  }
};

module.exports = checkIdeaLimit;