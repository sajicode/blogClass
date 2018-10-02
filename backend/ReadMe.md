# Backend Server for a Blog

<b>Intro</b>

The goal here is to create APIs for a simple blogging website. These APIs can then be consumed
and manipulated on the front-end.
The database of choice is MongoDB and Mongoose ODM will be utilized in modelling the database.

<h3>Step One => Setting up the app directory</h3>

The backend folder serves as our root folder. Several subdirectories were created inside the backend directory.
These include api, config, db, and tests. Files will also be created inside the backend folder.
These files include: app.js, index.js.
Access the root folder on the command line and run <b>npm init</b> to set up the package.json file. Press the enter key
continuously until it jumps out of the script. We also have to install some packages we would need for our application.
Still in the root folder on your command line, run 
<b>npm install bcryptjs body-parser cors express jsonwebtoken mongodb mongoose morgan validator --save</b>
After that, install nodemon globally (nodemon watches for changes on our files and restarts our server once it detects changes. This prevents us from having to restart our server every time we make changes to our files). run <b>npm install -g nodemon</b> to install it. Now we don't have to install nodemon for any new application since we have installed it globally.
You should see a node_modules folder in your root directory once you're done installing the packages.

Edit your package.json file to look like what we have in our folder. Do not bother about the devDependencies since we won't be writing tests for this application.

<h3>Step Two => Setting Up mongoose connection</h3>

There will be provision for a test database which means we would have to use the PROCESS_ENV method
to determine which environment we are currently running (Test, Development or Production);

Inside your config folder, create two folders - config.json and config.js. Edit both files accordingly.

If your application will be pushed to git, ensure you ignore your config.json file since it contains sensitive info such as your secret key (more on that later).

Inside our config.js file we are currently using the process.env method to determine the current environment we are working in, we then use the current environment to loop over the keys we have in our config.json file (test and development) and sets their contents on process.env. So if whether we are in the test or development environment, we can call process.env.PORT use our port or process.env.SECRET to use our secret;

The next step is to edit our mongoose.js file inside the db folder. The commented line in the mongoose.js file is what we could have used if we had to work with just one database.
We use mongoose to connect to our mongodb database so this simply means we are connecting to our mongodb on localhost, listening on port 27017 and our database should be named <b>blog</b>. For the purpose of test however, since we have a similar line in our config.json, all we need to do is call process.env.MONGODB_URI inside our mongoose.connect(remember we have set the properties on process.env). We  then export mongoose as an object since we have to use the connection in other files.

<h3>Step Three => Setting up our API directory and app.js and index.js files.

Inside our api directory, create several folders (auth, controllers, models, routers) and a file (api.js).
Our database models (Schema) will be stored inside files in the models directory, our controllers (functions) in the controllers directory, our routes in the routers directory and our authentication middleware in the auth directory


<h4>userModel.js</h4>

Create a file called userModel.js inside the models folder. This will hold our User Schema - The properties every user must possess when creating a new user.

According to our file, or Usermodel will have name, email, password and tokens properties. The first three will be input manually when creating a user while the tokens will be added automatically (more on that later);

We have to require several of our 3rd party libraries (mongoose, validator, jsonwebtoken, bcryptjs)

There is a Schema method on mongoose which we require and pass into variable Schema. Our database model is structured inside the schema.

We would also add several methods to our UserSchema. This methods can be called wherever we require the User model.

The first method (UserSchema.methods.generateAuthToken) will be responsible for creating a new token once a new user is reigistered and whenever a registered user logs in. Inside the method (function), we require the instance of a user (this) and pass it into variable user;
we also set a variable access to 'auth (this represents the access in our tokens method). Next, we create a token variable which would hold our created token and we create our token by running jwt.sign(). jwt holds our jsonwebtoken library. jwt.sign takes a a minimum of two arguments - 
- the id of the current user and then access (we passed access in because of the structure of our tokens property in the UserSchema, normally, its not required).
- a secret string (notice we just called process.env.SECRET to get the secret string in our package.json file).
- an optional <b>expiresIn</b> property which is used to give the created tokens an expiry date (read up on that).

The next step was to push the access and our created token into our tokens array (inside the UserSchema), we then save the user and return the token and the particular user.

The second method (UserSchema.statics.findByToken) is a static method (can only be called by the parent class). It takes an argument of token (this means the code can only work with users that have been registered). We then call the instance of the User class (this) and pass it to variable User. We also create a variable decoded which holds no value initially.
We use a try..catch to factor in the possibility of running the function on an unregistered user. Inside the try block, using jwt, we verify the passed in token against our secret, and if a user registered user with that token exists, we the decoded token into the variable decoded. However, if the user is invalid (unregistered), we catch whatever error is thrown to prevent our code from breaking (you can console.log(e) inside the catch block to see whatever error is being thrown).
Next, we use the mongoose method 'findOne' to get a user based on the decoded token's id, token and access and we also return the user.

