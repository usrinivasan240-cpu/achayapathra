import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/donation.dart';
import '../../models/ngo.dart';
import '../../models/volunteer.dart';
import '../../models/hunger_zone.dart';
import '../../services/firestore_service.dart';
import '../../services/location_service.dart';
import '../../widgets/achaya_card.dart';

class MapLayerConfig {
  bool showDonations;
  bool showNgos;
  bool showVolunteers;
  bool showInfrastructure;
  bool showHungerZones;

  MapLayerConfig({
    this.showDonations = true,
    this.showNgos = true,
    this.showVolunteers = true,
    this.showInfrastructure = true,
    this.showHungerZones = true,
  });
}

class LiveMapsScreen extends StatefulWidget {
  const LiveMapsScreen({super.key});

  @override
  State<LiveMapsScreen> createState() => _LiveMapsScreenState();
}

class _LiveMapsScreenState extends State<LiveMapsScreen> {
  final MapController _mapController = MapController();
  final FirestoreService _firestoreService = FirestoreService();
  final LocationService _locationService = LocationService.instance;

  final MapLayerConfig _layerConfig = MapLayerConfig();

  List<Donation> _donations = [];
  List<Ngo> _ngos = [];
  List<Volunteer> _volunteers = [];
  List<HungerZone> _hungerZones = [];

  bool _isLoading = true;
  bool _isPanelOpen = false;
  dynamic _selectedMarker;
  LatLng _currentCenter = const LatLng(10.8, 78.5);
  double _currentZoom = 7.0;

  @override
  void initState() {
    super.initState();
    _loadMapData();
  }

