# Flutter Industrial Standards Guide

## Table of Contents
- [Architecture Patterns](#architecture-patterns)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Dependency Injection](#dependency-injection)
- [API Integration](#api-integration)
- [Error Handling](#error-handling)
- [Testing Strategy](#testing-strategy)
- [Code Quality](#code-quality)
- [Security Best Practices](#security-best-practices)
- [CI/CD Pipeline](#cicd-pipeline)
- [Performance Optimization](#performance-optimization)

---

## Architecture Patterns

### Clean Architecture (Recommended)

Clean Architecture separates concerns into layers, making code testable, maintainable, and scalable.

**Three Main Layers:**

1. **Presentation Layer** - UI, Widgets, State Management
2. **Domain Layer** - Business Logic, Entities, Use Cases
3. **Data Layer** - Repositories, Data Sources, Models

**Benefits:**
- Independent of frameworks
- Testable
- Independent of UI
- Independent of database
- Independent of external agencies

### Alternative: Feature-First Architecture

Organize by features rather than layers for smaller to medium apps.

---

## Project Structure

### Clean Architecture Structure

```
lib/
├── core/
│   ├── constants/
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── strings.dart
│   ├── error/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   ├── api_client.dart
│   │   └── network_info.dart
│   ├── usecases/
│   │   └── usecase.dart
│   └── utils/
│       ├── validators.dart
│       └── extensions.dart
├── features/
│   ├── authentication/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── auth_local_datasource.dart
│   │   │   │   └── auth_remote_datasource.dart
│   │   │   ├── models/
│   │   │   │   └── user_model.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/
│   │   │       ├── login_usecase.dart
│   │   │       ├── logout_usecase.dart
│   │   │       └── register_usecase.dart
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── auth_bloc.dart
│   │       │   ├── auth_event.dart
│   │       │   └── auth_state.dart
│   │       ├── pages/
│   │       │   ├── login_page.dart
│   │       │   └── register_page.dart
│   │       └── widgets/
│   │           ├── login_form.dart
│   │           └── custom_text_field.dart
│   ├── home/
│   │   └── [same structure]
│   └── profile/
│       └── [same structure]
├── config/
│   ├── routes/
│   │   ├── app_routes.dart
│   │   └── route_generator.dart
│   └── themes/
│       ├── app_theme.dart
│       └── color_palette.dart
├── injection_container.dart
└── main.dart
```

### Alternative: Feature-First Structure

```
lib/
├── features/
│   ├── auth/
│   │   ├── models/
│   │   ├── services/
│   │   ├── widgets/
│   │   └── screens/
│   └── home/
├── shared/
│   ├── widgets/
│   ├── utils/
│   └── constants/
└── main.dart
```

---

## State Management

### 1. Bloc/Cubit (Most Industrial Standard)

**Why Bloc?**
- Predictable state management
- Easy to test
- Separates business logic from UI
- Excellent debugging with Bloc Observer
- Used by: Google, Alibaba, BMW

**Installation:**
```yaml
dependencies:
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
```

**Basic Implementation:**

```dart
// Event
abstract class AuthEvent extends Equatable {
  const AuthEvent();
}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  
  const LoginRequested({required this.email, required this.password});
  
  @override
  List<Object> get props => [email, password];
}

// State
abstract class AuthState extends Equatable {
  const AuthState();
}

class AuthInitial extends AuthState {
  @override
  List<Object> get props => [];
}

class AuthLoading extends AuthState {
  @override
  List<Object> get props => [];
}

class AuthSuccess extends AuthState {
  final User user;
  
  const AuthSuccess(this.user);
  
  @override
  List<Object> get props => [user];
}

class AuthFailure extends AuthState {
  final String message;
  
  const AuthFailure(this.message);
  
  @override
  List<Object> get props => [message];
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  
  AuthBloc({required this.loginUseCase}) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
  }
  
  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    final result = await loginUseCase(
      LoginParams(email: event.email, password: event.password),
    );
    
    result.fold(
      (failure) => emit(AuthFailure(failure.message)),
      (user) => emit(AuthSuccess(user)),
    );
  }
}

// Usage in Widget
class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => getIt<AuthBloc>(),
      child: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthSuccess) {
            Navigator.pushReplacementNamed(context, '/home');
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message)),
            );
          }
        },
        builder: (context, state) {
          if (state is AuthLoading) {
            return Center(child: CircularProgressIndicator());
          }
          
          return LoginForm(
            onSubmit: (email, password) {
              context.read<AuthBloc>().add(
                LoginRequested(email: email, password: password),
              );
            },
          );
        },
      ),
    );
  }
}
```

### 2. Riverpod (Modern Alternative)

```yaml
dependencies:
  flutter_riverpod: ^2.4.9
```

```dart
// Provider definition
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

// Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  
  AuthNotifier(this._repository) : super(AuthInitial());
  
  Future<void> login(String email, String password) async {
    state = AuthLoading();
    
    final result = await _repository.login(email, password);
    
    result.fold(
      (failure) => state = AuthFailure(failure.message),
      (user) => state = AuthSuccess(user),
    );
  }
}

// Usage
class LoginPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    
    ref.listen(authProvider, (previous, next) {
      if (next is AuthSuccess) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    });
    
    return Scaffold(
      body: authState is AuthLoading
          ? CircularProgressIndicator()
          : LoginForm(
              onSubmit: (email, password) {
                ref.read(authProvider.notifier).login(email, password);
              },
            ),
    );
  }
}
```

---

## Dependency Injection

### GetIt + Injectable (Recommended)

**Installation:**
```yaml
dependencies:
  get_it: ^7.6.4
  injectable: ^2.3.2

dev_dependencies:
  injectable_generator: ^2.4.1
  build_runner: ^2.4.6
```

**Setup:**

```dart
// injection_container.dart
import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'injection_container.config.dart';

final getIt = GetIt.instance;

@InjectableInit()
Future<void> configureDependencies() async => getIt.init();

// Usage in main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(MyApp());
}
```

**Annotating Classes:**

```dart
// Singleton
@lazySingleton
class AuthRepository {
  final ApiClient apiClient;
  
  AuthRepository(this.apiClient);
}

// Factory (new instance each time)
@injectable
class LoginUseCase {
  final AuthRepository repository;
  
  LoginUseCase(this.repository);
}

// Named registration
@Named('baseUrl')
@injectable
String get baseUrl => 'https://api.example.com';

// Environment-specific
@Environment('dev')
@injectable
class DevApiClient implements ApiClient { }

@Environment('prod')
@injectable
class ProdApiClient implements ApiClient { }
```

**Generate code:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Manual GetIt Setup (Without Injectable)

```dart
// injection_container.dart
import 'package:get_it/get_it.dart';

final getIt = GetIt.instance;

Future<void> setupDependencies() async {
  // External
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(sharedPreferences);
  
  // Core
  getIt.registerLazySingleton<ApiClient>(() => DioApiClient());
  getIt.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl());
  
  // Data sources
  getIt.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(getIt()),
  );
  
  getIt.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(getIt()),
  );
  
  // Repositories
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: getIt(),
      localDataSource: getIt(),
      networkInfo: getIt(),
    ),
  );
  
  // Use cases
  getIt.registerFactory(() => LoginUseCase(getIt()));
  getIt.registerFactory(() => LogoutUseCase(getIt()));
  
  // Blocs
  getIt.registerFactory(() => AuthBloc(loginUseCase: getIt()));
}
```

---

## API Integration

### Dio with Interceptors (Recommended)

**Installation:**
```yaml
dependencies:
  dio: ^5.4.0
  pretty_dio_logger: ^1.3.1
```

**Implementation:**

```dart
// api_client.dart
import 'package:dio/dio.dart';

class ApiClient {
  final Dio _dio;
  
  ApiClient({String? baseUrl}) : _dio = Dio(
    BaseOptions(
      baseUrl: baseUrl ?? 'https://api.example.com',
      connectTimeout: Duration(seconds: 30),
      receiveTimeout: Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  ) {
    _dio.interceptors.addAll([
      LoggingInterceptor(),
      AuthInterceptor(),
      ErrorInterceptor(),
    ]);
  }
  
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }
  
  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }
  
  Future<Response> put(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }
  
  Future<Response> delete(String path) {
    return _dio.delete(path);
  }
}

// Interceptors
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('REQUEST[${options.method}] => PATH: ${options.path}');
    super.onRequest(options, handler);
  }
  
  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print('RESPONSE[${response.statusCode}] => DATA: ${response.data}');
    super.onResponse(response, handler);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    print('ERROR[${err.response?.statusCode}] => MESSAGE: ${err.message}');
    super.onError(err, handler);
  }
}

class AuthInterceptor extends Interceptor {
  final TokenStorage tokenStorage;
  
  AuthInterceptor(this.tokenStorage);
  
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenStorage.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    super.onRequest(options, handler);
  }
}

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        throw NetworkException('Connection timeout');
      case DioExceptionType.badResponse:
        switch (err.response?.statusCode) {
          case 400:
            throw BadRequestException('Bad request');
          case 401:
            throw UnauthorizedException('Unauthorized');
          case 403:
            throw ForbiddenException('Forbidden');
          case 404:
            throw NotFoundException('Not found');
          case 500:
            throw ServerException('Server error');
          default:
            throw ServerException('Unknown error');
        }
      default:
        throw NetworkException('Network error');
    }
  }
}
```

### Retrofit (Type-Safe Alternative)

```yaml
dependencies:
  retrofit: ^4.0.3
  json_annotation: ^4.8.1

dev_dependencies:
  retrofit_generator: ^8.0.4
  json_serializable: ^6.7.1
```

```dart
import 'package:retrofit/retrofit.dart';
import 'package:dio/dio.dart';

part 'api_service.g.dart';

@RestApi(baseUrl: 'https://api.example.com')
abstract class ApiService {
  factory ApiService(Dio dio, {String baseUrl}) = _ApiService;
  
  @GET('/users/{id}')
  Future<User> getUser(@Path('id') String id);
  
  @POST('/auth/login')
  Future<AuthResponse> login(@Body() LoginRequest request);
  
  @GET('/posts')
  Future<List<Post>> getPosts(
    @Query('page') int page,
    @Query('limit') int limit,
  );
  
  @PUT('/users/{id}')
  Future<User> updateUser(
    @Path('id') String id,
    @Body() UserUpdateRequest request,
  );
  
  @DELETE('/posts/{id}')
  Future<void> deletePost(@Path('id') String id);
  
  @POST('/upload')
  @MultiPart()
  Future<UploadResponse> uploadFile(
    @Part(name: 'file') File file,
    @Part(name: 'description') String description,
  );
}

// Generate code
// flutter pub run build_runner build
```

---

## Error Handling

### Failure Classes

```dart
// failures.dart
abstract class Failure extends Equatable {
  final String message;
  
  const Failure(this.message);
  
  @override
  List<Object> get props => [message];
}

class ServerFailure extends Failure {
  const ServerFailure(super.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class CacheFailure extends Failure {
  const CacheFailure(super.message);
}

class ValidationFailure extends Failure {
  const ValidationFailure(super.message);
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure(super.message);
}
```

### Exception Classes

```dart
// exceptions.dart
class ServerException implements Exception {
  final String message;
  ServerException(this.message);
}

class NetworkException implements Exception {
  final String message;
  NetworkException(this.message);
}

class CacheException implements Exception {
  final String message;
  CacheException(this.message);
}

class UnauthorizedException implements Exception {
  final String message;
  UnauthorizedException(this.message);
}

class BadRequestException implements Exception {
  final String message;
  BadRequestException(this.message);
}

class NotFoundException implements Exception {
  final String message;
  NotFoundException(this.message);
}

class ForbiddenException implements Exception {
  final String message;
  ForbiddenException(this.message);
}
```

### Either/Result Pattern (Using Dartz)

```yaml
dependencies:
  dartz: ^0.10.1
```

```dart
import 'package:dartz/dartz.dart';

// Type alias for cleaner code
typedef ResultFuture<T> = Future<Either<Failure, T>>;
typedef ResultVoid = Future<Either<Failure, void>>;

// Repository implementation
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;
  final NetworkInfo networkInfo;
  
  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });
  
  @override
  ResultFuture<User> login(String email, String password) async {
    if (await networkInfo.isConnected) {
      try {
        final user = await remoteDataSource.login(email, password);
        await localDataSource.cacheUser(user);
        return Right(user);
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      } on UnauthorizedException catch (e) {
        return Left(UnauthorizedFailure(e.message));
      }
    } else {
      return Left(NetworkFailure('No internet connection'));
    }
  }
}

// UseCase with Either
class LoginUseCase {
  final AuthRepository repository;
  
  LoginUseCase(this.repository);
  
  ResultFuture<User> call(LoginParams params) {
    return repository.login(params.email, params.password);
  }
}

class LoginParams extends Equatable {
  final String email;
  final String password;
  
  const LoginParams({required this.email, required this.password});
  
  @override
  List<Object> get props => [email, password];
}

// Usage in Bloc
Future<void> _onLoginRequested(
  LoginRequested event,
  Emitter<AuthState> emit,
) async {
  emit(AuthLoading());
  
  final result = await loginUseCase(
    LoginParams(email: event.email, password: event.password),
  );
  
  result.fold(
    (failure) => emit(AuthFailure(failure.message)),
    (user) => emit(AuthSuccess(user)),
  );
}
```

### Alternative: Result Class (Without Dartz)

```dart
class Result<T> {
  final T? data;
  final Failure? failure;
  
  Result.success(this.data) : failure = null;
  Result.failure(this.failure) : data = null;
  
  bool get isSuccess => data != null;
  bool get isFailure => failure != null;
}

// Usage
Future<Result<User>> login(String email, String password) async {
  try {
    final user = await remoteDataSource.login(email, password);
    return Result.success(user);
  } on ServerException catch (e) {
    return Result.failure(ServerFailure(e.message));
  }
}
```

---

## Testing Strategy

### Test Structure

```
test/
├── unit/
│   ├── features/
│   │   └── auth/
│   │       ├── domain/
│   │       │   └── usecases/
│   │       │       └── login_usecase_test.dart
│   │       └── data/
│   │           └── repositories/
│   │               └── auth_repository_impl_test.dart
│   └── core/
│       └── network/
│           └── api_client_test.dart
├── widget/
│   └── features/
│       └── auth/
│           └── presentation/
│               └── pages/
│                   └── login_page_test.dart
└── integration/
    └── app_test.dart
```

### Unit Testing

**Installation:**
```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.4
  build_runner: ^2.4.6
```

**Example: UseCase Test**

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:dartz/dartz.dart';

@GenerateMocks([AuthRepository])
import 'login_usecase_test.mocks.dart';

void main() {
  late LoginUseCase usecase;
  late MockAuthRepository mockRepository;
  
  setUp(() {
    mockRepository = MockAuthRepository();
    usecase = LoginUseCase(mockRepository);
  });
  
  group('LoginUseCase', () {
    const tEmail = 'test@example.com';
    const tPassword = 'password123';
    const tUser = User(id: '1', email: tEmail, name: 'Test User');
    
    test('should return User when login is successful', () async {
      // arrange
      when(mockRepository.login(any, any))
          .thenAnswer((_) async => Right(tUser));
      
      // act
      final result = await usecase(
        LoginParams(email: tEmail, password: tPassword),
      );
      
      // assert
      expect(result, Right(tUser));
      verify(mockRepository.login(tEmail, tPassword));
      verifyNoMoreInteractions(mockRepository);
    });
    
    test('should return Failure when login fails', () async {
      // arrange
      when(mockRepository.login(any, any))
          .thenAnswer((_) async => Left(ServerFailure('Server error')));
      
      // act
      final result = await usecase(
        LoginParams(email: tEmail, password: tPassword),
      );
      
      // assert
      expect(result, Left(ServerFailure('Server error')));
      verify(mockRepository.login(tEmail, tPassword));
    });
  });
}
```

**Example: Bloc Test**

```yaml
dev_dependencies:
  bloc_test: ^9.1.5
```

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  late AuthBloc authBloc;
  late MockLoginUseCase mockLoginUseCase;
  
  setUp(() {
    mockLoginUseCase = MockLoginUseCase();
    authBloc = AuthBloc(loginUseCase: mockLoginUseCase);
  });
  
  tearDown(() {
    authBloc.close();
  });
  
  group('AuthBloc', () {
    const tUser = User(id: '1', email: 'test@example.com', name: 'Test');
    
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthSuccess] when login is successful',
      build: () {
        when(mockLoginUseCase(any))
            .thenAnswer((_) async => Right(tUser));
        return authBloc;
      },
      act: (bloc) => bloc.add(
        LoginRequested(email: 'test@example.com', password: 'password'),
      ),
      expect: () => [
        AuthLoading(),
        AuthSuccess(tUser),
      ],
    );
    
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthFailure] when login fails',
      build: () {
        when(mockLoginUseCase(any))
            .thenAnswer((_) async => Left(ServerFailure('Error')));
        return authBloc;
      },
      act: (bloc) => bloc.add(
        LoginRequested(email: 'test@example.com', password: 'wrong'),
      ),
      expect: () => [
        AuthLoading(),
        AuthFailure('Error'),
      ],
    );
  });
}
```

### Widget Testing

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

void main() {
  late MockAuthBloc mockAuthBloc;
  
  setUp(() {
    mockAuthBloc = MockAuthBloc();
  });
  
  Widget makeTestableWidget(Widget child) {
    return MaterialApp(
      home: BlocProvider<AuthBloc>(
        create: (_) => mockAuthBloc,
        child: child,
      ),
    );
  }
  
  group('LoginPage', () {
    testWidgets('should show loading indicator when state is loading',
        (tester) async {
      // arrange
      when(() => mockAuthBloc.state).thenReturn(AuthLoading());
      
      // act
      await tester.pumpWidget(makeTestableWidget(LoginPage()));
      
      // assert
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
    
    testWidgets('should show login form when state is initial',
        (tester) async {
      // arrange
      when(() => mockAuthBloc.state).thenReturn(AuthInitial());
      
      // act
      await tester.pumpWidget(makeTestableWidget(LoginPage()));
      
      // assert
      expect(find.byType(TextField), findsNWidgets(2));
      expect(find.byType(ElevatedButton), findsOneWidget);
    });
    
    testWidgets('should add LoginRequested event when button is pressed',
        (tester) async {
      // arrange
      when(() => mockAuthBloc.state).thenReturn(AuthInitial());
      
      // act
      await tester.pumpWidget(makeTestableWidget(LoginPage()));
      await tester.enterText(
        find.byType(TextField).first,
        'test@example.com',
      );
      await tester.enterText(
        find.byType(TextField).last,
        'password',
      );
      await tester.tap(find.byType(ElevatedButton));
      
      // assert
      verify(() => mockAuthBloc.add(
        LoginRequested(email: 'test@example.com', password: 'password'),
      )).called(1);
    });
  });
}
```

### Integration Testing

```yaml
dev_dependencies:
  integration_test:
    sdk: flutter
```

```dart
// integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('end-to-end test', () {
    testWidgets('complete login flow', (tester) async {
      app.main();
      await tester.pumpAndSettle();
      
      // Find email field and enter text
      final emailField = find.byKey(Key('emailField'));
      await tester.enterText(emailField, 'test@example.com');
      await tester.pumpAndSettle();
      
      // Find password field and enter text
      final passwordField = find.byKey(Key('passwordField'));
      await tester.enterText(passwordField, 'password123');
      await tester.pumpAndSettle();
      
      // Tap login button
      final loginButton = find.byKey(Key('loginButton'));
      await tester.tap(loginButton);
      await tester.pumpAndSettle();
      
      // Verify navigation to home page
      expect(find.text('Home Page'), findsOneWidget);
    });
  });
}
```

### Test Coverage

```bash
# Run tests with coverage
flutter test --coverage

# Generate HTML report
genhtml coverage/lcov.info -o coverage/html

# Open report
open coverage/html/index.html
```

**Target Coverage:**
- Unit tests: 80%+
- Widget tests: 70%+
- Integration tests: Critical user flows

---

## Code Quality

### Linting

**flutter_lints (Official):**
```yaml
dev_dependencies:
  flutter_lints: ^4.0.0
```

```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - always_declare_return_types
    - always_put_required_named_parameters_first
    - avoid_print
    - avoid_unnecessary_containers
    - prefer_const_constructors
    - prefer_const_literals_to_create_immutables
    - prefer_final_fields
    - require_trailing_commas
```

**very_good_analysis (VGV Standards):**
```yaml
dev_dependencies:
  very_good_analysis: ^6.0.0
```

```yaml
# analysis_options.yaml
include: package:very_good_analysis/analysis_options.yaml
```

### Code Formatting

```bash
# Format all files
dart format .

# Check formatting
dart format --set-exit-if-changed .
```

### Static Analysis

```bash
# Analyze code
flutter analyze

# Fix issues automatically
dart fix --apply
```

### Pre-commit Hooks (Husky alternative)

```yaml
dev_dependencies:
  husky: ^0.1.7
```

```bash
# Install husky
dart run husky install

# Add pre-commit hook
dart run husky set .husky/pre-commit "flutter test && flutter analyze"
```

---

## Security Best Practices

### 1. Secure Storage

```yaml
dependencies:
  flutter_secure_storage: ^9.0.0
```

```dart
class SecureStorageService {
  final FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );
  
  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }
  
  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }
  
  Future<void> deleteToken() async {
    await _storage.delete(key: 'auth_token');
  }
  
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
```

### 2. Certificate Pinning

```yaml
dependencies:
  dio: ^5.4.0
```

```dart
class PinnedApiClient {
  Dio createDio() {
    final dio = Dio();
    
    (dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
      final client = HttpClient();
      
      client.badCertificateCallback = (cert, host, port) {
        // Pin SHA256 fingerprint
        final fingerprint = sha256.convert(cert.der).toString();
        return fingerprint == 'YOUR_CERTIFICATE_SHA256_HASH';
      };
      
      return client;
    };
    
    return dio;
  }
}
```

### 3. API Key Protection

**Don't hardcode API keys:**
```dart
// ❌ Bad
const apiKey = 'sk_live_abc123xyz';

// ✅ Good - use environment variables
class EnvironmentConfig {
  static const apiKey = String.fromEnvironment('API_KEY');
  static const baseUrl = String.fromEnvironment('BASE_URL');
}
```

**Run with environment variables:**
```bash
flutter run --dart-define=API_KEY=your_key --dart-define=BASE_URL=https://api.example.com
```

**Or use envied package:**
```yaml
dependencies:
  envied: ^0.5.4

dev_dependencies:
  envied_generator: ^0.5.4
  build_runner: ^2.4.6
```

```dart
// .env file (add to .gitignore)
API_KEY=your_api_key
BASE_URL=https://api.example.com

// env.dart
import 'package:envied/envied.dart';

part 'env.g.dart';

@Envied(path: '.env')
abstract class Env {
  @EnviedField(varName: 'API_KEY', obfuscate: true)
  static final String apiKey = _Env.apiKey;
  
  @EnviedField(varName: 'BASE_URL')
  static const String baseUrl = _Env.baseUrl;
}
```

### 4. Input Validation

```dart
class Validators {
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Enter a valid email';
    }
    
    return null;
  }
  
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain at least one uppercase letter';
    }
    
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain at least one number';
    }
    
    return null;
  }
  
  static String? validatePhoneNumber(String? value) {
    if (value == null || value.isEmpty) {
      return 'Phone number is required';
    }
    
    final phoneRegex = RegExp(r'^\+?[\d\s-]{10,}$');
    if (!phoneRegex.hasMatch(value)) {
      return 'Enter a valid phone number';
    }
    
    return null;
  }
}
```

### 5. Obfuscation (Release Build)

```bash
flutter build apk --obfuscate --split-debug-info=build/app/outputs/symbols
flutter build appbundle --obfuscate --split-debug-info=build/app/outputs/symbols
flutter build ios --obfuscate --split-debug-info=build/ios/symbols
```

### 6. SSL/TLS Enforcement

```dart
class SecureApiClient {
  Dio createSecureDio() {
    final dio = Dio();
    
    (dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
      final client = HttpClient();
      
      // Force TLS 1.2+
      client.badCertificateCallback = (cert, host, port) => false;
      
      return client;
    };
    
    return dio;
  }
}
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/main.yml
name: Flutter CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.0'
          channel: 'stable'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Verify formatting
        run: dart format --set-exit-if-changed .
      
      - name: Analyze code
        run: flutter analyze
      
      - name: Run tests
        run: flutter test --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: coverage/lcov.info
      
      - name: Build APK
        run: flutter build apk --release
      
      - name: Build iOS (macOS only)
        if: runner.os == 'macOS'
        run: flutter build ios --release --no-codesign
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: release-apk
          path: build/app/outputs/flutter-apk/app-release.apk
