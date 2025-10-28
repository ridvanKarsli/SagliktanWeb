# SagliktanApi.ChatReactionsControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**cancelDislikeChat**](ChatReactionsControllerApi.md#cancelDislikeChat) | **DELETE** /ChatReactions/cancelDislikeChat | 
[**cancelLikeChat**](ChatReactionsControllerApi.md#cancelLikeChat) | **DELETE** /ChatReactions/cancelLikeChat | 
[**dislikeChat**](ChatReactionsControllerApi.md#dislikeChat) | **POST** /ChatReactions/dislikeChat | 
[**getDislikedChatPeope**](ChatReactionsControllerApi.md#getDislikedChatPeope) | **GET** /ChatReactions/dislikedPeople | 
[**getLikedChatPeope**](ChatReactionsControllerApi.md#getLikedChatPeope) | **GET** /ChatReactions/likedPeople | 
[**likeChat**](ChatReactionsControllerApi.md#likeChat) | **POST** /ChatReactions/LikeChat | 



## cancelDislikeChat

> StringResponse cancelDislikeChat(chatReactionsID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatReactionsControllerApi();
let chatReactionsID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.cancelDislikeChat(chatReactionsID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chatReactionsID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## cancelLikeChat

> StringResponse cancelLikeChat(chatReactionsID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatReactionsControllerApi();
let chatReactionsID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.cancelLikeChat(chatReactionsID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chatReactionsID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## dislikeChat

> StringResponse dislikeChat(dislikedeChatID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatReactionsControllerApi();
let dislikedeChatID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.dislikeChat(dislikedeChatID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **dislikedeChatID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getDislikedChatPeope

> [ReactionPerson] getDislikedChatPeope(chatID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatReactionsControllerApi();
let chatID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getDislikedChatPeope(chatID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chatID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**[ReactionPerson]**](ReactionPerson.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getLikedChatPeope

> [ReactionPerson] getLikedChatPeope(chatID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatReactionsControllerApi();
let chatID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getLikedChatPeope(chatID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chatID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**[ReactionPerson]**](ReactionPerson.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## likeChat

> StringResponse likeChat(likedchatID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatReactionsControllerApi();
let likedchatID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.likeChat(likedchatID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **likedchatID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

