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
      const response = await axios.get(http://localhost:3333/post/${postId});

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
  axios.put(http://localhost:3333/post/${postId}, formData, {
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

        const response = await axios.delete(http://localhost:3333/api/post/${postId}, {
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
 
  - Like (POST)
  import axios from 'axios';

    // Функция для отправки запроса на сервер для переключения лайка
    const toggleLike = async (postId, token) => {
      try {
        const response = await axios.post(
          http://localhost:3333/api/post/${postId}/like, // Замените URL на ваш
          {},
          {
            headers: {
              Authorization: Bearer ${token}, // Если используется авторизация
            },
          }
        );
        console.log(response.data.message); // Либо используйте данные ответа
      } catch (error) {
        console.error('Error toggling like:', error.response?.data?.message || error.message);
      }
    };

    - answer

    {
    "message": "Post unliked successfully",
    "data": {
        "_id": "6787868b6532dab047cba1ad",
        "user": "677c2bdbc5312806cf1036ae",
        "content": "love",
        "imageUrls": [],
        "videoUrl": "https://res.cloudinary.com/drwrhviwk/video/upload/v1736935052/rbhxjefbdwfzpcbe77ii.mp4",
        "likesCount": 0,
        "likes": [],
        "commentsCount": 1,
        "comments": [
            "67878d08f0436e55ec43d0e9"
        ],
        "repostsCount": 0,
        "reposts": [],
        "createdAt": "2025-01-15T09:57:31.672Z",
        "updatedAt": "2025-01-15T11:21:28.209Z",
        "__v": 6
        }
    }

   - POST (reposts)
    import axios from 'axios';

    // URL API, где пост с репостом
    const apiUrl = 'http://localhost:3333/api/posts';

    const repostPost = async (postId, token) => {
      try {
        // Отправка POST-запроса с использованием axios
        const response = await axios.post(
          ${apiUrl}/${postId}/repost,  // Подставляем postId в URL
          {},
          {
            headers: {
              Authorization: Bearer ${token},  // Добавляем токен в заголовки
            },
          }
        );

        // Логируем успешный ответ
        console.log('Post reposted:', response.data);
      } catch (error) {
        // Обработка ошибок
        console.error('Error reposting post:', error.response ? error.response.data : error.message);
      }
    };
   - answer

   {
    "message": "Post reposted successfully",
    "data": {
        "_id": "6787868b6532dab047cba1ad",
        "user": "677c2bdbc5312806cf1036ae",
        "content": "love",
        "imageUrls": [],
        "videoUrl": "https://res.cloudinary.com/drwrhviwk/video/upload/v1736935052/rbhxjefbdwfzpcbe77ii.mp4",
        "likesCount": 0,
        "likes": [],
        "commentsCount": 1,
        "comments": [
            "67878d08f0436e55ec43d0e9"
        ],
        "repostsCount": 1,
        "reposts": [
            "677c2bdbc5312806cf1036ae"
        ],
        "createdAt": "2025-01-15T09:57:31.672Z",
        "updatedAt": "2025-01-15T11:48:02.341Z",
        "__v": 7
      }
     }
4. Comment

  -  POST

    import axios from 'axios';

    const addComment = async (postId, content, token) => {
      try {
        const response = await axios.post(
          http://localhost:3333/api/post/${postId}/comment, 
          { content },
          {
            headers: {
              Authorization: Bearer ${token},
            },
          }
        );
        console.log('Comment added:', response.data);
      } catch (error) {
        console.error('Error adding comment:', error.response?.data || error.message);
      }
    };

    Параметры:

    postId: ID поста, к которому добавляется комментарий.

    content: Содержимое комментария.

    token: JWT токен для аутентификации.


  - PUT

    import axios from 'axios';

    const editComment = async (commentId, content, token) => {
      try {
        const response = await axios.put(
          http://localhost:3000/api/comment/${commentId}, 
          { content },
          {
            headers: {
              Authorization: Bearer ${token},
            },
          }
        );
        console.log('Comment updated:', response.data);
      } catch (error) {
        console.error('Error updating comment:', error.response?.data || error.message);
      }
    };

    Параметры:

    commentId: ID комментария, который нужно отредактировать.

    content: Обновленное содержимое комментария.

    token: JWT токен для аутентификации.


 - DELETE

    import axios from 'axios';

    const deleteComment = async (commentId, token) => {
      try {
        const response = await axios.delete(
          http://localhost:3000/api/comment/${commentId}, 
          {
            headers: {
              Authorization: Bearer ${token},
            },
          }
        );
        console.log('Comment deleted:', response.data);
      } catch (error) {
        console.error('Error deleting comment:', error.response?.data || error.message);
      }
    };


   - POST(reply)
   import axios from 'axios';

    const toggleLike = async (commentId, token) => {
      try {
        const response = await axios.post(
          http://localhost:3333/api/comments/${commentId}/toggle-like,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: Bearer ${token},
            },
          }
        );

        console.log(response.data.message, response.data.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка при смене лайка:', error.response?.data || error.message);
      }
    };




5. User
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
  
6.Avatar 
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

7. FOLLOW 
   GET
   - mport axios from 'axios';

    const API_BASE_URL = 'http://localhost:3333/api';
    const token = 'YOUR_JWT_TOKEN';

    // Получить список подписок
    async function getFollowing() {
      try {
        const response = await axios.get(${API_BASE_URL}/following, {
          headers: { Authorization: Bearer ${token} },
        });
        console.log(response.data);
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    }

    // Получить список подписчиков
    async function getFollowers() {
      try {
        const response = await axios.get(${API_BASE_URL}/followers, {
          headers: { Authorization: Bearer ${token} },
        });
        console.log(response.data);
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    }


   - const toggleFollow = async (username: string) => {
      try {
        const response = await axios.post(/api/follow/username/${username}, {}, {
          headers: { Authorization: Bearer ${localStorage.getItem('token')} },
        });
        console.log(response.data.message);
      } catch (error) {
        console.error(error.response?.data?.message || 'Ошибка');
      }
    };

  