```

### Codemagic

```yaml
# codemagic.yaml
workflows:
  android-workflow:
    name: Android Workflow
    max_build_duration: 60
    environment:
      flutter: stable
      xcode: latest
      cocoapods: default
    scripts:
      - name: Get Flutter packages
        script: flutter pub get
      - name: Analyze code
        script: flutter analyze
      - name: Run tests
        script: flutter test
      - name: Build APK
        script: flutter build apk --release
    artifacts:
      - build/app/outputs/flutter-apk/*.apk
    publishing:
      email:
        recipients:
          - user@example.com
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: internal

  ios-workflow:
    name: iOS Workflow
    environment:
      flutter: stable
    scripts:
      - name: Get Flutter packages
        script: flutter pub get
      - name: Install pods
        script: cd ios && pod install
      - name: Build iOS
        script: flutter build ipa --release
    artifacts:
      - build/ios/ipa/*.ipa
    publishing:
      app_store_connect:
        api_key: $APP_STORE_CONNECT_KEY_IDENTIFIER
        key_id: $APP_STORE_CONNECT_KEY_ID
        issuer_id: $APP_STORE_CONNECT_ISSUER_ID
```

### Fastlane (Advanced)

```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Deploy to Google Play Internal Track"
  lane :deploy_internal do
    gradle(task: "clean")
    gradle(
      task: "bundle",
      build_type: "Release"
    )
    upload_to_play_store(
      track: 'internal',
      aab: '../build/app/outputs/bundle/release/app-release.aab'
    )
  end
end

# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Deploy to TestFlight"
  lane :deploy_testflight do
    build_app(
      scheme: "Runner",
      export_method: "app-store"
    )
    upload_to_testflight
  end
end
```

---

## Performance Optimization

### 1. Image Optimization

```yaml
dependencies:
  cached_network_image: ^3.3.0
```

```dart
CachedNetworkImage(
  imageUrl: 'https://example.com/image.jpg',
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
  maxHeightDiskCache: 1000,
  maxWidthDiskCache: 1000,
  memCacheHeight: 200,
  memCacheWidth: 200,
)
```

### 2. Lazy Loading Lists

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(
      title: Text(items[index].title),
    );
  },
)
```

### 3. Const Constructors

```dart
// ✅ Good - reduces rebuilds
const Text('Hello World');
const SizedBox(height: 16);
const Padding(padding: EdgeInsets.all(8.0));

// ❌ Bad
Text('Hello World');
SizedBox(height: 16);
```

### 4. Code Splitting

```dart
// Lazy load heavy screens
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => FutureBuilder(
      future: import('heavy_screen.dart'),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return HeavyScreen();
        }
        return CircularProgressIndicator();
      },
    ),
  ),
);
```

### 5. Performance Profiling

```bash
# Run with performance overlay
flutter run --profile

# Analyze build times
flutter build apk --analyze-size

# DevTools
flutter pub global activate devtools
flutter pub global run devtools
```

### 6. Reduce Widget Rebuilds

```dart
class MyWidget extends StatelessWidget {
  final VoidCallback onPressed;
  
  const MyWidget({Key? key, required this.onPressed}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: const Text('Click Me'), // Use const
    );
  }
}

// Use RepaintBoundary for expensive widgets
RepaintBoundary(
  child: ExpensiveWidget(),
)
```

---

## Additional Best Practices

### 1. Navigation

**Go Router (Recommended):**
```yaml
dependencies:
  go_router: ^13.0.0
```

```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomePage(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => LoginPage(),
    ),
    GoRoute(
      path: '/profile/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ProfilePage(userId: id);
      },
    ),
  ],
  redirect: (context, state) {
    final isLoggedIn = /* check auth status */;
    final isLoggingIn = state.matchedLocation == '/login';
    
    if (!isLoggedIn && !isLoggingIn) {
      return '/login';
    }
    
    if (isLoggedIn && isLoggingIn) {
      return '/';
    }
    
    return null;
  },
);

