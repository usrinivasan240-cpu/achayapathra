import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'services/auth_service.dart';

class AchayapathraApp extends StatelessWidget {
  const AchayapathraApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Set system UI overlay style
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: AppColors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
    );

    // Set preferred orientations
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    return MaterialApp(
      title: 'Achayapathra',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme(),
      darkTheme: AppTheme.darkTheme(),
      themeMode: ThemeMode.system,
      initialRoute: AppRoutes.splash,
      onGenerateRoute: _generateRoute,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.noScaling,
          ),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }

  Route<dynamic> _generateRoute(RouteSettings settings) {
    final routes = _getRoutes();
    final routeBuilder = routes[settings.name];

    if (routeBuilder != null) {
      return MaterialPageRoute(
        builder: routeBuilder,
        settings: settings,
      );
    }

    // Default 404 page
    return MaterialPageRoute(
      builder: (context) => _buildNotFoundPage(context, settings.name),
      settings: settings,
    );
  }

  Map<String, WidgetBuilder> _getRoutes() {
    return {
      // Splash & Onboarding
      AppRoutes.splash: (context) => const _SplashScreen(),
      AppRoutes.onboarding: (context) => const _PlaceholderScreen(
            title: 'Onboarding',
            subtitle: 'Welcome to Achayapathra',
          ),

      // Auth
      AppRoutes.login: (context) => const _PlaceholderScreen(
            title: 'Login',
            subtitle: 'Sign in to your account',
          ),
      AppRoutes.register: (context) => const _PlaceholderScreen(
            title: 'Register',
            subtitle: 'Create a new account',
          ),
      AppRoutes.forgotPassword: (context) => const _PlaceholderScreen(
            title: 'Forgot Password',
            subtitle: 'Reset your password',
          ),
      AppRoutes.otpVerification: (context) => const _PlaceholderScreen(
            title: 'OTP Verification',
            subtitle: 'Verify your phone number',
          ),
      AppRoutes.profileSetup: (context) => const _PlaceholderScreen(
            title: 'Profile Setup',
            subtitle: 'Complete your profile',
          ),

      // Main
      AppRoutes.home: (context) => const _PlaceholderScreen(
            title: 'Home',
            subtitle: 'Dashboard',
          ),
      AppRoutes.mainNavigation: (context) => const _PlaceholderScreen(
            title: 'Main Navigation',
            subtitle: 'Bottom navigation',
          ),

      // Donations
      AppRoutes.donationList: (context) => const _PlaceholderScreen(
            title: 'Donations',
            subtitle: 'Browse available donations',
          ),
      AppRoutes.donationCreate: (context) => const _PlaceholderScreen(
            title: 'Create Donation',
            subtitle: 'Donate food',
          ),
      AppRoutes.donationDetail: (context) => const _PlaceholderScreen(
            title: 'Donation Detail',
            subtitle: 'View donation details',
          ),
      AppRoutes.donationEdit: (context) => const _PlaceholderScreen(
            title: 'Edit Donation',
            subtitle: 'Update donation details',
          ),
      AppRoutes.donationMap: (context) => const _PlaceholderScreen(
            title: 'Donation Map',
            subtitle: 'View donations on map',
          ),
      AppRoutes.donationHistory: (context) => const _PlaceholderScreen(
            title: 'Donation History',
            subtitle: 'Your donation history',
          ),
      AppRoutes.donationTracking: (context) => const _PlaceholderScreen(
            title: 'Donation Tracking',
            subtitle: 'Track your donation',
          ),

      // NGOs
      AppRoutes.ngoList: (context) => const _PlaceholderScreen(
            title: 'NGOs',
            subtitle: 'Partner NGOs',
          ),
      AppRoutes.ngoDetail: (context) => const _PlaceholderScreen(
            title: 'NGO Detail',
            subtitle: 'NGO information',
          ),
      AppRoutes.ngoRegister: (context) => const _PlaceholderScreen(
            title: 'Register NGO',
            subtitle: 'Register your organization',
          ),
      AppRoutes.ngoDashboard: (context) => const _PlaceholderScreen(
            title: 'NGO Dashboard',
            subtitle: 'NGO management',
          ),
      AppRoutes.ngoNearby: (context) => const _PlaceholderScreen(
            title: 'Nearby NGOs',
            subtitle: 'Find NGOs near you',
          ),

      // Volunteers
      AppRoutes.volunteerList: (context) => const _PlaceholderScreen(
            title: 'Volunteers',
            subtitle: 'Active volunteers',
          ),
      AppRoutes.volunteerDetail: (context) => const _PlaceholderScreen(
            title: 'Volunteer Detail',
            subtitle: 'Volunteer information',
          ),
      AppRoutes.volunteerRegister: (context) => const _PlaceholderScreen(
            title: 'Register as Volunteer',
            subtitle: 'Join as a volunteer',
          ),
      AppRoutes.volunteerDashboard: (context) => const _PlaceholderScreen(
            title: 'Volunteer Dashboard',
            subtitle: 'Volunteer management',
          ),
      AppRoutes.volunteerAssignment: (context) => const _PlaceholderScreen(
            title: 'Volunteer Assignment',
            subtitle: 'Current assignment',
          ),

      // Impact & Stats
      AppRoutes.impactDashboard: (context) => const _PlaceholderScreen(
            title: 'Impact Dashboard',
            subtitle: 'Your impact stats',
          ),
      AppRoutes.leaderboard: (context) => const _PlaceholderScreen(
            title: 'Leaderboard',
            subtitle: 'Top contributors',
          ),
      AppRoutes.certificates: (context) => const _PlaceholderScreen(
            title: 'Certificates',
            subtitle: 'Your certificates',
          ),
      AppRoutes.certificateDetail: (context) => const _PlaceholderScreen(
            title: 'Certificate Detail',
            subtitle: 'View certificate',
          ),
      AppRoutes.carbonTracker: (context) => const _PlaceholderScreen(
            title: 'Carbon Tracker',
            subtitle: 'Track carbon savings',
          ),

      // Hunger Zones
      AppRoutes.hungerZoneList: (context) => const _PlaceholderScreen(
            title: 'Hunger Zones',
            subtitle: 'Identified hunger zones',
          ),
      AppRoutes.hungerZoneDetail: (context) => const _PlaceholderScreen(
            title: 'Hunger Zone Detail',
            subtitle: 'Zone information',
          ),
      AppRoutes.hungerZoneMap: (context) => const _PlaceholderScreen(
            title: 'Hunger Zone Map',
            subtitle: 'View zones on map',
          ),
      AppRoutes.hungerZoneReport: (context) => const _PlaceholderScreen(
            title: 'Report Hunger Zone',
            subtitle: 'Report a new zone',
          ),

      // Profile
      AppRoutes.profile: (context) => const _PlaceholderScreen(
            title: 'Profile',
            subtitle: 'Your profile',
          ),
      AppRoutes.profileEdit: (context) => const _PlaceholderScreen(
            title: 'Edit Profile',
            subtitle: 'Update your profile',
          ),
      AppRoutes.profileSettings: (context) => const _PlaceholderScreen(
            title: 'Profile Settings',
            subtitle: 'Account settings',
          ),
      AppRoutes.profileBadges: (context) => const _PlaceholderScreen(
            title: 'Badges',
            subtitle: 'Your earned badges',
          ),

      // Notifications
      AppRoutes.notifications: (context) => const _PlaceholderScreen(
            title: 'Notifications',
            subtitle: 'Your notifications',
          ),

      // Feedback
      AppRoutes.feedback: (context) => const _PlaceholderScreen(
            title: 'Feedback',
            subtitle: 'Share your feedback',
          ),
      AppRoutes.feedbackList: (context) => const _PlaceholderScreen(
            title: 'Feedback List',
            subtitle: 'View feedback',
          ),

      // Settings
      AppRoutes.settings: (context) => const _PlaceholderScreen(
            title: 'Settings',
            subtitle: 'App settings',
          ),
      AppRoutes.languageSettings: (context) => const _PlaceholderScreen(
            title: 'Language Settings',
            subtitle: 'Choose language',
          ),
      AppRoutes.notificationSettings: (context) => const _PlaceholderScreen(
            title: 'Notification Settings',
            subtitle: 'Manage notifications',
          ),
      AppRoutes.privacySettings: (context) => const _PlaceholderScreen(
            title: 'Privacy Settings',
            subtitle: 'Privacy controls',
          ),
      AppRoutes.about: (context) => const _PlaceholderScreen(
            title: 'About',
            subtitle: 'About Achayapathra',
          ),

      // Help
      AppRoutes.faq: (context) => const _PlaceholderScreen(
            title: 'FAQ',
            subtitle: 'Frequently asked questions',
          ),
      AppRoutes.contactUs: (context) => const _PlaceholderScreen(
            title: 'Contact Us',
            subtitle: 'Get in touch',
          ),
      AppRoutes.termsOfService: (context) => const _PlaceholderScreen(
            title: 'Terms of Service',
            subtitle: 'Terms and conditions',
          ),
      AppRoutes.privacyPolicy: (context) => const _PlaceholderScreen(
            title: 'Privacy Policy',
            subtitle: 'Privacy policy',
          ),

      // Search
      AppRoutes.search: (context) => const _PlaceholderScreen(
            title: 'Search',
            subtitle: 'Search donations, NGOs',
          ),

      // Map
      AppRoutes.fullMap: (context) => const _PlaceholderScreen(
            title: 'Map View',
            subtitle: 'Full map view',
          ),

      // Admin
      AppRoutes.adminDashboard: (context) => const _PlaceholderScreen(
            title: 'Admin Dashboard',
            subtitle: 'Admin management',
          ),
      AppRoutes.adminUsers: (context) => const _PlaceholderScreen(
            title: 'Manage Users',
            subtitle: 'User management',
          ),
      AppRoutes.adminDonations: (context) => const _PlaceholderScreen(
            title: 'Manage Donations',
            subtitle: 'Donation management',
          ),
      AppRoutes.adminNgos: (context) => const _PlaceholderScreen(
            title: 'Manage NGOs',
            subtitle: 'NGO management',
          ),
      AppRoutes.adminVolunteers: (context) => const _PlaceholderScreen(
            title: 'Manage Volunteers',
            subtitle: 'Volunteer management',
          ),
      AppRoutes.adminAnalytics: (context) => const _PlaceholderScreen(
            title: 'Analytics',
            subtitle: 'Platform analytics',
          ),
      AppRoutes.adminSettings: (context) => const _PlaceholderScreen(
            title: 'Admin Settings',
            subtitle: 'Platform settings',
          ),
    };
  }

  Widget _buildNotFoundPage(BuildContext context, String? routeName) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Page Not Found'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              '404',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                    color: AppColors.error,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            if (routeName != null) ...[
              const SizedBox(height: 8),
              Text(
                'Route: $routeName',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.grey500,
                    ),
              ),
            ],
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pushReplacementNamed(AppRoutes.home);
              },
              child: const Text('Go to Home'),
            ),
          ],
        ),
      ),
    );
  }
}

