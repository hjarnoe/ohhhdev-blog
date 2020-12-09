module.exports = (req, res) => {
	res.session.destroy(() => {
		res.redirect('/')
	})
}