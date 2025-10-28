# SagliktanApi.CommentReactionsControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**cancelDislikeComment**](CommentReactionsControllerApi.md#cancelDislikeComment) | **DELETE** /CommentReactions/cancelDislikeComment | 
[**cancelLikeComment**](CommentReactionsControllerApi.md#cancelLikeComment) | **DELETE** /CommentReactions/cancelLikeComment | 
[**dislikeComment**](CommentReactionsControllerApi.md#dislikeComment) | **POST** /CommentReactions/DislikedComment | 
[**getDislikedCommentPeope**](CommentReactionsControllerApi.md#getDislikedCommentPeope) | **GET** /CommentReactions/dislikedPeople | 
[**getLikedCommentPeope**](CommentReactionsControllerApi.md#getLikedCommentPeope) | **GET** /CommentReactions/likedPeople | 
[**likeComment**](CommentReactionsControllerApi.md#likeComment) | **POST** /CommentReactions/LikeComment | 



## cancelDislikeComment

> StringResponse cancelDislikeComment(cancelcommmentsDislikeID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentReactionsControllerApi();
let cancelcommmentsDislikeID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.cancelDislikeComment(cancelcommmentsDislikeID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cancelcommmentsDislikeID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## cancelLikeComment

> StringResponse cancelLikeComment(cancelcommmentsLikeID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentReactionsControllerApi();
let cancelcommmentsLikeID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.cancelLikeComment(cancelcommmentsLikeID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cancelcommmentsLikeID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## dislikeComment

> StringResponse dislikeComment(dislikedeCommentID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentReactionsControllerApi();
let dislikedeCommentID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.dislikeComment(dislikedeCommentID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **dislikedeCommentID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getDislikedCommentPeope

> [Person] getDislikedCommentPeope(commentID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentReactionsControllerApi();
let commentID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getDislikedCommentPeope(commentID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **commentID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**[Person]**](Person.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getLikedCommentPeope

> [Person] getLikedCommentPeope(commentID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentReactionsControllerApi();
let commentID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getLikedCommentPeope(commentID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **commentID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**[Person]**](Person.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## likeComment

> StringResponse likeComment(likedCommentID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentReactionsControllerApi();
let likedCommentID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.likeComment(likedCommentID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **likedCommentID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

