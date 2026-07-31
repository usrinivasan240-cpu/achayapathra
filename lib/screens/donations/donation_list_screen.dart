import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../config/routes.dart';
import '../../models/donation.dart';
import '../../services/firestore_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/achaya_button.dart';

enum FilterStatus { all, available, claimed, inTransit, delivered }

class DonationListScreen extends StatefulWidget {
  const DonationListScreen({super.key});

  @override
  State<DonationListScreen> createState() => _DonationListScreenState();
}

class _DonationListScreenState extends State<DonationListScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  final AuthService _authService = AuthService();
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<Donation> _allDonations = [];
  List<Donation> _filteredDonations = [];
  FilterStatus _selectedFilter = FilterStatus.all;
  String _searchQuery = '';
  bool _isLoading = true;
  String? _errorMessage;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _loadDonations();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadDonations() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final donations = await _firestoreService.getDonations(limit: 50);
      setState(() {
        _allDonations = donations;
        _filteredDonations = donations;
        _isLoading = false;
      });
      _applyFilter();
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Failed to load donations. Please try again.';
      });
    }
  }

  Future<void> _loadMore() async {
    if (_filteredDonations.isEmpty) return;
    try {
      final moreDonations = await _firestoreService.getDonations(
        limit: 20,
      );
      setState(() {
        _allDonations.addAll(moreDonations);
        _applyFilter();
      });
    } catch (_) {}
  }

  void _applyFilter() {
    List<Donation> filtered = List.from(_allDonations);

    switch (_selectedFilter) {
      case FilterStatus.all:
        break;
      case FilterStatus.available:
        filtered = filtered
            .where((d) => d.status == DonationStatus.pending && !d.isExpired)
            .toList();
        break;
      case FilterStatus.claimed:
        filtered = filtered
            .where((d) =>
                d.status == DonationStatus.matched ||
                d.status == DonationStatus.pickedUp)
            .toList();
        break;
      case FilterStatus.inTransit:
        filtered = filtered
            .where((d) => d.status == DonationStatus.inTransit)
            .toList();
        break;
      case FilterStatus.delivered:
        filtered = filtered
            .where((d) => d.status == DonationStatus.delivered)
            .toList();
        break;
    }

    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((d) {
        return d.foodName.toLowerCase().contains(query) ||
            (d.donorName?.toLowerCase().contains(query) ?? false) ||
            (d.address?.toLowerCase().contains(query) ?? false) ||
            d.foodTypeDisplayText.toLowerCase().contains(query);
      }).toList();
    }

    setState(() {
      _filteredDonations = filtered;
    });
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      setState(() {
        _searchQuery = value;
      });
      _applyFilter();
    });
  }

  String _formatTimeAgo(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat('MMM d').format(dateTime);
  }

  String _formatExpiry(DateTime expiryTime) {
    final diff = expiryTime.difference(DateTime.now());
    if (diff.isNegative) return 'Expired';
    if (diff.inHours < 1) return '${diff.inMinutes}m left';
    if (diff.inHours < 24) return '${diff.inHours}h left';
    return DateFormat('MMM d, h:mm a').format(expiryTime);
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

    return Scaffold(
      backgroundColor: isDark ? AppColors.grey900 : AppColors.grey50,
      appBar: AppBar(
        backgroundColor: isDark ? AppColors.grey900 : AppColors.white,
        elevation: 0,
        title: Text(
          'Donations',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.donationMap);
            },
            icon: const Icon(Icons.map_outlined),
            tooltip: 'View on Map',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(isDark),
          _buildFilterChips(isDark),
          Expanded(
            child: _buildContent(isDark),
          ),
        ],
      ),
      floatingActionButton: _buildFAB(),
    );
  }

  Widget _buildSearchBar(bool isDark) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      color: isDark ? AppColors.grey900 : AppColors.white,
      child: TextField(
        controller: _searchController,
        onChanged: _onSearchChanged,
        style: Theme.of(context).textTheme.bodyMedium,
        decoration: InputDecoration(
          hintText: 'Search donations, donors, food type...',
          prefixIcon: const Icon(Icons.search, size: 20),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  onPressed: () {
                    _searchController.clear();
                    _onSearchChanged('');
                  },
                  icon: const Icon(Icons.clear, size: 18),
                )
              : null,
          filled: true,
          fillColor: isDark ? AppColors.grey800 : AppColors.grey100,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          hintStyle: TextStyle(
            color: AppColors.grey400,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips(bool isDark) {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      color: isDark ? AppColors.grey900 : AppColors.white,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: FilterStatus.values.map((filter) {
          final isSelected = _selectedFilter == filter;
          final count = _getFilterCount(filter);
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: FilterChip(
              selected: isSelected,
              label: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _getFilterLabel(filter),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: isSelected
                          ? AppColors.white
                          : (isDark ? AppColors.grey300 : AppColors.grey700),
                    ),
                  ),
                  if (count > 0) ...[
                    const SizedBox(width: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.white.withOpacity(0.25)
                            : AppColors.grey300.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '$count',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: isSelected
                              ? AppColors.white
                              : AppColors.grey600,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              selectedColor: AppColors.primary,
              backgroundColor:
                  isDark ? AppColors.grey800 : AppColors.grey100,
              checkmarkColor: AppColors.white,
              side: BorderSide.none,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              onSelected: (_) {
                setState(() {
                  _selectedFilter = filter;
                });
                _applyFilter();
              },
              padding: const EdgeInsets.symmetric(horizontal: 8),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
            ),
          );
        }).toList(),
      ),
    );
  }

  int _getFilterCount(FilterStatus filter) {
    switch (filter) {
      case FilterStatus.all:
        return _allDonations.length;
      case FilterStatus.available:
        return _allDonations
            .where((d) =>
                d.status == DonationStatus.pending && !d.isExpired)
            .length;
      case FilterStatus.claimed:
        return _allDonations
            .where((d) =>
                d.status == DonationStatus.matched ||
                d.status == DonationStatus.pickedUp)
            .length;
      case FilterStatus.inTransit:
        return _allDonations
            .where((d) => d.status == DonationStatus.inTransit)
            .length;
      case FilterStatus.delivered:
        return _allDonations
            .where((d) => d.status == DonationStatus.delivered)
            .length;
    }
  }

  String _getFilterLabel(FilterStatus filter) {
    switch (filter) {
      case FilterStatus.all:
        return 'All';
      case FilterStatus.available:
        return 'Available';
      case FilterStatus.claimed:
        return 'Claimed';
      case FilterStatus.inTransit:
        return 'In Transit';
      case FilterStatus.delivered:
        return 'Delivered';
    }
  }

  Widget _buildContent(bool isDark) {
    if (_isLoading) {
      return _buildLoadingState();
    }

    if (_errorMessage != null) {
      return _buildErrorState(isDark);
    }

    if (_filteredDonations.isEmpty) {
      return _buildEmptyState(isDark);
    }

    return RefreshIndicator(
      onRefresh: _loadDonations,
      color: AppColors.primary,
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: _filteredDonations.length,
        itemBuilder: (context, index) {
          final donation = _filteredDonations[index];
          return _buildDonationCard(donation, isDark);
        },
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: AppColors.primary),
          const SizedBox(height: 16),
          Text(
            'Loading donations...',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.grey500,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(bool isDark) {
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
                Icons.error_outline,
                size: 40,
                color: AppColors.error,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Oops!',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.grey500,
                  ),
            ),
            const SizedBox(height: 24),
            AchayaButton(
              text: 'Retry',
              onPressed: _loadDonations,
              icon: Icons.refresh,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primaryShade,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.restaurant_menu,
                size: 60,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              _searchQuery.isNotEmpty
                  ? 'No donations found'
                  : 'No donations yet',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              _searchQuery.isNotEmpty
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to donate and make a difference!',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.grey500,
                  ),
            ),
            const SizedBox(height: 24),
            if (_searchQuery.isNotEmpty)
              AchayaButton(
                text: 'Clear Search',
                variant: ButtonVariant.outline,
                onPressed: () {
                  _searchController.clear();
                  setState(() {
                    _searchQuery = '';
                  });
                  _applyFilter();
                },
              )
            else
              AchayaButton(
                text: 'Create Donation',
                icon: Icons.add,
                onPressed: () {
                  Navigator.pushNamed(context, AppRoutes.donationCreate);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDonationCard(Donation donation, bool isDark) {
    final statusColor = _getStatusColor(donation.status);
    final foodColor = _getFoodTypeColor(donation.foodType);
    final isNearExpiry = donation.isNearExpiry;

    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          AppRoutes.donationDetail,
          arguments: donation.id,
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: isDark ? AppColors.grey800 : AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: donation.isUrgent
                ? AppColors.error.withOpacity(0.4)
                : isDark
                    ? AppColors.grey700
                    : AppColors.grey200,
            width: donation.isUrgent ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.black.withOpacity(isDark ? 0.2 : 0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildFoodImage(donation, foodColor),
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
                                style: Theme.of(context)
                                    .textTheme
                                    .titleSmall
                                    ?.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (donation.isUrgent) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 2),
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
                        Row(
                          children: [
                            Icon(
                              Icons.inventory_2_outlined,
                              size: 13,
                              color: AppColors.grey500,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              '${donation.quantity} ${donation.unit}',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(color: AppColors.grey600),
                            ),
                            const SizedBox(width: 10),
                            Container(
                              width: 3,
                              height: 3,
                              decoration: const BoxDecoration(
                                color: AppColors.grey400,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Icon(
                              Icons.access_time,
                              size: 13,
                              color: isNearExpiry
                                  ? AppColors.warning
                                  : AppColors.grey500,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              _formatExpiry(donation.expiryTime),
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: isNearExpiry
                                        ? AppColors.warning
                                        : AppColors.grey600,
                                    fontWeight: isNearExpiry
                                        ? FontWeight.w600
                                        : FontWeight.normal,
                                  ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        if (donation.donorName != null)
                          Row(
                            children: [
                              Icon(
                                Icons.person_outline,
                                size: 13,
                                color: AppColors.grey500,
                              ),
                              const SizedBox(width: 3),
                              Expanded(
                                child: Text(
                                  donation.donorName!,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: AppColors.grey600,
                                      ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        if (donation.address != null) ...[
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              Icon(
                                Icons.location_on_outlined,
                                size: 13,
                                color: AppColors.grey500,
                              ),
                              const SizedBox(width: 3),
                              Expanded(
                                child: Text(
                                  donation.address!,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: AppColors.grey600,
                                      ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
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
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _formatTimeAgo(donation.createdAt),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.grey400,
                              fontSize: 11,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (isNearExpiry)
              Container(
                width: double.infinity,
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.08),
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(16),
                    bottomRight: Radius.circular(16),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.warning_amber,
                      size: 14,
                      color: AppColors.warning,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Expiring soon - ${donation.timeUntilExpiry.inHours}h ${donation.timeUntilExpiry.inMinutes % 60}m remaining',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppColors.warning,
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

  Widget _buildFoodImage(Donation donation, Color foodColor) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: foodColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: donation.photoUrl != null
          ? ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                donation.photoUrl!,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Icon(
                    _getFoodTypeIcon(donation.foodType),
                    color: foodColor,
                    size: 26,
                  );
                },
              ),
            )
          : Icon(
              _getFoodTypeIcon(donation.foodType),
              color: foodColor,
              size: 26,
            ),
    );
  }

  Widget _buildFAB() {
    return FloatingActionButton.extended(
      onPressed: () {
        Navigator.pushNamed(context, AppRoutes.donationCreate);
      },
      backgroundColor: AppColors.primary,
      foregroundColor: AppColors.white,
      elevation: 4,
      icon: const Icon(Icons.add, size: 20),
      label: const Text(
        'New Donation',
        style: TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),
    );
  }
}
