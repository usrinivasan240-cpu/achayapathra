import 'package:cloud_firestore/cloud_firestore.dart';

enum CertificateLevel {
  bronze,
  silver,
  gold,
  platinum,
  diamond,
}

enum CertificateStatus {
  active,
  revoked,
  expired,
  pending,
}

class Certificate {
  final String id;
  final String userId;
  final String userName;
  final String? userEmail;
  final CertificateLevel level;
  final CertificateStatus status;
  final String title;
  final String description;
  final int impactPoints;
  final int donationsCount;
  final int mealsSaved;
  final double carbonSavedKg;
  final DateTime issuedAt;
  final DateTime? expiresAt;
  final DateTime? revokedAt;
  final String? revokedReason;
  final String? issuedBy;
  final String? certificateNumber;
  final String? qrCode;
  final String? imageUrl;
  final String? pdfUrl;
  final List<String> badges;
  final String? verificationUrl;
  final Map<String, dynamic>? metadata;
  final String? ward;
  final String? district;

  Certificate({
    required this.id,
    required this.userId,
    required this.userName,
    this.userEmail,
    this.level = CertificateLevel.bronze,
    this.status = CertificateStatus.active,
    required this.title,
    this.description = '',
    this.impactPoints = 0,
    this.donationsCount = 0,
    this.mealsSaved = 0,
    this.carbonSavedKg = 0,
    DateTime? issuedAt,
    this.expiresAt,
    this.revokedAt,
    this.revokedReason,
    this.issuedBy,
    this.certificateNumber,
    this.qrCode,
    this.imageUrl,
    this.pdfUrl,
    this.badges = const [],
    this.verificationUrl,
    this.metadata,
    this.ward,
    this.district,
  }) : issuedAt = issuedAt ?? DateTime.now();

  factory Certificate.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return Certificate(
      id: doc.id,
      userId: data['userId'] ?? '',
      userName: data['userName'] ?? '',
      userEmail: data['userEmail'],
      level: CertificateLevel.values.firstWhere(
        (e) => e.name == data['level'],
        orElse: () => CertificateLevel.bronze,
      ),
      status: CertificateStatus.values.firstWhere(
        (e) => e.name == data['status'],
        orElse: () => CertificateStatus.active,
      ),
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      impactPoints: data['impactPoints'] ?? 0,
      donationsCount: data['donationsCount'] ?? 0,
      mealsSaved: data['mealsSaved'] ?? 0,
      carbonSavedKg: data['carbonSavedKg']?.toDouble() ?? 0,
      issuedAt: data['issuedAt'] != null
          ? (data['issuedAt'] as Timestamp).toDate()
          : DateTime.now(),
      expiresAt: data['expiresAt'] != null
          ? (data['expiresAt'] as Timestamp).toDate()
          : null,
      revokedAt: data['revokedAt'] != null
          ? (data['revokedAt'] as Timestamp).toDate()
          : null,
      revokedReason: data['revokedReason'],
      issuedBy: data['issuedBy'],
      certificateNumber: data['certificateNumber'],
      qrCode: data['qrCode'],
      imageUrl: data['imageUrl'],
      pdfUrl: data['pdfUrl'],
      badges: List<String>.from(data['badges'] ?? []),
      verificationUrl: data['verificationUrl'],
      metadata: data['metadata'],
      ward: data['ward'],
      district: data['district'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'userName': userName,
      'userEmail': userEmail,
      'level': level.name,
      'status': status.name,
      'title': title,
      'description': description,
      'impactPoints': impactPoints,
      'donationsCount': donationsCount,
      'mealsSaved': mealsSaved,
      'carbonSavedKg': carbonSavedKg,
      'issuedAt': Timestamp.fromDate(issuedAt),
      'expiresAt': expiresAt != null ? Timestamp.fromDate(expiresAt!) : null,
      'revokedAt': revokedAt != null ? Timestamp.fromDate(revokedAt!) : null,
      'revokedReason': revokedReason,
      'issuedBy': issuedBy,
      'certificateNumber': certificateNumber,
      'qrCode': qrCode,
      'imageUrl': imageUrl,
      'pdfUrl': pdfUrl,
      'badges': badges,
      'verificationUrl': verificationUrl,
      'metadata': metadata,
      'ward': ward,
      'district': district,
    };
  }

