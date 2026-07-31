import 'package:cloud_firestore/cloud_firestore.dart';
import '../config/constants.dart';
import '../models/donation.dart';
import '../models/user.dart';
import '../models/ngo.dart';
import '../models/volunteer.dart';
import '../models/certificate.dart';
import '../models/hunger_zone.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // ==================== DONATIONS ====================

  // Create donation
  Future<String> createDonation(Donation donation) async {
    final docRef = await _firestore
        .collection(AppConstants.donationsCollection)
        .add(donation.toFirestore());
    return docRef.id;
  }

  // Get donation by ID
  Future<Donation?> getDonation(String donationId) async {
    try {
      final doc = await _firestore
          .collection(AppConstants.donationsCollection)
          .doc(donationId)
          .get();
      if (doc.exists) {
        return Donation.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get donation: ${e.toString()}');
    }
  }

  // Update donation
  Future<void> updateDonation(Donation donation) async {
    try {
      await _firestore
          .collection(AppConstants.donationsCollection)
          .doc(donation.id)
          .update(donation.copyWith(updatedAt: DateTime.now()).toFirestore());
    } catch (e) {
      throw Exception('Failed to update donation: ${e.toString()}');
    }
  }

  // Delete donation
  Future<void> deleteDonation(String donationId) async {
    try {
      await _firestore
          .collection(AppConstants.donationsCollection)
          .doc(donationId)
          .delete();
    } catch (e) {
      throw Exception('Failed to delete donation: ${e.toString()}');
    }
  }

  // Get donations stream
  Stream<List<Donation>> getDonationsStream({
    String? status,
    String? donorId,
    String? ngoId,
    String? district,
    int limit = 20,
  }) {
    Query query = _firestore
        .collection(AppConstants.donationsCollection)
        .orderBy('createdAt', descending: true);

    if (status != null) {
      query = query.where('status', isEqualTo: status);
    }
    if (donorId != null) {
      query = query.where('donorId', isEqualTo: donorId);
    }
    if (ngoId != null) {
      query = query.where('assignedNgoId', isEqualTo: ngoId);
    }
    if (district != null) {
      query = query.where('district', isEqualTo: district);
    }

    query = query.limit(limit);

    return query.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => Donation.fromFirestore(doc))
          .toList();
    });
  }

  // Get donations list
  Future<List<Donation>> getDonations({
    String? status,
    String? donorId,
    String? ngoId,
    String? district,
    int limit = 20,
    DocumentSnapshot? lastDocument,
  }) async {
    try {
      Query query = _firestore
          .collection(AppConstants.donationsCollection)
          .orderBy('createdAt', descending: true);

      if (status != null) {
        query = query.where('status', isEqualTo: status);
      }
      if (donorId != null) {
        query = query.where('donorId', isEqualTo: donorId);
      }
      if (ngoId != null) {
        query = query.where('assignedNgoId', isEqualTo: ngoId);
      }
      if (district != null) {
        query = query.where('district', isEqualTo: district);
      }

      query = query.limit(limit);

      if (lastDocument != null) {
        query = query.startAfterDocument(lastDocument);
      }

      final snapshot = await query.get();
      return snapshot.docs
          .map((doc) => Donation.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception('Failed to get donations: ${e.toString()}');
    }
  }

  // Get nearby donations
  Future<List<Donation>> getNearbyDonations({
    required double latitude,
    required double longitude,
    double radiusKm = 10,
    int limit = 20,
  }) async {
    try {
      // Simple bounding box query (for more accuracy, use GeoFire)
      final latDelta = radiusKm / 111.0;
      final lngDelta = radiusKm / (111.0 * _cosDegrees(latitude));

      final snapshot = await _firestore
          .collection(AppConstants.donationsCollection)
          .where('status', isEqualTo: DonationStatus.pending.name)
          .where('latitude',
              isGreaterThanOrEqualTo: latitude - latDelta)
          .where('latitude',
              isLessThanOrEqualTo: latitude + latDelta)
          .where('longitude',
              isGreaterThanOrEqualTo: longitude - lngDelta)
          .where('longitude',
              isLessThanOrEqualTo: longitude + lngDelta)
          .orderBy('createdAt', descending: true)
          .limit(limit)
          .get();

      return snapshot.docs
          .map((doc) => Donation.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception('Failed to get nearby donations: ${e.toString()}');
    }
  }

  // ==================== USERS ====================

  // Get user by ID
  Future<AppUser?> getUser(String userId) async {
    try {
      final doc = await _firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .get();
      if (doc.exists) {
        return AppUser.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get user: ${e.toString()}');
    }
  }

  // Update user
  Future<void> updateUser(AppUser user) async {
    try {
      await _firestore
          .collection(AppConstants.usersCollection)
          .doc(user.id)
          .update(user.copyWith(updatedAt: DateTime.now()).toFirestore());
    } catch (e) {
      throw Exception('Failed to update user: ${e.toString()}');
    }
  }

  // Get users stream
  Stream<List<AppUser>> getUsersStream({
    String? role,
    String? district,
    int limit = 50,
  }) {
    Query query = _firestore
        .collection(AppConstants.usersCollection)
        .orderBy('impactPoints', descending: true);

    if (role != null) {
      query = query.where('role', isEqualTo: role);
    }
    if (district != null) {
      query = query.where('district', isEqualTo: district);
    }

    query = query.limit(limit);

    return query.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => AppUser.fromFirestore(doc))
          .toList();
    });
  }

  // Get leaderboard
  Future<List<AppUser>> getLeaderboard({
    String? district,
    int limit = 50,
  }) async {
    try {
      Query query = _firestore
          .collection(AppConstants.usersCollection)
          .orderBy('impactPoints', descending: true);

      if (district != null) {
        query = query.where('district', isEqualTo: district);
      }

      query = query.limit(limit);

      final snapshot = await query.get();
      return snapshot.docs
          .map((doc) => AppUser.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception('Failed to get leaderboard: ${e.toString()}');
    }
  }

  // Update user impact points
  Future<void> updateUserImpactPoints(
      String userId, int additionalPoints) async {
    try {
      await _firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .update({
        'impactPoints': FieldValue.increment(additionalPoints),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      throw Exception('Failed to update impact points: ${e.toString()}');
    }
  }

  // ==================== NGOs ====================

  // Create NGO
  Future<String> createNgo(Ngo ngo) async {
    final docRef = await _firestore
        .collection(AppConstants.ngosCollection)
        .add(ngo.toFirestore());
    return docRef.id;
  }

  // Get NGO by ID
  Future<Ngo?> getNgo(String ngoId) async {
    try {
      final doc = await _firestore
          .collection(AppConstants.ngosCollection)
          .doc(ngoId)
          .get();
      if (doc.exists) {
        return Ngo.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get NGO: ${e.toString()}');
    }
  }

  // Update NGO
  Future<void> updateNgo(Ngo ngo) async {
    try {
      await _firestore
          .collection(AppConstants.ngosCollection)
          .doc(ngo.id)
          .update(ngo.copyWith(updatedAt: DateTime.now()).toFirestore());
    } catch (e) {
      throw Exception('Failed to update NGO: ${e.toString()}');
    }
  }

  // Get NGOs stream
  Stream<List<Ngo>> getNgosStream({
    String? type,
    String? district,
    bool? isVerified,
    int limit = 20,
  }) {
    Query query = _firestore
        .collection(AppConstants.ngosCollection)
        .orderBy('impactPoints', descending: true);

    if (type != null) {
      query = query.where('type', isEqualTo: type);
    }
    if (district != null) {
      query = query.where('district', isEqualTo: district);
    }
    if (isVerified != null) {
      query = query.where('isVerified', isEqualTo: isVerified);
    }

    query = query.limit(limit);

    return query.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => Ngo.fromFirestore(doc)).toList();
    });
  }

  // Get NGOs list
  Future<List<Ngo>> getNgos({
    String? type,
    String? district,
    bool? isVerified,
    int limit = 20,
  }) async {
    try {
      Query query = _firestore
          .collection(AppConstants.ngosCollection)
          .orderBy('impactPoints', descending: true);

      if (type != null) {
        query = query.where('type', isEqualTo: type);
      }
      if (district != null) {
        query = query.where('district', isEqualTo: district);
      }
      if (isVerified != null) {
        query = query.where('isVerified', isEqualTo: isVerified);
      }

      query = query.limit(limit);

      final snapshot = await query.get();
      return snapshot.docs
          .map((doc) => Ngo.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception('Failed to get NGOs: ${e.toString()}');
    }
  }

  // Get nearby NGOs
  Future<List<Ngo>> getNearbyNgos({
    required double latitude,
    required double longitude,
    double radiusKm = 10,
    int limit = 20,
  }) async {
    try {
      final latDelta = radiusKm / 111.0;
      final lngDelta = radiusKm / (111.0 * _cosDegrees(latitude));

      final snapshot = await _firestore
          .collection(AppConstants.ngosCollection)
          .where('status', isEqualTo: NgoStatus.active.name)
          .where('latitude',
              isGreaterThanOrEqualTo: latitude - latDelta)
          .where('latitude',
              isLessThanOrEqualTo: latitude + latDelta)
          .where('longitude',
              isGreaterThanOrEqualTo: longitude - lngDelta)
          .where('longitude',
              isLessThanOrEqualTo: longitude + lngDelta)
          .limit(limit)
          .get();

      return snapshot.docs
          .map((doc) => Ngo.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception('Failed to get nearby NGOs: ${e.toString()}');
    }
  }

  // ==================== VOLUNTEERS ====================

  // Create volunteer
  Future<String> createVolunteer(Volunteer volunteer) async {
    final docRef = await _firestore
        .collection(AppConstants.volunteersCollection)
        .add(volunteer.toFirestore());
    return docRef.id;
  }

  // Get volunteer by ID
  Future<Volunteer?> getVolunteer(String volunteerId) async {
    try {
      final doc = await _firestore
          .collection(AppConstants.volunteersCollection)
          .doc(volunteerId)
          .get();
      if (doc.exists) {
        return Volunteer.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get volunteer: ${e.toString()}');
    }
  }

  // Update volunteer
  Future<void> updateVolunteer(Volunteer volunteer) async {
    try {
      await _firestore
          .collection(AppConstants.volunteersCollection)
          .doc(volunteer.id)
          .update(
              volunteer.copyWith(updatedAt: DateTime.now()).toFirestore());
    } catch (e) {
      throw Exception('Failed to update volunteer: ${e.toString()}');
    }
  }

  // Get volunteers stream
  Stream<List<Volunteer>> getVolunteersStream({
    String? status,
    String? district,
    bool? isAvailable,
    int limit = 20,
  }) {
    Query query = _firestore
        .collection(AppConstants.volunteersCollection)
        .orderBy('impactPoints', descending: true);

    if (status != null) {
      query = query.where('status', isEqualTo: status);
    }
    if (district != null) {
      query = query.where('assignedWards', arrayContains: district);
    }
    if (isAvailable != null) {
      query = query.where('isAvailable', isEqualTo: isAvailable);
    }

    query = query.limit(limit);

    return query.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => Volunteer.fromFirestore(doc))
          .toList();
    });
  }

  // Get available volunteers
  Future<List<Volunteer>> getAvailableVolunteers({
    required double latitude,
    required double longitude,
    double radiusKm = 15,
    int limit = 10,
  }) async {
    try {
      final snapshot = await _firestore
          .collection(AppConstants.volunteersCollection)
          .where('isAvailable', isEqualTo: true)
          .where('status', isEqualTo: VolunteerStatus.available.name)
          .limit(limit)
          .get();

      return snapshot.docs
          .map((doc) => Volunteer.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception(
          'Failed to get available volunteers: ${e.toString()}');
    }
  }

  // ==================== CERTIFICATES ====================

  // Create certificate
  Future<String> createCertificate(Certificate certificate) async {
    final docRef = await _firestore
        .collection(AppConstants.certificatesCollection)
        .add(certificate.toFirestore());
    return docRef.id;
  }

  // Get certificates for user
  Stream<List<Certificate>> getUserCertificatesStream(String userId) {
    return _firestore
        .collection(AppConstants.certificatesCollection)
        .where('userId', isEqualTo: userId)
        .orderBy('issuedAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => Certificate.fromFirestore(doc))
          .toList();
    });
  }

  // Get certificates list
  Future<List<Certificate>> getUserCertificates(String userId) async {
    try {
      final snapshot = await _firestore
          .collection(AppConstants.certificatesCollection)
          .where('userId', isEqualTo: userId)
          .orderBy('issuedAt', descending: true)
          .get();

      return snapshot.docs
          .map((doc) => Certificate.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception(
          'Failed to get certificates: ${e.toString()}');
    }
  }

  // ==================== HUNGER ZONES ====================

  // Create hunger zone
  Future<String> createHungerZone(HungerZone zone) async {
    final docRef = await _firestore
        .collection(AppConstants.hungerZonesCollection)
        .add(zone.toFirestore());
    return docRef.id;
  }

  // Get hunger zone by ID
  Future<HungerZone?> getHungerZone(String zoneId) async {
    try {
      final doc = await _firestore
          .collection(AppConstants.hungerZonesCollection)
          .doc(zoneId)
          .get();
      if (doc.exists) {
        return HungerZone.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get hunger zone: ${e.toString()}');
    }
  }

  // Get hunger zones stream
  Stream<List<HungerZone>> getHungerZonesStream({
    String? level,
    String? district,
    int limit = 20,
  }) {
    Query query = _firestore
        .collection(AppConstants.hungerZonesCollection)
        .orderBy('priorityScore', descending: true);

    if (level != null) {
      query = query.where('level', isEqualTo: level);
    }
    if (district != null) {
      query = query.where('district', isEqualTo: district);
    }

    query = query.limit(limit);

    return query.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => HungerZone.fromFirestore(doc))
          .toList();
    });
  }

  // Get nearby hunger zones
  Future<List<HungerZone>> getNearbyHungerZones({
    required double latitude,
    required double longitude,
    double radiusKm = 20,
    int limit = 10,
  }) async {
    try {
      final latDelta = radiusKm / 111.0;
      final lngDelta = radiusKm / (111.0 * _cosDegrees(latitude));

      final snapshot = await _firestore
          .collection(AppConstants.hungerZonesCollection)
          .where('status', isEqualTo: ZoneStatus.active.name)
          .where('latitude',
              isGreaterThanOrEqualTo: latitude - latDelta)
          .where('latitude',
              isLessThanOrEqualTo: latitude + latDelta)
          .where('longitude',
              isGreaterThanOrEqualTo: longitude - lngDelta)
          .where('longitude',
              isLessThanOrEqualTo: longitude + lngDelta)
          .orderBy('priorityScore', descending: true)
          .limit(limit)
          .get();

      return snapshot.docs
          .map((doc) => HungerZone.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception(
          'Failed to get nearby hunger zones: ${e.toString()}');
    }
  }

  // ==================== ANALYTICS ====================

  // Get donation stats
  Future<Map<String, dynamic>> getDonationStats({
    String? district,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      Query query = _firestore
          .collection(AppConstants.donationsCollection);

      if (district != null) {
        query = query.where('district', isEqualTo: district);
      }
      if (startDate != null) {
        query = query.where('createdAt',
            isGreaterThanOrEqualTo: Timestamp.fromDate(startDate));
      }
      if (endDate != null) {
        query = query.where('createdAt',
            isLessThanOrEqualTo: Timestamp.fromDate(endDate));
      }

      final snapshot = await query.get();
      final donations = snapshot.docs
          .map((doc) => Donation.fromFirestore(doc))
          .toList();

      final totalDonations = donations.length;
      final totalMeals =
          donations.fold<int>(0, (sum, d) => sum + d.quantity);
      final totalCarbon =
          donations.fold<double>(0, (sum, d) => sum + (d.carbonSavedKg ?? 0));
      final deliveredCount = donations
          .where((d) => d.status == DonationStatus.delivered)
          .length;

      return {
        'totalDonations': totalDonations,
        'totalMeals': totalMeals,
        'totalCarbonSaved': totalCarbon,
        'deliveredCount': deliveredCount,
        'successRate':
            totalDonations > 0 ? (deliveredCount / totalDonations * 100) : 0,
      };
    } catch (e) {
      throw Exception('Failed to get stats: ${e.toString()}');
    }
  }

  // ==================== SEARCH ====================

  // Search donations
  Future<List<Donation>> searchDonations(String query) async {
    try {
      final snapshot = await _firestore
          .collection(AppConstants.donationsCollection)
          .where('foodName', isGreaterThanOrEqualTo: query)
          .where('foodName', isLessThanOrEqualTo: '$query\uf8ff')
          .limit(20)
          .get();

      return snapshot.docs
          .map((doc) => Donation.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception('Failed to search donations: ${e.toString()}');
    }
  }

  // Search NGOs
  Future<List<Ngo>> searchNgos(String query) async {
    try {
      final snapshot = await _firestore
          .collection(AppConstants.ngosCollection)
          .where('name', isGreaterThanOrEqualTo: query)
          .where('name', isLessThanOrEqualTo: '$query\uf8ff')
          .limit(20)
          .get();

      return snapshot.docs
          .map((doc) => Ngo.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception('Failed to search NGOs: ${e.toString()}');
    }
  }

  // Helper function for cosine calculation
  double _cosDegrees(double degrees) {
    return degrees * 3.141592653589793 / 180.0;
  }
}
