import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../config/constants.dart';

class LocationData {
  final double latitude;
  final double longitude;
  final double? altitude;
  final double? accuracy;
  final double? speed;
  final DateTime timestamp;
  final String? address;
  final String? city;
  final String? district;
  final String? state;
  final String? country;
  final String? postalCode;

  LocationData({
    required this.latitude,
    required this.longitude,
    this.altitude,
    this.accuracy,
    this.speed,
    required this.timestamp,
    this.address,
    this.city,
    this.district,
    this.state,
    this.country,
    this.postalCode,
  });

  @override
  String toString() {
    return 'LocationData(lat: $latitude, lng: $longitude, address: $address)';
  }
}

class LocationService {
  static LocationService? _instance;
  static LocationService get instance => _instance ?? LocationService._();
  LocationService._();

  StreamSubscription<Position>? _positionSubscription;
  final StreamController<LocationData> _locationStreamController =
      StreamController<LocationData>.broadcast();

  Stream<LocationData> get locationStream =>
      _locationStreamController.stream;

  // Check if location services are enabled
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  // Check location permission
  Future<LocationPermission> checkPermission() async {
    return await Geolocator.checkPermission();
  }

  // Request location permission
  Future<LocationPermission> requestPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return LocationPermission.denied;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return LocationPermission.deniedForever;
    }

    return permission;
  }

  // Get current position
  Future<LocationData?> getCurrentPosition({
    bool forceAndroidLocationManager = false,
    Duration? timeLimit,
  }) async {
    try {
      // Check if location services are enabled
      if (!await isLocationServiceEnabled()) {
        throw LocationException('Location services are disabled');
      }

      // Check and request permission
      LocationPermission permission = await checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await requestPermission();
        if (permission == LocationPermission.denied) {
          throw LocationException('Location permission denied');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw LocationException('Location permission permanently denied');
      }

      // Get position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        forceAndroidLocationManager: forceAndroidLocationManager,
        timeLimit: timeLimit ?? AppConstants.locationTimeout,
      );

      // Get address from coordinates
      final addressData = await _getAddressFromCoordinates(
        position.latitude,
        position.longitude,
      );

      return LocationData(
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: position.altitude,
        accuracy: position.accuracy,
        speed: position.speed,
        timestamp: position.timestamp,
        address: addressData['address'],
        city: addressData['city'],
        district: addressData['district'],
        state: addressData['state'],
        country: addressData['country'],
        postalCode: addressData['postalCode'],
      );
    } on TimeoutException {
      throw LocationException('Location request timed out');
    } catch (e) {
      if (e is LocationException) rethrow;
      throw LocationException('Failed to get location: ${e.toString()}');
    }
  }

  // Get last known position
  Future<LocationData?> getLastKnownPosition() async {
    try {
      final position = await Geolocator.getLastKnownPosition();
      if (position == null) return null;

      final addressData = await _getAddressFromCoordinates(
        position.latitude,
        position.longitude,
      );

      return LocationData(
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: position.altitude,
        accuracy: position.accuracy,
        speed: position.speed,
        timestamp: position.timestamp,
        address: addressData['address'],
        city: addressData['city'],
        district: addressData['district'],
        state: addressData['state'],
        country: addressData['country'],
        postalCode: addressData['postalCode'],
      );
    } catch (e) {
      return null;
    }
  }

  // Start listening to location updates
  Future<void> startLocationUpdates({
    LocationAccuracy accuracy = LocationAccuracy.high,
    int distanceFilter = 10,
  }) async {
    try {
      final permission = await requestPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        throw LocationException('Location permission not granted');
      }

      final locationSettings = LocationSettings(
        accuracy: accuracy,
        distanceFilter: distanceFilter,
      );

      _positionSubscription =
          Geolocator.getPositionStream(locationSettings: locationSettings)
              .listen(
        (position) async {
          final addressData = await _getAddressFromCoordinates(
            position.latitude,
            position.longitude,
          );

          _locationStreamController.add(LocationData(
            latitude: position.latitude,
            longitude: position.longitude,
            altitude: position.altitude,
            accuracy: position.accuracy,
            speed: position.speed,
            timestamp: position.timestamp,
            address: addressData['address'],
            city: addressData['city'],
            district: addressData['district'],
            state: addressData['state'],
            country: addressData['country'],
            postalCode: addressData['postalCode'],
          ));
        },
        onError: (error) {
          _locationStreamController.addError(error);
        },
      );
    } catch (e) {
      if (e is LocationException) rethrow;
      throw LocationException(
          'Failed to start location updates: ${e.toString()}');
    }
  }

  // Stop location updates
  void stopLocationUpdates() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
  }

  // Calculate distance between two points
  double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000; // km
  }

  // Calculate bearing between two points
  double calculateBearing(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    return Geolocator.bearingBetween(lat1, lon1, lat2, lon2);
  }

  // Open location settings
  Future<bool> openLocationSettings() async {
    return await Geolocator.openLocationSettings();
  }

  // Open app settings
  Future<bool> openAppSettings() async {
    return await Geolocator.openAppSettings();
  }

  // Get address from coordinates using geocoding
  Future<Map<String, String?>> _getAddressFromCoordinates(
    double latitude,
    double longitude,
  ) async {
    try {
      final placemarks =
          await placemarkFromCoordinates(latitude, longitude);

      if (placemarks.isEmpty) {
        return {
          'address': null,
          'city': null,
          'district': null,
          'state': null,
          'country': null,
          'postalCode': null,
        };
      }

      final placemark = placemarks.first;

      // Build address string
      final addressParts = <String>[];
      if (placemark.street != null && placemark.street!.isNotEmpty) {
        addressParts.add(placemark.street!);
      }
      if (placemark.subLocality != null &&
          placemark.subLocality!.isNotEmpty) {
        addressParts.add(placemark.subLocality!);
      }
      if (placemark.locality != null && placemark.locality!.isNotEmpty) {
        addressParts.add(placemark.locality!);
      }
      if (placemark.administrativeArea != null &&
          placemark.administrativeArea!.isNotEmpty) {
        addressParts.add(placemark.administrativeArea!);
      }
      if (placemark.postalCode != null &&
          placemark.postalCode!.isNotEmpty) {
        addressParts.add(placemark.postalCode!);
      }

      return {
        'address': addressParts.isNotEmpty ? addressParts.join(', ') : null,
        'city': placemark.locality,
        'district': placemark.subAdministrativeArea,
        'state': placemark.administrativeArea,
        'country': placemark.country,
        'postalCode': placemark.postalCode,
      };
    } catch (e) {
      return {
        'address': null,
        'city': null,
        'district': null,
        'state': null,
        'country': null,
        'postalCode': null,
      };
    }
  }

  // Get coordinates from address
  Future<LocationData?> getCoordinatesFromAddress(String address) async {
    try {
      final locations = await locationFromAddress(address);

      if (locations.isEmpty) return null;

      final location = locations.first;

      return LocationData(
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: DateTime.now(),
      );
    } catch (e) {
      return null;
    }
  }

  // Dispose
  void dispose() {
    stopLocationUpdates();
    _locationStreamController.close();
  }
}

class LocationException implements Exception {
  final String message;
  LocationException(this.message);

  @override
  String toString() => 'LocationException: $message';
}
