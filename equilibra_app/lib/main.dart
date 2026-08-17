import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

const String baseUrl = 'http://10.0.2.2:3000';

void main() {
  runApp(const EquilibraApp());
}

class EquilibraApp extends StatelessWidget {
  const EquilibraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EQUILIBRA Admin',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFF1C40F)),
        scaffoldBackgroundColor: const Color(0xFFF6F3EE),
      ),
      home: const AppointmentDashboardScreen(),
    );
  }
}

class AppointmentDashboardScreen extends StatefulWidget {
  const AppointmentDashboardScreen({super.key});

  @override
  State<AppointmentDashboardScreen> createState() => _AppointmentDashboardScreenState();
}

class _AppointmentDashboardScreenState extends State<AppointmentDashboardScreen> {
  List<Appointment> appointments = [];
  bool isLoading = false;
  String? statusMessage;
  Timer? pollingTimer;

  @override
  void initState() {
    super.initState();
    _loadAppointments();
    pollingTimer = Timer.periodic(const Duration(seconds: 15), (_) => _loadAppointments(showToast: false));
  }

  @override
  void dispose() {
    pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadAppointments({bool showToast = true}) async {
    setState(() {
      isLoading = true;
    });

    try {
      final response = await http.get(Uri.parse('$baseUrl/api/appointments'));
      if (response.statusCode != 200) {
        throw Exception('No se pudo cargar la lista de citas');
      }

      final decoded = jsonDecode(response.body) as List<dynamic>;
      final loaded = decoded.map((item) => Appointment.fromJson(item as Map<String, dynamic>)).toList();

      setState(() {
        appointments = loaded;
        isLoading = false;
        if (showToast && loaded.any((item) => item.status == 'pendiente')) {
          statusMessage = 'Hay citas pendientes por confirmar';
        }
      });
    } catch (error) {
      setState(() {
        isLoading = false;
        statusMessage = 'No se pudo conectar con el servidor';
      });
    }
  }

  Future<void> _updateAppointmentStatus(Appointment appointment, String newStatus) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/api/appointments/${appointment.id}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': newStatus}),
      );

      if (response.statusCode >= 400) {
        throw Exception('No se pudo actualizar la cita');
      }

      await _loadAppointments(showToast: false);
      setState(() {
        statusMessage = newStatus == 'confirmada'
            ? 'Cita confirmada correctamente'
            : 'Cita cancelada';
      });
    } catch (error) {
      setState(() {
        statusMessage = 'Error al cambiar el estado de la cita';
      });
    }
  }

  Future<void> _registerDeviceToken() async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/device-token'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'deviceToken': 'demo-device-token-admin'}),
      );

      if (response.statusCode == 200) {
        debugPrint('Token registrado correctamente');
      }
    } catch (_) {
      debugPrint('No se pudo registrar token del dispositivo');
    }
  }

  Future<void> _callTherapist() async {
    final uri = Uri.parse('tel:+584121234567');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pendingAppointments = appointments.where((item) => item.status == 'pendiente').toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('EQUILIBRA Admin'),
        centerTitle: true,
        backgroundColor: const Color(0xFFF1C40F),
        foregroundColor: Colors.black,
      ),
      body: RefreshIndicator(
        onRefresh: () => _loadAppointments(showToast: false),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (pendingAppointments.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF3C4),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE6B800)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.notifications_active, color: Colors.black87),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Hay ${pendingAppointments.length} cita(s) pendiente(s) por confirmar',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ),
            if (statusMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(statusMessage!),
              ),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Citas activas', style: TextStyle(fontSize: 14, color: Colors.black54)),
                          const SizedBox(height: 8),
                          Text(
                            '${appointments.length}',
                            style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w800),
                          ),
                        ],
                      ),
                    ),
                    FilledButton.tonal(
                      onPressed: _registerDeviceToken,
                      child: const Text('Registrar app'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),
            if (isLoading)
              const Center(child: CircularProgressIndicator())
            else if (appointments.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Text('No hay citas registradas aún.'),
                ),
              )
            else
              ...appointments.map((appointment) {
                final isPending = appointment.status == 'pendiente';
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                appointment.name,
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: isPending ? const Color(0xFFFFD54F) : const Color(0xFFB2DFDB),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                appointment.status,
                                style: const TextStyle(fontWeight: FontWeight.w700),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text('${appointment.service} · ${appointment.phone}'),
                        const SizedBox(height: 4),
                        Text('${appointment.date} · ${appointment.time}'),
                        const SizedBox(height: 12),
                        if (isPending)
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _updateAppointmentStatus(appointment, 'confirmada'),
                                  icon: const Icon(Icons.check),
                                  label: const Text('Confirmar'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () => _updateAppointmentStatus(appointment, 'cancelada'),
                                  icon: const Icon(Icons.close),
                                  label: const Text('Cancelar'),
                                ),
                              ),
                            ],
                          )
                        else
                          const Text('Cita ya gestionada', style: TextStyle(color: Colors.black54)),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _callTherapist,
        icon: const Icon(Icons.call),
        label: const Text('Fisioterapeuta'),
      ),
    );
  }
}

class Appointment {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String service;
  final String date;
  final String time;
  final String status;

  Appointment({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.service,
    required this.date,
    required this.time,
    required this.status,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    final date = (json['date'] ?? '').toString();
    final time = (json['time'] ?? '').toString();
    return Appointment(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? 'Sin nombre').toString(),
      phone: (json['phone'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      service: (json['service'] ?? '').toString(),
      date: date,
      time: time,
      status: (json['status'] ?? 'pendiente').toString(),
    );
  }

  String get formattedDate {
    if (date.isEmpty) return 'Fecha no disponible';
    final parsed = DateTime.tryParse(date);
    if (parsed == null) return date;
    return DateFormat('dd/MM/yyyy').format(parsed);
  }
}
