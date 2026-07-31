import 'package:cloud_firestore/cloud_firestore.dart';

enum DonationStatus {
  pending,
  matched,
  pickedUp,
  inTransit,
  delivered,
  cancelled,
  expired,
}

enum FoodType {
  cooked,
  raw,
  packaged,
  beverages,
  dairy,
  bakery,
  fruits,
  vegetables,
  grains,
  other,
}

enum FoodCondition {
  fresh,
  good,
  acceptable,
  expired,
}

class Donation {
  final String id;
  final String donorId;
  final String? donorName;
  final String? donorPhone;
  final String foodName;
  final String description;
  final FoodType foodType;
  final FoodCondition foodCondition;
  final DonationStatus status;
  final int quantity;
  final String unit;
  final DateTime preparedAt;
  final DateTime expiryTime;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? assignedVolunteerId;
  final String? assignedNgoId;
  final String? matchedNgoId;
  final double? latitude;
  final double? longitude;
  final String? address;
  final String? ward;
  final String? district;
  final String? photoUrl;
  final List<String> photoUrls;
  final String? pickupInstructions;
  final String? specialNotes;
  final double? estimatedWeight;
  final String? weightUnit;
  final bool isVeg;
  final bool isHalal;
  final bool containsNuts;
  final bool containsDairy;
  final bool containsGluten;
  final List<String> allergens;
  final List<String> tags;
  final String? aiMatchId;
  final double? aiMatchScore;
  final String? aiMatchReason;
  final double? carbonSavedKg;
  final double? mealsEquivalent;
  final List<DeliveryEvent> deliveryTimeline;
  final String? cancellationReason;
  final double? rating;
  final String? feedback;
  final int impactPoints;
  final bool isUrgent;
  final String? urgencyReason;
  final int maxPickupDistanceKm;
  final DateTime? matchedAt;
  final DateTime? pickedUpAt;
  final DateTime? deliveredAt;

