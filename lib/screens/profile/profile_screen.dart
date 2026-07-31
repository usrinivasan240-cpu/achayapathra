import 'package:flutter/material.dart';

const Color primaryColor = Color(0xFFFF6B35);
const Color secondaryColor = Color(0xFF16A34A);
const Color accentColor = Color(0xFF1E3A8A);

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final String userName = "Srinivasan R";
  final String userRole = "Volunteer";
  final String memberSince = "March 2024";

  final List<Map<String, dynamic>> impactStats = [
    {"label": "Donations", "value": "48", "icon": Icons.volunteer_activism, "color": primaryColor},
    {"label": "People Fed", "value": "1,240", "icon": Icons.restaurant, "color": secondaryColor},
    {"label": "CO₂ Saved", "value": "89 kg", "icon": Icons.eco, "color": accentColor},
  ];

  final List<Map<String, dynamic>> menuItems = [
    {
      "title": "Edit Profile",
      "subtitle": "Update your personal information",
      "icon": Icons.person_outline,
      "color": primaryColor,
      "route": "/profile/edit",
    },
    {
      "title": "My Donations",
      "subtitle": "View all your donation history",
      "icon": Icons.history,
      "color": secondaryColor,
      "route": "/profile/donations",
    },
    {
      "title": "My Certificates",
      "subtitle": "Download impact certificates",
      "icon": Icons.verified,
      "color": accentColor,
      "route": "/profile/certificates",
    },
    {
      "title": "Settings",
      "subtitle": "Notifications, privacy, language",
      "icon": Icons.settings_outlined,
      "color": Colors.grey[600]!,
      "route": "/profile/settings",
    },
    {
      "title": "About Achayapathra",
      "subtitle": "App version, terms, support",
      "icon": Icons.info_outline,
      "color": Colors.blueGrey,
      "route": "/profile/about",
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: primaryColor,
        elevation: 0,
        title: const Text(
          "Profile",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.edit, color: Colors.white),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildProfileHeader(),
            _buildImpactStatsRow(),
            _buildMenuItems(),
            _buildLogoutButton(),
            _buildVersionInfo(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [primaryColor, Color(0xFFE85D2C)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              CircleAvatar(
                radius: 52,
                backgroundColor: Colors.white.withValues(alpha: 0.2),
                child: CircleAvatar(
                  radius: 48,
                  backgroundColor: Colors.white,
                  child: Text(
                    userName.split(" ").map((n) => n[0]).join(),
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: primaryColor,
                    ),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 6,
                    ),
                  ],
                ),
                child: const Icon(Icons.camera_alt, size: 18, color: primaryColor),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            userName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.badge, size: 16, color: Colors.white.withValues(alpha: 0.9)),
                const SizedBox(width: 6),
                Text(
                  userRole,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.95),
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Text(
            "Member since $memberSince",
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImpactStatsRow() {
    return Transform.translate(
      offset: const Offset(0, -16),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: impactStats.map((stat) {
            return Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: (stat["color"] as Color).withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    stat["icon"] as IconData,
                    color: stat["color"] as Color,
                    size: 24,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  stat["value"],
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                Text(
                  stat["label"],
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildMenuItems() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              "Account",
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.grey[600],
              ),
            ),
          ),
          ...menuItems.map((item) {
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ListTile(
                onTap: () {
                  Navigator.pushNamed(context, item["route"] as String);
                },
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: (item["color"] as Color).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    item["icon"] as IconData,
                    color: item["color"] as Color,
                    size: 22,
                  ),
                ),
                title: Text(
                  item["title"],
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: Colors.black87,
                  ),
                ),
                subtitle: Text(
                  item["subtitle"],
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
                trailing: Icon(
                  Icons.chevron_right,
                  color: Colors.grey[400],
                  size: 22,
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: SizedBox(
        width: double.infinity,
        height: 52,
        child: OutlinedButton.icon(
          onPressed: () => _showLogoutDialog(),
          icon: const Icon(Icons.logout, color: Colors.red),
          label: const Text(
            "Logout",
            style: TextStyle(
              color: Colors.red,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: Colors.red, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text("Logout"),
        content: const Text("Are you sure you want to logout from Achayapathra?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushReplacementNamed(context, '/login');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text("Logout"),
          ),
        ],
      ),
    );
  }

  Widget _buildVersionInfo() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        children: [
          Text(
            "Achayapathra v1.0.0",
            style: TextStyle(fontSize: 12, color: Colors.grey[400]),
          ),
          const SizedBox(height: 4),
          Text(
            "Fight Hunger, Save Food, Save Planet",
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey[400],
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }
}