The third method (UserSchema.statics.findByCredentials) is also a static method which takes two parameters(email and password). This method is used whenever a user is about to login, hence, it is used for verification.
We first pass an instance of our User class to variable User. We then use User.findOne passing in the email in order to check if a user with that particular email exists. This method will return a user if it finds one.
The if(!user) block means it should throw a Promise.reject() if it finds no user. If it does find a user, the user argument inside the .then((user)) will hold all the properties of that particular user. The next step is to decode the password of the user since we will be saving a hashed password (more on that later). In order to do this, we return a new Promise which takes the usual parameters (resolve and reject), we then use bcryptjs (which we pass into variable bcrypt) to compare the password we passed into the fiindByCredentials function against the password we have in our database. bcrypt.compare is used for this. The bcrypt.compare method takes three parameters - the password we passed into our function, the password from the user we returned (it is hashed) and a callback function which takes two arguments (err, res) depicting error and response respectively. Inside the function, we check if there was a response and if there was, we tell it to resolve the user (return the user), if there was no response, we tell it to reject the promise.

The fourth method is more of a middleware. We are simply telling the program that before every new user is saved run a function which will hash our password. This function takes just one parameter - next (remember middlewares?). Inside the function, we call an instance of a user and pass it into variable user. We then say that once that user's password is modified, generate a salt with bcrypt.genSalt (the first argument is the number of rounds it should run in order to generate a salt and then a callback function holding an err and a generated salt).
bcrypt.hash is then used to hash the password, it takes three parameters - the password we passed into the findByCredentials function, the returned user's password (remember the user we returned when we did bcrypt.compare??) and a callback function which holds an error and the hashed password. If a hashed password is returned, we set the value of the returned user's password to be the hash and then invoke next (because middleware!). The else statement means if the user's password is not modified, don't do anything, just go to the next middleware or function by invoking next()

At the bottom of our UserModel.js file, we used the model method on mongoose to create our User model and then pass it to a variable called User. mongoose.model() takes two arguments - the collection name (remember collection == tables) and our Schema (UserSchema);

we export the User as an object since we would be using it in other files


<h4>Auth.js</h4>

