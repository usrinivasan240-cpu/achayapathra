import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../config/constants.dart';
import '../../services/auth_service.dart';
import '../../services/firestore_service.dart';
import '../../models/user.dart';
import '../../models/donation.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/donation_tile.dart';
import '../../widgets/section_header.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _authService = AuthService();
  final _firestoreService = FirestoreService();

  AppUser? _currentUser;
  bool _isLoadingUser = true;
  int _mealsServed = 12450;
  int _foodRescued = 8320;
  double _co2Saved = 4160.5;
  int _activeDonations = 47;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      final user = await _authService.getCurrentAppUser();
      if (mounted) {
        setState(() {
          _currentUser = user;
          _isLoadingUser = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingUser = false);
      }
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.grey50,
      body: RefreshIndicator(
        onRefresh: () async {
          await _loadUserData();
        },
        color: AppColors.primary,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
          slivers: [
            SliverToBoxAdapter(child: _buildWelcomeHeader()),
            SliverToBoxAdapter(child: _buildActiveAlerts()),
            SliverToBoxAdapter(child: _buildQuickActions()),
            SliverToBoxAdapter(child: _buildImpactStats()),
            SliverToBoxAdapter(
              child: SectionHeader(
                title: 'Recent Donations',
                trailing: TextButton(
                  onPressed: () {},
                  child: const Text(
                    'View All',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Inter',
                    ),
                  ),
                ),
              ),
            ),
            _buildRecentDonations(),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeHeader() {
    final name = _currentUser?.displayName ?? 'User';

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _getGreeting(),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.white.withOpacity(0.8),
                            fontFamily: 'Inter',
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppColors.white,
                            fontFamily: 'Poppins',
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () {},
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: AppColors.white.withOpacity(0.3),
                          width: 1.5,
                        ),
                      ),
                      child: _currentUser?.avatarUrl != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12.5),
                              child: Image.network(
                                _currentUser!.avatarUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return _buildAvatarFallback(name);
                                },
                              ),
                            )
                          : _buildAvatarFallback(name),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.workspace_premium,
                      size: 20,
                      color: AppColors.white,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _currentUser?.levelTitle ?? 'Newcomer',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.white,
                              fontFamily: 'Inter',
                            ),
                          ),
                          Text(
                            '${_currentUser?.impactPoints ?? 0} impact points',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.white.withOpacity(0.8),
                              fontFamily: 'Inter',
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.chevron_right,
                      color: AppColors.white.withOpacity(0.8),
                      size: 20,
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

  Widget _buildAvatarFallback(String name) {
    final initials = name.isNotEmpty
        ? name.split(' ').map((e) => e[0]).take(2).join().toUpperCase()
        : 'U';
    return Center(
      child: Text(
        initials,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: AppColors.white,
          fontFamily: 'Poppins',
        ),
      ),
    );
  }

  Widget _buildActiveAlerts() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.warning.withOpacity(0.1),
              AppColors.primary.withOpacity(0.08),
            ],
          ),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: AppColors.warning.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.warning.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.notifications_active_outlined,
                size: 22,
                color: AppColors.warning,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '3 Urgent Donations Nearby',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.grey900,
                      fontFamily: 'Inter',
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Food available for pickup in your area',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.grey500,
                      fontFamily: 'Inter',
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: AppColors.grey400,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      _QuickAction(
        icon: Icons.favorite_outline,
        label: 'Donate',
        color: AppColors.primary,
        route: AppRoutes.donationCreate,
      ),
      _QuickAction(
        icon: Icons.delivery_dining_outlined,
        label: 'Track',
        color: AppColors.secondary,
        route: AppRoutes.donationTracking,
      ),
      _QuickAction(
        icon: Icons.map_outlined,
        label: 'Map',
        color: AppColors.accent,
        route: AppRoutes.donationMap,
      ),
      _QuickAction(
        icon: Icons.auto_awesome_outlined,
        label: 'AI Insights',
        color: const Color(0xFF8B5CF6),
        route: AppRoutes.impactDashboard,
      ),
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: actions.map((action) {
          return Expanded(
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).pushNamed(action.route);
              },
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.grey200,
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: action.color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        action.icon,
                        size: 22,
                        color: action.color,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      action.label,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.grey700,
                        fontFamily: 'Inter',
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildImpactStats() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: ImpactStatCard(
                  title: 'Meals Served',
                  value: _formatNumber(_mealsServed),
                  unit: '',
                  icon: Icons.restaurant_outlined,
                  color: AppColors.primary,
                  description: 'Across Tamil Nadu',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ImpactStatCard(
                  title: 'Food Rescued',
                  value: _formatNumber(_foodRescued),
                  unit: 'kg',
                  icon: Icons.recycling_outlined,
                  color: AppColors.secondary,
                  description: 'Waste prevented',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ImpactStatCard(
                  title: 'CO\u2082 Saved',
                  value: _co2Saved.toStringAsFixed(1),
                  unit: 'kg',
                  icon: Icons.eco_outlined,
                  color: const Color(0xFF16A34A),
                  description: 'Environmental impact',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ImpactStatCard(
                  title: 'Active Donations',
                  value: _activeDonations.toString(),
                  unit: '',
                  icon: Icons.volunteer_activism_outlined,
                  color: const Color(0xFF8B5CF6),
                  description: 'Available now',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentDonations() {
    return StreamBuilder<List<Donation>>(
      stream: _firestoreService.getDonationsStream(limit: 5),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: List.generate(
                  3,
                  (_) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ),
          );
        }

        if (snapshot.hasError) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: _buildDemoDonations(),
            ),
          );
        }

        final donations = snapshot.data ?? [];

        if (donations.isEmpty) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: _buildDemoDonations(),
            ),
          );
        }

        return SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                return DonationTile(
                  donation: donations[index],
                  compact: true,
                  showDonorInfo: false,
                  onTap: () {},
                );
              },
              childCount: donations.length.clamp(0, 5),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDemoDonations() {
    final now = DateTime.now();
    final demoDonations = [
      _DemoDonation(
        name: 'Home-cooked Meals',
        quantity: '25 portions',
        time: '2h ago',
        icon: Icons.restaurant,
        color: AppColors.primary,
        status: 'Pending',
        statusColor: AppColors.statusPending,
      ),
      _DemoDonation(
        name: 'Fresh Vegetables',
        quantity: '15 kg',
        time: '4h ago',
        icon: Icons.grass,
        color: AppColors.secondary,
        status: 'Matched',
        statusColor: AppColors.statusMatched,
      ),
      _DemoDonation(
        name: 'Bakery Items',
        quantity: '40 pieces',
        time: '6h ago',
        icon: Icons.bakery_dining,
        color: AppColors.certificateBronze,
        status: 'Delivered',
        statusColor: AppColors.statusDelivered,
      ),
    ];

    return Column(
      children: demoDonations.map((donation) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.grey200),
            boxShadow: [
              BoxShadow(
                color: AppColors.black.withOpacity(0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: donation.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  donation.icon,
                  color: donation.color,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      donation.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.grey900,
                        fontFamily: 'Inter',
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${donation.quantity} \u2022 ${donation.time}',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.grey500,
                        fontFamily: 'Inter',
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: donation.statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  donation.status,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: donation.statusColor,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  String _formatNumber(int number) {
    if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(1)}k';
    }
    return number.toString();
  }
}

class _QuickAction {
  final IconData icon;
  final String label;
  final Color color;
  final String route;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.route,
  });
}

class _DemoDonation {
  final String name;
  final String quantity;
  final String time;
  final IconData icon;
  final Color color;
  final String status;
  final Color statusColor;

  const _DemoDonation({
    required this.name,
    required this.quantity,
    required this.time,
    required this.icon,
    required this.color,
    required this.status,
    required this.statusColor,
  });
}
