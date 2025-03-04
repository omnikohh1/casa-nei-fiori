import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/gallery_screen.dart';
import 'screens/booking_screen.dart';

void main() {
  runApp(const CasaNeiFioriApp());
}

class CasaNeiFioriApp extends StatelessWidget {
  const CasaNeiFioriApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Casa nei Fiori',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.teal,
          primary: Colors.teal,
          secondary: Colors.amber,
        ),
        fontFamily: 'Lora',
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const HomeScreen(),
        '/booking': (context) => BookingScreen(), 
        '/gallery': (context) => const GalleryScreen(),
      },
    );
  }
}

