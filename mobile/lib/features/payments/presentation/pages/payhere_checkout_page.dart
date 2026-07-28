import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PayHereCheckoutPage extends StatefulWidget {
  final Map<String, dynamic> checkoutData;

  const PayHereCheckoutPage({Key? key, required this.checkoutData}) : super(key: key);

  @override
  State<PayHereCheckoutPage> createState() => _PayHereCheckoutPageState();
}

class _PayHereCheckoutPageState extends State<PayHereCheckoutPage> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();

    final checkoutUrl = widget.checkoutData['checkout_url'] as String;
    final formData = widget.checkoutData['form_data'] as Map<String, dynamic>;

    // Build the query string for application/x-www-form-urlencoded
    final uri = Uri(queryParameters: formData.map((key, value) => MapEntry(key, value?.toString() ?? '')));
    final body = Uint8List.fromList(utf8.encode(uri.query));

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onNavigationRequest: (NavigationRequest request) {
            if (request.url.contains('/api/member/payments/online/return')) {
              // Payment Success Return URL
              Navigator.pop(context, true);
              return NavigationDecision.prevent;
            }
            if (request.url.contains('/api/member/payments/online/cancel')) {
              // Payment Cancel URL
              Navigator.pop(context, false);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(
        Uri.parse(checkoutUrl),
        method: LoadRequestMethod.post,
        body: body,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Secure Checkout', style: TextStyle(fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context, false),
        ),
        elevation: 1,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}
