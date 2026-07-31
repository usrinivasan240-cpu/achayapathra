import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../config/constants.dart';
import '../../models/certificate.dart';
import '../../services/firestore_service.dart';
import '../../widgets/achaya_card.dart';
import '../../widgets/achaya_button.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/section_header.dart';
import '../../widgets/loading_shimmer.dart';
import 'certificate_preview_screen.dart';

class CertificateScreen extends StatefulWidget {
  final String? userId;

  const CertificateScreen({super.key, this.userId});

  @override
  State<CertificateScreen> createState() => _CertificateScreenState();
}

class _CertificateScreenState extends State<CertificateScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final FirestoreService _firestoreService = FirestoreService();
  final TextEditingController _verifyController = TextEditingController();
  List<Certificate> _certificates = [];
  bool _isLoading = true;
  String? _verifyError;
  Certificate? _verifiedCertificate;
  bool _isVerifying = false;

  String _selectedFilter = 'all';
  final List<String> _filters = ['all', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadCertificates();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _verifyController.dispose();
    super.dispose();
  }

  void _loadCertificates() {
    setState(() => _isLoading = true);
    final userId = widget.userId ?? 'current_user';

    _firestoreService.getUserCertificatesStream(userId).listen(
      (certificates) {
        if (mounted) {
          setState(() {
            _certificates = certificates;
            _isLoading = false;
          });
        }
      },
      onError: (error) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _certificates = _getSampleCertificates();
          });
        }
      },
    );
  }

  List<Certificate> _getSampleCertificates() {
    return [
      Certificate(
        id: 'cert_001',
        userId: 'user_001',
        userName: 'Rajesh Kumar',
        level: CertificateLevel.gold,
        title: 'Gold Food Saver',
        description: 'Outstanding contribution to food redistribution',
        impactPoints: 1250,
        donationsCount: 28,
        mealsSaved: 340,
        carbonSavedKg: 125.5,
        issuedAt: DateTime.now().subtract(const Duration(days: 15)),
        certificateNumber: 'ACH-GOLD-2026-001',
        qrCode: 'CERT-GOLD-001',
        badges: ['community_star', 'green_champion'],
      ),
      Certificate(
        id: 'cert_002',
        userId: 'user_001',
        userName: 'Rajesh Kumar',
        level: CertificateLevel.silver,
        title: 'Silver Food Champion',
        description: 'Dedicated food redistribution volunteer',
        impactPoints: 620,
        donationsCount: 15,
        mealsSaved: 180,
        carbonSavedKg: 67.3,
        issuedAt: DateTime.now().subtract(const Duration(days: 45)),
        certificateNumber: 'ACH-SLV-2026-002',
        qrCode: 'CERT-SLV-002',
        badges: ['ten_donations'],
      ),
      Certificate(
        id: 'cert_003',
        userId: 'user_001',
        userName: 'Rajesh Kumar',
        level: CertificateLevel.bronze,
        title: 'Bronze Food Hero',
        description: 'First steps towards fighting food waste',
        impactPoints: 120,
        donationsCount: 5,
        mealsSaved: 45,
        carbonSavedKg: 18.2,
        issuedAt: DateTime.now().subtract(const Duration(days: 90)),
        certificateNumber: 'ACH-BRZ-2026-003',
        qrCode: 'CERT-BRZ-003',
        badges: ['first_donation'],
      ),
      Certificate(
        id: 'cert_004',
        userId: 'user_001',
        userName: 'Rajesh Kumar',
        level: CertificateLevel.platinum,
        title: 'Platinum Impact Leader',
        description: 'Transforming communities through food redistribution',
        impactPoints: 2800,
        donationsCount: 62,
        mealsSaved: 720,
        carbonSavedKg: 310.8,
        issuedAt: DateTime.now().subtract(const Duration(days: 5)),
        certificateNumber: 'ACH-PLT-2026-004',
        qrCode: 'CERT-PLT-004',
        badges: ['community_star', 'green_champion', 'urgent_hero'],
      ),
      Certificate(
        id: 'cert_005',
        userId: 'user_001',
        userName: 'Rajesh Kumar',
        level: CertificateLevel.diamond,
        title: 'Diamond Visionary',
        description: 'Legendary contribution to zero food waste mission',
        impactPoints: 5200,
        donationsCount: 110,
        mealsSaved: 1450,
        carbonSavedKg: 620.4,
        issuedAt: DateTime.now(),
        certificateNumber: 'ACH-DIA-2026-005',
        qrCode: 'CERT-DIA-005',
        badges: [
          'hundred_donations',
          'community_star',
          'green_champion',
          'urgent_hero',
          'volunteer_hero',
        ],
      ),
    ];
  }

  Map<String, int> _getCertificateStats() {
    final total = _certificates.length;
    final byType = <String, int>{};
    for (final cert in _certificates) {
      final level = cert.levelDisplayText;
      byType[level] = (byType[level] ?? 0) + 1;
    }
    return {'total': total, ...byType};
  }

  List<Certificate> _getFilteredCertificates() {
    if (_selectedFilter == 'all') return _certificates;
    return _certificates
        .where((c) => c.level.name == _selectedFilter)
        .toList();
  }

  void _verifyCertificate() {
    final input = _verifyController.text.trim();
    if (input.isEmpty) {
      setState(() => _verifyError = 'Please enter a certificate ID');
      return;
    }

    setState(() {
      _isVerifying = true;
      _verifyError = null;
      _verifiedCertificate = null;
    });

    final match = _certificates.where(
      (c) => c.certificateNumber?.toLowerCase() == input.toLowerCase(),
    ).firstOrNull;

    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        setState(() {
          _isVerifying = false;
          _verifiedCertificate = match;
          _verifyError = match == null ? 'Certificate not found' : null;
        });
      }
    });
  }

  void _openCertificatePreview(Certificate certificate) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CertificatePreviewScreen(certificate: certificate),
      ),
    );
  }

  void _shareCertificate(Certificate certificate) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _buildShareSheet(certificate),
    );
  }

  Widget _buildShareSheet(Certificate certificate) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.grey300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Share Certificate',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          _buildShareOption(
            icon: Icons.link,
            title: 'Copy Link',
            subtitle: 'Copy certificate verification link',
            onTap: () {
              Navigator.pop(context);
              final link = 'https://achayapathra.app/verify/${certificate.certificateNumber}';
              Clipboard.setData(ClipboardData(text: link));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Link copied to clipboard')),
              );
            },
            isDark: isDark,
          ),
          _buildShareOption(
            icon: Icons.download,
            title: 'Download PDF',
            subtitle: 'Save certificate as PDF',
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Downloading certificate...')),
              );
            },
            isDark: isDark,
          ),
          _buildShareOption(
            icon: Icons.image,
            title: 'Download PNG',
            subtitle: 'Save certificate as image',
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Saving image...')),
              );
            },
            isDark: isDark,
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildShareOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.primaryShade,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final stats = _getCertificateStats();

    return Scaffold(
      backgroundColor: isDark ? AppColors.grey900 : AppColors.grey50,
      appBar: AppBar(
        title: const Text('Certificate Center'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.grey500,
          tabs: const [
            Tab(text: 'My Certificates'),
            Tab(text: 'Verify'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCertificatesTab(stats, isDark),
          _buildVerifyTab(isDark),
        ],
      ),
    );
  }

  Widget _buildCertificatesTab(Map<String, int> stats, bool isDark) {
    return Column(
      children: [
        _buildStatsOverview(stats, isDark),
        _buildFilterChips(isDark),
        Expanded(
          child: _isLoading
              ? _buildLoadingGrid()
              : _getFilteredCertificates().isEmpty
                  ? _buildEmptyCertificates(isDark)
                  : _buildCertificateGrid(isDark),
        ),
      ],
    );
  }

  Widget _buildStatsOverview(Map<String, int> stats, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: isDark ? AppColors.grey800 : AppColors.white,
      child: Row(
        children: [
          _buildStatPill(
            label: 'Total',
            value: '${stats['total'] ?? 0}',
            color: AppColors.primary,
          ),
          const SizedBox(width: 8),
          _buildStatPill(
            label: 'Bronze',
            value: '${stats['Bronze'] ?? 0}',
            color: AppColors.certificateBronze,
          ),
          const SizedBox(width: 8),
          _buildStatPill(
            label: 'Silver',
            value: '${stats['Silver'] ?? 0}',
            color: AppColors.certificateSilver,
          ),
          const SizedBox(width: 8),
          _buildStatPill(
            label: 'Gold',
            value: '${stats['Gold'] ?? 0}',
            color: AppColors.certificateGold,
          ),
          const SizedBox(width: 8),
          _buildStatPill(
            label: 'Plat.',
            value: '${stats['Platinum'] ?? 0}',
            color: AppColors.certificatePlatinum,
          ),
          const SizedBox(width: 8),
          _buildStatPill(
            label: 'Diam.',
            value: '${stats['Diamond'] ?? 0}',
            color: AppColors.certificateDiamond,
          ),
        ],
      ),
    );
  }

  Widget _buildStatPill({
    required String label,
    required String value,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w600,
                color: color.withOpacity(0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChips(bool isDark) {
    return SizedBox(
      height: 56,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        scrollDirection: Axis.horizontal,
        itemCount: _filters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final filter = _filters[index];
          final isSelected = _selectedFilter == filter;
          final color = filter == 'all'
              ? AppColors.primary
              : AppColors.getCertificateColor(filter);

          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = filter),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? color.withOpacity(0.15) : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? color : AppColors.grey300,
                  width: isSelected ? 1.5 : 1,
                ),
              ),
              child: Text(
                filter == 'all' ? 'All' : filter[0].toUpperCase() + filter.substring(1),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? color : AppColors.grey500,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildLoadingGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.75,
      ),
      itemCount: 6,
      itemBuilder: (_, __) => const CardShimmer(),
    );
  }

  Widget _buildEmptyCertificates(bool isDark) {
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
                color: AppColors.primaryShade,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.card_membership_outlined,
                size: 40,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'No Certificates Yet',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Start donating food to earn certificates\nof appreciation',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.grey500,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            AchayaButton(
              text: 'Start Donating',
              icon: Icons.add,
              onPressed: () => Navigator.pushNamed(context, AppRoutes.donationCreate),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCertificateGrid(bool isDark) {
    final certificates = _getFilteredCertificates();

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.75,
      ),
      itemCount: certificates.length,
      itemBuilder: (context, index) {
        final cert = certificates[index];
        return _buildCertificateCard(cert, isDark);
      },
    );
  }

  Widget _buildCertificateCard(Certificate certificate, bool isDark) {
    final levelColor = AppColors.getCertificateColor(certificate.level.name);

    return AchayaCard(
      onTap: () => _openCertificatePreview(certificate),
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            height: 80,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [levelColor.withOpacity(0.8), levelColor],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Stack(
              children: [
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.white.withOpacity(0.25),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      certificate.levelEmoji,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ),
                ),
                Positioned(
                  left: 12,
                  top: 12,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        _getCertificateIcon(certificate.level),
                        color: AppColors.white,
                        size: 24,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        certificate.levelDisplayText,
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    certificate.title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppColors.grey900,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    certificate.userName,
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.grey600,
                    ),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Icon(Icons.calendar_today, size: 10, color: AppColors.grey400),
                      const SizedBox(width: 3),
                      Text(
                        DateFormat('MMM dd, yyyy').format(certificate.issuedAt),
                        style: TextStyle(
                          fontSize: 10,
                          color: AppColors.grey400,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      _buildMiniStat(
                        Icons.restaurant,
                        '${certificate.mealsSaved}',
                        AppColors.secondary,
                      ),
                      const SizedBox(width: 6),
                      _buildMiniStat(
                        Icons.eco,
                        '${certificate.carbonSavedKg.toStringAsFixed(0)}kg',
                        AppColors.accent,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat(IconData icon, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 9, color: color),
          const SizedBox(width: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getCertificateIcon(CertificateLevel level) {
    switch (level) {
      case CertificateLevel.bronze:
        return Icons.workspace_premium;
      case CertificateLevel.silver:
        return Icons.military_tech;
      case CertificateLevel.gold:
        return Icons.emoji_events;
      case CertificateLevel.platinum:
        return Icons.diamond;
      case CertificateLevel.diamond:
        return Icons.auto_awesome;
    }
  }

  Widget _buildVerifyTab(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.accent, AppColors.accentDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                const Icon(
                  Icons.verified_user,
                  color: AppColors.white,
                  size: 48,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Verify Certificate',
                  style: TextStyle(
                    color: AppColors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Scan QR code or enter certificate ID to verify authenticity',
                  style: TextStyle(
                    color: AppColors.white.withOpacity(0.8),
                    fontSize: 13,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: AchayaButton(
                  text: 'Scan QR Code',
                  icon: Icons.qr_code_scanner,
                  variant: ButtonVariant.outline,
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('QR Scanner coming soon')),
                    );
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Divider(color: AppColors.grey300),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text(
                  'OR',
                  style: TextStyle(
                    color: AppColors.grey500,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Expanded(
                child: Divider(color: AppColors.grey300),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _verifyController,
            decoration: InputDecoration(
              hintText: 'Enter Certificate ID (e.g., ACH-GOLD-2026-001)',
              prefixIcon: const Icon(Icons.badge_outlined),
              errorText: _verifyError,
            ),
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => _verifyCertificate(),
          ),
          const SizedBox(height: 12),
          AchayaButton(
            text: 'Verify',
            icon: Icons.verified,
            isExpanded: true,
            isLoading: _isVerifying,
            onPressed: _verifyCertificate,
          ),
          if (_verifiedCertificate != null) ...[
            const SizedBox(height: 24),
            _buildVerificationResult(_verifiedCertificate!, isDark),
          ],
          if (_verifyError != null && _verifiedCertificate == null && !_isVerifying) ...[
            const SizedBox(height: 24),
            _buildVerificationError(isDark),
          ],
        ],
      ),
    );
  }

  Widget _buildVerificationResult(Certificate certificate, bool isDark) {
    final levelColor = AppColors.getCertificateColor(certificate.level.name);

    return AchayaCard(
      accentColor: AppColors.secondary,
      showAccent: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.verified,
                  color: AppColors.success,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Certificate Verified',
                      style: TextStyle(
                        color: AppColors.success,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      'This certificate is authentic',
                      style: TextStyle(
                        color: AppColors.grey500,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Divider(height: 24),
          _buildVerifyInfoRow('Name', certificate.userName),
          _buildVerifyInfoRow('Level', '${certificate.levelEmoji} ${certificate.levelDisplayText}'),
          _buildVerifyInfoRow('Certificate ID', certificate.certificateNumber ?? 'N/A'),
          _buildVerifyInfoRow('Issued', DateFormat('MMM dd, yyyy').format(certificate.issuedAt)),
          _buildVerifyInfoRow('Impact Points', '${certificate.impactPoints}'),
          _buildVerifyInfoRow('Meals Saved', '${certificate.mealsSaved}'),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: AchayaButton(
                  text: 'Download',
                  icon: Icons.download,
                  variant: ButtonVariant.secondary,
                  onPressed: () {},
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AchayaButton(
                  text: 'Share',
                  icon: Icons.share,
                  variant: ButtonVariant.outline,
                  onPressed: () => _shareCertificate(certificate),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVerifyInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: TextStyle(
                color: AppColors.grey500,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
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

  Widget _buildVerificationError(bool isDark) {
    return AchayaCard(
      accentColor: AppColors.error,
      showAccent: true,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.error.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.error_outline,
              color: AppColors.error,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Certificate Not Found',
                  style: TextStyle(
                    color: AppColors.error,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  'No certificate matches this ID. Please check and try again.',
                  style: TextStyle(
                    color: AppColors.grey500,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