  Donation({
    required this.id,
    required this.donorId,
    this.donorName,
    this.donorPhone,
    required this.foodName,
    this.description = '',
    required this.foodType,
    this.foodCondition = FoodCondition.fresh,
    this.status = DonationStatus.pending,
    required this.quantity,
    this.unit = 'portions',
    required this.preparedAt,
    required this.expiryTime,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.assignedVolunteerId,
    this.assignedNgoId,
    this.matchedNgoId,
    this.latitude,
    this.longitude,
    this.address,
    this.ward,
    this.district,
    this.photoUrl,
    this.photoUrls = const [],
    this.pickupInstructions,
    this.specialNotes,
    this.estimatedWeight,
    this.weightUnit,
    this.isVeg = true,
    this.isHalal = false,
    this.containsNuts = false,
    this.containsDairy = false,
    this.containsGluten = false,
    this.allergens = const [],
    this.tags = const [],
    this.aiMatchId,
    this.aiMatchScore,
    this.aiMatchReason,
    this.carbonSavedKg,
    this.mealsEquivalent,
    this.deliveryTimeline = const [],
    this.cancellationReason,
    this.rating,
    this.feedback,
    this.impactPoints = 0,
    this.isUrgent = false,
    this.urgencyReason,
    this.maxPickupDistanceKm = 10,
    this.matchedAt,
    this.pickedUpAt,
    this.deliveredAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory Donation.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return Donation(
      id: doc.id,
      donorId: data['donorId'] ?? '',
      donorName: data['donorName'],
      donorPhone: data['donorPhone'],
      foodName: data['foodName'] ?? '',
      description: data['description'] ?? '',
      foodType: FoodType.values.firstWhere(
        (e) => e.name == data['foodType'],
        orElse: () => FoodType.other,
      ),
      foodCondition: FoodCondition.values.firstWhere(
        (e) => e.name == data['foodCondition'],
        orElse: () => FoodCondition.fresh,
      ),
      status: DonationStatus.values.firstWhere(
        (e) => e.name == data['status'],
        orElse: () => DonationStatus.pending,
      ),
      quantity: data['quantity'] ?? 0,
      unit: data['unit'] ?? 'portions',
      preparedAt: data['preparedAt'] != null
          ? (data['preparedAt'] as Timestamp).toDate()
          : DateTime.now(),
      expiryTime: data['expiryTime'] != null
          ? (data['expiryTime'] as Timestamp).toDate()
          : DateTime.now().add(const Duration(hours: 4)),
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : DateTime.now(),
      assignedVolunteerId: data['assignedVolunteerId'],
      assignedNgoId: data['assignedNgoId'],
      matchedNgoId: data['matchedNgoId'],
      latitude: data['latitude']?.toDouble(),
      longitude: data['longitude']?.toDouble(),
      address: data['address'],
      ward: data['ward'],
      district: data['district'],
      photoUrl: data['photoUrl'],
      photoUrls: List<String>.from(data['photoUrls'] ?? []),
      pickupInstructions: data['pickupInstructions'],
      specialNotes: data['specialNotes'],
      estimatedWeight: data['estimatedWeight']?.toDouble(),
      weightUnit: data['weightUnit'],
      isVeg: data['isVeg'] ?? true,
      isHalal: data['isHalal'] ?? false,
      containsNuts: data['containsNuts'] ?? false,
      containsDairy: data['containsDairy'] ?? false,
      containsGluten: data['containsGluten'] ?? false,
      allergens: List<String>.from(data['allergens'] ?? []),
      tags: List<String>.from(data['tags'] ?? []),
      aiMatchId: data['aiMatchId'],
      aiMatchScore: data['aiMatchScore']?.toDouble(),
      aiMatchReason: data['aiMatchReason'],
      carbonSavedKg: data['carbonSavedKg']?.toDouble(),
      mealsEquivalent: data['mealsEquivalent']?.toDouble(),
      deliveryTimeline: (data['deliveryTimeline'] as List<dynamic>?)
              ?.map((e) => DeliveryEvent.fromMap(e as Map<String, dynamic>))
              .toList() ??
          [],
      cancellationReason: data['cancellationReason'],
      rating: data['rating']?.toDouble(),
      feedback: data['feedback'],
      impactPoints: data['impactPoints'] ?? 0,
      isUrgent: data['isUrgent'] ?? false,
      urgencyReason: data['urgencyReason'],
      maxPickupDistanceKm: data['maxPickupDistanceKm'] ?? 10,
      matchedAt: data['matchedAt'] != null
          ? (data['matchedAt'] as Timestamp).toDate()
          : null,
      pickedUpAt: data['pickedUpAt'] != null
          ? (data['pickedUpAt'] as Timestamp).toDate()
          : null,
      deliveredAt: data['deliveredAt'] != null
          ? (data['deliveredAt'] as Timestamp).toDate()
          : null,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'donorId': donorId,
      'donorName': donorName,
      'donorPhone': donorPhone,
      'foodName': foodName,
      'description': description,
      'foodType': foodType.name,
      'foodCondition': foodCondition.name,
      'status': status.name,
      'quantity': quantity,
      'unit': unit,
      'preparedAt': Timestamp.fromDate(preparedAt),
      'expiryTime': Timestamp.fromDate(expiryTime),
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(DateTime.now()),
      'assignedVolunteerId': assignedVolunteerId,
      'assignedNgoId': assignedNgoId,
      'matchedNgoId': matchedNgoId,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'ward': ward,
      'district': district,
      'photoUrl': photoUrl,
      'photoUrls': photoUrls,
      'pickupInstructions': pickupInstructions,
      'specialNotes': specialNotes,
      'estimatedWeight': estimatedWeight,
      'weightUnit': weightUnit,
      'isVeg': isVeg,
      'isHalal': isHalal,
      'containsNuts': containsNuts,
      'containsDairy': containsDairy,
      'containsGluten': containsGluten,
      'allergens': allergens,
      'tags': tags,
      'aiMatchId': aiMatchId,
      'aiMatchScore': aiMatchScore,
      'aiMatchReason': aiMatchReason,
      'carbonSavedKg': carbonSavedKg,
      'mealsEquivalent': mealsEquivalent,
      'deliveryTimeline':
          deliveryTimeline.map((e) => e.toMap()).toList(),
      'cancellationReason': cancellationReason,
      'rating': rating,
      'feedback': feedback,
      'impactPoints': impactPoints,
      'isUrgent': isUrgent,
      'urgencyReason': urgencyReason,
      'maxPickupDistanceKm': maxPickupDistanceKm,
      'matchedAt': matchedAt != null ? Timestamp.fromDate(matchedAt!) : null,
      'pickedUpAt':
          pickedUpAt != null ? Timestamp.fromDate(pickedUpAt!) : null,
      'deliveredAt':
          deliveredAt != null ? Timestamp.fromDate(deliveredAt!) : null,
    };
  }

  Donation copyWith({
    String? id,
    String? donorId,
    String? donorName,
    String? donorPhone,
    String? foodName,
    String? description,
    FoodType? foodType,
    FoodCondition? foodCondition,
    DonationStatus? status,
    int? quantity,
    String? unit,
    DateTime? preparedAt,
    DateTime? expiryTime,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? assignedVolunteerId,
    String? assignedNgoId,
    String? matchedNgoId,
    double? latitude,
    double? longitude,
    String? address,
    String? ward,
    String? district,
    String? photoUrl,
    List<String>? photoUrls,
    String? pickupInstructions,
    String? specialNotes,
    double? estimatedWeight,
    String? weightUnit,
    bool? isVeg,
    bool? isHalal,
    bool? containsNuts,
    bool? containsDairy,
    bool? containsGluten,
    List<String>? allergens,
    List<String>? tags,
    String? aiMatchId,
    double? aiMatchScore,
    String? aiMatchReason,
    double? carbonSavedKg,
    double? mealsEquivalent,
    List<DeliveryEvent>? deliveryTimeline,
    String? cancellationReason,
    double? rating,
    String? feedback,
    int? impactPoints,
    bool? isUrgent,
    String? urgencyReason,
    int? maxPickupDistanceKm,
    DateTime? matchedAt,
    DateTime? pickedUpAt,
    DateTime? deliveredAt,
  }) {
    return Donation(
      id: id ?? this.id,
      donorId: donorId ?? this.donorId,
      donorName: donorName ?? this.donorName,
      donorPhone: donorPhone ?? this.donorPhone,
      foodName: foodName ?? this.foodName,
      description: description ?? this.description,
      foodType: foodType ?? this.foodType,
      foodCondition: foodCondition ?? this.foodCondition,
      status: status ?? this.status,
      quantity: quantity ?? this.quantity,
      unit: unit ?? this.unit,
      preparedAt: preparedAt ?? this.preparedAt,
      expiryTime: expiryTime ?? this.expiryTime,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      assignedVolunteerId: assignedVolunteerId ?? this.assignedVolunteerId,
      assignedNgoId: assignedNgoId ?? this.assignedNgoId,
      matchedNgoId: matchedNgoId ?? this.matchedNgoId,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      ward: ward ?? this.ward,
      district: district ?? this.district,
      photoUrl: photoUrl ?? this.photoUrl,
      photoUrls: photoUrls ?? this.photoUrls,
      pickupInstructions: pickupInstructions ?? this.pickupInstructions,
      specialNotes: specialNotes ?? this.specialNotes,
      estimatedWeight: estimatedWeight ?? this.estimatedWeight,
      weightUnit: weightUnit ?? this.weightUnit,
      isVeg: isVeg ?? this.isVeg,
      isHalal: isHalal ?? this.isHalal,
      containsNuts: containsNuts ?? this.containsNuts,
      containsDairy: containsDairy ?? this.containsDairy,
      containsGluten: containsGluten ?? this.containsGluten,
      allergens: allergens ?? this.allergens,
      tags: tags ?? this.tags,
      aiMatchId: aiMatchId ?? this.aiMatchId,
      aiMatchScore: aiMatchScore ?? this.aiMatchScore,
      aiMatchReason: aiMatchReason ?? this.aiMatchReason,
      carbonSavedKg: carbonSavedKg ?? this.carbonSavedKg,
      mealsEquivalent: mealsEquivalent ?? this.mealsEquivalent,
      deliveryTimeline: deliveryTimeline ?? this.deliveryTimeline,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      rating: rating ?? this.rating,
      feedback: feedback ?? this.feedback,
      impactPoints: impactPoints ?? this.impactPoints,
      isUrgent: isUrgent ?? this.isUrgent,
      urgencyReason: urgencyReason ?? this.urgencyReason,
      maxPickupDistanceKm: maxPickupDistanceKm ?? this.maxPickupDistanceKm,
      matchedAt: matchedAt ?? this.matchedAt,
      pickedUpAt: pickedUpAt ?? this.pickedUpAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
    );
  }

  bool get isExpired => DateTime.now().isAfter(expiryTime);
  bool get isAvailable =>
      status == DonationStatus.pending && !isExpired;
  bool get canBeCancelled =>
      status == DonationStatus.pending || status == DonationStatus.matched;

  String get statusDisplayText {
    switch (status) {
      case DonationStatus.pending:
        return 'Pending';
      case DonationStatus.matched:
        return 'Matched';
      case DonationStatus.pickedUp:
        return 'Picked Up';
      case DonationStatus.inTransit:
        return 'In Transit';
      case DonationStatus.delivered:
        return 'Delivered';
      case DonationStatus.cancelled:
        return 'Cancelled';
      case DonationStatus.expired:
        return 'Expired';
    }
  }

  String get foodTypeDisplayText {
    switch (foodType) {
      case FoodType.cooked:
        return 'Cooked Food';
      case FoodType.raw:
        return 'Raw Ingredients';
      case FoodType.packaged:
        return 'Packaged Food';
      case FoodType.beverages:
        return 'Beverages';
      case FoodType.dairy:
        return 'Dairy Products';
      case FoodType.bakery:
        return 'Bakery Items';
      case FoodType.fruits:
        return 'Fruits';
      case FoodType.vegetables:
        return 'Vegetables';
      case FoodType.grains:
        return 'Grains & Cereals';
      case FoodType.other:
        return 'Other';
    }
  }

  Duration get timeUntilExpiry => expiryTime.difference(DateTime.now());
  bool get isNearExpiry => timeUntilExpiry.inHours < 2;
}

class DeliveryEvent {
  final String status;
  final DateTime timestamp;
  final String? location;
  final String? note;
  final String? updatedBy;

  DeliveryEvent({
    required this.status,
    required this.timestamp,
    this.location,
    this.note,
    this.updatedBy,
  });

  factory DeliveryEvent.fromMap(Map<String, dynamic> map) {
    return DeliveryEvent(
      status: map['status'] ?? '',
      timestamp: map['timestamp'] != null
          ? (map['timestamp'] as Timestamp).toDate()
          : DateTime.now(),
      location: map['location'],
      note: map['note'],
      updatedBy: map['updatedBy'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'status': status,
      'timestamp': Timestamp.fromDate(timestamp),
      'location': location,
      'note': note,
      'updatedBy': updatedBy,
    };
  }
}