  Future<void> _loadMapData() async {
    setState(() => _isLoading = true);

    try {
      final results = await Future.wait([
        _firestoreService.getDonations(limit: 100),
        _firestoreService.getNgos(limit: 50),
        _firestoreService.getVolunteersStream().first,
        _firestoreService.getHungerZonesStream().first,
      ]);

      setState(() {
        _donations = results[0] as List<Donation>;
        _ngos = results[1] as List<Ngo>;
        _volunteers = results[2] as List<Volunteer>;
        _hungerZones = results[3] as List<HungerZone>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load map data: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _centerOnCurrentLocation() async {
    try {
      final location = await _locationService.getCurrentPosition();
      if (location != null) {
        final newCenter = LatLng(location.latitude, location.longitude);
        _mapController.move(newCenter, 13.0);
        setState(() {
          _currentCenter = newCenter;
          _currentZoom = 13.0;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not get location: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _onMarkerTapped(dynamic marker) {
    setState(() {
      _selectedMarker = marker;
      _isPanelOpen = true;
    });
  }

  void _closePanel() {
    setState(() {
      _isPanelOpen = false;
      _selectedMarker = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.grey900 : AppColors.grey50,
      body: Stack(
        children: [
          _buildMap(isDark),
          _buildTopControls(isDark),
          if (_isPanelOpen && _selectedMarker != null)
            _buildSidePanel(isDark),
          _buildLegendBar(isDark),
          _buildZoomControls(isDark),
        ],
      ),
    );
  }

  Widget _buildMap(bool isDark) {
    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: _currentCenter,
        initialZoom: _currentZoom,
        onTap: (tapPosition, latLng) {
          _closePanel();
        },
        onPositionChanged: (position, hasGesture) {
          _currentCenter = position.center;
          _currentZoom = position.zoom;
        },
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.achayapathra.app',
          maxZoom: 19,
        ),
        _buildHungerZoneCircles(),
        MarkerLayer(markers: _buildAllMarkers()),
        RichAttributionWidget(
          popupInitialDisplayDuration: Duration.zero,
          attributionConfig: const AttributionConfig(
            showFlutterMapLogo: false,
            sourceTitles: ['OpenStreetMap contributors'],
          ),
        ),
      ],
    );
  }

  Widget _buildHungerZoneCircles() {
    if (!_layerConfig.showHungerZones) {
      return const SizedBox.shrink();
    }

    return CircleLayer(
      circles: _hungerZones
          .where((zone) => zone.status == ZoneStatus.active)
          .map((zone) {
        Color circleColor;
        double radiusMeters;

        switch (zone.level) {
          case HungerLevel.low:
            circleColor = AppColors.hungerLow.withOpacity(0.15);
            radiusMeters = zone.radiusKm * 500;
            break;
          case HungerLevel.moderate:
            circleColor = AppColors.hungerModerate.withOpacity(0.15);
            radiusMeters = zone.radiusKm * 600;
            break;
          case HungerLevel.high:
            circleColor = AppColors.hungerHigh.withOpacity(0.15);
            radiusMeters = zone.radiusKm * 700;
            break;
          case HungerLevel.critical:
            circleColor = AppColors.hungerCritical.withOpacity(0.15);
            radiusMeters = zone.radiusKm * 800;
            break;
        }

        return CircleMarker(
          point: LatLng(zone.latitude, zone.longitude),
          radius: radiusMeters,
          useRadiusInMeter: true,
          color: circleColor,
          borderColor: circleColor.withOpacity(0.6),
          borderWidth: 2,
        );
      }).toList(),
    );
  }

  List<Marker> _buildAllMarkers() {
    final List<Marker> markers = [];

    if (_layerConfig.showDonations) {
      markers.addAll(_buildDonationMarkers());
    }
    if (_layerConfig.showNgos) {
      markers.addAll(_buildNgoMarkers());
    }
    if (_layerConfig.showVolunteers) {
      markers.addAll(_buildVolunteerMarkers());
    }
    if (_layerConfig.showInfrastructure) {
      markers.addAll(_buildInfrastructureMarkers());
    }
    if (_layerConfig.showHungerZones) {
      markers.addAll(_buildHungerZoneMarkers());
    }

    return markers;
  }

  List<Marker> _buildDonationMarkers() {
    return _donations
        .where((d) =>
            d.latitude != null &&
            d.longitude != null &&
            d.status != DonationStatus.delivered &&
            d.status != DonationStatus.cancelled)
        .map((donation) {
      return Marker(
        point: LatLng(donation.latitude!, donation.longitude!),
        width: 40,
        height: 40,
        child: GestureDetector(
          onTap: () => _onMarkerTapped(donation),
          child: Container(
            decoration: BoxDecoration(
              color: donation.isUrgent
                  ? AppColors.error
                  : AppColors.primary,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: (donation.isUrgent
                          ? AppColors.error
                          : AppColors.primary)
                      .withOpacity(0.4),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Icon(
              Icons.restaurant,
              color: AppColors.white,
              size: 20,
            ),
          ),
        ),
      );
    }).toList();
  }

  List<Marker> _buildNgoMarkers() {
    return _ngos
        .where((ngo) =>
            ngo.latitude != null &&
            ngo.longitude != null &&
            ngo.status == NgoStatus.active)
        .map((ngo) {
      return Marker(
        point: LatLng(ngo.latitude!, ngo.longitude!),
        width: 40,
        height: 40,
        child: GestureDetector(
          onTap: () => _onMarkerTapped(ngo),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.accent,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: AppColors.accent.withOpacity(0.4),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Transform.rotate(
              angle: 0.785398,
              child: const Icon(
                Icons.foundation,
                color: AppColors.white,
                size: 18,
              ),
            ),
          ),
        ),
      );
    }).toList();
  }

  List<Marker> _buildVolunteerMarkers() {
    return _volunteers
        .where((v) =>
            v.currentLatitude != null &&
            v.currentLongitude != null &&
            v.status == VolunteerStatus.available)
        .map((volunteer) {
      return Marker(
        point: LatLng(volunteer.currentLatitude!, volunteer.currentLongitude!),
        width: 36,
        height: 36,
        child: GestureDetector(
          onTap: () => _onMarkerTapped(volunteer),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.warning,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: AppColors.warning.withOpacity(0.4),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Icon(
              Icons.delivery_dining,
              color: AppColors.white,
              size: 18,
            ),
          ),
        ),
      );
    }).toList();
  }

  List<Marker> _buildInfrastructureMarkers() {
    final List<Marker> markers = [];

    for (final ngo in _ngos.where((n) =>
        n.latitude != null &&
        n.longitude != null &&
        n.status == NgoStatus.active)) {
      markers.add(
        Marker(
          point: LatLng(ngo.latitude!, ngo.longitude!),
          width: 32,
          height: 32,
          child: GestureDetector(
            onTap: () => _onMarkerTapped(ngo),
            child: Container(
              decoration: BoxDecoration(
                color: ngo.isVerified
                    ? AppColors.secondary
                    : AppColors.grey500,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.white, width: 1.5),
              ),
              child: Icon(
                Icons.store,
                color: AppColors.white,
                size: 16,
              ),
            ),
          ),
        ),
      );
    }

    return markers;
  }

  List<Marker> _buildHungerZoneMarkers() {
    return _hungerZones
        .where((zone) => zone.status == ZoneStatus.active)
        .map((zone) {
      Color color;
      switch (zone.level) {
        case HungerLevel.low:
          color = AppColors.hungerLow;
          break;
        case HungerLevel.moderate:
          color = AppColors.hungerModerate;
          break;
        case HungerLevel.high:
          color = AppColors.hungerHigh;
          break;
        case HungerLevel.critical:
          color = AppColors.hungerCritical;
          break;
      }

      return Marker(
        point: LatLng(zone.latitude, zone.longitude),
        width: 36,
        height: 36,
        child: GestureDetector(
          onTap: () => _onMarkerTapped(zone),
          child: Container(
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.4),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Icon(
              Icons.warning,
              color: AppColors.white,
              size: 18,
            ),
          ),
        ),
      );
    }).toList();
  }

  Widget _buildTopControls(bool isDark) {
    return Positioned(
      top: MediaQuery.of(context).padding.top + 8,
      left: 16,
      right: 16,
      child: Column(
        children: [
          _buildSearchBar(isDark),
          const SizedBox(height: 8),
          _buildLayerToggles(isDark),
        ],
      ),
    );
  }

  Widget _buildSearchBar(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.grey800 : AppColors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.search, size: 20, color: AppColors.grey500),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search location...',
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                filled: false,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                hintStyle: TextStyle(
                  color: AppColors.grey400,
                  fontSize: 14,
                ),
              ),
              style: Theme.of(context).textTheme.bodyMedium,
              onSubmitted: (value) {
                _searchLocation(value);
              },
            ),
          ),
          IconButton(
            onPressed: _centerOnCurrentLocation,
            icon: const Icon(Icons.my_location, size: 20),
            color: AppColors.primary,
            tooltip: 'My Location',
          ),
        ],
      ),
    );
  }

  void _searchLocation(String query) async {
    if (query.trim().isEmpty) return;

    try {
      final result = await _locationService.getCoordinatesFromAddress(query);
      if (result != null) {
        final newCenter = LatLng(result.latitude, result.longitude);
        _mapController.move(newCenter, 14.0);
        setState(() {
          _currentCenter = newCenter;
          _currentZoom = 14.0;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location not found')),
        );
      }
    }
  }

  Widget _buildLayerToggles(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.grey800.withOpacity(0.95)
            : AppColors.white.withOpacity(0.95),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.08),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildLayerToggle(
              'Donations',
              Icons.restaurant,
              AppColors.primary,
              _layerConfig.showDonations,
              (val) => setState(() => _layerConfig.showDonations = val),
            ),
            _buildLayerToggle(
              'NGOs',
              Icons.foundation,
              AppColors.accent,
              _layerConfig.showNgos,
              (val) => setState(() => _layerConfig.showNgos = val),
            ),
            _buildLayerToggle(
              'Volunteers',
              Icons.delivery_dining,
              AppColors.warning,
              _layerConfig.showVolunteers,
              (val) => setState(() => _layerConfig.showVolunteers = val),
            ),
            _buildLayerToggle(
              'Infrastructure',
              Icons.store,
              AppColors.secondary,
              _layerConfig.showInfrastructure,
              (val) =>
                  setState(() => _layerConfig.showInfrastructure = val),
            ),
            _buildLayerToggle(
              'Hunger Zones',
              Icons.warning,
              AppColors.hungerCritical,
              _layerConfig.showHungerZones,
              (val) =>
                  setState(() => _layerConfig.showHungerZones = val),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLayerToggle(
    String label,
    IconData icon,
    Color color,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: value ? color.withOpacity(0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: value ? color : AppColors.grey300,
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14,
              color: value ? color : AppColors.grey400,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: value ? color : AppColors.grey500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildZoomControls(bool isDark) {
    return Positioned(
      right: 16,
      bottom: 160,
      child: Column(
        children: [
          _buildZoomButton(
            Icons.add,
            () {
              _currentZoom = (_currentZoom + 1).clamp(1.0, 18.0);
              _mapController.move(_currentCenter, _currentZoom);
            },
            isDark,
          ),
          const SizedBox(height: 4),
          _buildZoomButton(
            Icons.remove,
            () {
              _currentZoom = (_currentZoom - 1).clamp(1.0, 18.0);
              _mapController.move(_currentCenter, _currentZoom);
            },
            isDark,
          ),
          const SizedBox(height: 8),
          _buildZoomButton(
            Icons.my_location,
            _centerOnCurrentLocation,
            isDark,
            color: AppColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildZoomButton(
    IconData icon,
    VoidCallback onPressed,
    bool isDark, {
    Color? color,
  }) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: isDark ? AppColors.grey800 : AppColors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(
          icon,
          size: 20,
          color: color ?? (isDark ? AppColors.grey300 : AppColors.grey700),
        ),
        padding: EdgeInsets.zero,
      ),
    );
  }

  Widget _buildLegendBar(bool isDark) {
    return Positioned(
      bottom: 16,
      left: 16,
      right: 70,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isDark
              ? AppColors.grey800.withOpacity(0.95)
              : AppColors.white.withOpacity(0.95),
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: AppColors.black.withOpacity(0.1),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildLegendItem('Donations', AppColors.primary, Icons.restaurant),
              _buildLegendDivider(),
              _buildLegendItem('NGOs', AppColors.accent, Icons.foundation),
              _buildLegendDivider(),
              _buildLegendItem(
                  'Volunteers', AppColors.warning, Icons.delivery_dining),
              _buildLegendDivider(),
              _buildLegendItem('Hunger', AppColors.hungerCritical, Icons.warning),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color, IconData icon) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Icon(icon, size: 10, color: color),
        const SizedBox(width: 3),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w500,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildLegendDivider() {
    return Container(
      width: 1,
      height: 14,
      margin: const EdgeInsets.symmetric(horizontal: 6),
      color: AppColors.grey300,
    );
  }

  Widget _buildSidePanel(bool isDark) {
    return Positioned(
      left: 0,
      top: MediaQuery.of(context).padding.top + 130,
      bottom: 80,
      width: 280,
      child: GestureDetector(
        onHorizontalDragEnd: (details) {
          if (details.primaryVelocity != null &&
              details.primaryVelocity! > 0) {
            _closePanel();
          }
        },
        child: Container(
          margin: const EdgeInsets.only(left: 8),
          decoration: BoxDecoration(
            color: isDark ? AppColors.grey800 : AppColors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: AppColors.black.withOpacity(0.15),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              _buildPanelHeader(isDark),
              Expanded(
                child: _buildPanelContent(isDark),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPanelHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _getMarkerColor(_selectedMarker).withOpacity(0.1),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: _getMarkerColor(_selectedMarker),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _getMarkerIcon(_selectedMarker),
              color: AppColors.white,
              size: 18,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getMarkerTitle(_selectedMarker),
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  _getMarkerSubtitle(_selectedMarker),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.grey500,
                      ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: _closePanel,
            icon: const Icon(Icons.close, size: 18),
            color: AppColors.grey500,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  Widget _buildPanelContent(bool isDark) {
    final marker = _selectedMarker;
    if (marker == null) return const SizedBox.shrink();

    if (marker is Donation) {
      return _buildDonationPanel(marker, isDark);
    } else if (marker is Ngo) {
      return _buildNgoPanel(marker, isDark);
    } else if (marker is Volunteer) {
      return _buildVolunteerPanel(marker, isDark);
    } else if (marker is HungerZone) {
      return _buildHungerZonePanel(marker, isDark);
    }

    return const SizedBox.shrink();
  }

  Widget _buildDonationPanel(Donation donation, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        _buildPanelInfoRow('Food', donation.foodName),
        _buildPanelInfoRow('Quantity', '${donation.quantity} ${donation.unit}'),
        _buildPanelInfoRow('Type', donation.foodTypeDisplayText),
        _buildPanelInfoRow('Status', donation.statusDisplayText),
        if (donation.donorName != null)
          _buildPanelInfoRow('Donor', donation.donorName!),
        if (donation.address != null)
          _buildPanelInfoRow('Location', donation.address!),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              Navigator.pushNamed(
                context,
                '/donations/detail',
                arguments: donation.id,
              );
            },
            child: const Text('View Details'),
          ),
        ),
      ],
    );
  }

  Widget _buildNgoPanel(Ngo ngo, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        _buildPanelInfoRow('Name', ngo.name),
        _buildPanelInfoRow('Type', ngo.typeDisplayText),
        _buildPanelInfoRow(
            'Capacity', '${ngo.currentOccupancy}/${ngo.capacity}'),
        if (ngo.rating != null)
          _buildPanelInfoRow('Rating', '${ngo.rating!.toStringAsFixed(1)}'),
        _buildPanelInfoRow('Verified', ngo.isVerified ? 'Yes' : 'No'),
        if (ngo.address != null) _buildPanelInfoRow('Address', ngo.address!),
      ],
    );
  }

  Widget _buildVolunteerPanel(Volunteer volunteer, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        _buildPanelInfoRow('Name', volunteer.name),
        _buildPanelInfoRow('Status', volunteer.statusDisplayText),
        _buildPanelInfoRow(
            'Vehicle', volunteer.vehicleTypeDisplayText),
        _buildPanelInfoRow(
            'Deliveries', '${volunteer.totalDeliveries}'),
        if (volunteer.averageRating > 0)
          _buildPanelInfoRow(
              'Rating', volunteer.averageRating.toStringAsFixed(1)),
      ],
    );
  }

  Widget _buildHungerZonePanel(HungerZone zone, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        _buildPanelInfoRow('Zone', zone.name),
        _buildPanelInfoRow('Level', zone.levelDisplayText),
        _buildPanelInfoRow('Radius', '${zone.radiusKm} km'),
        _buildPanelInfoRow(
            'Affected', '${zone.affectedPopulation} people'),
        _buildPanelInfoRow(
            'Meals Served', '${zone.totalMealsServed}'),
        if (zone.address != null)
          _buildPanelInfoRow('Address', zone.address!),
      ],
    );
  }

  Widget _buildPanelInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 70,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.grey500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Color _getMarkerColor(dynamic marker) {
    if (marker is Donation) {
      return marker.isUrgent ? AppColors.error : AppColors.primary;
    } else if (marker is Ngo) {
      return AppColors.accent;
    } else if (marker is Volunteer) {
      return AppColors.warning;
    } else if (marker is HungerZone) {
      switch (marker.level) {
        case HungerLevel.low:
          return AppColors.hungerLow;
        case HungerLevel.moderate:
          return AppColors.hungerModerate;
        case HungerLevel.high:
          return AppColors.hungerHigh;
        case HungerLevel.critical:
          return AppColors.hungerCritical;
      }
    }
    return AppColors.grey500;
  }

  IconData _getMarkerIcon(dynamic marker) {
    if (marker is Donation) {
      return Icons.restaurant;
    } else if (marker is Ngo) {
      return Icons.foundation;
    } else if (marker is Volunteer) {
      return Icons.delivery_dining;
    } else if (marker is HungerZone) {
      return Icons.warning;
    }
    return Icons.location_on;
  }

  String _getMarkerTitle(dynamic marker) {
    if (marker is Donation) {
      return marker.foodName;
    } else if (marker is Ngo) {
      return marker.name;
    } else if (marker is Volunteer) {
      return marker.name;
    } else if (marker is HungerZone) {
      return marker.name;
    }
    return 'Unknown';
  }

  String _getMarkerSubtitle(dynamic marker) {
    if (marker is Donation) {
      return '${marker.quantity} ${marker.unit} • ${marker.statusDisplayText}';
    } else if (marker is Ngo) {
      return marker.typeDisplayText;
    } else if (marker is Volunteer) {
      return '${marker.vehicleTypeDisplayText} • ${marker.statusDisplayText}';
    } else if (marker is HungerZone) {
      return '${marker.levelDisplayText} • ${marker.affectedPopulation} affected';
    }
    return '';
  }
}
