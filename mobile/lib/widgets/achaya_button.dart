import 'package:flutter/material.dart';
import '../config/theme.dart';

enum ButtonVariant { primary, secondary, outline, text, gradient }

class AchayaButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final bool isLoading;
  final bool isExpanded;
  final IconData? icon;
  final IconData? suffixIcon;
  final double? width;
  final double? height;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? borderColor;
  final double? fontSize;
  final FontWeight? fontWeight;

  const AchayaButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.isLoading = false,
    this.isExpanded = false,
    this.icon,
    this.suffixIcon,
    this.width,
    this.height = 50,
    this.borderRadius = 12,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.fontSize,
    this.fontWeight,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null || isLoading;

    Widget button;

    switch (variant) {
      case ButtonVariant.primary:
        button = _buildPrimaryButton(isDisabled);
        break;
      case ButtonVariant.secondary:
        button = _buildSecondaryButton(isDisabled);
        break;
      case ButtonVariant.outline:
        button = _buildOutlineButton(isDisabled);
        break;
      case ButtonVariant.text:
        button = _buildTextButton(isDisabled);
        break;
      case ButtonVariant.gradient:
        button = _buildGradientButton(isDisabled);
        break;
    }

    if (isExpanded) {
      button = SizedBox(
        width: double.infinity,
        child: button,
      );
    }

    if (width != null) {
      button = SizedBox(
        width: width,
        child: button,
      );
    }

    if (margin != null) {
      button = Padding(
        padding: margin!,
        child: button,
      );
    }

    return button;
  }

  Widget _buildPrimaryButton(bool isDisabled) {
    return ElevatedButton(
      onPressed: isDisabled ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor ?? AppColors.primary,
        foregroundColor: foregroundColor ?? AppColors.white,
        disabledBackgroundColor:
            (backgroundColor ?? AppColors.primary).withOpacity(0.5),
        disabledForegroundColor:
            (foregroundColor ?? AppColors.white).withOpacity(0.7),
        elevation: 0,
        padding: padding ??
            const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
      child: _buildChild(),
    );
  }

  Widget _buildSecondaryButton(bool isDisabled) {
    return ElevatedButton(
      onPressed: isDisabled ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor ?? AppColors.secondary,
        foregroundColor: foregroundColor ?? AppColors.white,
        disabledBackgroundColor:
            (backgroundColor ?? AppColors.secondary).withOpacity(0.5),
        disabledForegroundColor:
            (foregroundColor ?? AppColors.white).withOpacity(0.7),
        elevation: 0,
        padding: padding ??
            const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
      child: _buildChild(),
    );
  }

  Widget _buildOutlineButton(bool isDisabled) {
    return OutlinedButton(
      onPressed: isDisabled ? null : onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: foregroundColor ?? AppColors.primary,
        disabledForegroundColor:
            (foregroundColor ?? AppColors.primary).withOpacity(0.5),
        side: BorderSide(
          color: isDisabled
              ? (borderColor ?? AppColors.primary).withOpacity(0.5)
              : (borderColor ?? AppColors.primary),
          width: 1.5,
        ),
        padding: padding ??
            const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
      child: _buildChild(),
    );
  }

  Widget _buildTextButton(bool isDisabled) {
    return TextButton(
      onPressed: isDisabled ? null : onPressed,
      style: TextButton.styleFrom(
        foregroundColor: foregroundColor ?? AppColors.primary,
        disabledForegroundColor:
            (foregroundColor ?? AppColors.primary).withOpacity(0.5),
        padding: padding ??
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      child: _buildChild(),
    );
  }

  Widget _buildGradientButton(bool isDisabled) {
    return Container(
      decoration: BoxDecoration(
        gradient: isDisabled
            ? LinearGradient(
                colors: [
                  (backgroundColor ?? AppColors.primary).withOpacity(0.5),
                  (backgroundColor ?? AppColors.primaryDark)
                      .withOpacity(0.5),
                ],
              )
            : const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isDisabled ? null : onPressed,
          borderRadius: BorderRadius.circular(borderRadius),
          child: Padding(
            padding: padding ??
                const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            child: _buildChild(),
          ),
        ),
      ),
    );
  }

  Widget _buildChild() {
    if (isLoading) {
      return SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            foregroundColor ?? AppColors.white,
          ),
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (icon != null) ...[
          Icon(icon, size: 20),
          const SizedBox(width: 8),
        ],
        Text(
          text,
          style: TextStyle(
            fontSize: fontSize ?? 16,
            fontWeight: fontWeight ?? FontWeight.w600,
          ),
        ),
        if (suffixIcon != null) ...[
          const SizedBox(width: 8),
          Icon(suffixIcon, size: 20),
        ],
      ],
    );
  }
}
