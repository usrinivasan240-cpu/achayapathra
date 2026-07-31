import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../config/routes.dart';
import '../../models/donation.dart';
import '../../models/ngo.dart';
import '../../services/firestore_service.dart';
import '../../services/auth_service.dart';
import '../../services/location_service.dart';
import '../../services/ai_service.dart';
import '../../widgets/achaya_button.dart';
import '../../widgets/achaya_card.dart';

class CreateDonationScreen extends StatefulWidget {
  const CreateDonationScreen({super.key});

  @override
  State<CreateDonationScreen> createState() => _CreateDonationScreenState();
}

class _CreateDonationScreenState extends State<CreateDonationScreen> {
  final _formKey = GlobalKey<FormState>();
  final FirestoreService _firestoreService = FirestoreService();
  final AuthService _authService = AuthService();
  final LocationService _locationService = LocationService.instance;
  final AiService _aiService = AiService();

  final TextEditingController _foodNameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _quantityController = TextEditingController();
  final TextEditingController _expiryHoursController =
      TextEditingController(text: '4');
  final TextEditingController _pickupInstructionsController =
      TextEditingController();
  final TextEditingController _specialNotesController =
      TextEditingController();

  FoodType _selectedFoodType = FoodType.cooked;
  String _selectedUnit = 'portions';
  bool _isVeg = true;
  bool _isUrgent = false;
  DateTime _expiryTime = DateTime.now().add(const Duration(hours: 4));
  File? _selectedImage;
  double? _latitude;
  double? _longitude;
  String? _currentAddress;
  bool _isGettingLocation = false;
  bool _isSubmitting = false;
  bool _isGettingAiMatch = false;
  List<Ngo> _matchedNgos = [];
  bool _showMatchPreview = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _foodNameController.dispose();
    _descriptionController.dispose();
    _quantityController.dispose();
    _expiryHoursController.dispose();
    _pickupInstructionsController.dispose();
    _specialNotesController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isGettingLocation = true);
    try {
      final location = await _locationService.getCurrentPosition();
      if (location != null) {
        setState(() {
          _latitude = location.latitude;
          _longitude = location.longitude;
          _currentAddress = location.address;
          _isGettingLocation = false;
        });
      }
    } catch (e) {
      setState(() => _isGettingLocation = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not get location: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        maxWidth: 1200,
        maxHeight: 1200,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to pick image: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _updateExpiryTime() {
    final hours = int.tryParse(_expiryHoursController.text) ?? 4;
    setState(() {
      _expiryTime = DateTime.now().add(Duration(hours: hours));
    });
  }

  Future<void> _getAiMatchPreview() async {
    if (_foodNameController.text.isEmpty || _quantityController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter food name and quantity first'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    setState(() => _isGettingAiMatch = true);

    try {
      final tempDonation = Donation(
        id: 'temp',
        donorId: _authService.currentUserId ?? '',
        foodName: _foodNameController.text.trim(),
        description: _descriptionController.text.trim(),
        foodType: _selectedFoodType,
        quantity: int.tryParse(_quantityController.text) ?? 0,
        unit: _selectedUnit,
        preparedAt: DateTime.now(),
        expiryTime: _expiryTime,
        latitude: _latitude,
        longitude: _longitude,
        address: _currentAddress,
        isVeg: _isVeg,
        isUrgent: _isUrgent,
      );

      final ngos = await _firestoreService.getNgos(
        district: _currentAddress?.split(',').last.trim(),
        limit: 5,
      );

      setState(() {
        _matchedNgos = ngos;
        _showMatchPreview = true;
        _isGettingAiMatch = false;
      });
    } catch (e) {
      setState(() => _isGettingAiMatch = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('AI matching failed: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _submitDonation() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final userId = _authService.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      final donation = Donation(
        id: '',
        donorId: userId,
        foodName: _foodNameController.text.trim(),
        description: _descriptionController.text.trim(),
        foodType: _selectedFoodType,
        quantity: int.tryParse(_quantityController.text) ?? 0,
        unit: _selectedUnit,
        preparedAt: DateTime.now(),
        expiryTime: _expiryTime,
        latitude: _latitude,
        longitude: _longitude,
        address: _currentAddress,
        isVeg: _isVeg,
        isUrgent: _isUrgent,
        pickupInstructions: _pickupInstructionsController.text.trim().isEmpty
            ? null
            : _pickupInstructionsController.text.trim(),
        specialNotes: _specialNotesController.text.trim().isEmpty
            ? null
            : _specialNotesController.text.trim(),
        impactPoints: AppConstants.pointsPerDonation,
      );

      final donationId = await _firestoreService.createDonation(donation);

      await _firestoreService.updateUserImpactPoints(
        userId,
        AppConstants.pointsPerDonation,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Donation created successfully!'),
            backgroundColor: AppColors.secondary,
          ),
        );
        Navigator.pop(context);
        Navigator.pushNamed(
          context,
          AppRoutes.donationDetail,
          arguments: donationId,
        );
      }
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create donation: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
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
          'Create Donation',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.close),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildPhotoSection(isDark),
            const SizedBox(height: 20),
            _buildFoodDetailsSection(isDark),
            const SizedBox(height: 20),
            _buildQuantitySection(isDark),
            const SizedBox(height: 20),
            _buildExpirySection(isDark),
            const SizedBox(height: 20),
            _buildLocationSection(isDark),
            const SizedBox(height: 20),
            _buildOptionsSection(isDark),
            const SizedBox(height: 20),
            _buildInstructionsSection(isDark),
            const SizedBox(height: 20),
            _buildAiMatchSection(isDark),
            const SizedBox(height: 24),
            _buildDonateButton(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoSection(bool isDark) {
    return AchayaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.camera_alt_outlined,
                  size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Food Photo',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const Spacer(),
              Text(
                'Optional',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.grey400,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => _showImagePickerOptions(),
            child: Container(
              width: double.infinity,
              height: 160,
              decoration: BoxDecoration(
                color: isDark ? AppColors.grey800 : AppColors.grey100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.grey300,
                  width: 1.5,
                  style: BorderStyle.solid,
                ),
              ),
              child: _selectedImage != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.file(
                            _selectedImage!,
                            fit: BoxFit.cover,
                          ),
                          Positioned(
                            top: 8,
                            right: 8,
                            child: GestureDetector(
                              onTap: () {
                                setState(() => _selectedImage = null);
                              },
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: AppColors.black54,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.close,
                                  size: 16,
                                  color: AppColors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.add_a_photo_outlined,
                            size: 28,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Tap to add photo',
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: AppColors.grey500,
                                  ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Helps NGOs verify food quality',
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.grey400,
                                  ),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  void _showImagePickerOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
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
                  'Add Photo',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.camera_alt,
                        color: AppColors.primary),
                  ),
                  title: const Text('Take Photo'),
                  subtitle: const Text('Use camera to capture'),
                  onTap: () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.camera);
                  },
                ),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child:
                        const Icon(Icons.photo_library, color: AppColors.secondary),
                  ),
                  title: const Text('Choose from Gallery'),
                  subtitle: const Text('Select existing photo'),
                  onTap: () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.gallery);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFoodDetailsSection(bool isDark) {
    return AchayaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.restaurant_outlined,
                  size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Food Details',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _foodNameController,
            decoration: const InputDecoration(
              labelText: 'Food Name *',
              hintText: 'e.g., Vegetable Biryani, Rice & Dal',
              prefixIcon: Icon(Icons.fastfood_outlined, size: 20),
            ),
            textCapitalization: TextCapitalization.words,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return AppConstants.foodNameRequired;
              }
              if (value.trim().length < 2) {
                return 'Food name must be at least 2 characters';
              }
              return null;
            },
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _descriptionController,
            decoration: const InputDecoration(
              labelText: 'Description',
              hintText: 'Ingredients, preparation details...',
              prefixIcon: Icon(Icons.description_outlined, size: 20),
            ),
            maxLines: 3,
            textCapitalization: TextCapitalization.sentences,
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<FoodType>(
            value: _selectedFoodType,
            decoration: const InputDecoration(
              labelText: 'Food Type *',
              prefixIcon: Icon(Icons.category_outlined, size: 20),
            ),
            items: FoodType.values.map((type) {
              String label;
              switch (type) {
                case FoodType.cooked:
                  label = 'Cooked Meals';
                  break;
                case FoodType.raw:
                  label = 'Raw Ingredients';
                  break;
                case FoodType.packaged:
                  label = 'Packaged Food';
                  break;
                case FoodType.beverages:
                  label = 'Beverages';
                  break;
                case FoodType.dairy:
                  label = 'Dairy Products';
                  break;
                case FoodType.bakery:
                  label = 'Bakery Items';
                  break;
                case FoodType.fruits:
                  label = 'Fruits';
                  break;
                case FoodType.vegetables:
                  label = 'Vegetables';
                  break;
                case FoodType.grains:
                  label = 'Grains & Cereals';
                  break;
                case FoodType.other:
                  label = 'Other';
                  break;
              }
              return DropdownMenuItem(
                value: type,
                child: Text(label),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null) {
                setState(() => _selectedFoodType = value);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildQuantitySection(bool isDark) {
    return AchayaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.scale_outlined,
                  size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Quantity',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: TextFormField(
                  controller: _quantityController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Quantity *',
                    hintText: '0',
                    prefixIcon: Icon(Icons.numbers, size: 20),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return AppConstants.quantityRequired;
                    }
                    final qty = int.tryParse(value.trim());
                    if (qty == null || qty <= 0) {
                      return 'Enter a valid quantity';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 1,
                child: DropdownButtonFormField<String>(
                  value: _selectedUnit,
                  decoration: const InputDecoration(
                    labelText: 'Unit',
                  ),
                  items: AppConstants.quantityUnits.take(6).map((unit) {
                    return DropdownMenuItem(
                      value: unit,
                      child: Text(unit),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() => _selectedUnit = value);
                    }
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildExpirySection(bool isDark) {
    return AchayaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.timer_outlined,
                  size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Expiry Time',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _expiryHoursController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'Expires in (hours) *',
              hintText: '4',
              prefixIcon: const Icon(Icons.access_time, size: 20),
              suffixIcon: TextButton(
                onPressed: _pickExpiryTime,
                child: const Text('Custom'),
              ),
            ),
            onChanged: (_) => _updateExpiryTime(),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return AppConstants.expiryRequired;
              }
              final hours = int.tryParse(value.trim());
              if (hours == null || hours <= 0) {
                return 'Enter valid hours';
              }
              return null;
            },
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primaryShade,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline,
                    size: 16, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Food will expire at ${_formatDateTime(_expiryTime)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.primary,
                      fontWeight: FontWeight.w500,
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

  Future<void> _pickExpiryTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _expiryTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 7)),
    );

    if (date != null && mounted) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_expiryTime),
      );

      if (time != null) {
        final newExpiry = DateTime(
          date.year,
          date.month,
          date.day,
          time.hour,
          time.minute,
        );

        if (newExpiry.isAfter(DateTime.now())) {
          final hours =
              newExpiry.difference(DateTime.now()).inHours;
          setState(() {
            _expiryTime = newExpiry;
            _expiryHoursController.text = '$hours';
          });
        }
      }
    }
  }

  String _formatDateTime(DateTime dt) {
    final hour = dt.hour > 12 ? dt.hour - 12 : dt.hour;
    final minute = dt.minute.toString().padLeft(2, '0');
    final amPm = dt.hour >= 12 ? 'PM' : 'AM';
    return '${dt.day}/${dt.month}/${dt.year} $hour:$minute $amPm';
  }

  Widget _buildLocationSection(bool isDark) {
    return AchayaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.location_on_outlined,
                  size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Pickup Location',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const Spacer(),
              TextButton.icon(
                onPressed: _isGettingLocation ? null : _getCurrentLocation,
                icon: _isGettingLocation
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.my_location, size: 16),
                label: Text(
                  _isGettingLocation ? 'Getting...' : 'Current',
                  style: const TextStyle(fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.grey800 : AppColors.grey100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: _currentAddress != null
                ? Row(
                    children: [
                      const Icon(Icons.place,
                          size: 20, color: AppColors.secondary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _currentAddress!,
                              style: Theme.of(context).textTheme.bodyMedium,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (_latitude != null && _longitude != null)
                              Text(
                                '${_latitude!.toStringAsFixed(4)}, ${_longitude!.toStringAsFixed(4)}',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(color: AppColors.grey400),
                              ),
                          ],
                        ),
                      ),
                    ],
                  )
                : Row(
                    children: [
                      const Icon(Icons.location_off,
                          size: 20, color: AppColors.grey400),
                      const SizedBox(width: 8),
                      Text(
                        _isGettingLocation
                            ? 'Detecting location...'
                            : 'Location not available. Tap "Current" to get location.',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.grey500,
                            ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildOptionsSection(bool isDark) {
    return AchayaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.tune,
                  size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Options',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Vegetarian'),
            subtitle: const Text('Mark if food is vegetarian'),
            value: _isVeg,
            activeColor: AppColors.secondary,
            onChanged: (value) {
              setState(() => _isVeg = value);
            },
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Urgent Donation'),
            subtitle: const Text('Priority matching for immediate need'),
            value: _isUrgent,
            activeColor: AppColors.error,
            onChanged: (value) {
              setState(() => _isUrgent = value);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildInstructionsSection(bool isDark) {
    return AchayaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.info_outline,
                  size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Additional Info',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _pickupInstructionsController,
            decoration: const InputDecoration(
              labelText: 'Pickup Instructions',
              hintText: 'e.g., Ring bell, ask for Ravi at reception',
              prefixIcon: Icon(Icons.instructions_outlined, size: 20),
            ),
            maxLines: 2,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _specialNotesController,
            decoration: const InputDecoration(
              labelText: 'Special Notes',
              hintText: 'e.g., Contains nuts, keep refrigerated',
              prefixIcon: Icon(Icons.note_outlined, size: 20),
            ),
            maxLines: 2,
          ),
        ],
      ),
    );
  }

  Widget _buildAiMatchSection(bool isDark) {
    return AchayaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome,
                  size: 18, color: AppColors.accent),
              const SizedBox(width: 8),
              Text(
                'AI Match Preview',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const Spacer(),
              if (!_showMatchPreview)
                TextButton.icon(
                  onPressed: _isGettingAiMatch ? null : _getAiMatchPreview,
                  icon: _isGettingAiMatch
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.auto_awesome, size: 16),
                  label: Text(
                    _isGettingAiMatch ? 'Finding...' : 'Preview Matches',
                    style: const TextStyle(fontSize: 12),
                  ),
                ),
            ],
          ),
          if (_showMatchPreview && _matchedNgos.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'Suggested NGO partners near you:',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.grey600,
                  ),
            ),
            const SizedBox(height: 8),
            ...(_matchedNgos.take(3).map((ngo) {
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.accentShade,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.accent.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.foundation,
                        size: 18,
                        color: AppColors.accent,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ngo.name,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(fontWeight: FontWeight.w600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            ngo.typeDisplayText,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.grey500,
                                ),
                          ),
                        ],
                      ),
                    ),
                    if (ngo.rating != null)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star,
                              size: 14, color: AppColors.warning),
                          const SizedBox(width: 2),
                          Text(
                            ngo.rating!.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              );
            })),
          ] else if (_showMatchPreview && _matchedNgos.isEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.warning.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline,
                      size: 16, color: AppColors.warning),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'No NGOs found nearby. Donation will be visible to all partners.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.warning,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDonateButton() {
    return SizedBox(
      width: double.infinity,
      child: Container(
        decoration: BoxDecoration(
          gradient: _isSubmitting
              ? LinearGradient(
                  colors: [
                    AppColors.primary.withOpacity(0.5),
                    AppColors.primaryDark.withOpacity(0.5),
                  ],
                )
              : AppColors.primaryGradient,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: _isSubmitting ? null : _submitDonation,
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_isSubmitting) ...[
                    const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(AppColors.white),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Creating Donation...',
                      style: TextStyle(
                        color: AppColors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ] else ...[
                    const Icon(Icons.favorite, color: AppColors.white, size: 22),
                    const SizedBox(width: 10),
                    const Text(
                      'Donate Now',
                      style: TextStyle(
                        color: AppColors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
