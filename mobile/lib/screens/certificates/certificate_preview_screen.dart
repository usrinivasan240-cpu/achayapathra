import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/certificate.dart';
import '../../widgets/achaya_button.dart';

class CertificatePreviewScreen extends StatefulWidget {
  final Certificate certificate;

  const CertificatePreviewScreen({super.key, required this.certificate});

  @override
  State<CertificatePreviewScreen> createState() => _CertificatePreviewScreenState();
}

class _CertificatePreviewScreenState extends State<CertificatePreviewScreen> {
  bool _isLandscape = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
      DeviceOrientation.portraitUp,
    ]);
  }

  @override
  void dispose() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    super.dispose();
  }

  Certificate get _cert => widget.certificate;
  Color get _levelColor => AppColors.getCertificateColor(_cert.level.name);

  void _downloadPdf() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Generating PDF...')),
    );
  }

  void _downloadPng() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Saving certificate image...')),
    );
  }

  void _printCertificate() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Preparing to print...')),
    );
  }

  void _shareTo(String platform) {
    final text = 'Check out my ${_cert.levelDisplayText} Certificate of Appreciation '
        'from Achayapathra! Certificate ID: ${_cert.certificateNumber ?? _cert.id}';

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Sharing to $platform...')),
    );
  }

  void _showShareOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
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
            const Text(
              'Share Certificate',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(height: 20),
            _buildSocialShareTile(
              icon: Icons.workspaces,
              title: 'LinkedIn',
              color: const Color(0xFF0077B5),
              onTap: () {
                Navigator.pop(context);
                _shareTo('LinkedIn');
              },
            ),
            _buildSocialShareTile(
              icon: Icons.chat,
              title: 'WhatsApp',
              color: const Color(0xFF25D366),
              onTap: () {
                Navigator.pop(context);
                _shareTo('WhatsApp');
              },
            ),
            _buildSocialShareTile(
              icon: Icons.email,
              title: 'Email',
              color: AppColors.primary,
              onTap: () {
                Navigator.pop(context);
                _shareTo('Email');
              },
            ),
            _buildSocialShareTile(
              icon: Icons.link,
              title: 'Copy Link',
              color: AppColors.accent,
              onTap: () {
                Navigator.pop(context);
                final link = 'https://achayapathra.app/verify/${_cert.certificateNumber}';
                Clipboard.setData(ClipboardData(text: link));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Link copied to clipboard')),
                );
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialShareTile({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final isLandscapeNow = MediaQuery.of(context).orientation == Orientation.landscape;

    return Scaffold(
      backgroundColor: isDark ? AppColors.grey900 : AppColors.grey100,
      appBar: AppBar(
        title: Text('${_cert.levelDisplayText} Certificate'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(
              isLandscapeNow ? Icons.screen_lock_portrait : Icons.screen_lock_landscape,
            ),
            onPressed: () {
              setState(() {
                _isLandscape = !_isLandscape;
              });
              if (_isLandscape) {
                SystemChrome.setPreferredOrientations([
                  DeviceOrientation.landscapeLeft,
                  DeviceOrientation.landscapeRight,
                ]);
              } else {
                SystemChrome.setPreferredOrientations([
                  DeviceOrientation.portraitUp,
                ]);
              }
            },
            tooltip: 'Toggle orientation',
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: _showShareOptions,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(isLandscapeNow ? 16 : 12),
        child: Column(
          children: [
            _buildCertificateWidget(isLandscapeNow, screenWidth, isDark),
            const SizedBox(height: 16),
            _buildActionButtons(isDark),
            const SizedBox(height: 16),
            _buildCertificateDetails(isDark),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildCertificateWidget(bool isLandscape, double screenWidth, bool isDark) {
    final certWidth = isLandscape
        ? (screenWidth - 32).clamp(300.0, 600.0)
        : (screenWidth - 24).clamp(280.0, 420.0);
    final certHeight = certWidth * 0.707;

    return Container(
      width: certWidth,
      constraints: BoxConstraints(maxHeight: certHeight),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(4),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          _buildCertificateBorder(certWidth, certHeight),
          Padding(
            padding: EdgeInsets.all(certWidth * 0.04),
            child: Column(
              children: [
                _buildCertificateHeader(certWidth),
                SizedBox(height: certHeight * 0.03),
                _buildCertificateTitle(certWidth),
                SizedBox(height: certHeight * 0.02),
                _buildRecipientName(certWidth),
                SizedBox(height: certHeight * 0.02),
                _buildCertificateBody(certWidth),
                const Spacer(),
                _buildCertificateFooter(certWidth, certHeight),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCertificateBorder(double width, double height) {
    return Positioned.fill(
      child: Container(
        margin: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          border: Border.all(color: _levelColor.withOpacity(0.5), width: 2),
          borderRadius: BorderRadius.circular(2),
        ),
        child: Container(
          margin: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            border: Border.all(color: _levelColor.withOpacity(0.25), width: 1),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      ),
    );
  }

  Widget _buildCertificateHeader(double width) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: width * 0.1,
              height: width * 0.1,
              decoration: BoxDecoration(
                color: AppColors.accentShade,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.account_balance,
                size: width * 0.05,
                color: AppColors.accent,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              'Tamil Nadu\nGovt.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: width * 0.02,
                color: AppColors.accent,
                fontWeight: FontWeight.w600,
                height: 1.1,
              ),
            ),
          ],
        ),
        Column(
          children: [
            Container(
              width: width * 0.1,
              height: width * 0.1,
              decoration: BoxDecoration(
                color: AppColors.primaryShade,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.restaurant,
                size: width * 0.05,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              'Achayapathra',
              style: TextStyle(
                fontSize: width * 0.02,
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCertificateTitle(double width) {
    return Column(
      children: [
        Text(
          'CERTIFICATE',
          style: TextStyle(
            fontSize: width * 0.055,
            fontWeight: FontWeight.bold,
            color: AppColors.grey900,
            letterSpacing: 3,
          ),
        ),
        Text(
          'OF APPRECIATION',
          style: TextStyle(
            fontSize: width * 0.035,
            fontWeight: FontWeight.w600,
            color: AppColors.grey600,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          width: width * 0.3,
          height: 2,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [_levelColor.withOpacity(0.3), _levelColor, _levelColor.withOpacity(0.3)],
            ),
            borderRadius: BorderRadius.circular(1),
          ),
        ),
      ],
    );
  }

  Widget _buildRecipientName(double width) {
    return Column(
      children: [
        Text(
          'This is proudly presented to',
          style: TextStyle(
            fontSize: width * 0.025,
            color: AppColors.grey500,
            fontStyle: FontStyle.italic,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          _cert.userName,
          style: TextStyle(
            fontSize: width * 0.055,
            fontWeight: FontWeight.bold,
            color: _levelColor,
            letterSpacing: 1,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          _cert.title,
          style: TextStyle(
            fontSize: width * 0.028,
            color: AppColors.grey600,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildCertificateBody(double width) {
    return Column(
      children: [
        Text(
          _cert.description.isNotEmpty
              ? _cert.description
              : 'For outstanding contribution to the fight against food waste and hunger through the Achayapathra Food Redistribution Platform.',
          style: TextStyle(
            fontSize: width * 0.022,
            color: AppColors.grey700,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: width * 0.02),
        _buildImpactStatsRow(width),
        SizedBox(height: width * 0.02),
        _buildCertificateMeta(width),
      ],
    );
  }

  Widget _buildImpactStatsRow(double width) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: width * 0.02,
        vertical: width * 0.015,
      ),
      decoration: BoxDecoration(
        color: AppColors.grey50,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.grey200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildImpactStatItem(
            Icons.restaurant,
            '${_cert.mealsSaved}',
            'Meals',
            width,
          ),
          _buildImpactDivider(width),
          _buildImpactStatItem(
            Icons.recycling,
            '${_cert.donationsCount}',
            'Rescued',
            width,
          ),
          _buildImpactDivider(width),
          _buildImpactStatItem(
            Icons.people,
            '${(_cert.mealsSaved * 0.8).toInt()}',
            'Helped',
            width,
          ),
          _buildImpactDivider(width),
          _buildImpactStatItem(
            Icons.eco,
            '${_cert.carbonSavedKg.toStringAsFixed(0)}kg',
            'CO\u2082 Saved',
            width,
          ),
        ],
      ),
    );
  }

  Widget _buildImpactStatItem(IconData icon, String value, String label, double width) {
    return Column(
      children: [
        Icon(icon, size: width * 0.03, color: AppColors.secondary),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: width * 0.03,
            fontWeight: FontWeight.bold,
            color: AppColors.grey900,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: width * 0.018,
            color: AppColors.grey500,
          ),
        ),
      ],
    );
  }

  Widget _buildImpactDivider(double width) {
    return Container(
      width: 1,
      height: width * 0.06,
      color: AppColors.grey200,
    );
  }

  Widget _buildCertificateMeta(double width) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildMetaItem('ID', _cert.certificateNumber ?? _cert.id, width),
        SizedBox(width: width * 0.04),
        _buildMetaItem(
          'Date',
          DateFormat('dd MMM yyyy').format(_cert.issuedAt),
          width,
        ),
      ],
    );
  }

  Widget _buildMetaItem(String label, String value, double width) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: width * 0.018,
            color: AppColors.grey400,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: width * 0.02,
            color: AppColors.grey700,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildCertificateFooter(double width, double height) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        _buildSignatorySection(width),
        _buildQrSection(width),
        _buildSealSection(width),
      ],
    );
  }

  Widget _buildSignatorySection(double width) {
    return Column(
      children: [
        Container(
          width: width * 0.18,
          height: 1,
          color: AppColors.grey400,
        ),
        const SizedBox(height: 4),
        Text(
          'Authorized Signatory',
          style: TextStyle(
            fontSize: width * 0.018,
            color: AppColors.grey500,
          ),
        ),
        Text(
          _cert.issuedBy ?? 'District Collector',
          style: TextStyle(
            fontSize: width * 0.02,
            color: AppColors.grey700,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildQrSection(double width) {
    return Column(
      children: [
        QrImageView(
          data: _cert.qrCode ?? _cert.id,
          version: QrVersions.auto,
          size: width * 0.1,
          backgroundColor: AppColors.white,
          eyeStyle: QrEyeStyle(
            eyeShape: QrEyeShape.roundedOuter,
            color: _levelColor,
          ),
        ),
        Text(
          'Scan to Verify',
          style: TextStyle(
            fontSize: width * 0.015,
            color: AppColors.grey400,
          ),
        ),
      ],
    );
  }

  Widget _buildSealSection(double width) {
    return Column(
      children: [
        Container(
          width: width * 0.1,
          height: width * 0.1,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: _levelColor.withOpacity(0.5), width: 2),
          ),
          child: Center(
            child: Container(
              width: width * 0.07,
              height: width * 0.07,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _levelColor.withOpacity(0.1),
              ),
              child: Icon(
                Icons.verified,
                size: width * 0.04,
                color: _levelColor,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Platform Seal',
          style: TextStyle(
            fontSize: width * 0.018,
            color: AppColors.grey500,
          ),
        ),
        Text(
          'Achayapathra',
          style: TextStyle(
            fontSize: width * 0.02,
            color: _levelColor,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.grey800 : AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.grey700 : AppColors.grey200,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Actions',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: AchayaButton(
                  text: 'Download PDF',
                  icon: Icons.picture_as_pdf,
                  variant: ButtonVariant.primary,
                  onPressed: _downloadPdf,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AchayaButton(
                  text: 'Download PNG',
                  icon: Icons.image,
                  variant: ButtonVariant.secondary,
                  onPressed: _downloadPng,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: AchayaButton(
                  text: 'Print',
                  icon: Icons.print,
                  variant: ButtonVariant.outline,
                  onPressed: _printCertificate,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AchayaButton(
                  text: 'Share',
                  icon: Icons.share,
                  variant: ButtonVariant.outline,
                  onPressed: _showShareOptions,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCertificateDetails(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.grey800 : AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.grey700 : AppColors.grey200,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Certificate Details',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 12),
          _buildDetailRow('Recipient', _cert.userName),
          _buildDetailRow('Title', _cert.title),
          _buildDetailRow('Level', '${_cert.levelEmoji} ${_cert.levelDisplayText}'),
          _buildDetailRow('Certificate ID', _cert.certificateNumber ?? 'N/A'),
          _buildDetailRow('Issued On', DateFormat('MMMM dd, yyyy').format(_cert.issuedAt)),
          _buildDetailRow('Impact Points', '${_cert.impactPoints}'),
          _buildDetailRow('Donations', '${_cert.donationsCount}'),
          _buildDetailRow('Meals Saved', '${_cert.mealsSaved}'),
          _buildDetailRow('CO\u2082 Saved', '${_cert.carbonSavedKg.toStringAsFixed(1)} kg'),
          if (_cert.badges.isNotEmpty) ...[
            const SizedBox(height: 8),
            const Text(
              'Badges Earned',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: AppColors.grey600,
              ),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: _cert.badges.map((badge) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryShade,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    badge.replaceAll('_', ' ').toUpperCase(),
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
          const SizedBox(height: 12),
          Center(
            child: GestureDetector(
              onTap: () {
                final url = 'https://achayapathra.app/verify/${_cert.certificateNumber}';
                launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.accentShade,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.link, size: 14, color: AppColors.accent),
                    SizedBox(width: 4),
                    Text(
                      'Verify Online',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.accent,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.grey500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.grey800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
