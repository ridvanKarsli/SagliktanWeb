# SagliktanApi.LogUserControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**login**](LogUserControllerApi.md#login) | **POST** /logUser/loginUser | 
[**signUp**](LogUserControllerApi.md#signUp) | **POST** /logUser/signupUser | 



## login

> TokenResponse login(person)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.LogUserControllerApi();
let person = new SagliktanApi.Person(); // Person | 
apiInstance.login(person).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **person** | [**Person**](Person.md)|  | 

### Return type

[**TokenResponse**](TokenResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*


## signUp

> StringResponse signUp(person)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.LogUserControllerApi();
let person = new SagliktanApi.Person(); // Person | 
apiInstance.signUp(person).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **person** | [**Person**](Person.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*

