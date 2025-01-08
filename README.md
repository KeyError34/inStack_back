API

1. auth

- register
  POST
  http://localhost:3333/api/auth/register

  // Email validation (standard)
  // Full name validation (only letters and spaces allowed)
  // Password validation (length, numbers, uppercase and special characters)

  -example
  {
  "email":"li@gmail.com",
  "fullName":"Li Fisher",
  "username":"Li55",
  "password":"125648kkkk"
  }
  -answer
  {
  "message": "User registered successfully"
  }

- login
  POST
  http://localhost:3333/api/auth/login

  -example
  {
  "email":"bob@gmail.com",
  "password":"123fff*@"
  }
  or
  {
  "username":"Bob25",
  "password":"123fff*@"
  }

  -answer
  {
  "message": "Login successful",
  "data": {
  "id": "6776d891b906666fa68062d9",
  "username": "Bob25"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NzZkODkxYjkwNjY2NmZhNjgwNjJkOSIsInVzZXJuYW1lIjoiQm9iMjUiLCJyb2xlIjoidXNlciIsImlhdCI6MTczNjE4MDA2OCwiZXhwIjoxNzM2MjIzMjY4fQ.OkQ0r8m9FCDURibd1xSm6x4xJZLQCNz5xczaX7hJbG8"
  }

2. resetPass
   - link to enter the email to which the renewal link will be sent
      - http://localhost:3333/api/request-password-reset
      
      -example
      {
        "email":"lazynyuk@gmail.com"
        
      }
      
      -answer
      {
          "message": "Reset link sent to email",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxhenlueXVrQGdtYWlsLmNvbSIsImlhdCI6MTczNjE5MTUxNywiZXhwIjoxNzM2MjM0NzE3fQ.Ap60GqusthGQIh_BdBjlPi2MiEbayAgPNP4JNb3_h9A"
      }

   - link to enter a new password

     - http://localhost:3333/api/reset-password
      
      -example
      {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxhenlueXVrQGdtYWlsLmNvbSIsImlhdCI6MTczNjE5MTUxNywiZXhwIjoxNzM2MjM0NzE3fQ.Ap60GqusthGQIh_BdBjlPi2MiEbayAgPNP4JNb3_h9A",
        "newPassword":"new564"
        
      }

      -answer
      {
          "message": "Password successfully reset"
      }

3.  Post
  - link to
    http://localhost:3333/api/post/create

   - -example

    import axios from 'axios';

    const createPost = async (content, images = [], video = null) => {
      const formData = new FormData();
      formData.append('content', content);

      // Добавляем изображения, если они есть
      if (Array.isArray(images) && images.length > 0) {
        images.forEach((image) => formData.append('images', image));
      }

      // Добавляем видео, если оно есть
      if (video) {
        formData.append('video', video);
      }

      // Проверяем, есть ли вообще файлы для загрузки
      if (!formData.has('images') && !formData.has('video')) {
        console.error('Ошибка: Нет файлов для загрузки.');
        return;
      }

      try {
        const response = await axios.post('post/create', formData, {
          headers: {
            'Authorization': Bearer ${localStorage.getItem('token')},
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Пост создан:', response.data);
      } catch (error) {
        console.error('Ошибка при создании поста:', error.response?.data || error.message);
      }
    };

    export default createPost;
     
     -answer
     {
    "user": "677c2bdbc5312806cf1036ae",
    "content": "fanny",
    "imageUrls": [
        "https://res.cloudinary.com/drwrhviwk/image/upload/v1736334038/mrg8khmtbwglikdmglr9.webp"
    ],
    "videoUrl": "",
    "likesCount": 0,
    "comments": [],
    "reposts": [],
    "_id": "677e5ad55cacd3ceb22402e8",
    "createdAt": "2025-01-08T11:00:37.923Z",
    "updatedAt": "2025-01-08T11:00:37.923Z",
    "__v": 0
    }