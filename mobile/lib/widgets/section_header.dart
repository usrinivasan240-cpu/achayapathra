import 'package:flutter/material.dart';
import '../config/theme.dart';

class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final Widget? leading;
  final VoidCallback? onTrailingTap;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final bool showDivider;
  final Color? titleColor;
  final Color? subtitleColor;
  final double? titleFontSize;

  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
    this.leading,
    this.onTrailingTap,
    this.padding,
    this.margin,
    this.showDivider = false,
    this.titleColor,
    this.subtitleColor,
    this.titleFontSize,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Padding(
      padding: margin ?? EdgeInsets.zero,
      child: Column(
        children: [
          Padding(
            padding: padding ??
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                if (leading != null) ...[
                  leading!,
                  const SizedBox(width: 8),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: titleColor ??
                              (isDark ? AppColors.white : AppColors.grey900),
                          fontWeight: FontWeight.w600,
                          fontSize: titleFontSize,
                        ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          subtitle!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: subtitleColor ?? AppColors.grey500,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (trailing != null) ...[
                  if (onTrailingTap != null)
                    GestureDetector(
                      onTap: onTrailingTap,
                      child: trailing,
                    )
                  else
                    trailing!,
                ],
              ],
            ),
          ),
          if (showDivider)
            Divider(
              height: 1,
              color: isDark ? AppColors.grey700 : AppColors.grey200,
            ),
        ],
      ),
    );
  }
}

class SectionHeaderWithAction extends StatelessWidget {
  final String title;
  final String actionText;
  final VoidCallback? onActionTap;
  final Widget? child;
  final EdgeInsetsGeometry? padding;

  const SectionHeaderWithAction({
    super.key,
    required this.title,
    required this.actionText,
    this.onActionTap,
    this.child,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: title,
          trailing: TextButton(
            onPressed: onActionTap,
            child: Text(
              actionText,
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          padding: padding,
        ),
        if (child != null) child!,
      ],
    );
  }
}

class StickySectionHeader extends StatelessWidget {
  final String title;
  final Color? backgroundColor;
  final Color? textColor;

  const StickySectionHeader({
    super.key,
    required this.title,
    this.backgroundColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: backgroundColor ??
          (isDark ? AppColors.grey900 : AppColors.grey50),
      child: Text(
        title.toUpperCase(),
        style: theme.textTheme.labelSmall?.copyWith(
          color: textColor ?? AppColors.grey500,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
