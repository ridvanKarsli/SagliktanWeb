# SagliktanApi.ContactInfoControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addContactInfo**](ContactInfoControllerApi.md#addContactInfo) | **POST** /contactInfor/addContactInfor | 
[**deleteContactInfo**](ContactInfoControllerApi.md#deleteContactInfo) | **DELETE** /contactInfor/deleteContact | 
[**getAllContect**](ContactInfoControllerApi.md#getAllContect) | **GET** /contactInfor/getAllContact | 
[**getContect**](ContactInfoControllerApi.md#getContect) | **GET** /contactInfor/getContact | 
[**updateContactInfo**](ContactInfoControllerApi.md#updateContactInfo) | **PUT** /contactInfor/updateContactInfor | 



## addContactInfo

> StringResponse addContactInfo(authorization, contactInfo)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ContactInfoControllerApi();
let authorization = "authorization_example"; // String | 
let contactInfo = new SagliktanApi.ContactInfo(); // ContactInfo | 
apiInstance.addContactInfo(authorization, contactInfo).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **contactInfo** | [**ContactInfo**](ContactInfo.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*


## deleteContactInfo

> StringResponse deleteContactInfo(contactID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ContactInfoControllerApi();
let contactID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.deleteContactInfo(contactID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **contactID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getAllContect

> [ContactInfo] getAllContect(userID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ContactInfoControllerApi();
let userID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getAllContect(userID, authorization).then((data) => {
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

[**[ContactInfo]**](ContactInfo.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getContect

> ContactInfo getContect(contactID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ContactInfoControllerApi();
let contactID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getContect(contactID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **contactID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**ContactInfo**](ContactInfo.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## updateContactInfo

> StringResponse updateContactInfo(authorization, contactInfo)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ContactInfoControllerApi();
let authorization = "authorization_example"; // String | 
let contactInfo = new SagliktanApi.ContactInfo(); // ContactInfo | 
apiInstance.updateContactInfo(authorization, contactInfo).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **contactInfo** | [**ContactInfo**](ContactInfo.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*

