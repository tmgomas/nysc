import 'package:flutter/material.dart';

/// Color palette for the NYCSC app.
class ColorPalette {
  ColorPalette._();

  // Primary brand color
  static const Color primary = Color(0xFF1565C0);
  static const Color primaryLight = Color(0xFF1E88E5);
  static const Color primaryDark = Color(0xFF003C8F);

  // Accent / Secondary (Teal)
  static const Color accent = Color(0xFF26A69A);
  static const Color accentLight = Color(0xFF64D8CB);
  static const Color accentDark = Color(0xFF00766C);

  // Status colors
  static const Color success = Color(0xFF43A047);
  static const Color warning = Color(0xFFFFA726);
  static const Color error = Color(0xFFE53935);
  static const Color info = Color(0xFF29B6F6);

  // Dark Sporty Base
  static const Color background = Color(0xFF0D1220); // bg2
  static const Color backgroundDark = Color(0xFF080C14); // bg
  static const Color surface = Color(0x0DFFFFFF); // rgba(255,255,255,0.05)
  static const Color glassBorder = Color(0x1AFFFFFF); // rgba(255,255,255,0.1)

  // Text
  static const Color textPrimary = Color(0xFFF0F4FF);
  static const Color textSecondary = Color(0xFFA0AABF);
  static const Color textMuted = Color(0xFF5A6480);
  
  static const Color divider = Color(0x1AFFFFFF);
}
