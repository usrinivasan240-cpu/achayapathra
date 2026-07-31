import 'package:flutter/material.dart';

const Color primaryColor = Color(0xFFFF6B35);
const Color secondaryColor = Color(0xFF16A34A);
const Color accentColor = Color(0xFF1E3A8A);

class VolunteerDashboardScreen extends StatefulWidget {
  const VolunteerDashboardScreen({super.key});

  @override
  State<VolunteerDashboardScreen> createState() => _VolunteerDashboardScreenState();
}

class _VolunteerDashboardScreenState extends State<VolunteerDashboardScreen> {
  final String volunteerName = "Arjun Selvam";
  final double rating = 4.8;
  final int deliveriesCompleted = 142;

  final List<Map<String, dynamic>> stats = [
    {"label": "Active\nPickups", "value": "3", "icon": Icons.local_shipping, "color": primaryColor},
    {"label": "Completed", "value": "142", "icon": Icons.check_circle, "color": secondaryColor},
    {"label": "Distance\nTravelled", "value": "328 km", "icon": Icons.route, "color": accentColor},
    {"label": "Hours\nLogged", "value": "87h", "icon": Icons.timer, "color": Colors.orange},
  ];

  final List<Map<String, dynamic>> availablePickups = [
    {
      "donor": "Hotel Saravana Bhavan",
      "address": "T. Nagar, Chennai",
      "foodType": "Cooked Meals",
      "quantity": "60 plates",
      "distance": "2.3 km",
      "time": "Urgent",
      "timeColor": Colors.red,
    },
    {
      "donor": "Reliance Fresh",
      "address": "Adyar, Chennai",
      "foodType": "Fresh Vegetables",
      "quantity": "30 kg",
      "distance": "4.1 km",
      "time": "1 hour left",
      "timeColor": Colors.orange,
    },
    {
      "donor": "Subiksha Mart",
      "address": "Velachery, Chennai",
      "foodType": "Fruits & Dairy",
      "quantity": "20 kg",
      "distance": "5.8 km",
      "time": "3 hours left",
      "timeColor": secondaryColor,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: accentColor,
        elevation: 0,
        title: const Text(
          "Volunteer Dashboard",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildProfileCard(),
            _buildStatsGrid(),
            _buildActiveDeliveryCard(),
            _buildSectionHeader("Available Pickups", "Refresh"),
            _buildAvailablePickupsList(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [accentColor, Color(0xFF2B5DB8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 32,
            backgroundColor: Colors.white.withValues(alpha: 0.2),
            child: const Icon(Icons.person, color: Colors.white, size: 36),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  volunteerName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      "$rating",
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Icon(Icons.check_circle, color: Colors.white.withValues(alpha: 0.8), size: 16),
                    const SizedBox(width: 4),
                    Text(
                      "$deliveriesCompleted deliveries",
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.6,
        ),
        itemCount: stats.length,
        itemBuilder: (context, index) {
          final stat = stats[index];
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  stat["icon"] as IconData,
                  color: stat["color"] as Color,
                  size: 26,
                ),
                const Spacer(),
                Text(
                  stat["value"] as String,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                Text(
                  stat["label"] as String,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey[600],
                    height: 1.2,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildActiveDeliveryCard() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: secondaryColor.withValues(alpha: 0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: secondaryColor.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: secondaryColor.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              children: [
                const Icon(Icons.delivery_dining, color: secondaryColor, size: 20),
                const SizedBox(width: 8),
                const Text(
                  "Active Delivery",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: secondaryColor,
                    fontSize: 15,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: secondaryColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    "In Progress",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.store, size: 18, color: Colors.grey),
                    const SizedBox(width: 6),
                    const Expanded(
                      child: Text(
                        "Pickup: Hotel Saravana, Mylapore",
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 18, color: Colors.red),
                    const SizedBox(width: 6),
                    const Expanded(
                      child: Text(
                        "Drop: Annalakshmi NGO, Velachery",
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.only(left: 24),
                  child: Text(
                    "80 plates • Fresh Vegetables 15kg",
                    style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                  ),
                ),
                const SizedBox(height: 16),
                // Status timeline
                Row(
                  children: [
                    _buildTimelineDot(Colors.green, true),
                    _buildTimelineLine(true),
                    _buildTimelineDot(Colors.green, true),
                    _buildTimelineLine(false),
                    _buildTimelineDot(secondaryColor, false),
                    _buildTimelineLine(false),
                    _buildTimelineDot(Colors.grey[300]!, false),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Accepted", style: TextStyle(fontSize: 10, color: Colors.grey[500])),
                    Text("Picked Up", style: TextStyle(fontSize: 10, color: Colors.grey[500])),
                    Text("In Transit", style: TextStyle(fontSize: 10, color: secondaryColor, fontWeight: FontWeight.w600)),
                    Text("Delivered", style: TextStyle(fontSize: 10, color: Colors.grey[400])),
                  ],
                ),
                const SizedBox(height: 16),
                // Map preview placeholder
                Container(
                  height: 120,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Stack(
                    children: [
                      Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.map, size: 32, color: secondaryColor.withValues(alpha: 0.5)),
                            const SizedBox(height: 4),
                            Text(
                              "Live Map Tracking",
                              style: TextStyle(
                                color: secondaryColor.withValues(alpha: 0.7),
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Positioned(
                        bottom: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.navigation, size: 14, color: accentColor),
                              SizedBox(width: 4),
                              Text(
                                "3.2 km away",
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: accentColor),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.update, size: 18),
                    label: const Text("Update Delivery Status"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: secondaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineDot(Color color, bool active) {
    return Container(
      width: 14,
      height: 14,
      decoration: BoxDecoration(
        color: active ? color : Colors.grey[200],
        shape: BoxShape.circle,
        border: Border.all(
          color: active ? color : Colors.grey[300]!,
          width: 2,
        ),
      ),
      child: active
          ? const Icon(Icons.check, size: 8, color: Colors.white)
          : null,
    );
  }

  Widget _buildTimelineLine(bool active) {
    return Expanded(
      child: Container(
        height: 2,
        color: active ? Colors.green : Colors.grey[300],
      ),
    );
  }

  Widget _buildSectionHeader(String title, String actionText) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          if (actionText.isNotEmpty)
            TextButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.refresh, size: 16),
              label: Text(
                actionText,
                style: const TextStyle(color: accentColor, fontWeight: FontWeight.w600),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAvailablePickupsList() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: availablePickups.length,
      itemBuilder: (context, index) {
        final pickup = availablePickups[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
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
                          pickup["donor"],
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          pickup["address"],
                          style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: (pickup["timeColor"] as Color).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      pickup["time"],
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: pickup["timeColor"] as Color,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  _buildChip(Icons.fastfood, pickup["foodType"]),
                  const SizedBox(width: 8),
                  _buildChip(Icons.inventory_2, pickup["quantity"]),
                  const SizedBox(width: 8),
                  _buildChip(Icons.near_me, pickup["distance"]),
                ],
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _showAcceptDialog(context, pickup),
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text("Accept Pickup"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.grey[600]),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[700])),
        ],
      ),
    );
  }

  void _showAcceptDialog(BuildContext context, Map<String, dynamic> pickup) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text("Accept Pickup?"),
        content: Text(
          "You are about to accept pickup from ${pickup["donor"]}.\n\n"
          "Food: ${pickup["foodType"]}\n"
          "Quantity: ${pickup["quantity"]}\n"
          "Distance: ${pickup["distance"]}",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text("Pickup accepted from ${pickup["donor"]}!"),
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
            child: const Text("Confirm"),
          ),
        ],
      ),
    );
  }
}
