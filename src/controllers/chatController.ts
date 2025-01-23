
import { Socket } from 'socket.io';
import User, { IUser } from '../models/User';
import Chat, { IChat } from '../models/Chat';
import Message from '../models/Message';
import { Types } from 'mongoose';

class MessengerController {
  private io: any;
  private users: Map<string, Socket> = new Map();

  constructor(io: any) {
    this.io = io;
  }

  // Регистрация пользователя
  public connectUser(socket: Socket): void {
    socket.on('register', (username: string) => {
      this.users.set(username, socket);
      socket.data.username = username; // Сохраняем username в data сокета
      console.log(`${username} подключен.`);
    });
  }

  // Создание чата
  public async createChat(socket: Socket, { currentUsername, otherUsername }: { currentUsername: string; otherUsername: string }): Promise<void> {
    try {
      // Проверяем наличие текущего пользователя
      const currentUser = await User.findOne({ username: currentUsername });
      if (!currentUser) {
        socket.emit('error', 'Current user not found');
        return;
      }

      // Проверяем наличие другого пользователя
      const otherUser = await User.findOne({ username: otherUsername });
      if (!otherUser) {
        socket.emit('error', 'Other user not found');
        return;
      }

      // Создаем или получаем существующий чат
      const chat = await this.createChatBetweenUsers(currentUser._id, otherUser._id);

      // Подключаем сокеты обоих пользователей к комнате чата
      socket.join(chat._id.toString());
      const otherUserSocket = this.users.get(otherUser.username);
      if (otherUserSocket) {
        otherUserSocket.join(chat._id.toString());
      }

      // Уведомляем пользователей о создании чата
      socket.emit('chatCreated', chat);
      if (otherUserSocket) {
        otherUserSocket.emit('chatCreated', chat);
      }

      console.log(`Чат создан между ${currentUsername} и ${otherUsername}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      socket.emit('error', 'Error creating chat');
    }
  }

  // Метод для создания нового чата или получения существующего
  public async createChatBetweenUsers(userId1: Types.ObjectId, userId2: Types.ObjectId): Promise<IChat> {
    const existingChat = await Chat.findOne({
      participants: { $all: [userId1, userId2] },
    });

    if (existingChat) {
      return existingChat;
    }

    const newChat = new Chat({
      participants: [userId1, userId2],
    });

    return await newChat.save();
  }

  // Отправка сообщения
  public async sendMessage(socket: Socket, { chatId, messageContent }: { chatId: string; messageContent: string }): Promise<void> {
    const currentUsername = socket.data.username; // Берем username текущего пользователя из сокета

    if (!currentUsername) {
      socket.emit('error', 'User not authenticated');
      return;
    }

    try {
      const chat = await Chat.findById(chatId) as IChat;
      if (!chat) {
        socket.emit('error', 'Chat not found');
        return;
      }

      // Находим текущего пользователя
      const currentUser = await User.findOne({ username: currentUsername });
      if (!currentUser) {
        socket.emit('error', 'Current user not found');
        return;
      }

      // Находим получателя сообщения
      const receiver = chat.participants.find((p) => !p.equals(currentUser._id));
      if (!receiver) {
        socket.emit('error', 'Receiver not found in chat');
        return;
      }

      const message = new Message({
        content: messageContent,
        sender: currentUser._id,
        receiver: receiver,
        chat: chat._id,
      });

      await message.save();

      // Отправляем сообщение всем участникам чата
      this.io.to(chat._id.toString()).emit('newMessage', {
        sender: currentUsername,
        content: message.content,
        createdAt: message.createdAt,
      });


console.log(`Новое сообщение от ${currentUsername}: ${message.content}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Error sending message');
    }
  }
}

export default MessengerController;