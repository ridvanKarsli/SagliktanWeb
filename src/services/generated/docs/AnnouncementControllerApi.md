# SagliktanApi.AnnouncementControllerApi

All URIs are relative to *https://saglikta-7d7a2dbc0cf4.herokuapp.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addAnnouncement**](AnnouncementControllerApi.md#addAnnouncement) | **POST** /announcement/addAnnouncement | 
[**deleteAnnouncement**](AnnouncementControllerApi.md#deleteAnnouncement) | **DELETE** /announcement/deleteAnnouncement | 
[**getAnnouncement**](AnnouncementControllerApi.md#getAnnouncement) | **GET** /announcement/getAnnouncement | 
[**getAnnouncements**](AnnouncementControllerApi.md#getAnnouncements) | **GET** /announcement/getAnnouncements | 



## addAnnouncement

> StringResponse addAnnouncement(authorization, announcement)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.AnnouncementControllerApi();
let authorization = "authorization_example"; // String | 
let announcement = new SagliktanApi.Announcement(); // Announcement | 
apiInstance.addAnnouncement(authorization, announcement).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorization** | **String**|  | 
 **announcement** | [**Announcement**](Announcement.md)|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: */*


## deleteAnnouncement

> StringResponse deleteAnnouncement(announcementID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.AnnouncementControllerApi();
let announcementID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.deleteAnnouncement(announcementID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **announcementID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**StringResponse**](StringResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getAnnouncement

> Announcement getAnnouncement(announcementID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.AnnouncementControllerApi();
let announcementID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getAnnouncement(announcementID, authorization).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **announcementID** | **Number**|  | 
 **authorization** | **String**|  | 

### Return type

[**Announcement**](Announcement.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getAnnouncements

> [Announcement] getAnnouncements(userID, authorization)



### Example

```javascript
import SagliktanApi from 'sagliktan-api';

let apiInstance = new SagliktanApi.AnnouncementControllerApi();
let userID = 56; // Number | 
let authorization = "authorization_example"; // String | 
apiInstance.getAnnouncements(userID, authorization).then((data) => {
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

[**[Announcement]**](Announcement.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