Create an Auth.js file in the auth directory. The Auth.js file is going to hold our autentication middleware. In order to make use of the Auth middleware, we just need to pass the function in our routers (more on that later).
We first require our User model. We then create a variable authenticate which takes three parameters - req, res, next - depicting request, response and next(middleware). Inside the function, we require an x-auth property which is supposed to be on request.header (this means any time we run a function which uses the authenticate method, we have to pass an x-auth property inside our request header with the value being our token, more on that later).
The next step is to call the findByToken method (remember it can only be called on the main class!). The findByToken is supposed to return a user (check findByToken method inside userModel.js). Now, if no user is returned (which means a token wasn't passed or the user is not registered, the promise is rejected), however, if a user is returned, we set a that user (along with its properties) on the request object (yes, we can do that), we also set the token on the request object. This is sort of like passing information via Session in PHP. We then call a next() so that the program can move to the next function or middleware. However, if the user doesn't exist (not authenticated) we call a catch and send back a status of 401 and a message saying "Invalid user". We do not call next because we do not want an unauthenticated user to have access to the next function or middleware after authentication. We export the authenticate function so we can use it in our routes.

<h4>userController.js</h4>

Inside the userController.js file, we would be requiring our userModel file and the ObjectID method from mongodb. The purpose of the ObjectID is to help us validate a user's ID (checks if that ID exists).

- Add a new user
we create and export our addUser function. It takes two parameters (req and res) depicting request and response. Now inside the function, the request (req) has a header and a body property. Everything we input in our form or postman (as a backend developer) resides inside req.body. Now, remember that for each user you create, you have to pass in a name, email and password while the token is automatically generated? Towing that line, the name, email and password we input are all in data and were simply passed as arguments when calling an instance of the User class. After this we proceed to save the new user after which we generate a token for the new user (remember generateAuthToken returns a token). We then tell the program to send back the token for us inside our response header with a property of x-auth while the created user is also sent back.

Before we go on to the next function in user controller, let us pass our function to a route and test it in post man.

<h4>userRouter.js</h4>

Inside this file, we require express, since we would be using the express router, we also require the userController including the authenticate function from our Auth.js file.
Our first route will be for when a user accesses /register on the webpage or on postman. Because we would be posting data (user name, email and password), we use a post method, and inside the post method, we call the addUser function on the user controller. This simply means that any time the /register route is accessed, the addUser function should be called.
We then export our router so it can be used in our next file - api.js

<h4>Api.js</h4>

Inside our api.js file we require our express library, we also invoke the express router and pass it to variable api. api will now serve as a router. We also require our userRouter.js file. 
We then set our user router on another route (/users);
We then export api.

<h4>App.js</h4>

we require our express library once again, we then invoke the express library and pass it to variable app, which means every method on express is now present in app. We also require some of our dependencies (body-parser, morgan and cors).

- body-parser is responsible for parsing the contents of an incoming request. body-parser.urlencoded parses the text as incoming data which is how browsers tend to send form data and exposes the resulting object on req.body (makes sense?). The object consists of keys and values.
body-parser.json parses the text as json and exposes the resulting object on req.body.

- morgan logs every request made to the server on our console.

- cors (cross-origin resource sharing) is a mechanism that uses additional HTTP headers to tell a browser to let a web application running at one origin (domain) have permission to access selected resources from a server at a different origin such as consuming an external api.

whenever we call app.use, it means we want to use express (now within app) to make use of these external libraries as middlewares. In essence, app.use takes a middleware as its argument.

we also pass a simple router middleware (/api) which links to our api file. this simply means when we want to access a particular controller e.g. addUsers, we have to call (for windows users), localhost:port/api/users/register (api from app.js, users from api.js and register from userRouter.js).
We then pass a middleware function to detect any server error and send it back to us before going on to the next middleware.
we export app for use in our index.js file.

<h4>Index.js</h4>

Our server will be started from the index.js file, so any time we run <b>npm start</b>, the command "nodemon index.js" is run thereby starting our server. To test it in postman (remember to start your mongodb server using mongod), check image_1 and image_2. Enter the details accordingly and click "send". You should see a result like that of image_3. The returned object is the created user along with its properties.

- Login a user => exports.loginUser

- In our userController.js file we use the findByCredentials method passing in the required arguments - email and password. Remember this will be a post method, since we will be sending an email and a password, and so how email will be on req.body.email while password will be on req.body.password. findByCredentials returns a user (check userModel.js), we then generate a new token for the logged in user, which means the tokens array will now have two objects containing two different tokens. we then tell the program to return the created token in our response header and also our logged in user. 

- In our userRouter.js file, we add a router for the loginUser function => router.route('/login).

For postman demo, check image_4, image_5 shows the response body while image_6 shows the response header (the returned token is highlighted)

- Get a single user => exports.getUser

- In order to get a single user's details, we would need to use a parameter to specify the user we want. we would be using the user's id. In our userRouter.js file, the route for  getting a new user is router.route('/:id).get(authenticate, userController.getUser). First, remember what authenticate function returns? (check Auth.js). Now we would leverage whatever our authenicate function returns inside our userController.getUser function. The :id on the route is a placeholder which means whenever we want to run it on postman, we would be passing an extra parameter (the user id) and so it will look like localhost:port/api/users/userid;

The id we pass along will be stored on our req.params.id (note: if the placeholder was :geek, the extra parameter will be accessed on req.params.geek). We then use the mongoose method - findById to search for a user who has the id we passed and the user is returned to us if found.

To test this in postman (make sure you have added the route in userRouter.js) copy the id of a registered user from your database and add behind the route in postman and then copy the same user's token (just one token not both) and inside the header, create an x-auth key and paste the token inside the value, you should see a returned user so far the user is registered - image_7.

- fetch all registered users => exports.fetchUsers

This method doesn't require any parameter when sending the request since we are getting all the users we have in our database. calling User.find({}) means we are looking for all instances of a user in our database which are then returned to us if found. Remember to set the route in the userRouter.js file and also pass the user token inside the x-auth key in the request header. check image_8.

- edit a user => exports.editUser

To edit a user, we also require a parameter(id) to specify the user we want to edit. Our request data is on req.body which we pass to variable data. We use the mongoose method findByIdAndUpdate. This takes in the id we want to update {_id: id}, the data we want to update {$set: data}, and new {new: true} which returns the updated user. image 9 and 10

- remove a user => exports.deleteUser
You should be able to get the logic from the function. the deleted is user is returned - image_11


<h3>Posts</h4>

You should have a good idea about the flow of the project by now. For our posts, only the authenticated users can create, view, edit or delete posts. Our PostSchema is quite simple, it is made up of just a title, content, createdAt and author properties. The title and content will be inserted whenever we call an instance of the Post model, the createdAt property is filled with the aid of the JavaScript Date Object and so the date is saved whenever an instance of Post is called. The author is gotten from our req.user (remember when we set our user on the request object in Auth.js, like session?). This means, once the user is authenticated, the user is stored on the request object and a particular logged in user, we can then access the user's id (which is what is required inside our PostSchema). This way every new post will be assigned to any author signed in (authenticated) at that moment.

We pass our controller to the postRouter.js file
- To add a post - image_12 and image_13

- fetchposts fetches all the posts associated with a logged in user. image_14

- getPost gets a single post according to its id, this means its the post id we would pass as the extra parameter on the url - image_15.

- updatePost updates a post according to its id - image_16, image_17 and image_18. Access the fetchposts route to confirm the post has been updated or check your database

- deletePost deletes a post according to its id - image_19

At this point you should be able to figure out how the comments part work. Cheers.