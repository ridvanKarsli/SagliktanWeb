# SagliktanApi.ReadablePublicUserControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getAllPublicUser**](ReadablePublicUserControllerApi.md#getAllPublicUser) | **GET** /publicUser/publicUsers | 
[**getPublicUser**](ReadablePublicUserControllerApi.md#getPublicUser) | **GET** /publicUser/publicUser | 



## getAllPublicUser

> [PublicUser] getAllPublicUser(authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ReadablePublicUserControllerApi();
let authorization = "authorization_example"; // String | 
apiInstance.getAllPublicUser(authorization).then((data) => {
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

[**[PublicUser]**](PublicUser.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getPublicUser

> PublicUser getPublicUser(userID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ReadablePublicUserControllerApi();
let userID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getPublicUser(userID, authorization).then((data) => {
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

[**PublicUser**](PublicUser.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

