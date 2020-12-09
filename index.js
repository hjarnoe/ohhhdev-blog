const   { config, engine } = require('express-edge'),
		express = require('express'),
		edge = require("edge.js"),
		{ port, mongodb } = require('./sources/config'),
		mongoose = require('mongoose'),
		bodyParser = require('body-parser'),
		fileUpload = require('express-fileupload'),
		expressSession = require('express-session'),
		connectFlash = require("connect-flash"),
		connectMongo = require('connect-mongo');

// =========== Controllers ===========
const   createPostController = require('./controllers/createPost'),
	homePageController = require('./controllers/homePage'),
	storePostController = require('./controllers/storePost'),
	getPostController = require('./controllers/getPost'),
	createUserController = require('./controllers/createUser'),
	storeUserController = require('./controllers/storeUser'),
	loginController = require("./controllers/login"),
	loginUserController = require('./controllers/loginUser'),
	logoutController = require("./controllers/logout");
// ===========             ===========

const app = express();
const mongoStore = connectMongo(expressSession);

// =========== Configure Edge ===========
config({ cache: process.env.NODE_ENV === 'production' });
// ===========                ===========

// =========== Connect to MongoDB ===========
mongoose.connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => 'You are now connected to Mongo!')
	.catch(err => console.log('Something went wrong', err));

app.use(connectFlash());
app.use(expressSession({
	secret: 'secret',
	resave: false,
	saveUninitialized: true,
	store: new mongoStore({
		mongooseConnection: mongoose.connection
	})
}));
app.use(fileUpload());
app.use(express.static('public'));
app.use(engine);
app.set('views', `${__dirname}/views`);
app.use('*', (req, res, next) => {
	edge.global('auth', req.session.userId)
	next()
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =========== Middleware ===========
const   storePost = require('./middleware/storePost'),
		auth = require("./middleware/auth"),
		redirectIfAuthenticated = require('./middleware/redirectIfAuthenticated');
// ===========            ===========

app.use('/posts/store', storePost);

// =========== Routes ===========
app.get("/", homePageController);
app.get("/post/:id", getPostController);
app.get("/posts/new", auth, createPostController);
app.post("/posts/store", auth, storePost, storePostController);
app.get('/auth/login', redirectIfAuthenticated, loginController);
app.post('/users/login', redirectIfAuthenticated, loginUserController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.get("/auth/logout", redirectIfAuthenticated, logoutController);

app.listen(port, () => console.log(`App listening on port ${port}`));