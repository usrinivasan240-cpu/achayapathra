import 'package:cloud_firestore/cloud_firestore.dart';

enum VolunteerStatus {
  available,
  busy,
  offline,
  onLeave,
}

enum VehicleType {
  bike,
  car,
  van,
  truck,
  bicycle,
  walking,
  other,
}

class Volunteer {
  final String id;
  final String userId;
  final String name;
  final String? phone;
  final String? email;
  final String? avatarUrl;
  final VolunteerStatus status;
  final VehicleType vehicleType;
  final String? vehicleNumber;
  final double? latitude;
  final double? longitude;
  final double? currentLatitude;
  final double? currentLongitude;
  final int totalPickups;
  final int totalDeliveries;
  final int totalDistanceKm;
  final double averageRating;
  final int totalRatings;
  final bool isVerified;
  final bool isAvailable;
  final List<String> serviceAreas;
  final List<String> serviceTypes;
  final int maxDistanceKm;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastActiveAt;
  final DateTime? currentAssignmentStart;
  final String? currentAssignmentId;
  final List<String> assignedWards;
  final List<String> badges;
  final int impactPoints;
  final double carbonSavedKg;
  final int mealsDelivered;
  final List<String> documents;
  final bool hasRefrigeratedVehicle;
  final int maxCapacityKg;
  final Map<String, dynamic>? availability;
  final String? emergencyContact;
  final String? emergencyPhone;

