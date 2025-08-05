import axios from 'axios';

const API_BASE_URL = 'https://saglikta-7d7a2dbc0cf4.herokuapp.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * Tüm gönderileri (chat'leri) yorumlarıyla birlikte getirir
 * @returns {Promise<Array>} Gönderi listesi
 */
export const getAllChats = async () => {
  try {
    console.log('Tüm gönderiler getiriliyor...'); // Debug için
    const response = await api.get('/chats/getAllChat');
    console.log('Gönderiler başarıyla alındı:', response.data?.length, 'adet'); // Debug için
    return response.data || [];
  } catch (error) {
    console.error('Gönderiler yüklenirken hata oluştu:', error.message);
    console.error('API Response:', error.response?.data); // Debug için
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.status === 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    }
    throw new Error('Gönderiler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

/**
 * Gönderiyi beğenir
 * @param {number} chatID - Beğenilecek gönderi ID'si
 * @returns {Promise} API response
 */
export const likeChatPost = async (chatID) => {
  console.log(`Gönderi beğeniliyor, chatID: ${chatID}`); // Debug için
  
  // Eğer çalışan endpoint varsa onu kullan
  if (workingLikeEndpoint) {
    try {
      const endpoint = workingLikeEndpoint.replace('{chatID}', chatID);
      const response = await api.post(endpoint, {});
      console.log(`✅ Cache'lenmiş like endpoint kullanıldı:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`❌ Cache'lenmiş like endpoint artık çalışmıyor, yeniden aranacak`);
      workingLikeEndpoint = null; // Cache'i temizle
    }
  }
  
  // Farklı endpoint formatlarını dene
  const possibleEndpoints = [
    `/ChatReactions/LikeChat?likedchatID={chatID}`,            // Original format
    `/ChatReactions/LikeChat?likedChatID={chatID}`,            // Düzeltilmiş format (büyük C)
    `/ChatReactions/likeChat?likedchatID={chatID}`,            // Küçük harf
    `/chatReactions/likeChat?chatID={chatID}`,                 // camelCase
    `/reactions/like?chatID={chatID}`,                         // Simplified
    `/chats/like?chatID={chatID}`,                             // Under chats
    `/like?chatID={chatID}`,                                   // Minimal
  ];
  
  for (const endpointTemplate of possibleEndpoints) {
    const endpoint = endpointTemplate.replace('{chatID}', chatID);
    try {
      console.log(`Denenen like endpoint: ${endpoint}`);
      const response = await api.post(endpoint, {});
      console.log(`✅ Başarılı like endpoint bulundu: ${endpoint}`, response.data);
      
      // Başarılı endpoint'i cache'le
      workingLikeEndpoint = endpointTemplate;
      console.log(`📦 Like endpoint cache'lendi: ${workingLikeEndpoint}`);
      
      return response.data;
    } catch (error) {
      console.log(`❌ Başarısız like endpoint: ${endpoint} - ${error.response?.status}`);
      
      // 404 değilse (gerçek bir hata varsa) dur
      if (error.response?.status !== 404) {
        console.warn(`Gerçek hata bulundu: ${error.response?.status}`, error.response?.data);
        throw error;
      }
      
      // 404 ise devam et
      continue;
    }
  }
  
  console.warn('Hiçbir like endpoint çalışmıyor');
  throw new Error('Beğeni özelliği şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
};

/**
 * Gönderiyi beğenmez (dislike)
 * @param {number} chatID - Beğenilmeyecek gönderi ID'si  
 * @returns {Promise} API response
 */
export const dislikeChatPost = async (chatID) => {
  console.log(`Gönderi beğenilmiyor, chatID: ${chatID}`); // Debug için
  
  // Eğer çalışan endpoint varsa onu kullan
  if (workingDislikeEndpoint) {
    try {
      const endpoint = workingDislikeEndpoint.replace('{chatID}', chatID);
      const response = await api.post(endpoint, {});
      console.log(`✅ Cache'lenmiş dislike endpoint kullanıldı:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`❌ Cache'lenmiş dislike endpoint artık çalışmıyor, yeniden aranacak`);
      workingDislikeEndpoint = null; // Cache'i temizle
    }
  }
  
  // Farklı endpoint formatlarını dene
  const possibleEndpoints = [
    `/ChatReactions/dislikeChat?dislikedeChatID={chatID}`,     // Verdiğin format (typo ile)
    `/ChatReactions/DislikeChat?dislikedChatID={chatID}`,      // Düzeltilmiş format
    `/ChatReactions/dislikeChat?dislikedchatID={chatID}`,      // Küçük harf
    `/chatReactions/dislikeChat?chatID={chatID}`,              // camelCase
    `/reactions/dislike?chatID={chatID}`,                      // Simplified
    `/chats/dislike?chatID={chatID}`,                          // Under chats
    `/dislike?chatID={chatID}`,                                // Minimal
  ];
  
  for (const endpointTemplate of possibleEndpoints) {
    const endpoint = endpointTemplate.replace('{chatID}', chatID);
    try {
      console.log(`Denenen dislike endpoint: ${endpoint}`);
      const response = await api.post(endpoint, {});
      console.log(`✅ Başarılı dislike endpoint bulundu: ${endpoint}`, response.data);
      
      // Başarılı endpoint'i cache'le
      workingDislikeEndpoint = endpointTemplate;
      console.log(`📦 Dislike endpoint cache'lendi: ${workingDislikeEndpoint}`);
      
      return response.data;
    } catch (error) {
      console.log(`❌ Başarısız dislike endpoint: ${endpoint} - ${error.response?.status}`);
      
      // 404 değilse (gerçek bir hata varsa) dur
      if (error.response?.status !== 404) {
        console.warn(`Gerçek hata bulundu: ${error.response?.status}`, error.response?.data);
        throw error;
      }
      
      // 404 ise devam et
      continue;
    }
  }
  
  console.warn('Hiçbir dislike endpoint çalışmıyor');
  throw new Error('Beğenmeme özelliği şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
};

/**
 * Gönderiyi beğenen kişileri getirir
 * @param {number} chatID - Gönderi ID'si
 * @returns {Promise<Array>} Beğenen kişiler listesi
 */
export const getLikedPeople = async (chatID) => {
  try {
    console.log(`Beğenen kişiler getiriliyor, chatID: ${chatID}`); // Debug için
    const response = await api.get(`/ChatReactions/likedPeople?chatID=${chatID}`);
    console.log('✅ Beğenen kişiler başarıyla alındı:', response.data); // Debug için
    return response.data || [];
  } catch (error) {
    console.error(`Beğenen kişiler yüklenirken hata oluştu (chatID: ${chatID}):`, error.message);
    console.error('API Response:', error.response?.data); // Debug için
    
    // 404 hatası durumunda boş array döndür (henüz beğenen yok demektir)
    if (error.response?.status === 404) {
      console.log('404 hatası - henüz beğenen yok, boş array döndürülüyor');
      return [];
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.status === 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    }
    
    // Diğer hatalar için de boş array döndür ama warning ver
    console.warn('Beğenen kişiler yükleme hatası, boş array döndürülüyor');
    return [];
  }
};

/**
 * Gönderiyi beğenmeyen kişileri getirir
 * @param {number} chatID - Gönderi ID'si
 * @returns {Promise<Array>} Beğenmeyen kişiler listesi
 */
export const getDislikedPeople = async (chatID) => {
  try {
    console.log(`Beğenmeyen kişiler getiriliyor, chatID: ${chatID}`); // Debug için
    const response = await api.get(`/ChatReactions/dislikedPeople?chatID=${chatID}`);
    console.log('✅ Beğenmeyen kişiler başarıyla alındı:', response.data); // Debug için
    return response.data || [];
  } catch (error) {
    console.error(`Beğenmeyen kişiler yüklenirken hata oluştu (chatID: ${chatID}):`, error.message);
    console.error('API Response:', error.response?.data); // Debug için
    
    // 404 hatası durumunda boş array döndür (henüz beğenmeyen yok demektir)
    if (error.response?.status === 404) {
      console.log('404 hatası - henüz beğenmeyen yok, boş array döndürülüyor');
      return [];
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.status === 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    }
    
    // Diğer hatalar için de boş array döndür ama warning ver
    console.warn('Beğenmeyen kişiler yükleme hatası, boş array döndürülüyor');
    return [];
  }
};

/**
 * Giriş yapmış kullanıcının profilini getirir
 * @returns {Promise<Object>} Kullanıcı profili
 */
export const getLoggedUser = async () => {
  const response = await api.get('/user/loggedUser');
  return response.data;
};

/**
 * Doktor detaylarını userID ile getirir
 * @param {number} userID
 * @returns {Promise<Object>} Doktor detayları
 */
export const getDoctorDetails = async (userID) => {
  const response = await api.get(`/doctor/doctor?userID=${userID}`);
  return response.data;
};

/**
 * Tüm kullanıcıları getirir
 * @returns {Promise<Array>} Kullanıcı listesi
 */
export const getAllUsers = async () => {
  const response = await api.get('/user/users');
  return response.data;
};

/**
 * Belirli bir kullanıcıyı userID ile getirir
 * @param {number} userID
 * @returns {Promise<Object>} Kullanıcı
 */
export const getUserById = async (userID) => {
  const response = await api.get(`/user/user?userID=${userID}`);
  return response.data;
};

/**
 * Belirli bir public user'ı userID ile getirir
 * @param {number} userID
 * @returns {Promise<Object>} Public user
 */
export const getPublicUserById = async (userID) => {
  const response = await api.get(`/publicUser/publicUser?userID=${userID}`);
  return response.data;
};



// Cache for working endpoints
let workingCommentsEndpoint = null;
let workingLikeEndpoint = null;
let workingDislikeEndpoint = null;
let workingLikeCommentEndpoint = null;
let workingDislikeCommentEndpoint = null;

/**
 * Belirli bir gönderi/chat'in yorumlarını getirir
 * @param {number} chatID
 * @returns {Promise<Array>} Yorum listesi
 */
export const getCommentsByChatId = async (chatID) => {
  console.log(`Yorumlar getiriliyor, chatID: ${chatID}`); // Debug için
  
  // Eğer çalışan endpoint varsa onu kullan
  if (workingCommentsEndpoint) {
    try {
      const response = await api.get(workingCommentsEndpoint.replace('{chatID}', chatID));
      console.log(`✅ Cache'lenmiş endpoint kullanıldı:`, response.data);
      return response.data || [];
    } catch (error) {
      console.log(`❌ Cache'lenmiş endpoint artık çalışmıyor, yeniden aranacak`);
      workingCommentsEndpoint = null; // Cache'i temizle
    }
  }
  
  // Farklı endpoint formatlarını dene
  const possibleEndpoints = [
    `/comments/getComments?chatID={chatID}`,
    `/comments/comments?chatID={chatID}`,
    `/comments?chatID={chatID}`,
    `/comment/getComments?chatID={chatID}`,
    `/comment/comments?chatID={chatID}`,
    `/comment?chatID={chatID}`,
    `/chats/getComments?chatID={chatID}`,
    `/chats/comments?chatID={chatID}`,
  ];
  
  for (const endpointTemplate of possibleEndpoints) {
    const endpoint = endpointTemplate.replace('{chatID}', chatID);
    try {
      console.log(`Denenen endpoint: ${endpoint}`);
      const response = await api.get(endpoint);
      console.log(`✅ Başarılı endpoint bulundu: ${endpoint}`, response.data);
      
      // Başarılı endpoint'i cache'le
      workingCommentsEndpoint = endpointTemplate;
      console.log(`📦 Endpoint cache'lendi: ${workingCommentsEndpoint}`);
      
      return response.data || [];
    } catch (error) {
      console.log(`❌ Başarısız endpoint: ${endpoint} - ${error.response?.status}`);
      
      // 404 değilse (gerçek bir hata varsa) dur
      if (error.response?.status !== 404) {
        console.warn(`Gerçek hata bulundu: ${error.response?.status}`, error.response?.data);
        break;
      }
      
      // 404 ise devam et
      continue;
    }
  }
  
  console.warn('Hiçbir comments endpoint çalışmıyor, boş array döndürülüyor');
  return [];
};

/**
 * Gönderiye yorum ekler
 * @param {number} chatID - Gönderi ID'si
 * @param {Object} commentData - Yorum verisi
 * @param {string} commentData.message - Yorum mesajı
 * @param {number} commentData.userID - Kullanıcı ID'si
 * @returns {Promise<Object>} Eklenen yorum
 */
export const addComment = async (chatID, commentData) => {
  try {
    // Minimum gerekli alanlarla deneme - veritabanı 4 sütun bekliyor, 5 gönderiyorduk
    const requestBody = {
      message: commentData.message,
      chatID: parseInt(chatID),
      userID: commentData.userID
    };

    console.log('Yorum gönderiliyor:', requestBody); // Debug için

    const response = await api.post(`/comments/addComment?chatID=${chatID}`, requestBody);
    return response.data;
  } catch (error) {
    console.error(`Yorum eklenirken hata oluştu (chatID: ${chatID}):`, error.message);
    console.error('API Response:', error.response?.data); // Debug için
    
    // Eğer hala sütun hatası alırsak, farklı format deneyelim
    if (error.response?.data?.message?.includes('column index is out of range')) {
      console.log('Sütun hatası, alternatif format deneniyor...');
      try {
        // Daha minimal format
        const minimalBody = {
          message: commentData.message,
          userID: commentData.userID
        };
        const retryResponse = await api.post(`/comments/addComment?chatID=${chatID}`, minimalBody);
        return retryResponse.data;
      } catch (retryError) {
        console.error('Alternatif format da başarısız:', retryError.message);
      }
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.status === 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    }
    throw new Error('Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

/**
 * Yorumu beğenir
 * @param {number} commentID
 * @returns {Promise<Object>} Güncellenen yorum
 */
export const likeComment = async (commentID) => {
  const response = await api.post(`/comments/like?commentID=${commentID}`);
  return response.data;
};

/**
 * Yorumu beğenmez
 * @param {number} commentID
 * @returns {Promise<Object>} Güncellenen yorum
 */
export const dislikeComment = async (commentID) => {
  const response = await api.post(`/comments/dislike?commentID=${commentID}`);
  return response.data;
};

/**
 * Yorumu beğenir
 * @param {number} commentID - Beğenilecek yorum ID'si
 * @returns {Promise} API response
 */
export const likeCommentPost = async (commentID) => {
  console.log(`Yorum beğeniliyor, commentID: ${commentID}`); // Debug için
  
  // Eğer çalışan endpoint varsa onu kullan
  if (workingLikeCommentEndpoint) {
    try {
      const endpoint = workingLikeCommentEndpoint.replace('{commentID}', commentID);
      const response = await api.post(endpoint, {});
      console.log(`✅ Cache'lenmiş like comment endpoint kullanıldı:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`❌ Cache'lenmiş like comment endpoint artık çalışmıyor, yeniden aranacak`);
      workingLikeCommentEndpoint = null; // Cache'i temizle
    }
  }
  
  // Farklı endpoint formatlarını dene
  const possibleEndpoints = [
    `/CommentReactions/LikeComment?likedCommentID={commentID}`,             // Original format
    `/CommentReactions/likeComment?likedCommentID={commentID}`,             // Küçük harf
    `/commentReactions/likeComment?commentID={commentID}`,                  // camelCase
    `/reactions/like?commentID={commentID}`,                               // Simplified
    `/comments/like?commentID={commentID}`,                                // Under comments
  ];
  
  for (const endpointTemplate of possibleEndpoints) {
    const endpoint = endpointTemplate.replace('{commentID}', commentID);
    try {
      console.log(`Denenen like comment endpoint: ${endpoint}`);
      const response = await api.post(endpoint, {});
      console.log(`✅ Başarılı like comment endpoint bulundu: ${endpoint}`, response.data);
      
      // Başarılı endpoint'i cache'le
      workingLikeCommentEndpoint = endpointTemplate;
      console.log(`📦 Like comment endpoint cache'lendi: ${workingLikeCommentEndpoint}`);
      
      return response.data;
    } catch (error) {
      console.log(`❌ Başarısız like comment endpoint: ${endpoint} - ${error.response?.status}`);
      
      // 404 değilse (gerçek bir hata varsa) dur
      if (error.response?.status !== 404) {
        console.warn(`Gerçek hata bulundu: ${error.response?.status}`, error.response?.data);
        throw error;
      }
      
      // 404 ise devam et
      continue;
    }
  }
  
  console.warn('Hiçbir like comment endpoint çalışmıyor');
  throw new Error('Yorum beğeni özelliği şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
};

/**
 * Yorumu beğenmez (dislike)
 * @param {number} commentID - Beğenilmeyecek yorum ID'si
 * @returns {Promise} API response
 */
export const dislikeCommentPost = async (commentID) => {
  console.log(`Yorum beğenilmiyor, commentID: ${commentID}`); // Debug için
  
  // Eğer çalışan endpoint varsa onu kullan
  if (workingDislikeCommentEndpoint) {
    try {
      const endpoint = workingDislikeCommentEndpoint.replace('{commentID}', commentID);
      const response = await api.post(endpoint, {});
      console.log(`✅ Cache'lenmiş dislike comment endpoint kullanıldı:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`❌ Cache'lenmiş dislike comment endpoint artık çalışmıyor, yeniden aranacak`);
      workingDislikeCommentEndpoint = null; // Cache'i temizle
    }
  }
  
  // Farklı endpoint formatlarını dene (typo ile birlikte)
  const possibleEndpoints = [
    `/CommentReactions/DislikedComment?dislikedeCommentID={commentID}`,     // Verdiğin format (typo ile)
    `/CommentReactions/DislikeComment?dislikedCommentID={commentID}`,       // Düzeltilmiş format
    `/CommentReactions/dislikeComment?dislikedCommentID={commentID}`,       // Küçük harf
    `/commentReactions/dislikeComment?commentID={commentID}`,               // camelCase
    `/reactions/dislike?commentID={commentID}`,                            // Simplified
    `/comments/dislike?commentID={commentID}`,                             // Under comments
  ];
  
  for (const endpointTemplate of possibleEndpoints) {
    const endpoint = endpointTemplate.replace('{commentID}', commentID);
    try {
      console.log(`Denenen dislike comment endpoint: ${endpoint}`);
      const response = await api.post(endpoint, {});
      console.log(`✅ Başarılı dislike comment endpoint bulundu: ${endpoint}`, response.data);
      
      // Başarılı endpoint'i cache'le
      workingDislikeCommentEndpoint = endpointTemplate;
      console.log(`📦 Dislike comment endpoint cache'lendi: ${workingDislikeCommentEndpoint}`);
      
      return response.data;
    } catch (error) {
      console.log(`❌ Başarısız dislike comment endpoint: ${endpoint} - ${error.response?.status}`);
      
      // 404 değilse (gerçek bir hata varsa) dur
      if (error.response?.status !== 404) {
        console.warn(`Gerçek hata bulundu: ${error.response?.status}`, error.response?.data);
        throw error;
      }
      
      // 404 ise devam et
      continue;
    }
  }
  
  console.warn('Hiçbir dislike comment endpoint çalışmıyor');
  throw new Error('Yorum beğenmeme özelliği şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
};

/**
 * Yorumu beğenen kişileri getirir
 * @param {number} commentID - Yorum ID'si
 * @returns {Promise<Array>} Beğenen kişiler listesi
 */
export const getCommentLikedPeople = async (commentID) => {
  try {
    console.log(`Yorumu beğenen kişiler getiriliyor, commentID: ${commentID}`); // Debug için
    const response = await api.get(`/CommentReactions/likedPeople?commentID=${commentID}`);
    console.log('✅ Yorumu beğenen kişiler başarıyla alındı:', response.data); // Debug için
    return response.data || [];
  } catch (error) {
    console.error(`Yorumu beğenen kişiler yüklenirken hata oluştu (commentID: ${commentID}):`, error.message);
    console.error('API Response:', error.response?.data); // Debug için
    
    // 404 hatası durumunda boş array döndür (henüz beğenen yok demektir)
    if (error.response?.status === 404) {
      console.log('404 hatası - henüz yorumu beğenen yok, boş array döndürülüyor');
      return [];
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.status === 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    }
    
    // Diğer hatalar için de boş array döndür ama warning ver
    console.warn('Yorumu beğenen kişiler yükleme hatası, boş array döndürülüyor');
    return [];
  }
};

/**
 * Yorumu beğenmeyen kişileri getirir
 * @param {number} commentID - Yorum ID'si
 * @returns {Promise<Array>} Beğenmeyen kişiler listesi
 */
export const getCommentDislikedPeople = async (commentID) => {
  try {
    console.log(`Yorumu beğenmeyen kişiler getiriliyor, commentID: ${commentID}`); // Debug için
    const response = await api.get(`/CommentReactions/dislikedPeople?commentID=${commentID}`);
    console.log('✅ Yorumu beğenmeyen kişiler başarıyla alındı:', response.data); // Debug için
    return response.data || [];
  } catch (error) {
    console.error(`Yorumu beğenmeyen kişiler yüklenirken hata oluştu (commentID: ${commentID}):`, error.message);
    console.error('API Response:', error.response?.data); // Debug için
    
    // 404 hatası durumunda boş array döndür (henüz beğenmeyen yok demektir)
    if (error.response?.status === 404) {
      console.log('404 hatası - henüz yorumu beğenmeyen yok, boş array döndürülüyor');
      return [];
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.status === 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    }
    
    // Diğer hatalar için de boş array döndür ama warning ver
    console.warn('Yorumu beğenmeyen kişiler yükleme hatası, boş array döndürülüyor');
    return [];
  }
};

export default api; 