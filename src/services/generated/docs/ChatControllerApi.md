# SagliktanApi.ChatControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addChat**](ChatControllerApi.md#addChat) | **POST** /chats/addChat | 
[**deleteChat**](ChatControllerApi.md#deleteChat) | **DELETE** /chats/deleteChat | 
[**getAllChat**](ChatControllerApi.md#getAllChat) | **GET** /chats/getAllChat | 
[**getChatWithID**](ChatControllerApi.md#getChatWithID) | **GET** /chats/getChatWithID | 
[**getChats**](ChatControllerApi.md#getChats) | **GET** /chats/getChats | 
[**getChatsWithFiltre**](ChatControllerApi.md#getChatsWithFiltre) | **GET** /chats/getChatsWithFiltre | 



## addChat

> StringResponse addChat(authorization, chats)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatControllerApi();
let authorization = "authorization_example"; // String | 
let chats = new SagliktanApi.Chats(); // Chats | 
apiInstance.addChat(authorization, chats).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **chats** | [**Chats**](Chats.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*


## deleteChat

> StringResponse deleteChat(chatID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatControllerApi();
let chatID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.deleteChat(chatID, authorization).then((data) => {
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

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getAllChat

> [Chats] getAllChat(authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatControllerApi();
let authorization = "authorization_example"; // String | 
apiInstance.getAllChat(authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 

### Return type

[**[Chats]**](Chats.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getChatWithID

> Chats getChatWithID(chatID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatControllerApi();
let chatID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getChatWithID(chatID, authorization).then((data) => {
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

[**Chats**](Chats.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getChats

> [Chats] getChats(userID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatControllerApi();
let userID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getChats(userID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **userID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**[Chats]**](Chats.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getChatsWithFiltre

> [Chats] getChatsWithFiltre(category, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ChatControllerApi();
let category = "category_example"; // String | 
let authorization = "authorization_example"; // String | 
apiInstance.getChatsWithFiltre(category, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **category** | **String**|  | 
 **authorization** | **String**|  | 

### Return type

[**[Chats]**](Chats.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

