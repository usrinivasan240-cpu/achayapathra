import 'package:cloud_firestore/cloud_firestore.dart';

enum NgoType {
  foodBank,
  shelter,
  orphanage,
  oldAgeHome,
  communityKitchen,
  disasterRelief,
  education,
  health,
  other,
}

enum NgoStatus {
  active,
  inactive,
  pending,
  suspended,
}

class Ngo {
  final String id;
  final String name;
  final String description;
  final NgoType type;
  final NgoStatus status;
  final String? contactPerson;
  final String? contactPhone;
  final String? contactEmail;
  final String? website;
  final String? logoUrl;
  final String? coverImageUrl;
  final String? address;
  final String? ward;
  final String? district;
  final String? state;
  final String? pincode;
  final double? latitude;
  final double? longitude;
  final int capacity;
  final int currentOccupancy;
  final int totalReceived;
  final int totalBeneficiaries;
  final double? rating;
  final int totalRatings;
  final List<String> services;
  final List<String> foodPreferences;
  final List<String> operatingHours;
  final bool acceptsRawFood;
  final bool acceptsCookedFood;
  final bool acceptsPackagedFood;
  final bool acceptsBeverages;
  final bool isVerified;
  final bool is24Hours;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? createdBy;
  final List<String> photos;
  final List<String> tags;
  final String? registrationNumber;
  final String? panNumber;
  final bool isDonationEligible;
  final int impactPoints;
  final double carbonSavedKg;
  final int mealsServed;
  final List<String> recentDonations;