  Volunteer({
    required this.id,
    required this.userId,
    required this.name,
    this.phone,
    this.email,
    this.avatarUrl,
    this.status = VolunteerStatus.available,
    this.vehicleType = VehicleType.bike,
    this.vehicleNumber,
    this.latitude,
    this.longitude,
    this.currentLatitude,
    this.currentLongitude,
    this.totalPickups = 0,
    this.totalDeliveries = 0,
    this.totalDistanceKm = 0,
    this.averageRating = 0,
    this.totalRatings = 0,
    this.isVerified = false,
    this.isAvailable = true,
    this.serviceAreas = const [],
    this.serviceTypes = const [],
    this.maxDistanceKm = 15,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.lastActiveAt,
    this.currentAssignmentStart,
    this.currentAssignmentId,
    this.assignedWards = const [],
    this.badges = const [],
    this.impactPoints = 0,
    this.carbonSavedKg = 0,
    this.mealsDelivered = 0,
    this.documents = const [],
    this.hasRefrigeratedVehicle = false,
    this.maxCapacityKg = 10,
    this.availability,
    this.emergencyContact,
    this.emergencyPhone,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory Volunteer.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return Volunteer(
      id: doc.id,
      userId: data['userId'] ?? '',
      name: data['name'] ?? '',
      phone: data['phone'],
      email: data['email'],
      avatarUrl: data['avatarUrl'],
      status: VolunteerStatus.values.firstWhere(
        (e) => e.name == data['status'],
        orElse: () => VolunteerStatus.available,
      ),
      vehicleType: VehicleType.values.firstWhere(
        (e) => e.name == data['vehicleType'],
        orElse: () => VehicleType.bike,
      ),
      vehicleNumber: data['vehicleNumber'],
      latitude: data['latitude']?.toDouble(),
      longitude: data['longitude']?.toDouble(),
      currentLatitude: data['currentLatitude']?.toDouble(),
      currentLongitude: data['currentLongitude']?.toDouble(),
      totalPickups: data['totalPickups'] ?? 0,
      totalDeliveries: data['totalDeliveries'] ?? 0,
      totalDistanceKm: data['totalDistanceKm'] ?? 0,
      averageRating: data['averageRating']?.toDouble() ?? 0,
      totalRatings: data['totalRatings'] ?? 0,
      isVerified: data['isVerified'] ?? false,
      isAvailable: data['isAvailable'] ?? true,
      serviceAreas: List<String>.from(data['serviceAreas'] ?? []),
      serviceTypes: List<String>.from(data['serviceTypes'] ?? []),
      maxDistanceKm: data['maxDistanceKm'] ?? 15,
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : DateTime.now(),
      lastActiveAt: data['lastActiveAt'] != null
          ? (data['lastActiveAt'] as Timestamp).toDate()
          : null,
      currentAssignmentStart: data['currentAssignmentStart'] != null
          ? (data['currentAssignmentStart'] as Timestamp).toDate()
          : null,
      currentAssignmentId: data['currentAssignmentId'],
      assignedWards: List<String>.from(data['assignedWards'] ?? []),
      badges: List<String>.from(data['badges'] ?? []),
      impactPoints: data['impactPoints'] ?? 0,
      carbonSavedKg: data['carbonSavedKg']?.toDouble() ?? 0,
      mealsDelivered: data['mealsDelivered'] ?? 0,
      documents: List<String>.from(data['documents'] ?? []),
      hasRefrigeratedVehicle: data['hasRefrigeratedVehicle'] ?? false,
      maxCapacityKm: data['maxCapacityKm'] ?? 10,
      availability: data['availability'],
      emergencyContact: data['emergencyContact'],
      emergencyPhone: data['emergencyPhone'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'name': name,
      'phone': phone,
      'email': email,
      'avatarUrl': avatarUrl,
      'status': status.name,
      'vehicleType': vehicleType.name,
      'vehicleNumber': vehicleNumber,
      'latitude': latitude,
      'longitude': longitude,
      'currentLatitude': currentLatitude,
      'currentLongitude': currentLongitude,
      'totalPickups': totalPickups,
      'totalDeliveries': totalDeliveries,
      'totalDistanceKm': totalDistanceKm,
      'averageRating': averageRating,
      'totalRatings': totalRatings,
      'isVerified': isVerified,
      'isAvailable': isAvailable,
      'serviceAreas': serviceAreas,
      'serviceTypes': serviceTypes,
      'maxDistanceKm': maxDistanceKm,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(DateTime.now()),
      'lastActiveAt':
          lastActiveAt != null ? Timestamp.fromDate(lastActiveAt!) : null,
      'currentAssignmentStart': currentAssignmentStart != null
          ? Timestamp.fromDate(currentAssignmentStart!)
          : null,
      'currentAssignmentId': currentAssignmentId,
      'assignedWards': assignedWards,
      'badges': badges,
      'impactPoints': impactPoints,
      'carbonSavedKg': carbonSavedKg,
      'mealsDelivered': mealsDelivered,
      'documents': documents,
      'hasRefrigeratedVehicle': hasRefrigeratedVehicle,
      'maxCapacityKm': maxCapacityKm,
      'availability': availability,
      'emergencyContact': emergencyContact,
      'emergencyPhone': emergencyPhone,
    };
  }

  Volunteer copyWith({
    String? id,
    String? userId,
    String? name,
    String? phone,
    String? email,
    String? avatarUrl,
    VolunteerStatus? status,
    VehicleType? vehicleType,
    String? vehicleNumber,
    double? latitude,
    double? longitude,
    double? currentLatitude,
    double? currentLongitude,
    int? totalPickups,
    int? totalDeliveries,
    int? totalDistanceKm,
    double? averageRating,
    int? totalRatings,
    bool? isVerified,
    bool? isAvailable,
    List<String>? serviceAreas,
    List<String>? serviceTypes,
    int? maxDistanceKm,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastActiveAt,
    DateTime? currentAssignmentStart,
    String? currentAssignmentId,
    List<String>? assignedWards,
    List<String>? badges,
    int? impactPoints,
    double? carbonSavedKg,
    int? mealsDelivered,
    List<String>? documents,
    bool? hasRefrigeratedVehicle,
    int? maxCapacityKg,
    Map<String, dynamic>? availability,
    String? emergencyContact,
    String? emergencyPhone,
  }) {
    return Volunteer(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      status: status ?? this.status,
      vehicleType: vehicleType ?? this.vehicleType,
      vehicleNumber: vehicleNumber ?? this.vehicleNumber,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      currentLatitude: currentLatitude ?? this.currentLatitude,
      currentLongitude: currentLongitude ?? this.currentLongitude,
      totalPickups: totalPickups ?? this.totalPickups,
      totalDeliveries: totalDeliveries ?? this.totalDeliveries,
      totalDistanceKm: totalDistanceKm ?? this.totalDistanceKm,
      averageRating: averageRating ?? this.averageRating,
      totalRatings: totalRatings ?? this.totalRatings,
      isVerified: isVerified ?? this.isVerified,
      isAvailable: isAvailable ?? this.isAvailable,
      serviceAreas: serviceAreas ?? this.serviceAreas,
      serviceTypes: serviceTypes ?? this.serviceTypes,
      maxDistanceKm: maxDistanceKm ?? this.maxDistanceKm,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastActiveAt: lastActiveAt ?? this.lastActiveAt,
      currentAssignmentStart:
          currentAssignmentStart ?? this.currentAssignmentStart,
      currentAssignmentId: currentAssignmentId ?? this.currentAssignmentId,
      assignedWards: assignedWards ?? this.assignedWards,
      badges: badges ?? this.badges,
      impactPoints: impactPoints ?? this.impactPoints,
      carbonSavedKg: carbonSavedKg ?? this.carbonSavedKg,
      mealsDelivered: mealsDelivered ?? this.mealsDelivered,
      documents: documents ?? this.documents,
      hasRefrigeratedVehicle:
          hasRefrigeratedVehicle ?? this.hasRefrigeratedVehicle,
      maxCapacityKg: maxCapacityKg ?? this.maxCapacityKg,
      availability: availability ?? this.availability,
      emergencyContact: emergencyContact ?? this.emergencyContact,
      emergencyPhone: emergencyPhone ?? this.emergencyPhone,
    );
  }

  bool get isCurrentlyAssigned => currentAssignmentId != null;
  bool get isActive => status == VolunteerStatus.available && isAvailable;

  String get statusDisplayText {
    switch (status) {
      case VolunteerStatus.available:
        return 'Available';
      case VolunteerStatus.busy:
        return 'Busy';
      case VolunteerStatus.offline:
        return 'Offline';
      case VolunteerStatus.onLeave:
        return 'On Leave';
    }
  }

  String get vehicleTypeDisplayText {
    switch (vehicleType) {
      case VehicleType.bike:
        return 'Motorcycle';
      case VehicleType.car:
        return 'Car';
      case VehicleType.van:
        return 'Van';
      case VehicleType.truck:
        return 'Truck';
      case VehicleType.bicycle:
        return 'Bicycle';
      case VehicleType.walking:
        return 'Walking';
      case VehicleType.other:
        return 'Other';
    }
  }
}
