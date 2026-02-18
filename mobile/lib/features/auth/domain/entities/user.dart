import 'package:equatable/equatable.dart';

/// User domain entity.
class User extends Equatable {
  final String id;
  final String name;
  final String email;
  final List<String> roles;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.roles,
  });

  bool get isMember => roles.contains('member');
  bool get isCoach => roles.contains('coach');
  bool get isAdmin => roles.contains('admin') || roles.contains('super_admin');

  @override
  List<Object> get props => [id, name, email, roles];
}
