# SagliktanApi.ReadableDoctorControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getAllDoctor**](ReadableDoctorControllerApi.md#getAllDoctor) | **GET** /doctor/doctors | 
[**getDoctor**](ReadableDoctorControllerApi.md#getDoctor) | **GET** /doctor/doctor | 



## getAllDoctor

> [Doctor] getAllDoctor(authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ReadableDoctorControllerApi();
let authorization = "authorization_example"; // String | 
apiInstance.getAllDoctor(authorization).then((data) => {
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

[**[Doctor]**](Doctor.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getDoctor

> Doctor getDoctor(userID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.ReadableDoctorControllerApi();
let userID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getDoctor(userID, authorization).then((data) => {
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

[**Doctor**](Doctor.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

