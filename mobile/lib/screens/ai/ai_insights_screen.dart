import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../config/constants.dart';
import '../../widgets/achaya_card.dart';
import '../../widgets/achaya_button.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/section_header.dart';

class AiInsightsScreen extends StatefulWidget {
  const AiInsightsScreen({super.key});

  @override
  State<AiInsightsScreen> createState() => _AiInsightsScreenState();
}

class _AiInsightsScreenState extends State<AiInsightsScreen> {
  final List<_AiInsightCard> _cards = [];

  @override
  void initState() {
    super.initState();
    _initializeCards();
  }

  void _initializeCards() {
    _cards.addAll([
      _AiInsightCard(
        title: 'Food Waste Predictor',
        subtitle: 'AI-powered waste forecasting',
        description: 'Predict food surplus patterns and optimize donation timing based on historical data, events, and seasonal trends.',
        icon: Icons.analytics_outlined,
        color: AppColors.primary,
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        stats: [
          _AiStat(label: 'Accuracy', value: '94.2%'),
          _AiStat(label: 'Predictions Today', value: '28'),
          _AiStat(label: 'Food Saved', value: '340kg'),
        ],
        features: [
          'Weekly surplus predictions',
          'Seasonal trend analysis',
          'Event-based forecasting',
          'Smart alerts for donors',
        ],
        route: null,
      ),
      _AiInsightCard(
        title: 'Smart Matching',
        subtitle: 'Intelligent NGO-Volunteer pairing',
        description: 'AI algorithm matches donations with the best-suited NGOs and volunteers based on location, capacity, food preferences, and ratings.',
        icon: Icons.psychology_outlined,
        color: AppColors.secondary,
        gradient: const LinearGradient(
          colors: [AppColors.secondary, AppColors.secondaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        stats: [
          _AiStat(label: 'Match Score', value: '87%'),
          _AiStat(label: 'Active Matches', value: '156'),
          _AiStat(label: 'Success Rate', value: '96%'),
        ],
        features: [
          'Location-based matching',
          'Capacity-aware pairing',
          'Food preference alignment',
          'Real-time availability check',
        ],
        route: null,
      ),
      _AiInsightCard(
        title: 'Carbon Impact',
        subtitle: 'Environmental savings tracker',
        description: 'Track the environmental impact of food donations including CO\u2082 savings, water conservation, and landfill diversion metrics.',
        icon: Icons.eco_outlined,
        color: const Color(0xFF059669),
        gradient: const LinearGradient(
          colors: [Color(0xFF059669), Color(0xFF047857)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        stats: [
          _AiStat(label: 'CO\u2082 Saved', value: '12.4t'),
          _AiStat(label: 'Trees Equiv.', value: '568'),
          _AiStat(label: 'Water Saved', value: '240kL'),
        ],
        features: [
          'Real-time CO\u2082 calculations',
          'Water footprint tracking',
          'Landfill diversion metrics',
          'Monthly impact reports',
        ],
        route: AppRoutes.carbonTracker,
      ),
      _AiInsightCard(
        title: 'Demand Forecast',
        subtitle: 'Hunger zone demand prediction',
        description: 'Predict food demand across different hunger zones and schedule proactive distributions to prevent food insecurity.',
        icon: Icons.insights_outlined,
        color: AppColors.accent,
        gradient: const LinearGradient(
          colors: [AppColors.accent, AppColors.accentDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        stats: [
          _AiStat(label: 'Zones Monitored', value: '45'),
          _AiStat(label: 'Demand Accuracy', value: '91%'),
          _AiStat(label: 'People Reached', value: '2.3k'),
        ],
        features: [
          'Zone-level demand prediction',
          'Population density analysis',
          'Seasonal demand patterns',
          'Proactive distribution alerts',
        ],
        route: AppRoutes.hungerZoneList,
      ),
      _AiInsightCard(
        title: 'Route Optimizer',
        subtitle: 'AI-optimized delivery routes',
        description: 'Optimize pickup and delivery routes to minimize travel time, fuel consumption, and maximize the number of deliveries per trip.',
        icon: Icons.route_outlined,
        color: const Color(0xFF7C3AED),
        gradient: const LinearGradient(
          colors: [Color(0xFF7C3AED), Color(0xFF6D28D9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        stats: [
          _AiStat(label: 'Time Saved', value: '32%'),
          _AiStat(label: 'Fuel Saved', value: '180L'),
          _AiStat(label: 'Trips Optimized', value: '892'),
        ],
        features: [
          'Multi-stop route planning',
          'Real-time traffic integration',
          'Fuel-efficient routing',
          'Batch delivery optimization',
        ],
        route: null,
      ),
    ]);
  }

  void _navigateToDetail(_AiInsightCard card) {
    if (card.route != null) {
      Navigator.pushNamed(context, card.route!);
    } else {
      _showDetailBottomSheet(card);
    }
  }

  void _showDetailBottomSheet(_AiInsightCard card) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => _AiDetailSheet(
          card: card,
          scrollController: scrollController,
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
        title: const Text('AI Insights Hub'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.auto_awesome, size: 14, color: AppColors.secondary),
                SizedBox(width: 4),
                Text(
                  'AI Active',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.secondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeroBanner(isDark),
            _buildOverviewStats(isDark),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Text(
                'AI Tools',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 8),
            ...List.generate(_cards.length, (index) {
              return _buildInsightCard(_cards[index], isDark);
            }),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroBanner(bool isDark) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF1E3A8A),
            Color(0xFF2563EB),
            Color(0xFF3B82F6),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.accent.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  color: AppColors.white,
                  size: 28,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Achayapathra AI',
                      style: TextStyle(
                        color: AppColors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Powered by Machine Learning',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Leveraging artificial intelligence to optimize food redistribution, minimize waste, and maximize community impact across Tamil Nadu.',
            style: TextStyle(
              color: AppColors.white.withOpacity(0.85),
              fontSize: 13,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildBannerStat('94%', 'Accuracy'),
              const SizedBox(width: 16),
              _buildBannerStat('2.5k', 'Daily Queries'),
              const SizedBox(width: 16),
              _buildBannerStat('156', 'Active Models'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBannerStat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: AppColors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: AppColors.white.withOpacity(0.7),
            fontSize: 11,
          ),
        ),
      ],
    );
  }

  Widget _buildOverviewStats(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: MiniStatCard(
              label: 'Food Saved',
              value: '12.4t',
              icon: Icons.restaurant,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: MiniStatCard(
              label: 'CO\u2082 Reduced',
              value: '8.2t',
              icon: Icons.eco,
              color: AppColors.secondary,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: MiniStatCard(
              label: 'People Fed',
              value: '5.6k',
              icon: Icons.people,
              color: AppColors.accent,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInsightCard(_AiInsightCard card, bool isDark) {
    return AchayaCard(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      onTap: () => _navigateToDetail(card),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: card.gradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(card.icon, color: AppColors.white, size: 26),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      card.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      card.subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.grey500,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: AppColors.grey400,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            card.description,
            style: TextStyle(
              fontSize: 13,
              color: AppColors.grey600,
              height: 1.4,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          Row(
            children: card.stats.map((stat) {
              return Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: card.color.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      Text(
                        stat.value,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: card.color,
                        ),
                      ),
                      Text(
                        stat.label,
                        style: TextStyle(
                          fontSize: 10,
                          color: AppColors.grey500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _AiDetailSheet extends StatelessWidget {
  final _AiInsightCard card;
  final ScrollController scrollController;

  const _AiDetailSheet({
    required this.card,
    required this.scrollController,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.grey800 : AppColors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: ListView(
        controller: scrollController,
        padding: const EdgeInsets.all(24),
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.grey300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: card.gradient,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(card.icon, color: AppColors.white, size: 30),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      card.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      card.subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.grey500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            card.description,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.grey600,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Live Metrics',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: card.stats.map((stat) {
              return Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: card.color.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Text(
                        stat.value,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: card.color,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        stat.label,
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.grey500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          Text(
            'Features',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ...card.features.map((feature) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: card.color.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.check,
                      size: 14,
                      color: card.color,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      feature,
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.grey700,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 24),
          if (card.route != null)
            AchayaButton(
              text: 'Open ${card.title}',
              icon: Icons.open_in_new,
              isExpanded: true,
              variant: ButtonVariant.gradient,
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, card.route!);
              },
            )
          else
            AchayaButton(
              text: 'Coming Soon',
              icon: Icons.construction,
              isExpanded: true,
              variant: ButtonVariant.outline,
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${card.title} is under development'),
                  ),
                );
              },
            ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _AiInsightCard {
  final String title;
  final String subtitle;
  final String description;
  final IconData icon;
  final Color color;
  final Gradient gradient;
  final List<_AiStat> stats;
  final List<String> features;
  final String? route;

  const _AiInsightCard({
    required this.title,
    required this.subtitle,
    required this.description,
    required this.icon,
    required this.color,
    required this.gradient,
    required this.stats,
    required this.features,
    this.route,
  });
}

class _AiStat {
  final String label;
  final String value;

  const _AiStat({required this.label, required this.value});
}
