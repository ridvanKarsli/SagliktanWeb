# SagliktanApi.CommentsControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addComment**](CommentsControllerApi.md#addComment) | **POST** /comments/addComment | 
[**deleteComment**](CommentsControllerApi.md#deleteComment) | **DELETE** /comments/deleteComment | 
[**getCommentWthID**](CommentsControllerApi.md#getCommentWthID) | **GET** /comments/getCommentWithID | 
[**getComments**](CommentsControllerApi.md#getComments) | **GET** /comments/getComment | 



## addComment

> StringResponse addComment(authorization, comments)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentsControllerApi();
let authorization = "authorization_example"; // String | 
let comments = new SagliktanApi.Comments(); // Comments | 
apiInstance.addComment(authorization, comments).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **comments** | [**Comments**](Comments.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*


## deleteComment

> StringResponse deleteComment(commnetsID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentsControllerApi();
let commnetsID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.deleteComment(commnetsID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **commnetsID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getCommentWthID

> Comments getCommentWthID(commentsID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentsControllerApi();
let commentsID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getCommentWthID(commentsID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **commentsID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**Comments**](Comments.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getComments

> [Comments] getComments(chatID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.CommentsControllerApi();
let chatID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getComments(chatID, authorization).then((data) => {
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

[**[Comments]**](Comments.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

