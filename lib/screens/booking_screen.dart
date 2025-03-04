import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class BookingScreen extends StatefulWidget {
  @override
  _BookingScreenState createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _formKey = GlobalKey<FormState>();

  DateTime? _selectedCheckIn;
  DateTime? _selectedCheckOut;
  String? _name;
  String? _email;
  String? _phone;
  String _selectedApartment = "Superior"; // Default
  bool _isAvailable = false;
  bool _checkedAvailability = false;

  void _pickCheckInDate() async {
    DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );

    if (pickedDate != null) {
      setState(() {
        _selectedCheckIn = pickedDate;
      });
    }
  }

  void _pickCheckOutDate() async {
    DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedCheckIn ?? DateTime.now(),
      firstDate: _selectedCheckIn ?? DateTime.now(),
      lastDate: DateTime(2100),
    );

    if (pickedDate != null) {
      setState(() {
        _selectedCheckOut = pickedDate;
      });
    }
  }

  Future<void> _checkAvailability() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      if (_selectedCheckIn == null || _selectedCheckOut == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Seleziona una data di check-in e check-out')),
        );
        return;
      }

      String checkIn = "${_selectedCheckIn!.year}-${_selectedCheckIn!.month.toString().padLeft(2, '0')}-${_selectedCheckIn!.day.toString().padLeft(2, '0')}";
      String checkOut = "${_selectedCheckOut!.year}-${_selectedCheckOut!.month.toString().padLeft(2, '0')}-${_selectedCheckOut!.day.toString().padLeft(2, '0')}";

      String url = "http://localhost:3000/checkAvailability?checkIn=$checkIn&checkOut=$checkOut&apartment=$_selectedApartment";

      try {
        final response = await http.get(Uri.parse(url));

        if (response.statusCode == 200) {
          final jsonResponse = jsonDecode(response.body);
          bool isAvailable = jsonResponse["available"];

          setState(() {
            _isAvailable = isAvailable;
            _checkedAvailability = true;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(isAvailable
                  ? "L'appartamento $_selectedApartment è DISPONIBILE!"
                  : "L'appartamento $_selectedApartment è **NON DISPONIBILE**."),
              backgroundColor: isAvailable ? Colors.green : Colors.red,
            ),
          );
        } else {
          throw Exception("Errore HTTP ${response.statusCode}");
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Errore nella verifica della disponibilità")),
        );
        print(e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Prenota Ora')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Inserisci i tuoi dati per la prenotazione:",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),

              // Nome
              TextFormField(
                decoration: const InputDecoration(labelText: "Nome Completo"),
                validator: (value) => value!.isEmpty ? "Inserisci il tuo nome" : null,
                onSaved: (value) => _name = value,
              ),

              // Email
              TextFormField(
                decoration: const InputDecoration(labelText: "Email"),
                keyboardType: TextInputType.emailAddress,
                validator: (value) => value!.isEmpty ? "Inserisci la tua email" : null,
                onSaved: (value) => _email = value,
              ),

              // Telefono
              TextFormField(
                decoration: const InputDecoration(labelText: "Telefono"),
                keyboardType: TextInputType.phone,
                validator: (value) => value!.isEmpty ? "Inserisci il tuo telefono" : null,
                onSaved: (value) => _phone = value,
              ),

              const SizedBox(height: 20),

              // Selezione appartamento
              const Text("Seleziona l'appartamento:", style: TextStyle(fontSize: 16)),
              DropdownButtonFormField(
                value: _selectedApartment,
                items: const [
                  DropdownMenuItem(value: "Superior", child: Text("Superior (5 posti)")),
                  DropdownMenuItem(value: "Deluxe", child: Text("Deluxe (3 posti)")),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedApartment = value!;
                  });
                },
              ),

              const SizedBox(height: 20),

              // Pulsanti Check-in e Check-out
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _pickCheckInDate,
                      child: Text(
                        _selectedCheckIn == null
                            ? "Seleziona Check-In"
                            : "${_selectedCheckIn!.day}/${_selectedCheckIn!.month}/${_selectedCheckIn!.year}",
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _pickCheckOutDate,
                      child: Text(
                        _selectedCheckOut == null
                            ? "Seleziona Check-Out"
                            : "${_selectedCheckOut!.day}/${_selectedCheckOut!.month}/${_selectedCheckOut!.year}",
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Bottone Verifica Disponibilità
              Center(
                child: ElevatedButton(
                  onPressed: _checkAvailability,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  ),
                  child: const Text(
                    "Verifica Disponibilità",
                    style: TextStyle(fontSize: 18),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
