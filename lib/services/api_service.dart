import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl = 'https://www.casaneifiori.it/wp-json/wp/v2/';

  Future<List<dynamic>> fetchApartments() async {
    final response = await http.get(Uri.parse('${baseUrl}apartments'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Errore nel recupero dati');
    }
  }
}
