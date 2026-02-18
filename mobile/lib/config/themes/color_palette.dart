import 'package:flutter/material.dart';

/// Color palette for the NYCSC app.
class ColorPalette {
  ColorPalette._();

  // Primary brand color — sporty blue
  static const Color primary = Color(0xFF1565C0);
  static const Color primaryLight = Color(0xFF5E92F3);
  static const Color primaryDark = Color(0xFF003C8F);

  // Accent / Secondary
  static const Color accent = Color(0xFF26A69A);
  static const Color accentLight = Color(0xFF64D8CB);
  static const Color accentDark = Color(0xFF00766C);

  // Status colors
  static const Color success = Color(0xFF43A047);
  static const Color warning = Color(0xFFFFA726);
  static const Color error = Color(0xFFE53935);
  static const Color info = Color(0xFF29B6F6);

  // Neutral
  static const Color background = Color(0xFFF5F7FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color divider = Color(0xFFE0E0E0);
}
