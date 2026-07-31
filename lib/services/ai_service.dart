import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../config/constants.dart';
import '../models/donation.dart';
import '../models/ngo.dart';
import '../models/volunteer.dart';

class AiMatchResult {
  final String matchedId;
  final double score;
  final String reason;
  final Map<String, dynamic> factors;

  AiMatchResult({
    required this.matchedId,
    required this.score,
    required this.reason,
    this.factors = const {},
  });
}

class AiService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Match donation with best NGO
  Future<AiMatchResult?> matchDonationWithNgo(Donation donation) async {
    try {
      // Get available NGOs
      final ngosSnapshot = await _firestore
          .collection(AppConstants.ngosCollection)
          .where('status', isEqualTo: NgoStatus.active.name)
          .where('isDonationEligible', isEqualTo: true)
          .get();

      if (ngosSnapshot.docs.isEmpty) return null;

      final ngos = ngosSnapshot.docs
          .map((doc) => Ngo.fromFirestore(doc))
          .toList();

      AiMatchResult? bestMatch;
      double bestScore = -1;

      for (final ngo in ngos) {
        final score = _calculateNgoMatchScore(donation, ngo);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = AiMatchResult(
            matchedId: ngo.id,
            score: score,
            reason: _getNgoMatchReason(donation, ngo, score),
            factors: _getNgoMatchFactors(donation, ngo),
          );
        }
      }

      return bestMatch;
    } catch (e) {
      throw Exception('Failed to match donation: ${e.toString()}');
    }
  }

  // Match donation with best volunteer
  Future<AiMatchResult?> matchDonationWithVolunteer(
      Donation donation) async {
    try {
      // Get available volunteers
      final volunteersSnapshot = await _firestore
          .collection(AppConstants.volunteersCollection)
          .where('isAvailable', isEqualTo: true)
          .where('status', isEqualTo: VolunteerStatus.available.name)
          .get();

      if (volunteersSnapshot.docs.isEmpty) return null;

      final volunteers = volunteersSnapshot.docs
          .map((doc) => Volunteer.fromFirestore(doc))
          .toList();

      AiMatchResult? bestMatch;
      double bestScore = -1;

      for (final volunteer in volunteers) {
        final score = _calculateVolunteerMatchScore(donation, volunteer);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = AiMatchResult(
            matchedId: volunteer.id,
            score: score,
            reason: _getVolunteerMatchReason(donation, volunteer, score),
            factors: _getVolunteerMatchFactors(donation, volunteer),
          );
        }
      }

      return bestMatch;
    } catch (e) {
      throw Exception(
          'Failed to match volunteer: ${e.toString()}');
    }
  }

  // Calculate NGO match score (0-100)
  double _calculateNgoMatchScore(Donation donation, Ngo ngo) {
    double score = 0;

    // Food type compatibility (30 points)
    score += _getFoodTypeCompatibility(donation, ngo) * 30;

    // Distance (25 points)
    if (donation.latitude != null &&
        donation.longitude != null &&
        ngo.latitude != null &&
        ngo.longitude != null) {
      final distance = _calculateDistance(
        donation.latitude!,
        donation.longitude!,
        ngo.latitude!,
        ngo.longitude!,
      );
      if (distance <= 5) {
        score += 25;
      } else if (distance <= 10) {
        score += 20;
      } else if (distance <= 20) {
        score += 15;
      } else if (distance <= 50) {
        score += 10;
      } else {
        score += 5;
      }
    }

    // Capacity (20 points)
    if (!ngo.isAtCapacity) {
      score += 20 * (1 - ngo.occupancyPercentage / 100);
    }

    // Rating (15 points)
    if (ngo.rating != null && ngo.rating! > 0) {
      score += (ngo.rating! / 5) * 15;
    }

    // Urgency bonus (10 points)
    if (donation.isUrgent) {
      score += 10;
    }

    return min(score, 100);
  }

  // Calculate volunteer match score (0-100)
  double _calculateVolunteerMatchScore(
      Donation donation, Volunteer volunteer) {
    double score = 0;

    // Distance (35 points)
    if (donation.latitude != null &&
        donation.longitude != null &&
        volunteer.currentLatitude != null &&
        volunteer.currentLongitude != null) {
      final distance = _calculateDistance(
        donation.latitude!,
        donation.longitude!,
        volunteer.currentLatitude!,
        volunteer.currentLongitude!,
      );
      if (distance <= 3) {
        score += 35;
      } else if (distance <= 5) {
        score += 30;
      } else if (distance <= 10) {
        score += 25;
      } else if (distance <= 20) {
        score += 15;
      } else {
        score += 5;
      }
    }

    // Vehicle capacity (20 points)
    if (donation.estimatedWeight != null) {
      if (volunteer.maxCapacityKg >= donation.estimatedWeight!) {
        score += 20;
      } else {
        score += 10;
      }
    } else {
      score += 15;
    }

    // Rating (15 points)
    if (volunteer.averageRating > 0) {
      score += (volunteer.averageRating / 5) * 15;
    }

    // Experience (15 points)
    final totalDeliveries = volunteer.totalDeliveries;
    if (totalDeliveries >= 100) {
      score += 15;
    } else if (totalDeliveries >= 50) {
      score += 12;
    } else if (totalDeliveries >= 20) {
      score += 10;
    } else if (totalDeliveries >= 5) {
      score += 7;
    } else {
      score += 3;
    }

    // Availability (15 points)
    if (volunteer.isAvailable &&
        volunteer.status == VolunteerStatus.available) {
      score += 15;
    } else if (volunteer.isAvailable) {
      score += 8;
    }

    return min(score, 100);
  }

  // Get food type compatibility (0-1)
  double _getFoodTypeCompatibility(Donation donation, Ngo ngo) {
    double compatibility = 0.5; // Default

    switch (donation.foodType) {
      case FoodType.cooked:
        if (ngo.acceptsCookedFood) compatibility = 1.0;
        break;
      case FoodType.raw:
        if (ngo.acceptsRawFood) compatibility = 1.0;
        break;
      case FoodType.packaged:
        if (ngo.acceptsPackagedFood) compatibility = 1.0;
        break;
      case FoodType.beverages:
        if (ngo.acceptsBeverages) compatibility = 1.0;
        break;
      default:
        compatibility = 0.7;
    }

    // Check food preferences
    if (ngo.foodPreferences.contains(donation.foodType.name)) {
      compatibility = min(compatibility + 0.2, 1.0);
    }

    return compatibility;
  }

  // Get NGO match reason
  String _getNgoMatchReason(
      Donation donation, Ngo ngo, double score) {
    final reasons = <String>[];

    if (score >= 80) {
      reasons.add('Excellent match');
    } else if (score >= 60) {
      reasons.add('Good match');
    } else {
      reasons.add('Possible match');
    }

    if (donation.latitude != null &&
        donation.longitude != null &&
        ngo.latitude != null &&
        ngo.longitude != null) {
      final distance = _calculateDistance(
        donation.latitude!,
        donation.longitude!,
        ngo.latitude!,
        ngo.longitude!,
      );
      reasons.add('${distance.toStringAsFixed(1)} km away');
    }

    if (ngo.rating != null && ngo.rating! >= 4) {
      reasons.add('Highly rated');
    }

    if (!ngo.isAtCapacity) {
      reasons.add('Has capacity');
    }

    return reasons.join(' • ');
  }

  // Get volunteer match reason
  String _getVolunteerMatchReason(
      Donation donation, Volunteer volunteer, double score) {
    final reasons = <String>[];

    if (score >= 80) {
      reasons.add('Ideal volunteer');
    } else if (score >= 60) {
      reasons.add('Good match');
    } else {
      reasons.add('Available');
    }

    if (donation.latitude != null &&
        donation.longitude != null &&
        volunteer.currentLatitude != null &&
        volunteer.currentLongitude != null) {
      final distance = _calculateDistance(
        donation.latitude!,
        donation.longitude!,
        volunteer.currentLatitude!,
        volunteer.currentLongitude!,
      );
      reasons.add('${distance.toStringAsFixed(1)} km away');
    }

    if (volunteer.averageRating >= 4) {
      reasons.add('Top rated');
    }

    if (volunteer.totalDeliveries >= 20) {
      reasons.add('Experienced');
    }

    return reasons.join(' • ');
  }

  // Get NGO match factors
  Map<String, dynamic> _getNgoMatchFactors(Donation donation, Ngo ngo) {
    final distance = (donation.latitude != null &&
            donation.longitude != null &&
            ngo.latitude != null &&
            ngo.longitude != null)
        ? _calculateDistance(
            donation.latitude!,
            donation.longitude!,
            ngo.latitude!,
            ngo.longitude!,
          )
        : null;

    return {
      'distance': distance,
      'capacity': ngo.occupancyPercentage,
      'rating': ngo.rating,
      'foodCompatibility':
          _getFoodTypeCompatibility(donation, ngo),
    };
  }

  // Get volunteer match factors
  Map<String, dynamic> _getVolunteerMatchFactors(
      Donation donation, Volunteer volunteer) {
    final distance = (donation.latitude != null &&
            donation.longitude != null &&
            volunteer.currentLatitude != null &&
            volunteer.currentLongitude != null)
        ? _calculateDistance(
            donation.latitude!,
            donation.longitude!,
            volunteer.currentLatitude!,
            volunteer.currentLongitude!,
          )
        : null;

    return {
      'distance': distance,
      'vehicleType': volunteer.vehicleType.name,
      'rating': volunteer.averageRating,
      'experience': volunteer.totalDeliveries,
    };
  }

  // Calculate distance between two coordinates (Haversine formula)
  double _calculateDistance(
      double lat1, double lon1, double lat2, double lon2) {
    const earthRadius = 6371; // km

    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);

    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRadians(lat1)) *
            cos(_toRadians(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return earthRadius * c;
  }

  double _toRadians(double degree) {
    return degree * pi / 180;
  }

  // Calculate carbon saved
  double calculateCarbonSaved({
    required double foodWeightKg,
    required double distanceKm,
    int portions = 1,
  }) {
    final foodCarbon = foodWeightKg * AppConstants.carbonPerKgFood;
    final transportCarbon = distanceKm * AppConstants.carbonPerKmTransport;
    final mealCarbon = portions * AppConstants.carbonPerMeal;

    return foodCarbon + transportCarbon + mealCarbon;
  }

  // Calculate impact points
  int calculateImpactPoints({
    required Donation donation,
    bool isUrgent = false,
    bool isFirstDonation = false,
  }) {
    int points = AppConstants.pointsPerDonation;

    // Quantity bonus
    if (donation.quantity >= 50) {
      points += AppConstants.bonusPointsLargeDonation;
    }

    // Urgent bonus
    if (isUrgent || donation.isUrgent) {
      points += AppConstants.bonusPointsUrgent;
    }

    // First donation bonus
    if (isFirstDonation) {
      points += AppConstants.bonusPointsFirstDonation;
    }

    // Per meal points
    points += donation.quantity * AppConstants.pointsPerMeal;

    return points;
  }

  // Predict donation expiry risk
  double predictExpiryRisk(Donation donation) {
    final timeUntilExpiry = donation.expiryTime.difference(DateTime.now());
    final hoursUntilExpiry = timeUntilExpiry.inHours;

    if (hoursUntilExpiry <= 0) return 1.0;
    if (hoursUntilExpiry <= 1) return 0.95;
    if (hoursUntilExpiry <= 2) return 0.8;
    if (hoursUntilExpiry <= 4) return 0.5;
    if (hoursUntilExpiry <= 8) return 0.3;
    return 0.1;
  }

  // Get smart suggestions for donation
  List<String> getDonationSuggestions(Donation donation) {
    final suggestions = <String>[];

    if (donation.isNearExpiry) {
      suggestions
          .add('This food is near expiry - prioritize quick pickup');
    }

    if (donation.quantity >= 50) {
      suggestions.add(
          'Large donation - consider multiple pickup points');
    }

    if (!donation.isVeg) {
      suggestions.add('Non-veg food - check NGO dietary preferences');
    }

    if (donation.containsAllergens) {
      suggestions
          .add('Contains allergens - ensure recipient is informed');
    }

    if (donation.latitude == null || donation.longitude == null) {
      suggestions.add(
          'Add location for better matching with nearby NGOs');
    }

    if (donation.photoUrl == null && donation.photoUrls.isEmpty) {
      suggestions.add(
          'Add photos to increase trust and matching success');
    }

    return suggestions;
  }
}
