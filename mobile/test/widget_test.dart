import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nycsc_mobile/features/auth/presentation/pages/login_page.dart';

void main() {
  testWidgets('Login page renders email and password fields', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: LoginPage(),
      ),
    );

    expect(find.text('Welcome Back'), findsOneWidget);
    expect(find.text('Sign In'), findsOneWidget);
    expect(find.byKey(const Key('emailField')), findsOneWidget);
    expect(find.byKey(const Key('passwordField')), findsOneWidget);
  });
}
