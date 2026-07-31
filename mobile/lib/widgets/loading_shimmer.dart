import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../config/theme.dart';

class LoadingShimmer extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;
  final EdgeInsetsGeometry? margin;

  const LoadingShimmer({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 8,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Shimmer.fromColors(
      baseColor: isDark ? AppColors.grey700 : AppColors.grey200,
      highlightColor: isDark ? AppColors.grey600 : AppColors.grey100,
      child: Container(
        width: width,
        height: height,
        margin: margin,
        decoration: BoxDecoration(
          color: isDark ? AppColors.grey700 : AppColors.grey200,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class DonationTileShimmer extends StatelessWidget {
  const DonationTileShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).brightness == Brightness.dark
            ? AppColors.grey800
            : AppColors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              LoadingShimmer(
                width: 48,
                height: 48,
                borderRadius: 12,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    LoadingShimmer(
                      width: 150,
                      height: 16,
                      borderRadius: 4,
                    ),
                    const SizedBox(height: 8),
                    LoadingShimmer(
                      width: 100,
                      height: 12,
                      borderRadius: 4,
                    ),
                  ],
                ),
              ),
              LoadingShimmer(
                width: 60,
                height: 24,
                borderRadius: 12,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              LoadingShimmer(
                width: 60,
                height: 20,
                borderRadius: 4,
              ),
              const SizedBox(width: 8),
              LoadingShimmer(
                width: 80,
                height: 20,
                borderRadius: 4,
              ),
              const SizedBox(width: 8),
              LoadingShimmer(
                width: 40,
                height: 20,
                borderRadius: 4,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class CardShimmer extends StatelessWidget {
  const CardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).brightness == Brightness.dark
            ? AppColors.grey800
            : AppColors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          LoadingShimmer(
            width: double.infinity,
            height: 120,
            borderRadius: 12,
          ),
          const SizedBox(height: 12),
          LoadingShimmer(
            width: 200,
            height: 18,
            borderRadius: 4,
          ),
          const SizedBox(height: 8),
          LoadingShimmer(
            width: 150,
            height: 14,
            borderRadius: 4,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              LoadingShimmer(
                width: 80,
                height: 32,
                borderRadius: 16,
              ),
              const SizedBox(width: 8),
              LoadingShimmer(
                width: 80,
                height: 32,
                borderRadius: 16,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class ListShimmer extends StatelessWidget {
  final int itemCount;
  final double itemHeight;

  const ListShimmer({
    super.key,
    this.itemCount = 5,
    this.itemHeight = 80,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        itemCount,
        (index) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Row(
            children: [
              LoadingShimmer(
                width: itemHeight,
                height: itemHeight,
                borderRadius: 12,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    LoadingShimmer(
                      width: double.infinity,
                      height: 16,
                      borderRadius: 4,
                    ),
                    const SizedBox(height: 8),
                    LoadingShimmer(
                      width: 120,
                      height: 12,
                      borderRadius: 4,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class StatsShimmer extends StatelessWidget {
  const StatsShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: LoadingShimmer(
            height: 100,
            borderRadius: 16,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: LoadingShimmer(
            height: 100,
            borderRadius: 16,
          ),
        ),
      ],
    );
  }
}

class MapMarkerShimmer extends StatelessWidget {
  const MapMarkerShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.primary.withOpacity(0.3),
      highlightColor: AppColors.primary.withOpacity(0.1),
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.3),
          shape: BoxShape.circle,
        ),
        child: const Icon(
          Icons.location_on,
          color: AppColors.primary,
          size: 24,
        ),
      ),
    );
  }
}
