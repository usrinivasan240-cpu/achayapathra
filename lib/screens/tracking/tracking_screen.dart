import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../config/constants.dart';
import '../../models/donation.dart';
import '../../services/firestore_service.dart';
import '../../widgets/achaya_card.dart';
import '../../widgets/achaya_button.dart';
import '../../widgets/loading_shimmer.dart';

class TrackingScreen extends StatefulWidget {
  const TrackingScreen({super.key});

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  final TextEditingController _trackingIdController = TextEditingController();
  final FirestoreService _firestoreService = FirestoreService();
  final Completer<GoogleMapController> _mapController = Completer();
  Donation? _donation;
  bool _isLoading = false;
  bool _hasSearched = false;
  String? _errorMessage;
  int _currentStageIndex = 0;
  Timer? _etaTimer;
  Duration _remainingEta = Duration.zero;

  final List<_TrackingStage> _stages = [
    _TrackingStage(
      status: 'pending',
      label: 'Donation Posted',
      icon: Icons.add_circle_outline,
      activeIcon: Icons.add_circle,
      color: AppColors.statusPending,
    ),
    _TrackingStage(
      status: 'matched',
      label: 'NGO Matched',
      icon: Icons.handshake_outlined,
      activeIcon: Icons.handshake,
      color: AppColors.statusMatched,
    ),
    _TrackingStage(
      status: 'picked_up',
      label: 'Picked Up',
      icon: Icons.local_shipping_outlined,
      activeIcon: Icons.local_shipping,
      color: AppColors.statusPickedUp,
    ),
    _TrackingStage(
      status: 'in_transit',
      label: 'In Transit',
      icon: Icons.route_outlined,
      activeIcon: Icons.route,
      color: AppColors.statusInTransit,
    ),
    _TrackingStage(
      status: 'delivered',
      label: 'Delivered',
      icon: Icons.check_circle_outline,
      activeIcon: Icons.check_circle,
      color: AppColors.statusDelivered,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _trackingIdController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _trackingIdController.dispose();
    _etaTimer?.cancel();
    super.dispose();
  }

  void _searchDonation() {
    final query = _trackingIdController.text.trim();
    if (query.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter a tracking ID';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _donation = null;
      _hasSearched = false;
    });

    _firestoreService.getDonation(query).then((donation) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _hasSearched = true;
        _donation = donation;
        if (donation != null) {
          _updateCurrentStage(donation);
          _startEtaCountdown(donation);
        } else {
          _errorMessage = 'No donation found with this ID';
        }
      });
    }).catchError((error) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _hasSearched = true;
        _errorMessage = 'Failed to search. Please try again.';
      });
    });
  }

  void _updateCurrentStage(Donation donation) {
    final statusIndex = _stages.indexWhere(
      (stage) => stage.status == donation.status.name,
    );
    setState(() {
      _currentStageIndex = statusIndex >= 0 ? statusIndex : 0;
    });
  }

  void _startEtaCountdown(Donation donation) {
    _etaTimer?.cancel();
    if (donation.deliveredAt != null) {
      _remainingEta = Duration.zero;
      return;
    }
    final expiryTime = donation.expiryTime;
    _remainingEta = expiryTime.difference(DateTime.now());
    if (_remainingEta.isNegative) {
      _remainingEta = Duration.zero;
      return;
    }
    _etaTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      final remaining = expiryTime.difference(DateTime.now());
      setState(() {
        _remainingEta = remaining.isNegative ? Duration.zero : remaining;
      });
      if (remaining.isNegative) {
        timer.cancel();
      }
    });
  }

  String _formatDuration(Duration d) {
    final hours = d.inHours;
    final minutes = d.inMinutes.remainder(60);
    final seconds = d.inSeconds.remainder(60);
    if (hours > 0) {
      return '${hours}h ${minutes}m ${seconds}s';
    }
    return '${minutes}m ${seconds}s';
  }

  String _formatDateTime(DateTime dt) {
    return DateFormat('MMM dd, yyyy • hh:mm a').format(dt);
  }

  LatLng? _getDonationLocation() {
    if (_donation?.latitude != null && _donation?.longitude != null) {
      return LatLng(_donation!.latitude!, _donation!.longitude!);
    }
    return null;
  }

  Future<void> _openInMaps() async {
    if (_donation?.latitude == null || _donation?.longitude == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location not available for this donation')),
        );
      }
      return;
    }
    final url = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${_donation!.latitude},${_donation!.longitude}',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _downloadCertificate() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Certificate download started...')),
    );
  }

  void _showPhotoDialog(String title, String? photoUrl) {
    if (photoUrl == null || photoUrl.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No $title photo available')),
      );
      return;
    }
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.close, color: AppColors.white),
                onPressed: () => Navigator.pop(context),
              ),
              title: Text(title, style: const TextStyle(color: AppColors.white)),
            ),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                photoUrl,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => Container(
                  height: 200,
                  color: AppColors.grey200,
                  child: const Center(child: Icon(Icons.broken_image, size: 48)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.grey900 : AppColors.grey50,
      appBar: AppBar(
        title: const Text('Track Donation'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          _buildSearchBar(isDark),
          Expanded(
            child: _isLoading
                ? _buildLoadingState()
                : _donation == null
                    ? _buildEmptyState(isDark)
                    : _buildTrackingContent(isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.grey800 : AppColors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _trackingIdController,
              decoration: InputDecoration(
                hintText: 'Enter Tracking ID (e.g., DON-ABC123)',
                prefixIcon: const Icon(Icons.search, color: AppColors.grey400),
                suffixIcon: _trackingIdController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 20),
                        onPressed: () {
                          _trackingIdController.clear();
                          setState(() {
                            _donation = null;
                            _hasSearched = false;
                            _errorMessage = null;
                          });
                        },
                      )
                    : null,
              ),
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => _searchDonation(),
            ),
          ),
          const SizedBox(width: 12),
          AchayaButton(
            text: '',
            icon: Icons.search,
            onPressed: _searchDonation,
            isLoading: _isLoading,
            width: 50,
            height: 50,
            padding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: AppColors.primary),
          SizedBox(height: 16),
          Text(
            'Searching for donation...',
            style: TextStyle(color: AppColors.grey500),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    if (_hasSearched && _errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.search_off_rounded,
                  size: 40,
                  color: AppColors.error,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: isDark ? AppColors.grey300 : AppColors.grey700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Double-check the tracking ID and try again',
                style: theme.textTheme.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.primaryShade,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.delivery_dining_rounded,
                size: 50,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Track Your Donation',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Enter your tracking ID to see real-time\nstatus of your food donation',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AppColors.grey500,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.accentShade,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.accent.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: AppColors.accent, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'You can find the tracking ID in your donation confirmation or in the notifications.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.accent,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrackingContent(bool isDark) {
    final donation = _donation!;
    final location = _getDonationLocation();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDonationHeader(donation, isDark),
          _buildEtaSection(isDark),
          _buildTimelineSection(donation, isDark),
          if (location != null) _buildMapSection(location, isDark),
          _buildPhotoSection(donation, isDark),
          _buildQrSection(isDark),
          _buildActionButtons(isDark),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildDonationHeader(Donation donation, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      color: isDark ? AppColors.grey800 : AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.getStatusColor(donation.status.name).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  donation.statusDisplayText,
                  style: TextStyle(
                    color: AppColors.getStatusColor(donation.status.name),
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                '#${donation.id.substring(0, 8).toUpperCase()}',
                style: TextStyle(
                  color: AppColors.grey500,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            donation.foodName,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              _buildInfoChip(Icons.restaurant, donation.foodTypeDisplayText),
              const SizedBox(width: 8),
              _buildInfoChip(Icons.inventory_2, '${donation.quantity} ${donation.unit}'),
            ],
          ),
          if (donation.donorName != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.person_outline, size: 16, color: AppColors.grey500),
                const SizedBox(width: 4),
                Text(
                  'Donated by ${donation.donorName}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.access_time, size: 16, color: AppColors.grey500),
              const SizedBox(width: 4),
              Text(
                'Posted ${_formatDateTime(donation.createdAt)}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.grey100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.grey600),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.grey600,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEtaSection(bool isDark) {
    final isActive = _donation?.status != DonationStatus.delivered &&
        _donation?.status != DonationStatus.cancelled;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isActive
              ? [AppColors.primary, AppColors.primaryDark]
              : [AppColors.secondary, AppColors.secondaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (isActive ? AppColors.primary : AppColors.secondary)
                .withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              isActive ? Icons.timer_outlined : Icons.check_circle_outline,
              color: AppColors.white,
              size: 32,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isActive ? 'Estimated Time' : 'Status',
                  style: TextStyle(
                    color: AppColors.white.withOpacity(0.8),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isActive ? _formatDuration(_remainingEta) : _donation!.statusDisplayText,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ),
          if (isActive)
            Column(
              children: [
                Text(
                  'until expiry',
                  style: TextStyle(
                    color: AppColors.white.withOpacity(0.7),
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: _remainingEta.inHours < 2
                        ? AppColors.error
                        : AppColors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _remainingEta.inHours < 2 ? 'URGENT' : 'ON TRACK',
                    style: TextStyle(
                      color: AppColors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildTimelineSection(Donation donation, bool isDark) {
    return AchayaCard(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Delivery Timeline',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          ...List.generate(_stages.length, (index) {
            final stage = _stages[index];
            final isCompleted = index <= _currentStageIndex;
            final isCurrent = index == _currentStageIndex;
            final isLast = index == _stages.length - 1;
            final event = donation.deliveryTimeline.where(
              (e) => e.status == stage.status,
            ).firstOrNull;

            return _buildTimelineItem(
              stage: stage,
              isCompleted: isCompleted,
              isCurrent: isCurrent,
              isLast: isLast,
              event: event,
              isDark: isDark,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTimelineItem({
    required _TrackingStage stage,
    required bool isCompleted,
    required bool isCurrent,
    required bool isLast,
    DeliveryEvent? event,
    required bool isDark,
  }) {
    final color = isCompleted ? stage.color : AppColors.grey300;
    final textColor = isCompleted
        ? (isDark ? AppColors.grey100 : AppColors.grey900)
        : AppColors.grey400;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isCompleted
                      ? color.withOpacity(0.15)
                      : (isDark ? AppColors.grey700 : AppColors.grey100),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isCompleted ? color : AppColors.grey300,
                    width: isCurrent ? 2.5 : 1.5,
                  ),
                ),
                child: Icon(
                  isCompleted ? stage.activeIcon : stage.icon,
                  size: 18,
                  color: isCompleted ? color : AppColors.grey400,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: index < _currentStageIndex ? color : AppColors.grey200,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              padding: const EdgeInsets.only(bottom: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    stage.label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isCompleted ? FontWeight.w600 : FontWeight.w500,
                      color: textColor,
                    ),
                  ),
                  if (event != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      _formatDateTime(event.timestamp),
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.grey500,
                      ),
                    ),
                    if (event.note != null) ...[
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.grey50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          event.note!,
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.grey600,
                          ),
                        ),
                      ),
                    ],
                  ] else if (isCurrent) ...[
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Current',
                        style: TextStyle(
                          fontSize: 11,
                          color: color,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapSection(LatLng location, bool isDark) {
    return AchayaCard(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.map_outlined, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Route Preview',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              height: 200,
              child: GoogleMap(
                initialCameraPosition: CameraPosition(
                  target: location,
                  zoom: 14,
                ),
                markers: {
                  Marker(
                    markerId: const MarkerId('donation'),
                    position: location,
                    icon: BitmapDescriptor.defaultMarkerWithHue(
                      BitmapDescriptor.hueOrange,
                    ),
                    infoWindow: InfoWindow(
                      title: _donation?.foodName ?? 'Donation',
                      snippet: _donation?.address ?? 'Location',
                    ),
                  ),
                },
                polylines: {
                  Polyline(
                    polylineId: const PolylineId('route'),
                    points: _generateRoutePoints(location),
                    color: AppColors.primary,
                    width: 4,
                    patterns: [PatternItem.dot],
                  ),
                },
                myLocationEnabled: false,
                zoomControlsEnabled: false,
                mapToolbarEnabled: false,
                onMapCreated: (controller) {
                  if (!_mapController.isCompleted) {
                    _mapController.complete(controller);
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<LatLng> _generateRoutePoints(LatLng destination) {
    final current = const LatLng(8.5241, 76.9366);
    return [
      current,
      LatLng(
        (current.latitude + destination.latitude) / 2 + 0.005,
        (current.longitude + destination.longitude) / 2 - 0.003,
      ),
      destination,
    ];
  }

  Widget _buildPhotoSection(Donation donation, bool isDark) {
    return AchayaCard(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.photo_camera_outlined, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Photo Verification',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildPhotoCard(
                  title: 'Pickup Photo',
                  icon: Icons.add_a_photo_outlined,
                  photoUrl: donation.photoUrl,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildPhotoCard(
                  title: 'Delivery Photo',
                  icon: Icons.check_photo_camera_outlined,
                  photoUrl: donation.photoUrls.isNotEmpty ? donation.photoUrls.last : null,
                  isDark: isDark,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoCard({
    required String title,
    required IconData icon,
    String? photoUrl,
    required bool isDark,
  }) {
    return GestureDetector(
      onTap: () => _showPhotoDialog(title, photoUrl),
      child: Container(
        height: 140,
        decoration: BoxDecoration(
          color: isDark ? AppColors.grey700 : AppColors.grey50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: photoUrl != null ? AppColors.secondary.withOpacity(0.3) : AppColors.grey200,
          ),
        ),
        child: photoUrl != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      photoUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _buildPhotoPlaceholder(icon, title, isDark),
                    ),
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              AppColors.black.withOpacity(0.6),
                              Colors.transparent,
                            ],
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.verified, size: 14, color: AppColors.secondary),
                            const SizedBox(width: 4),
                            Text(
                              title,
                              style: const TextStyle(
                                color: AppColors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              )
            : _buildPhotoPlaceholder(icon, title, isDark),
      ),
    );
  }

  Widget _buildPhotoPlaceholder(IconData icon, String title, bool isDark) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          icon,
          size: 32,
          color: isDark ? AppColors.grey500 : AppColors.grey400,
        ),
        const SizedBox(height: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 12,
            color: isDark ? AppColors.grey400 : AppColors.grey500,
          ),
        ),
      ],
    );
  }

  Widget _buildQrSection(bool isDark) {
    final trackingData = 'ACHAYA-${_donation?.id ?? "UNKNOWN"}';

    return AchayaCard(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.qr_code_2, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Tracking QR Code',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Center(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.grey200),
              ),
              child: QrImageView(
                data: trackingData,
                version: QrVersions.auto,
                size: 160,
                backgroundColor: AppColors.white,
                eyeStyle: const QrEyeStyle(
                  eyeShape: QrEyeShape.roundedOuter,
                  color: AppColors.primary,
                ),
                dataModuleStyle: const QrDataModuleStyle(
                  dataModuleShape: QrDataModuleShape.roundedOuter,
                  color: AppColors.grey900,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: GestureDetector(
              onTap: () {
                Clipboard.setData(ClipboardData(text: trackingData));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Tracking ID copied to clipboard')),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.accentShade,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.copy, size: 14, color: AppColors.accent),
                    const SizedBox(width: 6),
                    Text(
                      trackingData,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.accent,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(bool isDark) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: AchayaButton(
              text: 'Download Certificate',
              icon: Icons.download,
              onPressed: _downloadCertificate,
              variant: ButtonVariant.gradient,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: AchayaButton(
              text: 'Open in Maps',
              icon: Icons.map,
              onPressed: _openInMaps,
              variant: ButtonVariant.outline,
            ),
          ),
        ],
      ),
    );
  }
}

class _TrackingStage {
  final String status;
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final Color color;

  const _TrackingStage({
    required this.status,
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.color,
  });
}
