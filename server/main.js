const MongoClient = require('mongodb').MongoClient;
const GridFSBucket = require('mongodb').GridFSBucket;
const { Readable } = require('stream');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const multer = require('multer');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());



const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'PROD';
const SERVER_DOMAIN = 'http://localhost:3000';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: false },
  password: { type: String, required: true },
  images: { type: Array, required: false },
  sessions: [{ type: String, required: false }],
});

const User = mongoose.model('User', UserSchema);
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' }
});

const Session = mongoose.model('Session', sessionSchema);
// Connect to MongoDB
const LOCAL_MONGO_URL = 'mongodb://localhost:27017/mydb';
const MONGO_URL = ENVIRONMENT === 'PROD' ? process.env.MONGO_URL : LOCAL_MONGO_URL;
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log('MongoDB connected!');
});


// ASYNC FUNCTION TO UPLOAD FILE
async function main() {
  const storage = multer.memoryStorage();
  const url = ENVIRONMENT === 'PROD' ? process.env.MONGO_URL : 'mongodb://localhost:27017';
  const dbName = 'mydb';

  const connectToMongo = async () => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    return { client, db, bucket };
  };

  const { client, db, bucket } = await connectToMongo();
  const upload = multer({ storage });

  app.post('/upload', upload.single('image'), async (req, res) => {
    const { token, title, image } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    console.log(req);
    console.log(req.file)
    try {
      const readableStream = new Readable();
      readableStream.push(req.file.buffer);
      readableStream.push(null);
      const ownerId = token;
      const uploadStream = bucket.openUploadStream(req.file.originalname, { metadata: { ownerId, title } });
      readableStream.pipe(uploadStream);
      uploadStream.on('error', (error) => {
        console.log('Error uploading image:', error);
        res.status(500).send('Error uploading image');
      });

      uploadStream.on('finish', () => {
        console.log('Image uploaded successfully');
      });

      const images = await db.collection('images.files').find({ 'metadata.ownerId': ownerId }).toArray();
      console.log(images);
      const imageNames = images.map(image => `http://localhost:3000/images/${image.filename}`);
      console.log(imageNames);
      const user = await Session.findOne({ sessionId: token });
      const userFromUser = await User.findOne({ email: user.userEmail });
      userFromUser.images = imageNames;
      await userFromUser.save().then(() => console.log('User updated'));
      console.log(userFromUser);
      res.status(200).json({ message: 'Image uploaded successfully' });
    } catch (error) {
      console.log('Error uploading image:', error);
      res.status(500).send('Error uploading image');
    }
  });

  app.get('/images/:filename', async (req, res) => {
    try {
      const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
      downloadStream.pipe(res);
      downloadStream.on('error', (error) => {
        console.log('Error serving image:', error);
        res.status(500).send('Error serving image');
      });
    } catch (error) {
      console.log('Error serving image:', error);
      res.status(500).send('Error serving image');
    }
  });
  app.get('/images/owner/:ownerId', async (req, res) => {
    try {
      const images = await db.collection('images.files').find({ 'metadata.ownerId': req.params.ownerId }).toArray();
      var response = {};
      var imageNames = [];
      images.forEach(image => {
        imageNames.push(
          SERVER_DOMAIN + '/images/' + image.filename
        );
      }
      );
      response['images'] = imageNames;
      response['ownerId'] = req.params.ownerId;
      response['count'] = imageNames.length;
      res.status(200).json(response);


    } catch (error) {
      console.log('Error getting images:', error);
      res.status(500).send('Error getting images');
    }
  });

  app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    try {

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      // Hash the password and create the user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
      res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user' });
    }
  });
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      // Find the user with the given email
      const user = await User.findOne({ email });
      console.log(user);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      // Check if the password is correct
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      // Set the session ID as a cookie and store the user email in the session
      req.session.userId = user._id;
      req.session.userEmail = user.email;
      // Generate a random session ID and store it in the sessions collection
      const sessionId = require('crypto').randomBytes(16).toString('hex');
      // await Session.create({ sessionId, userEmail: user.email });
      // check if session exists
      const checkSession = await Session.findOne({ userEmail: user.email });
      if (checkSession) {
        await Session.updateOne({ userEmail: user.email }, { sessionId: sessionId });
      } else {
        await Session.create({ sessionId, userEmail: user.email });
      }

      // Set the session ID as a cookie with secure and httpOnly flags
      res.cookie('sid', sessionId, { maxAge: 3600000, httpOnly: true, secure: true });
      console.log('Cookie set successfully!');
      // Send a response back to the client with the session ID cookie
      res.status(200).send({ message: 'Login successful', token: sessionId }); // Send the session ID as a response 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error logging in' });
    }
  });

  // status
  app.post('/status', async (req, res) => {
    const { token } = req.body;
    try {
      // Find the session with the given session ID
      const userWithThisSession = await Session.findOne({ sessionId: token });
      console.log(userWithThisSession);
      if (!userWithThisSession) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      console.log(userWithThisSession);
      res.status(200).json({ message: 'User is logged in' });
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error logging in' });
    }
  });

  app.get('/userdata', async (req, res) => {
    console.log(req.headers);
    const { token } = req.headers;
    console.log(token);
    const userWithThisSession = await Session.findOne({ sessionId: token });
    console.log(userWithThisSession);
    if (!userWithThisSession) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const user = await User.findOne({ email: userWithThisSession.userEmail });
    res.status(200).json({ name: user.name, email: user.email, images: user.images });
  })

  app.post('/logout', async (req, res) => {
    const { token } = req.body;
    try {
      const userWithThisSession = await Session.findOneAndDelete({ sessionId: token });
      if (!userWithThisSession) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error logging out' });
    }
  });

  app.get('/', async (req, res) => {
    if (req.session.userId && req.session.userEmail) {
      console.log('User is logged in');
      res.send('User is logged in');
    } else {
      console.log('User is not logged in');
      res.send('User is not logged in');
    }
  });



  app.listen(PORT, () => {
    console.log('Server listening on port 3000');
  }
  )

}
main().then(() => console.log('Application started')).catch(err => { console.error(err) });

export default app;