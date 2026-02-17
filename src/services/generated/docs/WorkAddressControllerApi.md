# SagliktanApi.WorkAddressControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addWorkAddress**](WorkAddressControllerApi.md#addWorkAddress) | **POST** /workAddress/addWorkAddress | 
[**deleteWorkAddress**](WorkAddressControllerApi.md#deleteWorkAddress) | **DELETE** /workAddress/deleteWorkAddress | 
[**getWorkAddress**](WorkAddressControllerApi.md#getWorkAddress) | **GET** /workAddress/getWorkAddress | 
[**getWorkAddresses**](WorkAddressControllerApi.md#getWorkAddresses) | **GET** /workAddress/getWorkAddreses | 
[**updateWorkAddress**](WorkAddressControllerApi.md#updateWorkAddress) | **PUT** /workAddress/updateWorkAddress | 



## addWorkAddress

> StringResponse addWorkAddress(authorization, address)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.WorkAddressControllerApi();
let authorization = "authorization_example"; // String | 
let address = new SagliktanApi.Address(); // Address | 
apiInstance.addWorkAddress(authorization, address).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **address** | [**Address**](Address.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*


## deleteWorkAddress

> StringResponse deleteWorkAddress(addressID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.WorkAddressControllerApi();
let addressID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.deleteWorkAddress(addressID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **addressID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getWorkAddress

> Address getWorkAddress(addressID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.WorkAddressControllerApi();
let addressID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getWorkAddress(addressID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **addressID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**Address**](Address.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getWorkAddresses

> [Address] getWorkAddresses(userID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.WorkAddressControllerApi();
let userID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getWorkAddresses(userID, authorization).then((data) => {
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

[**[Address]**](Address.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## updateWorkAddress

> StringResponse updateWorkAddress(authorization, address)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.WorkAddressControllerApi();
let authorization = "authorization_example"; // String | 
let address = new SagliktanApi.Address(); // Address | 
apiInstance.updateWorkAddress(authorization, address).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **address** | [**Address**](Address.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*

