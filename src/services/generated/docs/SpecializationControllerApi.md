# SagliktanApi.SpecializationControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addSpecialization**](SpecializationControllerApi.md#addSpecialization) | **POST** /specialization/addSpecialization | 
[**deleteSpecialization**](SpecializationControllerApi.md#deleteSpecialization) | **DELETE** /specialization/deleteSpecialization | 
[**getSpecialization**](SpecializationControllerApi.md#getSpecialization) | **GET** /specialization/getSpecialization | 
[**getSpecializations**](SpecializationControllerApi.md#getSpecializations) | **GET** /specialization/getSpecializations | 
[**updateSpecialization**](SpecializationControllerApi.md#updateSpecialization) | **PUT** /specialization/updateSpecialization | 



## addSpecialization

> StringResponse addSpecialization(authorization, specialization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.SpecializationControllerApi();
let authorization = "authorization_example"; // String | 
let specialization = new SagliktanApi.Specialization(); // Specialization | 
apiInstance.addSpecialization(authorization, specialization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **specialization** | [**Specialization**](Specialization.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*


## deleteSpecialization

> StringResponse deleteSpecialization(specializationID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.SpecializationControllerApi();
let specializationID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.deleteSpecialization(specializationID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **specializationID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getSpecialization

> Specialization getSpecialization(specializationID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.SpecializationControllerApi();
let specializationID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getSpecialization(specializationID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **specializationID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**Specialization**](Specialization.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getSpecializations

> [Specialization] getSpecializations(userID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.SpecializationControllerApi();
let userID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getSpecializations(userID, authorization).then((data) => {
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

[**[Specialization]**](Specialization.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## updateSpecialization

> StringResponse updateSpecialization(authorization, specialization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.SpecializationControllerApi();
let authorization = "authorization_example"; // String | 
let specialization = new SagliktanApi.Specialization(); // Specialization | 
apiInstance.updateSpecialization(authorization, specialization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **specialization** | [**Specialization**](Specialization.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*

