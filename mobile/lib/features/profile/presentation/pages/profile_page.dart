import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../config/themes/color_palette.dart';
import '../cubit/profile_cubit.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  void initState() {
    super.initState();
    final state = context.read<ProfileCubit>().state;
    if (state is! ProfileLoaded) {
      context.read<ProfileCubit>().loadProfile();
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        context.read<ProfileCubit>().loadProfile();
      },
      child: BlocBuilder<ProfileCubit, ProfileState>(
        builder: (context, state) {
          if (state is ProfileLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is ProfileError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: ColorPalette.error),
                  const SizedBox(height: 16),
                  Text(state.message, style: const TextStyle(color: ColorPalette.error)),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => context.read<ProfileCubit>().loadProfile(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (state is ProfileLoaded) {
            final p = state.profile;
            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                children: [
                  _buildHero(p),
                  _buildEnrolledSports(p.programs),
                  _buildMenuOptions(context),
                  const SizedBox(height: 32),
                ],
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildHero(dynamic profile) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            ColorPalette.primary.withValues(alpha: 0.28),
            Colors.transparent,
          ],
          stops: const [0.0, 0.6],
        ),
      ),
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 16,
        left: 20,
        right: 20,
        bottom: 24,
      ),
      child: Column(
        children: [
          Align(
            alignment: Alignment.topRight,
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.06),
                border: Border.all(color: ColorPalette.glassBorder),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.settings_outlined, color: ColorPalette.textSecondary, size: 20),
            ),
          ),
          const SizedBox(height: 8),
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              Container(
                width: 82,
                height: 82,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [ColorPalette.primary, ColorPalette.accent],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.15), width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: ColorPalette.primary.withValues(alpha: 0.35),
                      blurRadius: 28,
                      offset: const Offset(0, 8),
                    )
                  ],
                ),
                alignment: Alignment.center,
                child: Text(
                  _getInitials(profile.fullName),
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
              Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  color: ColorPalette.primary,
                  shape: BoxShape.circle,
                  border: Border.all(color: ColorPalette.background, width: 2),
                ),
                child: const Icon(Icons.edit, size: 12, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            profile.fullName,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: ColorPalette.textPrimary,
              letterSpacing: -0.02,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Youth Member \u00B7 ${profile.district ?? 'Colombo District'}',
            style: const TextStyle(
              fontSize: 12,
              color: ColorPalette.textSecondary,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            'ID \u00B7 ${profile.memberNumber}',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: ColorPalette.primaryLight,
            ),
          ),
          const SizedBox(height: 18),
          Container(
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              color: ColorPalette.glassBorder,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                _buildStatItem(profile.programs.length.toString(), 'Sports', null),
                Container(width: 1, height: 50, color: ColorPalette.backgroundDark),
                _buildStatItem('89%', 'Attend.', ColorPalette.primaryLight),
                Container(width: 1, height: 50, color: ColorPalette.backgroundDark),
                _buildStatItem('Active', 'Status', const Color(0xFF81C784)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String val, String lbl, Color? valColor) {
    return Expanded(
      child: Container(
        color: Colors.white.withValues(alpha: 0.04),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        child: Column(
          children: [
            Text(
              val,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: valColor ?? ColorPalette.textPrimary,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              lbl.toUpperCase(),
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: ColorPalette.textMuted,
                letterSpacing: 0.6,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  Widget _buildEnrolledSports(List programs) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Enrolled Sports',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: ColorPalette.textPrimary,
                ),
              ),
              Text(
                'Edit \u2192',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: ColorPalette.primaryLight,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (programs.isEmpty)
            const Text('No sports enrolled yet.', style: TextStyle(color: ColorPalette.textSecondary)),
          for (int i = 0; i < programs.length; i++)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: ColorPalette.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: ColorPalette.glassBorder),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: (i % 2 == 0 ? ColorPalette.primary : ColorPalette.accent)
                          .withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      programs[i].name == 'Badminton' ? '🏸' : (programs[i].name == 'Swimming' ? '🏊' : '🏅'),
                      style: const TextStyle(fontSize: 22),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          programs[i].name,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: ColorPalette.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Coach: TBA \u00B7 Regular',
                          style: TextStyle(
                            fontSize: 11,
                            color: ColorPalette.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: (i % 2 == 0 ? ColorPalette.primary : ColorPalette.accent).withValues(alpha: 0.15),
                      border: Border.all(color: (i % 2 == 0 ? ColorPalette.primary : ColorPalette.accent).withValues(alpha: 0.25)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      i % 2 == 0 ? 'Senior' : 'Junior',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: (i % 2 == 0 ? ColorPalette.primaryLight : ColorPalette.accentLight),
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

  Widget _buildMenuOptions(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildMenuSectionLabel('Account'),
          _buildMenuItem('👤', ColorPalette.primary, 'Personal Information', 'Name, DOB, contacts'),
          _buildMenuItem('🔒', ColorPalette.success, 'Security', 'Password, 2FA'),
          
          const SizedBox(height: 8),
          _buildMenuSectionLabel('Preferences'),
          _buildMenuItem('🔔', ColorPalette.warning, 'Notifications', 'Class reminders, payments', badge: 'ON'),
          _buildMenuItem('🌙', ColorPalette.info, 'App Theme', 'Dark mode enabled'),

          const SizedBox(height: 24),
          InkWell(
            onTap: () {
              context.read<AuthBloc>().add(const LogoutRequested());
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: ColorPalette.error.withValues(alpha: 0.1),
                border: Border.all(color: ColorPalette.error.withValues(alpha: 0.2)),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('🚪 ', style: TextStyle(fontSize: 16)),
                  Text(
                    'Sign Out',
                    style: TextStyle(
                      color: Color(0xFFEF9A9A),
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
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

  Widget _buildMenuSectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 6),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: ColorPalette.textMuted,
          letterSpacing: 1.0,
        ),
      ),
    );
  }

  Widget _buildMenuItem(String emoji, Color color, String title, String sub, {String? badge}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      decoration: BoxDecoration(
        color: ColorPalette.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ColorPalette.glassBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text(emoji, style: const TextStyle(fontSize: 17)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: ColorPalette.textPrimary,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  sub,
                  style: const TextStyle(
                    fontSize: 11,
                    color: ColorPalette.textMuted,
                  ),
                ),
              ],
            ),
          ),
          if (badge != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: ColorPalette.primary.withValues(alpha: 0.15),
                border: Border.all(color: ColorPalette.primary.withValues(alpha: 0.25)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                badge,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: ColorPalette.primaryLight,
                ),
              ),
            )
          else
            const Icon(Icons.chevron_right, color: ColorPalette.textMuted, size: 20),
        ],
      ),
    );
  }
}