  Ngo({
    required this.id,
    required this.name,
    this.description = '',
    this.type = NgoType.communityKitchen,
    this.status = NgoStatus.active,
    this.contactPerson,
    this.contactPhone,
    this.contactEmail,
    this.website,
    this.logoUrl,
    this.coverImageUrl,
    this.address,
    this.ward,
    this.district,
    this.state,
    this.pincode,
    this.latitude,
    this.longitude,
    this.capacity = 100,
    this.currentOccupancy = 0,
    this.totalReceived = 0,
    this.totalBeneficiaries = 0,
    this.rating,
    this.totalRatings = 0,
    this.services = const [],
    this.foodPreferences = const [],
    this.operatingHours = const [],
    this.acceptsRawFood = true,
    this.acceptsCookedFood = true,
    this.acceptsPackagedFood = true,
    this.acceptsBeverages = true,
    this.isVerified = false,
    this.is24Hours = false,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.createdBy,
    this.photos = const [],
    this.tags = const [],
    this.registrationNumber,
    this.panNumber,
    this.isDonationEligible = true,
    this.impactPoints = 0,
    this.carbonSavedKg = 0,
    this.mealsServed = 0,
    this.recentDonations = const [],
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory Ngo.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return Ngo(
      id: doc.id,
      name: data['name'] ?? '',
      description: data['description'] ?? '',
      type: NgoType.values.firstWhere(
        (e) => e.name == data['type'],
        orElse: () => NgoType.communityKitchen,
      ),
      status: NgoStatus.values.firstWhere(
        (e) => e.name == data['status'],
        orElse: () => NgoStatus.active,
      ),
      contactPerson: data['contactPerson'],
      contactPhone: data['contactPhone'],
      contactEmail: data['contactEmail'],
      website: data['website'],
      logoUrl: data['logoUrl'],
      coverImageUrl: data['coverImageUrl'],
      address: data['address'],
      ward: data['ward'],
      district: data['district'],
      state: data['state'],
      pincode: data['pincode'],
      latitude: data['latitude']?.toDouble(),
      longitude: data['longitude']?.toDouble(),
      capacity: data['capacity'] ?? 100,
      currentOccupancy: data['currentOccupancy'] ?? 0,
      totalReceived: data['totalReceived'] ?? 0,
      totalBeneficiaries: data['totalBeneficiaries'] ?? 0,
      rating: data['rating']?.toDouble(),
      totalRatings: data['totalRatings'] ?? 0,
      services: List<String>.from(data['services'] ?? []),
      foodPreferences: List<String>.from(data['foodPreferences'] ?? []),
      operatingHours: List<String>.from(data['operatingHours'] ?? []),
      acceptsRawFood: data['acceptsRawFood'] ?? true,
      acceptsCookedFood: data['acceptsCookedFood'] ?? true,
      acceptsPackagedFood: data['acceptsPackagedFood'] ?? true,
      acceptsBeverages: data['acceptsBeverages'] ?? true,
      isVerified: data['isVerified'] ?? false,
      is24Hours: data['is24Hours'] ?? false,
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : DateTime.now(),
      createdBy: data['createdBy'],
      photos: List<String>.from(data['photos'] ?? []),
      tags: List<String>.from(data['tags'] ?? []),
      registrationNumber: data['registrationNumber'],
      panNumber: data['panNumber'],
      isDonationEligible: data['isDonationEligible'] ?? true,
      impactPoints: data['impactPoints'] ?? 0,
      carbonSavedKg: data['carbonSavedKg']?.toDouble() ?? 0,
      mealsServed: data['mealsServed'] ?? 0,
      recentDonations: List<String>.from(data['recentDonations'] ?? []),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'description': description,
      'type': type.name,
      'status': status.name,
      'contactPerson': contactPerson,
      'contactPhone': contactPhone,
      'contactEmail': contactEmail,
      'website': website,
      'logoUrl': logoUrl,
      'coverImageUrl': coverImageUrl,
      'address': address,
      'ward': ward,
      'district': district,
      'state': state,
      'pincode': pincode,
      'latitude': latitude,
      'longitude': longitude,
      'capacity': capacity,
      'currentOccupancy': currentOccupancy,
      'totalReceived': totalReceived,
      'totalBeneficiaries': totalBeneficiaries,
      'rating': rating,
      'totalRatings': totalRatings,
      'services': services,
      'foodPreferences': foodPreferences,
      'operatingHours': operatingHours,
      'acceptsRawFood': acceptsRawFood,
      'acceptsCookedFood': acceptsCookedFood,
      'acceptsPackagedFood': acceptsPackagedFood,
      'acceptsBeverages': acceptsBeverages,
      'isVerified': isVerified,
      'is24Hours': is24Hours,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(DateTime.now()),
      'createdBy': createdBy,
      'photos': photos,
      'tags': tags,
      'registrationNumber': registrationNumber,
      'panNumber': panNumber,
      'isDonationEligible': isDonationEligible,
      'impactPoints': impactPoints,
      'carbonSavedKg': carbonSavedKg,
      'mealsServed': mealsServed,
      'recentDonations': recentDonations,
    };
  }

  Ngo copyWith({
    String? id,
    String? name,
    String? description,
    NgoType? type,
    NgoStatus? status,
    String? contactPerson,
    String? contactPhone,
    String? contactEmail,
    String? website,
    String? logoUrl,
    String? coverImageUrl,
    String? address,
    String? ward,
    String? district,
    String? state,
    String? pincode,
    double? latitude,
    double? longitude,
    int? capacity,
    int? currentOccupancy,
    int? totalReceived,
    int? totalBeneficiaries,
    double? rating,
    int? totalRatings,
    List<String>? services,
    List<String>? foodPreferences,
    List<String>? operatingHours,
    bool? acceptsRawFood,
    bool? acceptsCookedFood,
    bool? acceptsPackagedFood,
    bool? acceptsBeverages,
    bool? isVerified,
    bool? is24Hours,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? createdBy,
    List<String>? photos,
    List<String>? tags,
    String? registrationNumber,
    String? panNumber,
    bool? isDonationEligible,
    int? impactPoints,
    double? carbonSavedKg,
    int? mealsServed,
    List<String>? recentDonations,
  }) {
    return Ngo(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      type: type ?? this.type,
      status: status ?? this.status,
      contactPerson: contactPerson ?? this.contactPerson,
      contactPhone: contactPhone ?? this.contactPhone,
      contactEmail: contactEmail ?? this.contactEmail,
      website: website ?? this.website,
      logoUrl: logoUrl ?? this.logoUrl,
      coverImageUrl: coverImageUrl ?? this.coverImageUrl,
      address: address ?? this.address,
      ward: ward ?? this.ward,
      district: district ?? this.district,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      capacity: capacity ?? this.capacity,
      currentOccupancy: currentOccupancy ?? this.currentOccupancy,
      totalReceived: totalReceived ?? this.totalReceived,
      totalBeneficiaries: totalBeneficiaries ?? this.totalBeneficiaries,
      rating: rating ?? this.rating,
      totalRatings: totalRatings ?? this.totalRatings,
      services: services ?? this.services,
      foodPreferences: foodPreferences ?? this.foodPreferences,
      operatingHours: operatingHours ?? this.operatingHours,
      acceptsRawFood: acceptsRawFood ?? this.acceptsRawFood,
      acceptsCookedFood: acceptsCookedFood ?? this.acceptsCookedFood,
      acceptsPackagedFood: acceptsPackagedFood ?? this.acceptsPackagedFood,
      acceptsBeverages: acceptsBeverages ?? this.acceptsBeverages,
      isVerified: isVerified ?? this.isVerified,
      is24Hours: is24Hours ?? this.is24Hours,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      createdBy: createdBy ?? this.createdBy,
      photos: photos ?? this.photos,
      tags: tags ?? this.tags,
      registrationNumber: registrationNumber ?? this.registrationNumber,
      panNumber: panNumber ?? this.panNumber,
      isDonationEligible: isDonationEligible ?? this.isDonationEligible,
      impactPoints: impactPoints ?? this.impactPoints,
      carbonSavedKg: carbonSavedKg ?? this.carbonSavedKg,
      mealsServed: mealsServed ?? this.mealsServed,
      recentDonations: recentDonations ?? this.recentDonations,
    );
  }

  bool get isAtCapacity => currentOccupancy >= capacity;
  double get occupancyPercentage =>
      capacity > 0 ? (currentOccupancy / capacity) * 100 : 0;

  String get typeDisplayText {
    switch (type) {
      case NgoType.foodBank:
        return 'Food Bank';
      case NgoType.shelter:
        return 'Shelter';
      case NgoType.orphanage:
        return 'Orphanage';
      case NgoType.oldAgeHome:
        return 'Old Age Home';
      case NgoType.communityKitchen:
        return 'Community Kitchen';
      case NgoType.disasterRelief:
        return 'Disaster Relief';
      case NgoType.education:
        return 'Education';
      case NgoType.health:
        return 'Health';
      case NgoType.other:
        return 'Other';
    }
  }
}
