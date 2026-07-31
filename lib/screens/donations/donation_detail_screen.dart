import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../config/routes.dart';
import '../../models/donation.dart';
import '../../models/ngo.dart';
import '../../models/user.dart';
import '../../services/firestore_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/achaya_button.dart';
import '../../widgets/achaya_card.dart';

class DonationDetailScreen extends StatefulWidget {
  final String donationId;

  const DonationDetailScreen({super.key, required this.donationId});

  @override
  State<DonationDetailScreen> createState() => _DonationDetailScreenState();
}

class _DonationDetailScreenState extends State<DonationDetailScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  final AuthService _authService = AuthService();

  Donation? _donation;
  bool _isLoading = true;
  String? _errorMessage;
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _loadDonation();
  }

  Future<void> _loadDonation() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final donation =
          await _firestoreService.getDonation(widget.donationId);
      if (donation != null) {
        setState(() {
          _donation = donation;
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Donation not found';
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Failed to load donation details';
      });
    }
  }

  Future<void> _claimDonation() async {
    final userId = _authService.currentUserId;
    if (userId == null || _donation == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Claim Donation'),
        content: Text(
          'Do you want to claim "${_donation!.foodName}"? This will match you as the receiving NGO.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Claim'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isUpdating = true);
    try {
      final updatedDonation = _donation!.copyWith(
        status: DonationStatus.matched,
        matchedNgoId: userId,
        matchedAt: DateTime.now(),
        updatedAt: DateTime.now(),
        deliveryTimeline: [
          ..._donation!.deliveryTimeline,
          DeliveryEvent(
            status: 'matched',
            timestamp: DateTime.now(),
            note: 'Matched with NGO',
            updatedBy: userId,
          ),
        ],
      );

      await _firestoreService.updateDonation(updatedDonation);
      setState(() {
        _donation = updatedDonation;
        _isUpdating = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Donation claimed successfully!'),
            backgroundColor: AppColors.secondary,
          ),
        );
      }
    } catch (e) {
      setState(() => _isUpdating = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to claim: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _updateStatus(DonationStatus newStatus) async {
    if (_donation == null) return;

    setState(() => _isUpdating = true);
    try {
      final userId = _authService.currentUserId;
      final timeline = List<DeliveryEvent>.from(_donation!.deliveryTimeline);

      String note;
      switch (newStatus) {
        case DonationStatus.pickedUp:
          note = 'Picked up by volunteer';
          break;
        case DonationStatus.inTransit:
          note = 'In transit to destination';
          break;
        case DonationStatus.delivered:
          note = 'Delivered successfully';
          break;
        default:
          note = 'Status updated';
      }

      timeline.add(DeliveryEvent(
        status: newStatus.name,
        timestamp: DateTime.now(),
        note: note,
        updatedBy: userId,
      ));

      final updatedDonation = _donation!.copyWith(
        status: newStatus,
        updatedAt: DateTime.now(),
        deliveryTimeline: timeline,
        pickedUpAt:
            newStatus == DonationStatus.pickedUp ? DateTime.now() : null,
        deliveredAt:
            newStatus == DonationStatus.delivered ? DateTime.now() : null,
      );

      await _firestoreService.updateDonation(updatedDonation);
      setState(() {
        _donation = updatedDonation;
        _isUpdating = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Status updated to ${newStatus.name}'),
            backgroundColor: AppColors.secondary,
          ),
        );
      }
    } catch (e) {
      setState(() => _isUpdating = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update status: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _cancelDonation() async {
    if (_donation == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Donation'),
        content: const Text('Are you sure you want to cancel this donation?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Cancel Donation'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isUpdating = true);
    try {
      final userId = _authService.currentUserId;
      final updatedDonation = _donation!.copyWith(
        status: DonationStatus.cancelled,
        updatedAt: DateTime.now(),
        cancellationReason: 'Cancelled by user',
        deliveryTimeline: [
          ..._donation!.deliveryTimeline,
          DeliveryEvent(
            status: 'cancelled',
            timestamp: DateTime.now(),
            note: 'Donation cancelled',
            updatedBy: userId,
          ),
        ],
      );

      await _firestoreService.updateDonation(updatedDonation);
      setState(() {
        _donation = updatedDonation;
        _isUpdating = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Donation cancelled'),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _isUpdating = false);
    }
  }

  void _shareDonation() {
    if (_donation == null) return;

    final text = '''
Help share this food donation!
${_donation!.foodName} - ${_donation!.quantity} ${_donation!.unit}
Location: ${_donation!.address ?? 'Not specified'}
Time left: ${_donation!.timeUntilExpiry.inHours}h ${_donation!.timeUntilExpiry.inMinutes % 60}m

Open Achayapathra app to claim this donation.
''';

    Share.share(text, subject: 'Food Donation: ${_donation!.foodName}');
  }

  void _copyTrackingId() {
    if (_donation == null) return;
    Clipboard.setData(ClipboardData(text: _donation!.id));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tracking ID copied!'),
        duration: Duration(seconds: 1),
      ),
    );
  }

  Color _getStatusColor(DonationStatus status) {
    switch (status) {
      case DonationStatus.pending:
        return AppColors.statusPending;
      case DonationStatus.matched:
        return AppColors.statusMatched;
      case DonationStatus.pickedUp:
        return AppColors.statusPickedUp;
      case DonationStatus.inTransit:
        return AppColors.statusInTransit;
      case DonationStatus.delivered:
        return AppColors.statusDelivered;
      case DonationStatus.cancelled:
        return AppColors.statusCancelled;
      case DonationStatus.expired:
        return AppColors.statusExpired;
    }
  }

  IconData _getFoodTypeIcon(FoodType type) {
    switch (type) {
      case FoodType.cooked:
        return Icons.restaurant;
      case FoodType.raw:
        return Icons.eco;
      case FoodType.packaged:
        return Icons.inventory_2;
      case FoodType.beverages:
        return Icons.local_cafe;
      case FoodType.dairy:
        return Icons.water_drop;
      case FoodType.bakery:
        return Icons.bakery_dining;
      case FoodType.fruits:
        return Icons.apple;
      case FoodType.vegetables:
        return Icons.grass;
      case FoodType.grains:
        return Icons.grain;
      case FoodType.other:
        return Icons.more_horiz;
    }
  }

  Color _getFoodTypeColor(FoodType type) {
    switch (type) {
      case FoodType.cooked:
        return AppColors.primary;
      case FoodType.raw:
      case FoodType.vegetables:
        return AppColors.secondary;
      case FoodType.packaged:
        return AppColors.accent;
      case FoodType.beverages:
        return AppColors.info;
      case FoodType.dairy:
        return AppColors.warning;
      case FoodType.bakery:
        return AppColors.certificateBronze;
      case FoodType.fruits:
        return AppColors.success;
      case FoodType.grains:
        return AppColors.warning;
      case FoodType.other:
        return AppColors.grey500;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          backgroundColor: isDark ? AppColors.grey900 : AppColors.white,
          title: const Text('Donation Details'),
        ),
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    if (_errorMessage != null || _donation == null) {
      return Scaffold(
        appBar: AppBar(
          backgroundColor: isDark ? AppColors.grey900 : AppColors.white,
          title: const Text('Donation Details'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline,
                  size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                _errorMessage ?? 'Donation not found',
                style: theme.textTheme.titleMedium,
              ),
              const SizedBox(height: 16),
              AchayaButton(
                text: 'Retry',
                onPressed: _loadDonation,
              ),
            ],
          ),
        ),
      );
    }

    final donation = _donation!;
    final statusColor = _getStatusColor(donation.status);
    final foodColor = _getFoodTypeColor(donation.foodType);

    return Scaffold(
      backgroundColor: isDark ? AppColors.grey900 : AppColors.grey50,
      body: CustomScrollView(
        slivers: [
          _buildHeroSection(donation, foodColor, isDark),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStatusHeader(donation, statusColor, isDark),
                _buildFoodInfoSection(donation, foodColor, isDark),
                _buildDonorInfoSection(donation, isDark),
                _buildStatusTimeline(donation, isDark),
                _buildMapPreview(donation, isDark),
                _buildQRCodeSection(donation, isDark),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ],
      ),
      bottomSheet: _buildActionButtons(donation, isDark),
    );
  }

  Widget _buildHeroSection(
      Donation donation, Color foodColor, bool isDark) {
    return SliverAppBar(
      expandedHeight: 240,
      pinned: true,
      backgroundColor: isDark ? AppColors.grey900 : AppColors.white,
      leading: GestureDetector(
        onTap: () => Navigator.pop(context),
        child: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.black.withOpacity(0.3),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.arrow_back, color: AppColors.white),
        ),
      ),
      actions: [
        GestureDetector(
          onTap: _shareDonation,
          child: Container(
            margin: const EdgeInsets.all(8),
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppColors.black.withOpacity(0.3),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.share, color: AppColors.white, size: 20),
          ),
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                foodColor.withOpacity(0.8),
                foodColor.withOpacity(0.4),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _getFoodTypeIcon(donation.foodType),
                    size: 40,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  donation.foodName,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  donation.foodTypeDisplayText,
                  style: TextStyle(
                    color: AppColors.white.withOpacity(0.85),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusHeader(
      Donation donation, Color statusColor, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: isDark ? AppColors.grey900 : AppColors.white,
      child: Row(
        children: [
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              donation.statusDisplayText,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: statusColor,
              ),
            ),
          ),
          const Spacer(),
          if (donation.isUrgent)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.priority_high, size: 14, color: AppColors.error),
                  SizedBox(width: 4),
                  Text(
                    'URGENT',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.error,
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(width: 8),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.grey100,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              '${donation.quantity} ${donation.unit}',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFoodInfoSection(
      Donation donation, Color foodColor, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: AchayaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.restaurant_outlined,
                    size: 18, color: foodColor),
                const SizedBox(width: 8),
                Text(
                  'Food Information',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildInfoRow(
                'Food Name', donation.foodName, Icons.fastfood_outlined),
            _buildInfoRow('Type', donation.foodTypeDisplayText,
                Icons.category_outlined),
            _buildInfoRow(
                'Quantity', '${donation.quantity} ${donation.unit}', Icons.scale),
            if (donation.description.isNotEmpty)
              _buildInfoRow('Description', donation.description,
                  Icons.description_outlined),
            _buildInfoRow(
              'Prepared',
              DateFormat('MMM d, yyyy h:mm a').format(donation.preparedAt),
              Icons.schedule,
            ),
            _buildInfoRow(
              'Expires',
              DateFormat('MMM d, yyyy h:mm a').format(donation.expiryTime),
              Icons.timer_outlined,
              valueColor: donation.isNearExpiry ? AppColors.warning : null,
            ),
            if (donation.isVeg)
              _buildInfoRow('Diet', 'Vegetarian', Icons.eco,
                  valueColor: AppColors.secondary),
            if (donation.isUrgent)
              _buildInfoRow('Priority', 'Urgent', Icons.priority_high,
                  valueColor: AppColors.error),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon,
      {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 15, color: AppColors.grey400),
          const SizedBox(width: 8),
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.grey500,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 13,
                color: valueColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDonorInfoSection(Donation donation, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: AchayaCard(
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.primaryShade,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.person,
                size: 24,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    donation.donorName ?? 'Anonymous Donor',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Donated ${DateFormat('MMM d, h:mm a').format(donation.createdAt)}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.grey500,
                        ),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.chevron_right),
              color: AppColors.grey400,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusTimeline(Donation donation, bool isDark) {
    final steps = [
      ('Created', Icons.add_circle_outline, true),
      ('Matched', Icons.handshake_outlined,
          donation.status.index >= DonationStatus.matched.index),
      ('Accepted', Icons.check_circle_outline,
          donation.status.index >= DonationStatus.matched.index),
      ('Picked Up', Icons.local_shipping_outlined,
          donation.status.index >= DonationStatus.pickedUp.index),
      ('In Transit', Icons.delivery_dining,
          donation.status.index >= DonationStatus.inTransit.index),
      ('Delivered', Icons.mark_chat_read_outlined,
          donation.status.index >= DonationStatus.delivered.index),
      ('Verified', Icons.verified_outlined,
          donation.status == DonationStatus.delivered),
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: AchayaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.timeline,
                    size: 18, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Status Timeline',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...List.generate(steps.length, (index) {
              final step = steps[index];
              final isCompleted = step.$3;
              final isLast = index == steps.length - 1;
              final isActive = index <= donation.status.index;

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: isCompleted
                              ? AppColors.secondary
                              : isActive
                                  ? AppColors.primary.withOpacity(0.15)
                                  : isDark
                                      ? AppColors.grey800
                                      : AppColors.grey100,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isCompleted
                                ? AppColors.secondary
                                : isActive
                                    ? AppColors.primary
                                    : AppColors.grey300,
                            width: 2,
                          ),
                        ),
                        child: Icon(
                          step.$2,
                          size: 14,
                          color: isCompleted
                              ? AppColors.white
                              : isActive
                                  ? AppColors.primary
                                  : AppColors.grey400,
                        ),
                      ),
                      if (!isLast)
                        Container(
                          width: 2,
                          height: 32,
                          color: isCompleted
                              ? AppColors.secondary
                              : AppColors.grey200,
                        ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        step.$1,
                        style: TextStyle(
                          fontWeight: isCompleted
                              ? FontWeight.w600
                              : FontWeight.normal,
                          fontSize: 14,
                          color: isCompleted
                              ? AppColors.secondary
                              : isDark
                                  ? AppColors.grey400
                                  : AppColors.grey600,
                        ),
                      ),
                    ),
                  ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildMapPreview(Donation donation, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: AchayaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.location_on_outlined,
                    size: 18, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Pickup Location',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const Spacer(),
                if (donation.latitude != null && donation.longitude != null)
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(
                        context,
                        AppRoutes.fullMap,
                        arguments: {
                          'latitude': donation.latitude,
                          'longitude': donation.longitude,
                        },
                      );
                    },
                    child: const Text('Open Map'),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              height: 140,
              decoration: BoxDecoration(
                color: isDark ? AppColors.grey800 : AppColors.grey100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: donation.latitude != null && donation.longitude != null
                  ? Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.map,
                              size: 48,
                              color: AppColors.secondary,
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 8,
                          left: 8,
                          right: 8,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.white.withOpacity(0.9),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              donation.address ??
                                  '${donation.latitude!.toStringAsFixed(4)}, ${donation.longitude!.toStringAsFixed(4)}',
                              style: const TextStyle(fontSize: 11),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                    )
                  : const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.location_off,
                              size: 32, color: AppColors.grey400),
                          SizedBox(height: 8),
                          Text(
                            'No location specified',
                            style: TextStyle(
                              color: AppColors.grey500,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQRCodeSection(Donation donation, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: AchayaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.qr_code,
                    size: 18, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Tracking QR',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: _copyTrackingId,
                  icon: const Icon(Icons.copy, size: 16),
                  tooltip: 'Copy Tracking ID',
                ),
              ],
            ),
            const SizedBox(height: 12),
            Center(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.grey200),
                ),
                child: QrImageView(
                  data: donation.id,
                  version: QrVersions.auto,
                  size: 160,
                  backgroundColor: AppColors.white,
                  foregroundColor: AppColors.grey900,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(
                'ID: ${donation.id.substring(0, 12)}...',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.grey500,
                      fontFamily: 'monospace',
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(Donation donation, bool isDark) {
    final userId = _authService.currentUserId;
    final isDonor = donation.donorId == userId;
    final isMatchedNgo = donation.matchedNgoId == userId;
    final canClaim =
        donation.status == DonationStatus.pending && !donation.isExpired;
    final canPickUp = donation.status == DonationStatus.matched;
    final canTransit = donation.status == DonationStatus.pickedUp;
    final canDeliver = donation.status == DonationStatus.inTransit;
    final canVerify = donation.status == DonationStatus.delivered;
    final canCancel = donation.canBeCancelled && isDonor;

    if (!canClaim &&
        !canPickUp &&
        !canTransit &&
        !canDeliver &&
        !canVerify &&
        !canCancel) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.grey900 : AppColors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.08),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (canCancel)
              Expanded(
                child: AchayaButton(
                  text: 'Cancel',
                  variant: ButtonVariant.outline,
                  onPressed: _isUpdating ? null : _cancelDonation,
                  isLoading: false,
                ),
              ),
            if (canCancel) const SizedBox(width: 12),
            if (canClaim)
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _isUpdating ? null : _claimDonation,
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (_isUpdating)
                              const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                      AppColors.white),
                                ),
                              )
                            else ...[
                              const Icon(Icons.handshake,
                                  color: AppColors.white, size: 18),
                              const SizedBox(width: 8),
                              const Text(
                                'Claim Donation',
                                style: TextStyle(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            if (canPickUp)
              Expanded(
                child: AchayaButton(
                  text: 'Mark as Picked Up',
                  icon: Icons.local_shipping,
                  onPressed: _isUpdating
                      ? null
                      : () => _updateStatus(DonationStatus.pickedUp),
                  isLoading: _isUpdating,
                ),
              ),
            if (canTransit)
              Expanded(
                child: AchayaButton(
                  text: 'Start Transit',
                  icon: Icons.delivery_dining,
                  onPressed: _isUpdating
                      ? null
                      : () => _updateStatus(DonationStatus.inTransit),
                  isLoading: _isUpdating,
                ),
              ),
            if (canDeliver)
              Expanded(
                child: AchayaButton(
                  text: 'Mark Delivered',
                  icon: Icons.check_circle,
                  variant: ButtonVariant.secondary,
                  onPressed: _isUpdating
                      ? null
                      : () => _updateStatus(DonationStatus.delivered),
                  isLoading: _isUpdating,
                ),
              ),
            if (canVerify)
              Expanded(
                child: AchayaButton(
                  text: 'Verify Delivery',
                  icon: Icons.verified,
                  variant: ButtonVariant.secondary,
                  onPressed: _isUpdating
                      ? null
                      : () => _updateStatus(DonationStatus.delivered),
                  isLoading: _isUpdating,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
