# SagliktanApi.DiseaseControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addDisease**](DiseaseControllerApi.md#addDisease) | **POST** /disease/addDisease | 
[**deleteDisease**](DiseaseControllerApi.md#deleteDisease) | **DELETE** /disease/deleteDisease | 
[**getDisease**](DiseaseControllerApi.md#getDisease) | **GET** /disease/getDisease | 
[**getDiseaseNames**](DiseaseControllerApi.md#getDiseaseNames) | **GET** /disease/getDiseaseNames | 
[**getDiseases**](DiseaseControllerApi.md#getDiseases) | **GET** /disease/getDiseases | 
[**updateDisease**](DiseaseControllerApi.md#updateDisease) | **PUT** /disease/updateDisease | 



## addDisease

> StringResponse addDisease(authorization, disease)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.DiseaseControllerApi();
let authorization = "authorization_example"; // String | 
let disease = new SagliktanApi.Disease(); // Disease | 
apiInstance.addDisease(authorization, disease).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **disease** | [**Disease**](Disease.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*


## deleteDisease

> StringResponse deleteDisease(diseaseID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.DiseaseControllerApi();
let diseaseID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.deleteDisease(diseaseID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **diseaseID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getDisease

> Disease getDisease(diseaseID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.DiseaseControllerApi();
let diseaseID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getDisease(diseaseID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **diseaseID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**Disease**](Disease.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getDiseaseNames

> [String] getDiseaseNames(authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.DiseaseControllerApi();
let authorization = "authorization_example"; // String | 
apiInstance.getDiseaseNames(authorization).then((data) => {
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

**[String]**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getDiseases

> [Disease] getDiseases(userID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.DiseaseControllerApi();
let userID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getDiseases(userID, authorization).then((data) => {
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

[**[Disease]**](Disease.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## updateDisease

> StringResponse updateDisease(authorization, disease)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.DiseaseControllerApi();
let authorization = "authorization_example"; // String | 
let disease = new SagliktanApi.Disease(); // Disease | 
apiInstance.updateDisease(authorization, disease).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **disease** | [**Disease**](Disease.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*

