import express, { Application } from 'express';
import cors from 'cors';
import http from 'http';
import socketIo from 'socket.io';
import connectDB from './config/db';
import authRouter from './routes/authRouter';
import resetPasswordRouter from './routes/passwordResetRouter';
import postRouter from './routes/postRouter';
import userRouter from './routes/userRouter';
import avatarRouter from './routes/avatarRouter';
import commentRouter from './routes/commentRouter';
import followRouter from './routes/followRouter';
import MessengerController from './controllers/chatController';
import cookieParser from 'cookie-parser';
class AppServer {
  private app: Application;
  private port: number;
  private server: http.Server;
  private io: socketIo.Server;
  private messengerController: MessengerController;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;
    this.server = http.createServer(this.app);
    this.io = new socketIo.Server(this.server, {
      cors: {
        origin: '*',  
        credentials: true, 
      },
    });
    this.messengerController = new MessengerController(this.io);

    this.initializeDatabase();
    this.setMiddlewares();
    this.setRoutes();
    this.setSocketEvents();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed: ', error);
    }
  }

  private setMiddlewares(): void {
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser()); 
  }

  private setRoutes(): void {
    this.app.use('/api/auth', authRouter);
    this.app.use('/api', resetPasswordRouter);
    this.app.use('/api/post', postRouter);
    this.app.use('/api', userRouter);
    this.app.use('/api', avatarRouter);
    this.app.use('/api', commentRouter);
    this.app.use('/api', followRouter);
  }

  private setSocketEvents(): void {
    this.io.on('connection', (socket) => {
      console.log('User connected');
      this.messengerController.connectUser(socket);

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  }
  public startServer(): void {
    this.server.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }
}

const app = new AppServer();
app.startServer();