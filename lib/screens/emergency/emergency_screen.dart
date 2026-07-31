import 'package:flutter/material.dart';

const Color primaryColor = Color(0xFFFF6B35);
const Color secondaryColor = Color(0xFF16A34A);
const Color accentColor = Color(0xFF1E3A8A);

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({super.key});

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  int peopleCount = 50;
  String selectedFoodType = "Any Food";
  String urgencyLevel = "High";
  bool locationDetected = true;
  String detectedLocation = "Adyar, Chennai, Tamil Nadu";
  bool isSending = false;

  final List<String> foodTypes = [
    "Any Food",
    "Cooked Meals",
    "Rice & Curry",
    "Bread & Snacks",
    "Fruits & Vegetables",
    "Milk & Dairy",
    "Baby Food",
  ];

  final List<Map<String, dynamic>> urgencyLevels = [
    {
      "level": "Critical",
      "color": Colors.red,
      "description": "Immediate need (within 1 hour)",
      "icon": Icons.warning_amber,
    },
    {
      "level": "High",
      "color": Colors.orange,
      "description": "Urgent need (within 3 hours)",
      "icon": Icons.priority_high,
    },
    {
      "level": "Medium",
      "color": Colors.amber,
      "description": "Moderate need (within 6 hours)",
      "icon": Icons.info_outline,
    },
  ];

  final List<Map<String, dynamic>> activeAlerts = [
    {
      "title": "Flood Relief - Velachery",
      "people": 200,
      "urgency": "Critical",
      "urgencyColor": Colors.red,
      "location": "Velachery, Chennai",
      "time": "25 min ago",
      "status": "Active",
      "responders": 3,
    },
    {
      "title": "Orphanage Supply Depleted",
      "people": 45,
      "urgency": "High",
      "urgencyColor": Colors.orange,
      "location": "T. Nagar, Chennai",
      "time": "1 hour ago",
      "status": "Responding",
      "responders": 2,
    },
    {
      "title": "Elderly Home - Meal Needed",
      "people": 30,
      "urgency": "Medium",
      "urgencyColor": Colors.amber,
      "location": "Mylapore, Chennai",
      "time": "2 hours ago",
      "status": "Fulfilled",
      "responders": 1,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.red.shade700,
        elevation: 0,
        title: const Text(
          "Emergency Request",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.history, color: Colors.white),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildSOSButton(),
            _buildRequestForm(),
            _buildActiveAlertsSection(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSOSButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.red.shade700, Colors.red.shade900],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Column(
        children: [
          GestureDetector(
            onTap: () => _showSOSConfirmDialog(),
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Colors.red, Color(0xFFB91C1C)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.red.withValues(alpha: 0.5),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.emergency, color: Colors.white, size: 48),
                  SizedBox(height: 4),
                  Text(
                    "SOS",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "SOS Emergency Request",
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            "Tap to send an emergency food request\nnearby volunteers and NGOs",
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 13,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRequestForm() {
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
          const Text(
            "Emergency Food Request",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 20),

          // People count selector
          const Text(
            "Number of People",
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: () {
                    setState(() {
                      peopleCount = (peopleCount - 10).clamp(10, 500);
                    });
                  },
                  icon: const Icon(Icons.remove_circle_outline, color: Colors.red, size: 30),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        "$peopleCount",
                        style: const TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      Text(
                        "people need food",
                        style: TextStyle(fontSize: 13, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {
                    setState(() {
                      peopleCount = (peopleCount + 10).clamp(10, 500);
                    });
                  },
                  icon: const Icon(Icons.add_circle_outline, color: secondaryColor, size: 30),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Food type selector
          const Text(
            "Food Type Needed",
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: foodTypes.map((type) {
              final isSelected = selectedFoodType == type;
              return GestureDetector(
                onTap: () => setState(() => selectedFoodType = type),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? primaryColor : Colors.grey[50],
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected ? primaryColor : Colors.grey[300]!,
                    ),
                  ),
                  child: Text(
                    type,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: isSelected ? Colors.white : Colors.grey[700],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          // Location auto-detect
          const Text(
            "Location",
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: locationDetected ? secondaryColor.withValues(alpha: 0.05) : Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: locationDetected ? secondaryColor.withValues(alpha: 0.3) : Colors.grey[200]!,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.location_on,
                  color: locationDetected ? secondaryColor : Colors.grey,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        locationDetected ? "Auto-detected" : "Detecting...",
                        style: TextStyle(
                          fontSize: 11,
                          color: locationDetected ? secondaryColor : Colors.grey,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        detectedLocation,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {
                    setState(() {
                      locationDetected = true;
                      detectedLocation = "Adyar, Chennai, Tamil Nadu";
                    });
                  },
                  icon: Icon(
                    Icons.my_location,
                    color: locationDetected ? secondaryColor : Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Urgency level
          const Text(
            "Urgency Level",
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
          ),
          const SizedBox(height: 10),
          Column(
            children: urgencyLevels.map((level) {
              final isSelected = urgencyLevel == level["level"];
              final levelColor = level["color"] as Color;
              return GestureDetector(
                onTap: () => setState(() => urgencyLevel = level["level"]),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isSelected ? levelColor.withValues(alpha: 0.08) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? levelColor : Colors.grey[200]!,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        level["icon"] as IconData,
                        color: levelColor,
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              level["level"],
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: isSelected ? levelColor : Colors.black87,
                              ),
                            ),
                            Text(
                              level["description"] as String,
                              style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                            ),
                          ],
                        ),
                      ),
                      if (isSelected)
                        Icon(Icons.check_circle, color: levelColor, size: 22),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          // Send button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: isSending ? null : _sendEmergencyRequest,
              icon: isSending
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Icon(Icons.send, size: 20),
              label: Text(
                isSending ? "Sending..." : "Send Emergency Request",
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade700,
                foregroundColor: Colors.white,
                disabledBackgroundColor: Colors.red.shade300,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveAlertsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Active Emergency Alerts",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              TextButton(
                onPressed: () {},
                child: const Text("View All", style: TextStyle(color: primaryColor)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: activeAlerts.length,
            itemBuilder: (context, index) {
              final alert = activeAlerts[index];
              final isActive = alert["status"] == "Active";
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: isActive
                      ? Border.all(color: Colors.red.withValues(alpha: 0.3), width: 1.5)
                      : null,
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
                          child: Text(
                            alert["title"],
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: (alert["urgencyColor"] as Color).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            alert["urgency"],
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: alert["urgencyColor"] as Color,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.people, size: 16, color: Colors.grey[500]),
                        const SizedBox(width: 4),
                        Text(
                          "${alert["people"]} people",
                          style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                        ),
                        const SizedBox(width: 16),
                        Icon(Icons.location_on, size: 16, color: Colors.grey[500]),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            alert["location"],
                            style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.access_time, size: 14, color: Colors.grey[400]),
                        const SizedBox(width: 4),
                        Text(
                          alert["time"],
                          style: TextStyle(fontSize: 12, color: Colors.grey[400]),
                        ),
                        const Spacer(),
                        Icon(Icons.handshake, size: 14, color: secondaryColor),
                        const SizedBox(width: 4),
                        Text(
                          "${alert["responders"]} responders",
                          style: TextStyle(fontSize: 12, color: secondaryColor, fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: alert["status"] == "Active"
                                ? Colors.red.withValues(alpha: 0.1)
                                : alert["status"] == "Responding"
                                    ? Colors.orange.withValues(alpha: 0.1)
                                    : secondaryColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            alert["status"],
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: alert["status"] == "Active"
                                  ? Colors.red
                                  : alert["status"] == "Responding"
                                      ? Colors.orange
                                      : secondaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (isActive) ...[
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text("Responding to: ${alert["title"]}"),
                                backgroundColor: secondaryColor,
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            );
                          },
                          icon: const Icon(Icons.volunteer_activism, size: 18),
                          label: const Text("Respond to Alert"),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _showSOSConfirmDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.warning_amber, color: Colors.red.shade700, size: 28),
            const SizedBox(width: 8),
            const Text("Emergency SOS"),
          ],
        ),
        content: const Text(
          "This will send an immediate emergency food request to all nearby volunteers and NGOs.\n\n"
          "Use this only for genuine emergencies requiring immediate food assistance.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                peopleCount = 50;
                selectedFoodType = "Any Food";
                urgencyLevel = "Critical";
              });
              _sendEmergencyRequest();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade700,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text("Send SOS"),
          ),
        ],
      ),
    );
  }

  void _sendEmergencyRequest() {
    setState(() => isSending = true);

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => isSending = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Emergency request sent! $peopleCount people need $selectedFoodType ($urgencyLevel urgency)",
            ),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 4),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            action: SnackBarAction(
              label: "View",
              textColor: Colors.white,
              onPressed: () {},
            ),
          ),
        );
      }
    });
  }
}