// In main.dart
MaterialApp.router(
  routerConfig: router,
)
```

### 2. Localization

```yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: ^0.18.1

dev_dependencies:
  flutter_gen: ^5.4.0
```

```yaml
# l10n.yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
```

```json
// lib/l10n/app_en.arb
{
  "@@locale": "en",
  "appTitle": "My App",
  "loginButton": "Login",
  "welcomeMessage": "Welcome, {name}!",
  "@welcomeMessage": {
    "placeholders": {
      "name": {
        "type": "String"
      }
    }
  }
}
```

### 3. Logging

```yaml
dependencies:
  logger: ^2.0.2
```

```dart
class AppLogger {
  static final logger = Logger(
    printer: PrettyPrinter(
      methodCount: 2,
      errorMethodCount: 8,
      lineLength: 120,
      colors: true,
      printEmojis: true,
      printTime: true,
    ),
  );
  
  static void d(String message) => logger.d(message);
  static void i(String message) => logger.i(message);
  static void w(String message) => logger.w(message);
  static void e(String message, [dynamic error]) => logger.e(message, error: error);
}
```

### 4. Analytics & Crash Reporting

```yaml
dependencies:
  firebase_analytics: ^10.8.0
  firebase_crashlytics: ^3.4.9
```

```dart
class AnalyticsService {
  final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;
  final FirebaseCrashlytics _crashlytics = FirebaseCrashlytics.instance;
  
