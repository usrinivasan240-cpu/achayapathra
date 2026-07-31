class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Achayapathra';
  static const String appVersion = '1.0.0';
  static const String appDescription =
      'Food Redistribution Platform - Circular Food Economy';

  // API URLs
  static const String baseUrl = 'https://achayapathra-api.vercel.app';
  static const String aiMatchingUrl = '$baseUrl/api/ai/match';
  static const String carbonCalcUrl = '$baseUrl/api/carbon/calculate';
  static const String notificationUrl = '$baseUrl/api/notifications';

  // Firebase Collections
  static const String usersCollection = 'users';
  static const String donationsCollection = 'donations';
  static const String ngosCollection = 'ngos';
  static const String volunteersCollection = 'volunteers';
  static const String certificatesCollection = 'certificates';
  static const String hungerZonesCollection = 'hungerZones';
  static const String notificationsCollection = 'notifications';
  static const String feedbackCollection = 'feedback';
  static const String reportsCollection = 'reports';
  static const String analyticsCollection = 'analytics';
  static const String settingsCollection = 'settings';
  static const String bannersCollection = 'banners';
  static const String faqCollection = 'faq';
  static const String contactCollection = 'contact';

  // Firestore Queries
  static const int donationsPerPage = 20;
  static const int ngosPerPage = 15;
  static const int volunteersPerPage = 15;
  static const int leaderboardLimit = 50;
  static const int recentDonationsLimit = 10;

  // Impact Points
  static const int pointsPerDonation = 10;
  static const int pointsPerPickup = 5;
  static const int pointsPerDelivery = 5;
  static const int pointsPerKgSaved = 2;
  static const int pointsPerMeal = 1;
  static const int bonusPointsUrgent = 15;
  static const int bonusPointsLargeDonation = 20;
  static const int bonusPointsFirstDonation = 50;

  // Carbon Savings
  static const double carbonPerKgFood = 2.5;
  static const double carbonPerMeal = 0.8;
  static const double carbonPerKmTransport = 0.21;

  // Certificate Thresholds
  static const int bronzeThreshold = 100;
  static const int silverThreshold = 500;
  static const int goldThreshold = 1000;
  static const int platinumThreshold = 2500;
  static const int diamondThreshold = 5000;

  // Badge Thresholds
  static const String badgeFirstDonation = 'first_donation';
  static const String badgeTenDonations = 'ten_donations';
  static const String badgeFiftyDonations = 'fifty_donations';
  static const String badgeHundredDonations = 'hundred_donations';
  static const String badgeUrgentHero = 'urgent_hero';
  static const String badgeGreenChampion = 'green_champion';
  static const String badgeCommunityStar = 'community_star';
  static const String badgeVolunteerHero = 'volunteer_hero';
  static const String badgeNgoPartner = 'ngo_partner';
  static const String badgeZeroWaste = 'zero_waste';
  static const String badgeWeekStreak = 'week_streak';
  static const String badgeMonthStreak = 'month_streak';

  // Food Types
  static const List<String> foodTypes = [
    'cooked',
    'raw',
    'packaged',
    'beverages',
    'dairy',
    'bakery',
    'fruits',
    'vegetables',
    'grains',
    'other',
  ];

  static const Map<String, String> foodTypeLabels = {
    'cooked': 'Cooked Food',
    'raw': 'Raw Ingredients',
    'packaged': 'Packaged Food',
    'beverages': 'Beverages',
    'dairy': 'Dairy Products',
    'bakery': 'Bakery Items',
    'fruits': 'Fruits',
    'vegetables': 'Vegetables',
    'grains': 'Grains & Cereals',
    'other': 'Other',
  };

  // Units
  static const List<String> quantityUnits = [
    'portions',
    'kg',
    'g',
    'liters',
    'ml',
    'pieces',
    'packets',
    'boxes',
    'bottles',
    'cans',
  ];

  // Districts (Kerala specific)
  static const List<String> keralaDistricts = [
    'Thiruvananthapuram',
    'Kollam',
    'Pathanamthitta',
    'Alappuzha',
    'Kottayam',
    'Idukki',
    'Ernakulam',
    'Thrissur',
    'Palakkad',
    'Malappuram',
    'Kozhikode',
    'Wayanad',
    'Kannur',
    'Kasaragod',
  ];

  // Wards (example for Thiruvananthapuram)
  static const List<String> defaultWards = [
    'Ward 1',
    'Ward 2',
    'Ward 3',
    'Ward 4',
    'Ward 5',
    'Ward 6',
    'Ward 7',
    'Ward 8',
    'Ward 9',
    'Ward 10',
  ];

  // Default Location (Thiruvananthapuram)
  static const double defaultLatitude = 8.5241;
  static const double defaultLongitude = 76.9366;
  static const double defaultMapZoom = 12.0;

  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration locationTimeout = Duration(seconds: 10);
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration snackbarDuration = Duration(seconds: 3);

  // Regex
  static const String emailRegex =
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  static const String phoneRegex = r'^[6-9]\d{9}$';
  static const String pincodeRegex = r'^[1-9][0-9]{5}$';

  // Storage Paths
  static const String profileImagesPath = 'profile_images';
  static const String donationImagesPath = 'donation_images';
  static const String certificatePdfPath = 'certificates';
  static const String ngoLogosPath = 'ngo_logos';
  static const String bannerImagesPath = 'banners';

  // Notification Types
  static const String notificationDonationMatch = 'donation_match';
  static const String notificationDonationPickedUp = 'donation_picked_up';
  static const String notificationDonationDelivered = 'donation_delivered';
  static const String notificationVolunteerAssigned = 'volunteer_assigned';
  static const String notificationCertificateEarned = 'certificate_earned';
  static const String notificationHungerZoneAlert = 'hunger_zone_alert';
  static const String notificationSystem = 'system';

  // Shared Preferences Keys
  static const String spThemeMode = 'theme_mode';
  static const String spLanguage = 'language';
  static const String spFirstLaunch = 'first_launch';
  static const String spUserId = 'user_id';
  static const String spFcmToken = 'fcm_token';
  static const String spLocationEnabled = 'location_enabled';
  static const String spNotificationsEnabled = 'notifications_enabled';

  // Pagination
  static String getDonationsQuery({
    String? status,
    String? donorId,
    String? ngoId,
    String? district,
    int limit = 20,
  }) {
    return 'donations';
  }

  // Validation Messages
  static const String nameRequired = 'Name is required';
  static const String emailRequired = 'Email is required';
  static const String emailInvalid = 'Please enter a valid email';
  static const String phoneRequired = 'Phone number is required';
  static const String phoneInvalid = 'Please enter a valid phone number';
  static const String passwordRequired = 'Password is required';
  static const String passwordMinLength = 'Password must be at least 6 characters';
  static const String foodNameRequired = 'Food name is required';
  static const String quantityRequired = 'Quantity is required';
  static const String locationRequired = 'Location is required';
  static const String expiryRequired = 'Expiry time is required';

  // Success Messages
  static const String donationCreated = 'Donation created successfully!';
  static const String donationUpdated = 'Donation updated successfully!';
  static const String donationCancelled = 'Donation cancelled successfully';
  static const String profileUpdated = 'Profile updated successfully!';
  static const String certificateEarned = 'Congratulations! Certificate earned!';
  static const String feedbackSubmitted = 'Thank you for your feedback!';
  static const String accountCreated = 'Account created successfully!';

  // Error Messages
  static const String errorGeneral = 'Something went wrong. Please try again.';
  static const String errorNetwork = 'No internet connection.';
  static const String errorAuth = 'Authentication failed. Please try again.';
  static const String errorNotFound = 'Data not found.';
  static const String errorPermission = 'Permission denied.';
  static const String errorLocation = 'Unable to get your location.';
}
