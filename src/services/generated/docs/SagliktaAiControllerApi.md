# SagliktanApi.SagliktaAiControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**askSagliktaAI**](SagliktaAiControllerApi.md#askSagliktaAI) | **POST** /sagliktaAI/ask | 



## askSagliktaAI

> StringResponse askSagliktaAI(message, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.SagliktaAiControllerApi();
let message = "message_example"; // String | 
let authorization = "authorization_example"; // String | 
apiInstance.askSagliktaAI(message, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **message** | **String**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

