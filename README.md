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
          
      }

   - link to enter a new password

     - http://localhost:3333/api/reset-password
      
      -example
      import axios from "axios";

      const API_URL = "http://localhost:3333/api";

      export const resetPassword = async (newPassword: string) => {
        try {
          const token = new URLSearchParams(window.location.search).get("token"); // Достаем токен прямо в запросе

          if (!token) {
            throw new Error("Token is missing from URL!");
          }

          const response = await axios.post(${API_URL}/reset-password, {
            token,
            newPassword,
          });

          return response.data;
        } catch (error) {
          throw error.response?.data?.message || "Error changing password";
        }
      };

      -answer
      {
          "message": "Password successfully reset"
      }

3.  Post
  *-* POST 
    link to create
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
        console.error('Error: No files to upload.');
        return;
      }

      try {
        const response = await axios.post('post/create', formData, {
          headers: {
            'Authorization': Bearer ${localStorage.getItem('token')},
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Post created:', response.data);
      } catch (error) {
        console.error('Error creating post:', error.response?.data || error.message);
      }
    };

    export default createPost;
     
     -answer
   {
    "message": "Post successfully created",
    "data": {
        "post_id": "6784ef30f189443ad14c61e5",
        "user": "677c2bdbc5312806cf1036ae",
        "content": "fanny",
        "imageUrls": [
            "https://res.cloudinary.com/drwrhviwk/image/upload/v1736765230/p2gd7qmnloihggvgmbtl.webp",
            "https://res.cloudinary.com/drwrhviwk/image/upload/v1736765232/ofkcwejr9f7qwoyicbzg.webp"
        ],
        "videoUrl": "",
        "likesCount": 0,
        "likes": [],
        "commentsCount": 0,
        "comments": [],
        "repostsCount": 0,
        "reposts": [],
        "_id": "6784ef30f189443ad14c61e5",
        "createdAt": "2025-01-13T10:47:12.335Z",
        "updatedAt": "2025-01-13T10:47:12.335Z",
        "__v": 0
    }
}
  *-* GET 
  http://localhost:3333/api/post/:postId

  import axios from 'axios';

  async function getPost(postId) {
    try {
      // Отправляем GET-запрос на сервер
      const response = await axios.get(http://localhost:5000/post/${postId});

      // Если запрос успешен, обработаем данные
      console.log('Post data:', response.data);
    } catch (error) {
      // Если запрос не удался, обработаем ошибку
      console.error('Error fetching post:', error.response ? error.response.data : error.message);
    }
  }

  // Пример вызова функции с postId
  getPost('your-post-id');

  - answer
  {
    "message": "Post successfully getted",
    "data": {
        "_id": "6784ef30f189443ad14c61e5",
        "user": {
            "_id": "677c2bdbc5312806cf1036ae",
            "username": "Ole34"
        },
        "content": "fanny",
        "imageUrls": [
            "https://res.cloudinary.com/drwrhviwk/image/upload/v1736765230/p2gd7qmnloihggvgmbtl.webp",
            "https://res.cloudinary.com/drwrhviwk/image/upload/v1736765232/ofkcwejr9f7qwoyicbzg.webp"
        ],
        "videoUrl": "",
        "likesCount": 0,
        "likes": [],
        "commentsCount": 0,
        "comments": [],
        "repostsCount": 0,
        "reposts": [],
        "createdAt": "2025-01-13T10:47:12.335Z",
        "updatedAt": "2025-01-13T10:47:12.335Z",
        "__v": 0
    }
   }
  *-* PUT 
    http://localhost:3333/api/post/:postId
   
  - example

  import axios from 'axios';

  // Получение JWT токена из localStorage
  const token = localStorage.getItem('jwtToken'); // Замените на ваш ключ, если он отличается

  // URL и ID поста
  const postId = '12345'; // замените на ID поста

  // Подготовка формы для отправки данных
  const formData = new FormData();
  formData.append('content', 'Новый контент для поста'); // новый контент
  formData.append('images', imageFile); // Замените imageFile на ваш файл изображения
  formData.append('video', videoFile); // Замените videoFile на ваш файл видео

  // Отправка запроса через Axios с использованием токена из localStorage
  axios.put(http://localhost:5000/post/${postId}, formData, {
    headers: {
      'Authorization': Bearer ${token},
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('Post updated:', response.data);
    })
    .catch(error => {
      console.error('Error updating post:', error.response?.data || error.message);
    });

  - answer
    {
      "message": "Post updated successfully",
      "data": {
          "_id": "6784ef30f189443ad14c61e5",
          "user": "677c2bdbc5312806cf1036ae",
          "content": "bilding",
          "imageUrls": [
              "https://res.cloudinary.com/drwrhviwk/image/upload/v1736772712/fpybsynqorjpteqwqyhi.webp"
          ],
          "videoUrl": "",
          "likesCount": 0,
          "likes": [],
          "commentsCount": 0,
          "comments": [],
          "repostsCount": 0,
          "reposts": [],
          "createdAt": "2025-01-13T10:47:12.335Z",
          "updatedAt": "2025-01-13T12:51:52.579Z",
          "__v": 1
      }
    }
  - DELETE
    http://localhost:3333/api/post/:postId

    import axios from 'axios';

    const deletePost = async (postId: string) => {
      try {
        // Получаем токен из localStorage
        const token = localStorage.getItem('jwt_token'); // предполагаем, что токен хранится под этим ключом
        
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }

        const response = await axios.delete(http://localhost:3000/api/post/${postId}, {
          headers: {
            Authorization: Bearer ${token},
          },
        });
        console.log('Post deleted successfully:', response.data);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    };

    // Пример вызова функции
    const postId = '60a4db16a2bc3d1c4f6e4e1b'; // ID поста, который нужно удалить

    deletePost(postId);

  - answer
  {
    "message": "Post and associated files deleted successfully"
  }

4. User
 -  POST (create new)
 - http://localhost:3333/api/profile 

  - example
    const createProfile = async (profileData: { age: number; bio: string }) => {
      try {
        const response = await axios.post('http://localhost:5000/profile', profileData, {
          headers: {
            Authorization: Bearer ${localStorage.getItem('token')},
          },
        }); 

        console.log('Profile created:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error creating profile:', error.response?.data || error);
      }
    };

 -  GET
 - http://localhost:3333/api/profile 

  - example
   
   import axios from 'axios';

    const getProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/profile', {
          headers: {
            Authorization: Bearer ${localStorage.getItem('token')},
          },
        });

        console.log('Profile:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error getting profile:', error.response?.data || error);
      }
    };

 -  PUT
 - http://localhost:3333/api/profile 

 - example

  const updateProfile = async (updatedData: { age?: number; bio?: string }) => {
    try {
      const response = await axios.put('http://localhost:5000/profile', updatedData, {
        headers: {
          Authorization: Bearer ${localStorage.getItem('token')},
        },
      });

      console.log('Profile updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error);
    }
  };
  
5.Avatar 
 - POST /upload-avatar
   http://localhost:3333/api/upload-avata
   +
   'Authorization': Bearer ${localStorage.getItem('token')}
   +
   file

    -example
    import axios from 'axios';

    const uploadAvatar = async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file); // 'avatar' — key for multer

      try {
        const response = await axios.post(
          'http://localhost:5000/upload-avatar',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: Bearer ${localStorage.getItem('token')}, // JWT token
            },
          }
        );
        console.log('Avatar uploaded:', response.data);
      } catch (error) {
        console.error('Avatar loading error:', error);
      }
    };

 - GET /avatar
    http://localhost:5000/api/avatar
    +
    'Authorization': Bearer ${localStorage.getItem('token')}

   -example
      const getMyAvatar = async () => {
      try {
        const response = await axios.get('http://localhost:5000/avatar', {
          headers: { Authorization: Bearer ${localStorage.getItem('token')} },
          responseType: 'blob',
        });

        return URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error getting avatar:', error);
      }
    };