  Future<void> logEvent(String name, Map<String, dynamic> parameters) {
    return _analytics.logEvent(name: name, parameters: parameters);
  }
  
  Future<void> logScreen(String screenName) {
    return _analytics.logScreenView(screenName: screenName);
  }
  
  void recordError(dynamic error, StackTrace stackTrace) {
    _crashlytics.recordError(error, stackTrace);
  }
}
```

---

## Resources

### Official Documentation
- [Flutter Documentation](https://docs.flutter.dev/)
- [Dart Documentation](https://dart.dev/guides)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)

### Architecture Guides
- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Flutter Architecture Samples](https://github.com/brianegan/flutter_architecture_samples)
- [Very Good Ventures Best Practices](https://verygood.ventures/blog)

### State Management
- [Bloc Documentation](https://bloclibrary.dev/)
- [Riverpod Documentation](https://riverpod.dev/)
- [Provider Documentation](https://pub.dev/packages/provider)

### Testing
- [Flutter Testing Documentation](https://docs.flutter.dev/testing)
- [Mockito Documentation](https://pub.dev/packages/mockito)
- [Integration Testing](https://docs.flutter.dev/testing/integration-tests)

### Community
- [Flutter Community on GitHub](https://github.com/fluttercommunity)
- [r/FlutterDev](https://reddit.com/r/FlutterDev)
- [Flutter Discord](https://discord.gg/flutter)

---

## Conclusion

මේ guide එක follow කරලා ඔයාට production-ready, maintainable, හා scalable Flutter applications හදන්න පුළුවන්. මතක තියාගන්න:

1. **Clean Architecture** use කරන්න separation of concerns වලට
2. **Bloc/Riverpod** වගේ proven state management solutions භාවිතා කරන්න
3. **Dependency Injection** implement කරන්න testability වලට
4. **Comprehensive testing** කරන්න (unit, widget, integration)
5. **CI/CD pipeline** setup කරන්න automated deployment වලට
6. **Security best practices** follow කරන්න
7. **Performance optimization** අමතක කරන්න එපා

සාර්ථකත්වය ඔයාට!
