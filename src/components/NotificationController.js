import React, { useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification ,{Importance}from 'react-native-push-notification';

const NotificationController = (props) => {
  useEffect(() => {
    const createNotificationChannel = () => {
      try {
        PushNotification.createChannel(
          {
            channelId: "channel-id", // (required)
            channelName: "My channel", // (required)
            channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
            playSound: false, // (optional) default: true
            soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
            importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
            vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
          },
          (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
        );
      } catch (error) {
        console.error('Error creating notification channel:', error);
      }
    };


    // Create a notification channel
    createNotificationChannel();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log(
        'A new message arrived! (FOREGROUNDD)',
        JSON.stringify(remoteMessage),
      );
      PushNotification.localNotification({
        channelId: "channel-id",
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
        bigPictureUrl: remoteMessage.notification.android.imageUrl,
        smallIcon: remoteMessage.notification.android.imageUrl,
      });
    });
    return unsubscribe;
  }, []);

  return null;
};

export default NotificationController;