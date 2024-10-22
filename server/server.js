import express from 'express';
import dotenv from 'dotenv';
import { notFound, errorHandler} from './middleware/errorMiddleware.js';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import postRoutes from './routes/postRoutes.js';
import path from 'path';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

// app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
// app.use(notFound);
// app.use(errorHandler);

app.use('/api/posts', postRoutes);

if (process.env.NODE_ENV === 'production') {
    // Serve static files from client/dist in production
    const buildPath = path.join(__dirname, 'client', 'dist');
    console.log('Serving static files from:', buildPath);
    
    app.use(express.static(buildPath));  // Serve static files
    console.log(path.resolve(buildPath, 'index.html'))
  
    // Catch-all handler for client-side routes (SPA)
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(buildPath, 'index.html'));  // Send index.html for any unknown routes
    });
  }

app.listen(PORT, () => {
    connectDB()
    console.log(`Server running on port ${PORT}`)
});