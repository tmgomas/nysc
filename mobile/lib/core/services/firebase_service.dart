import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';

class FirebaseService {
  final Logger _logger = Logger();
  late final FirebaseMessaging _messaging;

  Future<void> initialize() async {
    try {
      await Firebase.initializeApp();
      _messaging = FirebaseMessaging.instance;

      // Request permission for iOS/Web
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        _logger.i('User granted notification permission');
      } else if (settings.authorizationStatus == AuthorizationStatus.provisional) {
        _logger.i('User granted provisional notification permission');
      } else {
        _logger.w('User declined or has not accepted notification permission');
      }

      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        _logger.i('Received foreground message: ${message.messageId}');
        if (message.notification != null) {
          _logger.i('Message also contained a notification: ${message.notification}');
          // Note: In a real app, you might want to show a local notification here using flutter_local_notifications
        }
      });

    } catch (e) {
      _logger.e('Failed to initialize Firebase: $e');
    }
  }

  Future<String?> getDeviceToken() async {
    try {
      if (kIsWeb) {
        // Web requires a vapidKey
        return await _messaging.getToken(vapidKey: 'YOUR_WEB_VAPID_KEY_HERE');
      }
      return await _messaging.getToken();
    } catch (e) {
      _logger.e('Failed to get FCM token: $e');
      return null;
    }
  }
}

// Background message handler (Must be a top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  await Firebase.initializeApp();
  print("Handling a background message: ${message.messageId}");
}
