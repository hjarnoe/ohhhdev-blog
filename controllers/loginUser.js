const   bcrypt = require('bcrypt'),
		User = require('../database/models/User');

module.exports = (req, res) => {
	const {
		email,
		password
	} = req.body;
	
	// Try to find the user
	User.findOne({
		email
	}, (error, user) => {
		if (user) {
			// Compare passwords
			bcrypt.compare(password, user.password, (error, same) => {
				if (same) {
					// Store user session
					req.session.userId = user._id
					res.redirect('/')
				} else {
					res.redirect('/auth/login')
				}
			})
		} else {
			return res.redirect('/auth/login')
		}
	})
}