import 'package:flutter/material.dart';

class AppRoutes {
  AppRoutes._();

  // Splash & Onboarding
  static const String splash = '/';
  static const String onboarding = '/onboarding';

  // Auth
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String otpVerification = '/otp-verification';
  static const String profileSetup = '/profile-setup';

  // Main
  static const String home = '/home';
  static const String mainNavigation = '/main-navigation';

  // Donations
  static const String donationList = '/donations';
  static const String donationCreate = '/donations/create';
  static const String donationDetail = '/donations/detail';
  static const String donationEdit = '/donations/edit';
  static const String donationMap = '/donations/map';
  static const String donationHistory = '/donations/history';
  static const String donationTracking = '/donations/tracking';

  // NGOs
  static const String ngoList = '/ngos';
  static const String ngoDetail = '/ngos/detail';
  static const String ngoRegister = '/ngos/register';
  static const String ngoDashboard = '/ngos/dashboard';
  static const String ngoNearby = '/ngos/nearby';

  // Volunteers
  static const String volunteerList = '/volunteers';
  static const String volunteerDetail = '/volunteers/detail';
  static const String volunteerRegister = '/volunteers/register';
  static const String volunteerDashboard = '/volunteers/dashboard';
  static const String volunteerAssignment = '/volunteers/assignment';

  // Impact & Stats
  static const String impactDashboard = '/impact';
  static const String leaderboard = '/leaderboard';
  static const String certificates = '/certificates';
  static const String certificateDetail = '/certificates/detail';
  static const String carbonTracker = '/carbon-tracker';

  // Hunger Zones
  static const String hungerZoneList = '/hunger-zones';
  static const String hungerZoneDetail = '/hunger-zones/detail';
  static const String hungerZoneMap = '/hunger-zones/map';
  static const String hungerZoneReport = '/hunger-zones/report';

  // Profile
  static const String profile = '/profile';
  static const String profileEdit = '/profile/edit';
  static const String profileSettings = '/profile/settings';
  static const String profileBadges = '/profile/badges';

  // Notifications
  static const String notifications = '/notifications';

  // Feedback
  static const String feedback = '/feedback';
  static const String feedbackList = '/feedback/list';

  // Settings
  static const String settings = '/settings';
  static const String languageSettings = '/settings/language';
  static const String notificationSettings = '/settings/notifications';
  static const String privacySettings = '/settings/privacy';
  static const String about = '/about';

  // Help
  static const String faq = '/faq';
  static const String contactUs = '/contact-us';
  static const String termsOfService = '/terms';
  static const String privacyPolicy = '/privacy-policy';

  // Search
  static const String search = '/search';

  // Map
  static const String fullMap = '/map';

  // Admin
  static const String adminDashboard = '/admin';
  static const String adminUsers = '/admin/users';
  static const String adminDonations = '/admin/donations';
  static const String adminNgos = '/admin/ngos';
  static const String adminVolunteers = '/admin/volunteers';
  static const String adminAnalytics = '/admin/analytics';
  static const String adminSettings = '/admin/settings';
}