// Splash Screen Widget
class _SplashScreen extends StatefulWidget {
  const _SplashScreen();

  @override
  State<_SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<_SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeIn),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOutBack),
      ),
    );

    _controller.forward();

    // Navigate after delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        _navigateToNext();
      }
    });
  }

  void _navigateToNext() {
    // Check auth state and navigate accordingly
    final authService = AuthService();
    final user = authService.currentFirebaseUser;

    if (user != null) {
      Navigator.of(context).pushReplacementNamed(AppRoutes.home);
    } else {
      Navigator.of(context).pushReplacementNamed(AppRoutes.onboarding);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primary,
              AppColors.primaryDark,
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return FadeTransition(
                opacity: _fadeAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(30),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.black.withOpacity(0.2),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.restaurant,
                            size: 60,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Achayapathra',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: AppColors.white,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Food Redistribution Platform',
                        style: TextStyle(
                          fontSize: 16,
                          color: AppColors.white.withOpacity(0.9),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

// Placeholder Screen for routes not yet implemented
class _PlaceholderScreen extends StatelessWidget {
  final String title;
  final String subtitle;

  const _PlaceholderScreen({
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.construction,
              size: 64,
              color: AppColors.grey400,
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.grey500,
                  ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primaryShade,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Coming Soon',
                style: TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