  Certificate copyWith({
    String? id,
    String? userId,
    String? userName,
    String? userEmail,
    CertificateLevel? level,
    CertificateStatus? status,
    String? title,
    String? description,
    int? impactPoints,
    int? donationsCount,
    int? mealsSaved,
    double? carbonSavedKg,
    DateTime? issuedAt,
    DateTime? expiresAt,
    DateTime? revokedAt,
    String? revokedReason,
    String? issuedBy,
    String? certificateNumber,
    String? qrCode,
    String? imageUrl,
    String? pdfUrl,
    List<String>? badges,
    String? verificationUrl,
    Map<String, dynamic>? metadata,
    String? ward,
    String? district,
  }) {
    return Certificate(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userEmail: userEmail ?? this.userEmail,
      level: level ?? this.level,
      status: status ?? this.status,
      title: title ?? this.title,
      description: description ?? this.description,
      impactPoints: impactPoints ?? this.impactPoints,
      donationsCount: donationsCount ?? this.donationsCount,
      mealsSaved: mealsSaved ?? this.mealsSaved,
      carbonSavedKg: carbonSavedKg ?? this.carbonSavedKg,
      issuedAt: issuedAt ?? this.issuedAt,
      expiresAt: expiresAt ?? this.expiresAt,
      revokedAt: revokedAt ?? this.revokedAt,
      revokedReason: revokedReason ?? this.revokedReason,
      issuedBy: issuedBy ?? this.issuedBy,
      certificateNumber: certificateNumber ?? this.certificateNumber,
      qrCode: qrCode ?? this.qrCode,
      imageUrl: imageUrl ?? this.imageUrl,
      pdfUrl: pdfUrl ?? this.pdfUrl,
      badges: badges ?? this.badges,
      verificationUrl: verificationUrl ?? this.verificationUrl,
      metadata: metadata ?? this.metadata,
      ward: ward ?? this.ward,
      district: district ?? this.district,
    );
  }

  bool get isValid =>
      status == CertificateStatus.active &&
      (expiresAt == null || DateTime.now().isBefore(expiresAt!));

  String get levelDisplayText {
    switch (level) {
      case CertificateLevel.bronze:
        return 'Bronze';
      case CertificateLevel.silver:
        return 'Silver';
      case CertificateLevel.gold:
        return 'Gold';
      case CertificateLevel.platinum:
        return 'Platinum';
      case CertificateLevel.diamond:
        return 'Diamond';
    }
  }

  String get levelEmoji {
    switch (level) {
      case CertificateLevel.bronze:
        return '🥉';
      case CertificateLevel.silver:
        return '🥈';
      case CertificateLevel.gold:
        return '🥇';
      case CertificateLevel.platinum:
        return '💎';
      case CertificateLevel.diamond:
        return '👑';
    }
  }

  int get levelMinPoints {
    switch (level) {
      case CertificateLevel.bronze:
        return 100;
      case CertificateLevel.silver:
        return 500;
      case CertificateLevel.gold:
        return 1000;
      case CertificateLevel.platinum:
        return 2500;
      case CertificateLevel.diamond:
        return 5000;
    }
  }

  static CertificateLevel getLevelForPoints(int points) {
    if (points >= 5000) return CertificateLevel.diamond;
    if (points >= 2500) return CertificateLevel.platinum;
    if (points >= 1000) return CertificateLevel.gold;
    if (points >= 500) return CertificateLevel.silver;
    return CertificateLevel.bronze;
  }
}
