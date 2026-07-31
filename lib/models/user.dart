import 'package:cloud_firestore/cloud_firestore.dart';

enum UserRole {
  donor,
  volunteer,
  ngo,
  admin,
  receiver,
}

enum VerificationStatus {
  unverified,
  pending,
  verified,
  rejected,
}

class AppUser {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final UserRole role;
  final String? avatarUrl;
  final String? ward;
  final String? district;
  final String? state;
  final String? address;
  final double? latitude;
  final double? longitude;
  final VerificationStatus verificationStatus;
  final int impactPoints;
  final int totalDonations;
  final int totalPickups;
  final int totalDeliveries;
  final int mealsSaved;
  final double carbonSavedKg;
  final List<String> badges;
  final String? bio;
  final bool isAvailable;
  final bool isOnline;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastSeenAt;
  final Map<String, dynamic>? preferences;
  final String? fcmToken;
  final bool notificationsEnabled;
  final bool emailNotifications;
  final bool smsNotifications;
  final String? organizationName;
  final String? organizationType;
  final String? registrationNumber;
  final int maxPickupDistanceKm;
  final String? vehicleType;
  final String? vehicleNumber;
  final List<String> serviceAreas;
  final double? rating;
  final int totalRatings;
  final List<String> favoriteDonations;
  final List<String> savedLocations;

  AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.role = UserRole.donor,
    this.avatarUrl,
    this.ward,
    this.district,
    this.state,
    this.address,
    this.latitude,
    this.longitude,
    this.verificationStatus = VerificationStatus.unverified,
    this.impactPoints = 0,
    this.totalDonations = 0,
    this.totalPickups = 0,
    this.totalDeliveries = 0,
    this.mealsSaved = 0,
    this.carbonSavedKg = 0,
    this.badges = const [],
    this.bio,
    this.isAvailable = true,
    this.isOnline = false,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.lastSeenAt,
    this.preferences,
    this.fcmToken,
    this.notificationsEnabled = true,
    this.emailNotifications = true,
    this.smsNotifications = false,
    this.organizationName,
    this.organizationType,
    this.registrationNumber,
    this.maxPickupDistanceKm = 10,
    this.vehicleType,
    this.vehicleNumber,
    this.serviceAreas = const [],
    this.rating,
    this.totalRatings = 0,
    this.favoriteDonations = const [],
    this.savedLocations = const [],
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory AppUser.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return AppUser(
      id: doc.id,
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      phone: data['phone'],
      role: UserRole.values.firstWhere(
        (e) => e.name == data['role'],
        orElse: () => UserRole.donor,
      ),
      avatarUrl: data['avatarUrl'],
      ward: data['ward'],
      district: data['district'],
      state: data['state'],
      address: data['address'],
      latitude: data['latitude']?.toDouble(),
      longitude: data['longitude']?.toDouble(),
      verificationStatus: VerificationStatus.values.firstWhere(
        (e) => e.name == data['verificationStatus'],
        orElse: () => VerificationStatus.unverified,
      ),
      impactPoints: data['impactPoints'] ?? 0,
      totalDonations: data['totalDonations'] ?? 0,
      totalPickups: data['totalPickups'] ?? 0,
      totalDeliveries: data['totalDeliveries'] ?? 0,
      mealsSaved: data['mealsSaved'] ?? 0,
      carbonSavedKg: data['carbonSavedKg']?.toDouble() ?? 0,
      badges: List<String>.from(data['badges'] ?? []),
      bio: data['bio'],
      isAvailable: data['isAvailable'] ?? true,
      isOnline: data['isOnline'] ?? false,
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : DateTime.now(),
      lastSeenAt: data['lastSeenAt'] != null
          ? (data['lastSeenAt'] as Timestamp).toDate()
          : null,
      preferences: data['preferences'],
      fcmToken: data['fcmToken'],
      notificationsEnabled: data['notificationsEnabled'] ?? true,
      emailNotifications: data['emailNotifications'] ?? true,
      smsNotifications: data['smsNotifications'] ?? false,
      organizationName: data['organizationName'],
      organizationType: data['organizationType'],
      registrationNumber: data['registrationNumber'],
      maxPickupDistanceKm: data['maxPickupDistanceKm'] ?? 10,
      vehicleType: data['vehicleType'],
      vehicleNumber: data['vehicleNumber'],
      serviceAreas: List<String>.from(data['serviceAreas'] ?? []),
      rating: data['rating']?.toDouble(),
      totalRatings: data['totalRatings'] ?? 0,
      favoriteDonations: List<String>.from(data['favoriteDonations'] ?? []),
      savedLocations: List<String>.from(data['savedLocations'] ?? []),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'email': email,
      'phone': phone,
      'role': role.name,
      'avatarUrl': avatarUrl,
      'ward': ward,
      'district': district,
      'state': state,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'verificationStatus': verificationStatus.name,
      'impactPoints': impactPoints,
      'totalDonations': totalDonations,
      'totalPickups': totalPickups,
      'totalDeliveries': totalDeliveries,
      'mealsSaved': mealsSaved,
      'carbonSavedKg': carbonSavedKg,
      'badges': badges,
      'bio': bio,
      'isAvailable': isAvailable,
      'isOnline': isOnline,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(DateTime.now()),
      'lastSeenAt':
          lastSeenAt != null ? Timestamp.fromDate(lastSeenAt!) : null,
      'preferences': preferences,
      'fcmToken': fcmToken,
      'notificationsEnabled': notificationsEnabled,
      'emailNotifications': emailNotifications,
      'smsNotifications': smsNotifications,
      'organizationName': organizationName,
      'organizationType': organizationType,
      'registrationNumber': registrationNumber,
      'maxPickupDistanceKm': maxPickupDistanceKm,
      'vehicleType': vehicleType,
      'vehicleNumber': vehicleNumber,
      'serviceAreas': serviceAreas,
      'rating': rating,
      'totalRatings': totalRatings,
      'favoriteDonations': favoriteDonations,
      'savedLocations': savedLocations,
    };
  }

  AppUser copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    UserRole? role,
    String? avatarUrl,
    String? ward,
    String? district,
    String? state,
    String? address,
    double? latitude,
    double? longitude,
    VerificationStatus? verificationStatus,
    int? impactPoints,
    int? totalDonations,
    int? totalPickups,
    int? totalDeliveries,
    int? mealsSaved,
    double? carbonSavedKg,
    List<String>? badges,
    String? bio,
    bool? isAvailable,
    bool? isOnline,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastSeenAt,
    Map<String, dynamic>? preferences,
    String? fcmToken,
    bool? notificationsEnabled,
    bool? emailNotifications,
    bool? smsNotifications,
    String? organizationName,
    String? organizationType,
    String? registrationNumber,
    int? maxPickupDistanceKm,
    String? vehicleType,
    String? vehicleNumber,
    List<String>? serviceAreas,
    double? rating,
    int? totalRatings,
    List<String>? favoriteDonations,
    List<String>? savedLocations,
  }) {
    return AppUser(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      ward: ward ?? this.ward,
      district: district ?? this.district,
      state: state ?? this.state,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      verificationStatus: verificationStatus ?? this.verificationStatus,
      impactPoints: impactPoints ?? this.impactPoints,
      totalDonations: totalDonations ?? this.totalDonations,
      totalPickups: totalPickups ?? this.totalPickups,
      totalDeliveries: totalDeliveries ?? this.totalDeliveries,
      mealsSaved: mealsSaved ?? this.mealsSaved,
      carbonSavedKg: carbonSavedKg ?? this.carbonSavedKg,
      badges: badges ?? this.badges,
      bio: bio ?? this.bio,
      isAvailable: isAvailable ?? this.isAvailable,
      isOnline: isOnline ?? this.isOnline,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastSeenAt: lastSeenAt ?? this.lastSeenAt,
      preferences: preferences ?? this.preferences,
      fcmToken: fcmToken ?? this.fcmToken,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      smsNotifications: smsNotifications ?? this.smsNotifications,
      organizationName: organizationName ?? this.organizationName,
      organizationType: organizationType ?? this.organizationType,
      registrationNumber: registrationNumber ?? this.registrationNumber,
      maxPickupDistanceKm: maxPickupDistanceKm ?? this.maxPickupDistanceKm,
      vehicleType: vehicleType ?? this.vehicleType,
      vehicleNumber: vehicleNumber ?? this.vehicleNumber,
      serviceAreas: serviceAreas ?? this.serviceAreas,
      rating: rating ?? this.rating,
      totalRatings: totalRatings ?? this.totalRatings,
      favoriteDonations: favoriteDonations ?? this.favoriteDonations,
      savedLocations: savedLocations ?? this.savedLocations,
    );
  }

  bool get isVerified => verificationStatus == VerificationStatus.verified;
  bool get isNgo => role == UserRole.ngo;
  bool get isVolunteer => role == UserRole.volunteer;
  bool get isDonor => role == UserRole.donor;
  bool get isAdmin => role == UserRole.admin;

  String get roleDisplayText {
    switch (role) {
      case UserRole.donor:
        return 'Donor';
      case UserRole.volunteer:
        return 'Volunteer';
      case UserRole.ngo:
        return 'NGO';
      case UserRole.admin:
        return 'Admin';
      case UserRole.receiver:
        return 'Receiver';
    }
  }

  int get level {
    if (impactPoints >= 10000) return 10;
    if (impactPoints >= 5000) return 9;
    if (impactPoints >= 2500) return 8;
    if (impactPoints >= 1000) return 7;
    if (impactPoints >= 500) return 6;
    if (impactPoints >= 250) return 5;
    if (impactPoints >= 100) return 4;
    if (impactPoints >= 50) return 3;
    if (impactPoints >= 20) return 2;
    return 1;
  }

  String get levelTitle {
    switch (level) {
      case 10:
        return 'Food Hero';
      case 9:
        return 'Champion';
      case 8:
        return 'Guardian';
      case 7:
        return 'Protector';
      case 6:
        return 'Warrior';
      case 5:
        return 'Defender';
      case 4:
        return 'Supporter';
      case 3:
        return 'Helper';
      case 2:
        return 'Giver';
      default:
        return 'Newcomer';
    }
  }

  String get displayName => name.isNotEmpty ? name : email.split('@').first;
}
