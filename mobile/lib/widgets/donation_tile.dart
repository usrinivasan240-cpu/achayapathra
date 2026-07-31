import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../config/constants.dart';
import '../models/donation.dart';

class DonationTile extends StatelessWidget {
  final Donation donation;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final bool showDonorInfo;
  final bool showStatusBadge;
  final bool showExpiryWarning;
  final bool compact;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;

  const DonationTile({
    super.key,
    required this.donation,
    this.onTap,
    this.onLongPress,
    this.showDonorInfo = true,
    this.showStatusBadge = true,
    this.showExpiryWarning = true,
    this.compact = false,
    this.padding,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      onLongPress: onLongPress,
      child: Container(
        padding: padding ?? const EdgeInsets.all(12),
        margin: margin ?? const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: isDark ? AppColors.grey800 : AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: donation.isUrgent
                ? AppColors.error.withOpacity(0.5)
                : isDark
                    ? AppColors.grey700
                    : AppColors.grey200,
            width: donation.isUrgent ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.black.withOpacity(isDark ? 0.2 : 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: compact ? _buildCompactView(context) : _buildFullView(context),
      ),
    );
  }

  Widget _buildFullView(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _buildFoodIcon(context),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          donation.foodName,
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (donation.isUrgent) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.error.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'URGENT',
                            style: TextStyle(
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                              color: AppColors.error,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${donation.quantity} ${donation.unit}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                ],
              ),
            ),
            if (showStatusBadge) ...[
              const SizedBox(width: 8),
              _buildStatusBadge(),
            ],
          ],
        ),
        if (showDonorInfo && donation.donorName != null) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                Icons.person_outline,
                size: 14,
                color: AppColors.grey500,
              ),
              const SizedBox(width: 4),
              Text(
                donation.donorName!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: AppColors.grey600,
                ),
              ),
              if (donation.address != null) ...[
                const SizedBox(width: 12),
                Icon(
                  Icons.location_on_outlined,
                  size: 14,
                  color: AppColors.grey500,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    donation.address!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.grey600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ],
          ),
        ],
        const SizedBox(height: 8),
        Row(
          children: [
            _buildInfoChip(
              context,
              icon: Icons.access_time,
              label: _formatExpiryTime(),
              color: donation.isNearExpiry ? AppColors.warning : AppColors.grey500,
            ),
            const SizedBox(width: 8),
            _buildInfoChip(
              context,
              icon: Icons.restaurant,
              label: donation.foodTypeDisplayText,
              color: AppColors.primary,
            ),
            if (donation.isVeg) ...[
              const SizedBox(width: 8),
              _buildInfoChip(
                context,
                icon: Icons.eco,
                label: 'Veg',
                color: AppColors.secondary,
              ),
            ],
          ],
        ),
        if (showExpiryWarning && donation.isNearExpiry) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.warning.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.warning_amber,
                  size: 16,
                  color: AppColors.warning,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Expiring soon - pick up within ${donation.timeUntilExpiry.inHours}h ${donation.timeUntilExpiry.inMinutes % 60}m',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.warning,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildCompactView(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        _buildFoodIcon(context, size: 40),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                donation.foodName,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                '${donation.quantity} ${donation.unit} • ${_formatExpiryTime()}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: AppColors.grey500,
                ),
              ),
            ],
          ),
        ),
        if (showStatusBadge) _buildStatusBadge(),
      ],
    );
  }

  Widget _buildFoodIcon(BuildContext context, {double size = 48}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: _getFoodTypeColor().withOpacity(0.1),
        borderRadius: BorderRadius.circular(size / 4),
      ),
      child: Icon(
        _getFoodTypeIcon(),
        color: _getFoodTypeColor(),
        size: size * 0.5,
      ),
    );
  }

  Widget _buildStatusBadge() {
    final statusColor = AppColors.getStatusColor(donation.status.name);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        donation.statusDisplayText,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: statusColor,
        ),
      ),
    );
  }

  Widget _buildInfoChip(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 10,
            color: color,
          ),
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
      ),
    );
  }

  Color _getFoodTypeColor() {
    switch (donation.foodType) {
      case FoodType.cooked:
        return AppColors.primary;
      case FoodType.raw:
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
      case FoodType.vegetables:
        return AppColors.secondary;
      case FoodType.grains:
        return AppColors.warning;
      case FoodType.other:
        return AppColors.grey500;
    }
  }

  IconData _getFoodTypeIcon() {
    switch (donation.foodType) {
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

  String _formatExpiryTime() {
    final now = DateTime.now();
    final diff = donation.expiryTime.difference(now);

    if (diff.isNegative) return 'Expired';
    if (diff.inHours < 1) return '${diff.inMinutes}m left';
    if (diff.inHours < 24) return '${diff.inHours}h left';
    return DateFormat('MMM d, h:mm a').format(donation.expiryTime);
  }
}
