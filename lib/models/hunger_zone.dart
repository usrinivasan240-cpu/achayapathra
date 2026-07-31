import 'package:cloud_firestore/cloud_firestore.dart';

enum HungerLevel {
  low,
  moderate,
  high,
  critical,
}

enum ZoneStatus {
  active,
  inactive,
  monitoring,
  resolved,
}

class HungerZone {
  final String id;
  final String name;
  final String description;
  final HungerLevel level;
  final ZoneStatus status;
  final double latitude;
  final double longitude;
  final String? address;
  final String? ward;
  final String? district;
  final String? state;
  final double radiusKm;
  final int estimatedPopulation;
  final int affectedPopulation;
  final int totalDonationsReceived;
  final int totalMealsServed;
  final List<String> nearbyNgos;
  final List<String> recentDonations;
  final List<String> tags;
  final String? reporterId;
  final String? reporterName;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastDonationAt;
  final DateTime? lastUpdatedStatusAt;
  final bool isVerified;
  final String? verifiedBy;
  final DateTime? verifiedAt;
  final List<HungerZoneUpdate> updates;
  final Map<String, dynamic>? metadata;
  final List<String> photos;
  final String? urgencyNote;
  final int priorityScore;

  HungerZone({
    required this.id,
    required this.name,
    this.description = '',
    this.level = HungerLevel.moderate,
    this.status = ZoneStatus.active,
    required this.latitude,
    required this.longitude,
    this.address,
    this.ward,
    this.district,
    this.state,
    this.radiusKm = 2.0,
    this.estimatedPopulation = 0,
    this.affectedPopulation = 0,
    this.totalDonationsReceived = 0,
    this.totalMealsServed = 0,
    this.nearbyNgos = const [],
    this.recentDonations = const [],
    this.tags = const [],
    this.reporterId,
    this.reporterName,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.lastDonationAt,
    this.lastUpdatedStatusAt,
    this.isVerified = false,
    this.verifiedBy,
    this.verifiedAt,
    this.updates = const [],
    this.metadata,
    this.photos = const [],
    this.urgencyNote,
    this.priorityScore = 0,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory HungerZone.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return HungerZone(
      id: doc.id,
      name: data['name'] ?? '',
      description: data['description'] ?? '',
      level: HungerLevel.values.firstWhere(
        (e) => e.name == data['level'],
        orElse: () => HungerLevel.moderate,
      ),
      status: ZoneStatus.values.firstWhere(
        (e) => e.name == data['status'],
        orElse: () => ZoneStatus.active,
      ),
      latitude: data['latitude']?.toDouble() ?? 0,
      longitude: data['longitude']?.toDouble() ?? 0,
      address: data['address'],
      ward: data['ward'],
      district: data['district'],
      state: data['state'],
      radiusKm: data['radiusKm']?.toDouble() ?? 2.0,
      estimatedPopulation: data['estimatedPopulation'] ?? 0,
      affectedPopulation: data['affectedPopulation'] ?? 0,
      totalDonationsReceived: data['totalDonationsReceived'] ?? 0,
      totalMealsServed: data['totalMealsServed'] ?? 0,
      nearbyNgos: List<String>.from(data['nearbyNgos'] ?? []),
      recentDonations: List<String>.from(data['recentDonations'] ?? []),
      tags: List<String>.from(data['tags'] ?? []),
      reporterId: data['reporterId'],
      reporterName: data['reporterName'],
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : DateTime.now(),
      lastDonationAt: data['lastDonationAt'] != null
          ? (data['lastDonationAt'] as Timestamp).toDate()
          : null,
      lastUpdatedStatusAt: data['lastUpdatedStatusAt'] != null
          ? (data['lastUpdatedStatusAt'] as Timestamp).toDate()
          : null,
      isVerified: data['isVerified'] ?? false,
      verifiedBy: data['verifiedBy'],
      verifiedAt: data['verifiedAt'] != null
          ? (data['verifiedAt'] as Timestamp).toDate()
          : null,
      updates: (data['updates'] as List<dynamic>?)
              ?.map((e) => HungerZoneUpdate.fromMap(e as Map<String, dynamic>))
              .toList() ??
          [],
      metadata: data['metadata'],
      photos: List<String>.from(data['photos'] ?? []),
      urgencyNote: data['urgencyNote'],
      priorityScore: data['priorityScore'] ?? 0,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'description': description,
      'level': level.name,
      'status': status.name,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'ward': ward,
      'district': district,
      'state': state,
      'radiusKm': radiusKm,
      'estimatedPopulation': estimatedPopulation,
      'affectedPopulation': affectedPopulation,
      'totalDonationsReceived': totalDonationsReceived,
      'totalMealsServed': totalMealsServed,
      'nearbyNgos': nearbyNgos,
      'recentDonations': recentDonations,
      'tags': tags,
      'reporterId': reporterId,
      'reporterName': reporterName,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(DateTime.now()),
      'lastDonationAt': lastDonationAt != null
          ? Timestamp.fromDate(lastDonationAt!)
          : null,
      'lastUpdatedStatusAt': lastUpdatedStatusAt != null
          ? Timestamp.fromDate(lastUpdatedStatusAt!)
          : null,
      'isVerified': isVerified,
      'verifiedBy': verifiedBy,
      'verifiedAt':
          verifiedAt != null ? Timestamp.fromDate(verifiedAt!) : null,
      'updates': updates.map((e) => e.toMap()).toList(),
      'metadata': metadata,
      'photos': photos,
      'urgencyNote': urgencyNote,
      'priorityScore': priorityScore,
    };
  }

  HungerZone copyWith({
    String? id,
    String? name,
    String? description,
    HungerLevel? level,
    ZoneStatus? status,
    double? latitude,
    double? longitude,
    String? address,
    String? ward,
    String? district,
    String? state,
    double? radiusKm,
    int? estimatedPopulation,
    int? affectedPopulation,
    int? totalDonationsReceived,
    int? totalMealsServed,
    List<String>? nearbyNgos,
    List<String>? recentDonations,
    List<String>? tags,
    String? reporterId,
    String? reporterName,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastDonationAt,
    DateTime? lastUpdatedStatusAt,
    bool? isVerified,
    String? verifiedBy,
    DateTime? verifiedAt,
    List<HungerZoneUpdate>? updates,
    Map<String, dynamic>? metadata,
    List<String>? photos,
    String? urgencyNote,
    int? priorityScore,
  }) {
    return HungerZone(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      level: level ?? this.level,
      status: status ?? this.status,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      ward: ward ?? this.ward,
      district: district ?? this.district,
      state: state ?? this.state,
      radiusKm: radiusKm ?? this.radiusKm,
      estimatedPopulation: estimatedPopulation ?? this.estimatedPopulation,
      affectedPopulation: affectedPopulation ?? this.affectedPopulation,
      totalDonationsReceived:
          totalDonationsReceived ?? this.totalDonationsReceived,
      totalMealsServed: totalMealsServed ?? this.totalMealsServed,
      nearbyNgos: nearbyNgos ?? this.nearbyNgos,
      recentDonations: recentDonations ?? this.recentDonations,
      tags: tags ?? this.tags,
      reporterId: reporterId ?? this.reporterId,
      reporterName: reporterName ?? this.reporterName,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastDonationAt: lastDonationAt ?? this.lastDonationAt,
      lastUpdatedStatusAt: lastUpdatedStatusAt ?? this.lastUpdatedStatusAt,
      isVerified: isVerified ?? this.isVerified,
      verifiedBy: verifiedBy ?? this.verifiedBy,
      verifiedAt: verifiedAt ?? this.verifiedAt,
      updates: updates ?? this.updates,
      metadata: metadata ?? this.metadata,
      photos: photos ?? this.photos,
      urgencyNote: urgencyNote ?? this.urgencyNote,
      priorityScore: priorityScore ?? this.priorityScore,
    );
  }

  String get levelDisplayText {
    switch (level) {
      case HungerLevel.low:
        return 'Low';
      case HungerLevel.moderate:
        return 'Moderate';
      case HungerLevel.high:
        return 'High';
      case HungerLevel.critical:
        return 'Critical';
    }
  }

  String get levelEmoji {
    switch (level) {
      case HungerLevel.low:
        return '🟢';
      case HungerLevel.moderate:
        return '🟡';
      case HungerLevel.high:
        return '🟠';
      case HungerLevel.critical:
        return '🔴';
    }
  }

  bool get needsUrgentAttention =>
      level == HungerLevel.critical || level == HungerLevel.high;
}

class HungerZoneUpdate {
  final String id;
  final String message;
  final String? updatedBy;
  final String? updatedByName;
  final DateTime timestamp;
  final String? type;

  HungerZoneUpdate({
    required this.id,
    required this.message,
    this.updatedBy,
    this.updatedByName,
    DateTime? timestamp,
    this.type,
  }) : timestamp = timestamp ?? DateTime.now();

  factory HungerZoneUpdate.fromMap(Map<String, dynamic> map) {
    return HungerZoneUpdate(
      id: map['id'] ?? '',
      message: map['message'] ?? '',
      updatedBy: map['updatedBy'],
      updatedByName: map['updatedByName'],
      timestamp: map['timestamp'] != null
          ? (map['timestamp'] as Timestamp).toDate()
          : DateTime.now(),
      type: map['type'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'message': message,
      'updatedBy': updatedBy,
      'updatedByName': updatedByName,
      'timestamp': Timestamp.fromDate(timestamp),
      'type': type,
    };
  }
}
