import 'package:flutter/material.dart';

const Color primaryColor = Color(0xFFFF6B35);
const Color secondaryColor = Color(0xFF16A34A);
const Color accentColor = Color(0xFF1E3A8A);

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int currentLevelIndex = 2;
  int impactPoints = 4750;

  final List<Map<String, dynamic>> levels = [
    {"name": "Bronze", "minPoints": 0, "color": const Color(0xFFCD7F32), "icon": Icons.workspace_premium},
    {"name": "Silver", "minPoints": 1000, "color": const Color(0xFFC0C0C0), "icon": Icons.workspace_premium},
    {"name": "Gold", "minPoints": 3000, "color": const Color(0xFFFFD700), "icon": Icons.workspace_premium},
    {"name": "Platinum", "minPoints": 7000, "color": const Color(0xFFE5E4E2), "icon": Icons.workspace_premium},
    {"name": "Diamond", "minPoints": 15000, "color": const Color(0xFFB9F2FF), "icon": Icons.diamond},
  ];

  final List<Map<String, dynamic>> badges = [
    {"name": "First Donation", "icon": Icons.volunteer_activism, "earned": true, "color": primaryColor},
    {"name": "Food Saver", "icon": Icons.restaurant, "earned": true, "color": secondaryColor},
    {"name": "Eco Warrior", "icon": Icons.eco, "earned": true, "color": Colors.green},
    {"name": "Speed Runner", "icon": Icons.bolt, "earned": true, "color": Colors.amber},
    {"name": "Night Owl", "icon": Icons.nights_stay, "earned": true, "color": accentColor},
    {"name": "Team Player", "icon": Icons.groups, "earned": false, "color": Colors.grey},
    {"name": "Century Club", "icon": Icons.looks_one, "earned": false, "color": Colors.grey},
    {"name": "Zero Waste", "icon": Icons.recycling, "earned": false, "color": Colors.grey},
    {"name": "Carbon Hero", "icon": Icons.forest, "earned": false, "color": Colors.grey},
    {"name": "Community Star", "icon": Icons.star, "earned": false, "color": Colors.grey},
    {"name": "Legend", "icon": Icons.emoji_events, "earned": false, "color": Colors.grey},
    {"name": "Ambassador", "icon": Icons.public, "earned": false, "color": Colors.grey},
  ];

  final List<Map<String, dynamic>> leaderboard = [
    {"rank": 1, "name": "Priya Sharma", "points": 8920, "avatar": "PS", "color": Colors.amber},
    {"rank": 2, "name": "Karthik Raj", "points": 7650, "avatar": "KR", "color": Colors.grey},
    {"rank": 3, "name": "You", "points": 4750, "avatar": "ME", "color": primaryColor},
    {"rank": 4, "name": "Deepa Nair", "points": 4200, "avatar": "DN", "color": Colors.brown},
    {"rank": 5, "name": "Vikram Singh", "points": 3890, "avatar": "VS", "color": Colors.blue},
    {"rank": 6, "name": "Anitha Devi", "points": 3200, "avatar": "AD", "color": Colors.purple},
    {"rank": 7, "name": "Rahul Menon", "points": 2870, "avatar": "RM", "color": Colors.teal},
    {"rank": 8, "name": "Lakshmi Iyer", "points": 2540, "avatar": "LI", "color": Colors.deepOrange},
  ];

  final List<Map<String, dynamic>> redeemOptions = [
    {"name": "₹50 Grocery Voucher", "points": 500, "icon": Icons.shopping_cart},
    {"name": "₹100 Fuel Coupon", "points": 1000, "icon": Icons.local_gas_station},
    {"name": "Movie Tickets (2)", "points": 2000, "icon": Icons.movie},
    {"name": "Plant a Tree", "points": 750, "icon": Icons.park},
    {"name": "NGO Donation", "points": 1500, "icon": Icons.favorite},
    {"name": "Premium Badge", "points": 3000, "icon": Icons.emoji_events},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: primaryColor,
        elevation: 0,
        title: const Text(
          "Rewards & Gamification",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.help_outline, color: Colors.white),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: "My Rewards"),
            Tab(text: "Leaderboard"),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildRewardsTab(),
          _buildLeaderboardTab(),
        ],
      ),
    );
  }

  Widget _buildRewardsTab() {
    return SingleChildScrollView(
      child: Column(
        children: [
          _buildLevelProgress(),
          _buildImpactPointsCard(),
          _buildBadgesGrid(),
          _buildRedeemSection(),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildLevelProgress() {
    final currentLevel = levels[currentLevelIndex];
    final nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;
    final progress = nextLevel != null
        ? (impactPoints - currentLevel["minPoints"]).toDouble() /
            (nextLevel["minPoints"] - currentLevel["minPoints"]).toDouble()
        : 1.0;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                currentLevel["icon"] as IconData,
                color: currentLevel["color"] as Color,
                size: 36,
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${currentLevel["name"]} Level",
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  Text(
                    "Level ${currentLevelIndex + 1} of ${levels.length}",
                    style: TextStyle(fontSize: 13, color: Colors.grey[500]),
                  ),
                ],
              ),
              const Spacer(),
              if (nextLevel != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: secondaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    "${nextLevel["minPoints"] - impactPoints} pts to ${nextLevel["name"]}",
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: secondaryColor,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 20),
          // Level progress bar with markers
          Stack(
            children: [
              // Background bar
              Container(
                height: 8,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              // Progress fill
              FractionallySizedBox(
                widthFactor: ((currentLevelIndex + progress) / levels.length).clamp(0.0, 1.0),
                child: Container(
                  height: 8,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        currentLevel["color"] as Color,
                        nextLevel != null ? nextLevel["color"] as Color : currentLevel["color"] as Color,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Level markers
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: levels.map((level) {
              final isActive = levels.indexOf(level) <= currentLevelIndex;
              return Column(
                children: [
                  Icon(
                    level["icon"] as IconData,
                    size: 18,
                    color: isActive ? level["color"] as Color : Colors.grey[300],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    level["name"],
                    style: TextStyle(
                      fontSize: 9,
                      color: isActive ? Colors.grey[700] : Colors.grey[400],
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildImpactPointsCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF16A34A), Color(0xFF15803D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: secondaryColor.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.stars, color: Colors.white, size: 32),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Impact Points",
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
                Text(
                  impactPoints.toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.trending_up, color: Colors.white, size: 14),
                    SizedBox(width: 4),
                    Text(
                      "+280",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                "this week",
                style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBadgesGrid() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Badges",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              Text(
                "${badges.where((b) => b["earned"]).length}/${badges.length} earned",
                style: TextStyle(fontSize: 13, color: Colors.grey[500]),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              crossAxisSpacing: 10,
              mainAxisSpacing: 16,
            ),
            itemCount: badges.length,
            itemBuilder: (context, index) {
              final badge = badges[index];
              final earned = badge["earned"] as bool;
              return GestureDetector(
                onTap: () => _showBadgeDetail(badge),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: earned
                            ? (badge["color"] as Color).withValues(alpha: 0.15)
                            : Colors.grey[100],
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: earned ? badge["color"] as Color : Colors.grey[300]!,
                          width: 2,
                        ),
                      ),
                      child: Icon(
                        badge["icon"] as IconData,
                        color: earned ? badge["color"] as Color : Colors.grey[400],
                        size: 24,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      badge["name"],
                      style: TextStyle(
                        fontSize: 9,
                        color: earned ? Colors.black87 : Colors.grey[400],
                        fontWeight: earned ? FontWeight.w500 : FontWeight.normal,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _showBadgeDetail(Map<String, dynamic> badge) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: (badge["color"] as Color).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                badge["icon"] as IconData,
                color: badge["earned"] ? badge["color"] as Color : Colors.grey[400],
                size: 48,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              badge["name"],
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              badge["earned"]
                  ? "You've earned this badge! Keep up the great work."
                  : "Keep contributing to unlock this badge.",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Close"),
          ),
        ],
      ),
    );
  }

  Widget _buildRedeemSection() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.redeem, color: primaryColor, size: 24),
              const SizedBox(width: 8),
              const Text(
                "Redeem Points",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const Spacer(),
              Text(
                "Balance: $impactPoints pts",
                style: const TextStyle(fontSize: 13, color: primaryColor, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.5,
            ),
            itemCount: redeemOptions.length,
            itemBuilder: (context, index) {
              final option = redeemOptions[index];
              final canRedeem = impactPoints >= (option["points"] as int);
              return GestureDetector(
                onTap: canRedeem ? () => _showRedeemDialog(option) : null,
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: canRedeem
                        ? Border.all(color: primaryColor.withValues(alpha: 0.3), width: 1.5)
                        : null,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        option["icon"] as IconData,
                        color: canRedeem ? primaryColor : Colors.grey[400],
                        size: 28,
                      ),
                      const Spacer(),
                      Text(
                        option["name"],
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: canRedeem ? Colors.black87 : Colors.grey[400],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        "${option["points"]} pts",
                        style: TextStyle(
                          fontSize: 11,
                          color: canRedeem ? primaryColor : Colors.grey[400],
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _showRedeemDialog(Map<String, dynamic> option) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text("Redeem Reward"),
        content: Text(
          "Redeem ${option["points"]} points for:\n\n${option["name"]}\n\n"
          "Your remaining balance will be ${impactPoints - (option["points"] as int)} points.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                impactPoints -= option["points"] as int;
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text("Successfully redeemed: ${option["name"]}"),
                  backgroundColor: secondaryColor,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text("Redeem"),
          ),
        ],
      ),
    );
  }

  Widget _buildLeaderboardTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: leaderboard.length,
      itemBuilder: (context, index) {
        final entry = leaderboard[index];
        final isYou = entry["name"] == "You";
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isYou ? primaryColor.withValues(alpha: 0.08) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: isYou ? Border.all(color: primaryColor.withValues(alpha: 0.3), width: 1.5) : null,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              SizedBox(
                width: 36,
                child: Text(
                  "#${entry["rank"]}",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: entry["rank"] <= 3
                        ? [Colors.amber, Colors.grey, Colors.brown][entry["rank"] - 1]
                        : Colors.grey[600],
                  ),
                ),
              ),
              CircleAvatar(
                radius: 20,
                backgroundColor: entry["color"] as Color,
                child: Text(
                  entry["avatar"],
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      entry["name"],
                      style: TextStyle(
                        fontWeight: isYou ? FontWeight.bold : FontWeight.w600,
                        fontSize: 15,
                        color: Colors.black87,
                      ),
                    ),
                    Text(
                      "${entry["points"]} points",
                      style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    ),
                  ],
                ),
              ),
              if (entry["rank"] <= 3)
                Icon(
                  Icons.emoji_events,
                  color: [Colors.amber, Colors.grey, Colors.brown][entry["rank"] - 1],
                  size: 24,
                ),
            ],
          ),
        );
      },
    );
  }
}
