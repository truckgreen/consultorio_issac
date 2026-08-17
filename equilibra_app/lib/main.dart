import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

// URL del Backend: Detecta automáticamente si corre en Chrome / Web (localhost:3000) o Emulador Android (10.0.2.2:3000)
const String defaultBaseUrl = kIsWeb ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

void main() {
  runApp(const EquilibraAdminApp());
}

class EquilibraAdminApp extends StatelessWidget {
  const EquilibraAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EQUILIBRA | Panel Admin',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Arial',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
          primary: const Color(0xFF10B981),
          surface: Colors.white,
          background: const Color(0xFFF8FAFC),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F172A),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: const AdminHomeScreen(),
    );
  }
}

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String apiUrl = defaultBaseUrl;

  List<Appointment> _appointments = [];
  List<ServicePrice> _prices = [];
  bool _isLoading = false;
  String _searchQuery = '';
  String _selectedStatusFilter = 'all';
  String _selectedServiceFilter = 'all';
  Timer? _autoRefreshTimer;

  final List<String> _availableServices = [
    'Fisioterapia Deportiva',
    'Traumatología',
    'Psicología',
    'Nutrición',
    'Entrenamiento Funcional',
    'Boxeo'
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchAllData();
    // Auto-refresco periódico de datos en segundo plano
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 10), (_) => _fetchAllData(silent: true));
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchAllData({bool silent = false}) async {
    if (!silent) {
      setState(() => _isLoading = true);
    }

    try {
      final appointmentsFuture = _fetchAppointments();
      final pricesFuture = _fetchPrices();
      await Future.wait([appointmentsFuture, pricesFuture]);
    } catch (e) {
      debugPrint('Error sincronizando datos: $e');
    } finally {
      if (mounted && !silent) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _fetchAppointments() async {
    try {
      final response = await http
          .get(Uri.parse('$apiUrl/api/appointments'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final List<dynamic> list = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            _appointments = list.map((json) => Appointment.fromJson(json)).toList();
          });
        }
      }
    } catch (e) {
      debugPrint('Error en /api/appointments: $e');
    }
  }

  Future<void> _fetchPrices() async {
    try {
      final response = await http
          .get(Uri.parse('$apiUrl/api/prices'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final List<dynamic> list = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            _prices = list.map((json) => ServicePrice.fromJson(json)).toList();
          });
        }
      }
    } catch (e) {
      debugPrint('Error en /api/prices: $e');
    }
  }

  void _showToast(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: isError ? const Color(0xFFEF4444) : const Color(0xFF0F172A),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // Guardar o Editar Cita
  Future<void> _saveAppointment(Appointment appointment, {bool isEdit = false}) async {
    try {
      final url = isEdit
          ? '$apiUrl/api/appointments/${appointment.id}'
          : '$apiUrl/api/appointments';
      final method = isEdit ? http.put : http.post;

      final response = await method(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(appointment.toJson()),
      );

      if (response.statusCode < 400) {
        _showToast(isEdit ? '¡Cita actualizada con éxito!' : '¡Nueva cita registrada!');
        _fetchAllData(silent: true);
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      // Optimista local fallback
      setState(() {
        if (isEdit) {
          final index = _appointments.indexWhere((a) => a.id == appointment.id);
          if (index != -1) _appointments[index] = appointment;
        } else {
          _appointments.insert(0, appointment);
        }
      });
      _showToast(isEdit ? 'Cita actualizada localmente' : 'Cita guardada localmente');
    }
  }

  // Cambiar estado rápido
  Future<void> _updateStatus(Appointment appointment, String newStatus) async {
    try {
      final response = await http.patch(
        Uri.parse('$apiUrl/api/appointments/${appointment.id}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': newStatus}),
      );

      if (response.statusCode < 400) {
        _showToast(newStatus == 'confirmada' ? '¡Cita confirmada!' : 'Cita cancelada');
        _fetchAllData(silent: true);
      }
    } catch (e) {
      setState(() {
        final index = _appointments.indexWhere((a) => a.id == appointment.id);
        if (index != -1) {
          _appointments[index] = appointment.copyWith(status: newStatus);
        }
      });
      _showToast('Estado actualizado localmente');
    }
  }

  // Eliminar Cita
  Future<void> _deleteAppointment(String id) async {
    try {
      final response = await http.delete(Uri.parse('$apiUrl/api/appointments/$id'));
      if (response.statusCode < 400) {
        _showToast('Cita eliminada de la base de datos');
        _fetchAllData(silent: true);
      }
    } catch (e) {
      setState(() {
        _appointments.removeWhere((a) => a.id == id);
      });
      _showToast('Cita removida del registro');
    }
  }

  // Guardar Tarifa de Servicio
  Future<void> _savePrice(ServicePrice price) async {
    try {
      final response = await http.patch(
        Uri.parse('$apiUrl/api/prices/${price.id}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'price': price.price,
          'currency': price.currency,
          'duration': price.duration,
          'note': price.note,
        }),
      );

      if (response.statusCode < 400) {
        _showToast('Tarifa de ${price.service} actualizada');
        _fetchPrices();
      }
    } catch (e) {
      setState(() {
        final index = _prices.indexWhere((p) => p.id == price.id);
        if (index != -1) _prices[index] = price;
      });
      _showToast('Tarifa actualizada localmente');
    }
  }

  // Diálogo para Agregar / Editar Cita
  void _openAppointmentFormDialog([Appointment? existing]) {
    final isEdit = existing != null;
    final nameCtrl = TextEditingController(text: existing?.name ?? '');
    final phoneCtrl = TextEditingController(text: existing?.phone ?? '');
    final emailCtrl = TextEditingController(text: existing?.email ?? '');
    String selectedService = existing?.service ?? _availableServices.first;
    String selectedStatus = existing?.status ?? 'pendiente';
    DateTime selectedDate = existing != null && existing.date.isNotEmpty
        ? (DateTime.tryParse(existing.date) ?? DateTime.now())
        : DateTime.now().add(const Duration(days: 1));
    String selectedTime = existing?.time ?? '09:00';

    final List<String> times = [
      '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '12:00',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.edit_calendar, color: Color(0xFF10B981)),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    isEdit ? 'Editar Cita Médica' : 'Nueva Cita Manual',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              content: SizedBox(
                width: 480,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: nameCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Nombre del Paciente *',
                          prefixIcon: Icon(Icons.person_outline),
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: phoneCtrl,
                        keyboardType: TextInputType.phone,
                        decoration: const InputDecoration(
                          labelText: 'Teléfono de Contacto *',
                          prefixIcon: Icon(Icons.phone_outlined),
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Correo Electrónico',
                          prefixIcon: Icon(Icons.email_outlined),
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _availableServices.contains(selectedService) ? selectedService : _availableServices.first,
                        decoration: const InputDecoration(
                          labelText: 'Servicio / Especialidad *',
                          prefixIcon: Icon(Icons.medical_services_outlined),
                          border: OutlineInputBorder(),
                        ),
                        items: _availableServices.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                        onChanged: (val) {
                          if (val != null) setDialogState(() => selectedService = val);
                        },
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: InkWell(
                              onTap: () async {
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: selectedDate,
                                  firstDate: DateTime.now().subtract(const Duration(days: 30)),
                                  lastDate: DateTime.now().add(const Duration(days: 365)),
                                );
                                if (picked != null) {
                                  setDialogState(() => selectedDate = picked);
                                }
                              },
                              child: InputDecorator(
                                decoration: const InputDecoration(
                                  labelText: 'Fecha *',
                                  prefixIcon: Icon(Icons.calendar_today),
                                  border: OutlineInputBorder(),
                                ),
                                child: Text(DateFormat('yyyy-MM-dd').format(selectedDate)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: times.contains(selectedTime) ? selectedTime : times[1],
                              decoration: const InputDecoration(
                                labelText: 'Hora *',
                                prefixIcon: Icon(Icons.access_time),
                                border: OutlineInputBorder(),
                              ),
                              items: times.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                              onChanged: (val) {
                                if (val != null) setDialogState(() => selectedTime = val);
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: selectedStatus,
                        decoration: const InputDecoration(
                          labelText: 'Estado de la Cita',
                          prefixIcon: Icon(Icons.flag_outlined),
                          border: OutlineInputBorder(),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'pendiente', child: Text('Pendiente')),
                          DropdownMenuItem(value: 'confirmada', child: Text('Confirmada')),
                          DropdownMenuItem(value: 'cancelada', child: Text('Cancelada')),
                        ],
                        onChanged: (val) {
                          if (val != null) setDialogState(() => selectedStatus = val);
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancelar', style: TextStyle(color: Color(0xFF64748B))),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () {
                    final name = nameCtrl.text.trim();
                    final phone = phoneCtrl.text.trim();
                    if (name.isEmpty || phone.isEmpty) {
                      _showToast('Por favor completa el nombre y teléfono.', isError: true);
                      return;
                    }

                    final apt = Appointment(
                      id: existing?.id ?? 'apt-${DateTime.now().millisecondsSinceEpoch}',
                      name: name,
                      phone: phone,
                      email: emailCtrl.text.trim().isNotEmpty ? emailCtrl.text.trim() : '$name@ejemplo.com',
                      service: selectedService,
                      date: DateFormat('yyyy-MM-dd').format(selectedDate),
                      time: selectedTime,
                      status: selectedStatus,
                    );

                    Navigator.pop(context);
                    _saveAppointment(apt, isEdit: isEdit);
                  },
                  child: Text(isEdit ? 'Actualizar Cita' : 'Guardar Cita'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // Diálogo de Confirmación para Eliminar Cita
  void _confirmDeleteDialog(Appointment appointment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 28),
            SizedBox(width: 10),
            Text('¿Eliminar Cita?', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          ],
        ),
        content: Text(
          '¿Estás seguro de eliminar permanentemente la cita de ${appointment.name} (${appointment.service} - ${appointment.date} ${appointment.time})?\nEsta acción no se puede deshacer.',
          style: const TextStyle(color: Color(0xFF475569)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(context);
              _deleteAppointment(appointment.id);
            },
            child: const Text('Sí, Eliminar'),
          ),
        ],
      ),
    );
  }

  // Diálogo para Editar Tarifa de Precio
  void _openPriceEditDialog(ServicePrice price) {
    final priceCtrl = TextEditingController(text: price.price.toString());
    final currencyCtrl = TextEditingController(text: price.currency);
    final durationCtrl = TextEditingController(text: price.duration);
    final noteCtrl = TextEditingController(text: price.note);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.price_change, color: Color(0xFF10B981)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Tarifa: ${price.service}',
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
            ),
          ],
        ),
        content: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Expanded(
                    flex: 1,
                    child: TextField(
                      controller: currencyCtrl,
                      decoration: const InputDecoration(labelText: 'Moneda', border: OutlineInputBorder()),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: TextField(
                      controller: priceCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Precio *', border: OutlineInputBorder()),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: durationCtrl,
                decoration: const InputDecoration(labelText: 'Duración (ej. 50 min)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: noteCtrl,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Descripción / Nota clínica', border: OutlineInputBorder()),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              final newP = double.tryParse(priceCtrl.text) ?? price.price;
              final updated = price.copyWith(
                price: newP,
                currency: currencyCtrl.text.trim().isNotEmpty ? currencyCtrl.text.trim() : '\$',
                duration: durationCtrl.text.trim(),
                note: noteCtrl.text.trim(),
              );
              Navigator.pop(context);
              _savePrice(updated);
            },
            child: const Text('Guardar Tarifa'),
          ),
        ],
      ),
    );
  }

  // Filtrado de citas
  List<Appointment> get _filteredAppointments {
    return _appointments.where((apt) {
      final matchesQuery = _searchQuery.isEmpty ||
          apt.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          apt.phone.contains(_searchQuery) ||
          apt.service.toLowerCase().contains(_searchQuery.toLowerCase());

      final matchesStatus = _selectedStatusFilter == 'all' || apt.status == _selectedStatusFilter;
      final matchesService = _selectedServiceFilter == 'all' || apt.service == _selectedServiceFilter;

      return matchesQuery && matchesStatus && matchesService;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final totalCount = _appointments.length;
    final confirmedCount = _appointments.where((a) => a.status == 'confirmada').length;
    final pendingCount = _appointments.where((a) => a.status == 'pendiente').length;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'E',
                style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 18),
              ),
            ),
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'EQUILIBRA',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, letterSpacing: 1.1),
                ),
                Text(
                  'Panel Administrativo Móvil',
                  style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Sincronizar con Base de Datos',
            onPressed: () => _fetchAllData(),
          ),
          const SizedBox(width: 8),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF10B981),
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: const Color(0xFF94A3B8),
          tabs: const [
            Tab(icon: Icon(Icons.calendar_month, size: 20), text: 'Citas Médicas'),
            Tab(icon: Icon(Icons.attach_money, size: 20), text: 'Tarifas y Servicios'),
          ],
        ),
      ),
      body: _isLoading && _appointments.isEmpty
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildAppointmentsTab(totalCount, confirmedCount, pendingCount),
                _buildPricesTab(),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.white,
        onPressed: () => _openAppointmentFormDialog(),
        icon: const Icon(Icons.add),
        label: const Text('Nueva Cita', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }

  // ==========================================
  // PESTAÑA 1: GESTIÓN DE CITAS (BENTO THEME)
  // ==========================================
  Widget _buildAppointmentsTab(int total, int confirmed, int pending) {
    final filtered = _filteredAppointments;

    return RefreshIndicator(
      color: const Color(0xFF10B981),
      onRefresh: () => _fetchAllData(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Bento Grid de Estadísticas
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 600;
              return GridView.count(
                crossAxisCount: isWide ? 4 : 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: isWide ? 2.2 : 1.6,
                children: [
                  _buildStatCard('Total Citas', '$total', const Color(0xFF0F172A), Icons.calendar_today),
                  _buildStatCard('Confirmadas', '$confirmed', const Color(0xFF10B981), Icons.check_circle_outline),
                  _buildStatCard('Pendientes', '$pending', const Color(0xFFF59E0B), Icons.hourglass_top),
                  _buildStatCard('Sincronización', 'Online', const Color(0xFF3B82F6), Icons.cloud_done_outlined),
                ],
              );
            },
          ),
          const SizedBox(height: 16),

          // Filtros y Buscador
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                children: [
                  TextField(
                    decoration: InputDecoration(
                      hintText: 'Buscar por paciente, teléfono o servicio...',
                      prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B)),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () => setState(() => _searchQuery = ''),
                            )
                          : null,
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                    ),
                    onChanged: (val) => setState(() => _searchQuery = val),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedStatusFilter,
                          decoration: InputDecoration(
                            labelText: 'Estado',
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'all', child: Text('Todos los estados')),
                            DropdownMenuItem(value: 'confirmada', child: Text('Confirmadas')),
                            DropdownMenuItem(value: 'pendiente', child: Text('Pendientes')),
                            DropdownMenuItem(value: 'cancelada', child: Text('Canceladas')),
                          ],
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedStatusFilter = val);
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedServiceFilter,
                          decoration: InputDecoration(
                            labelText: 'Servicio',
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          items: [
                            const DropdownMenuItem(value: 'all', child: Text('Todos los servicios')),
                            ..._availableServices.map((s) => DropdownMenuItem(value: s, child: Text(s))),
                          ],
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedServiceFilter = val);
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Lista de Citas Médicas
          if (filtered.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 48),
                child: Column(
                  children: [
                    Icon(Icons.event_busy, size: 56, color: Colors.grey.shade400),
                    const SizedBox(height: 12),
                    const Text(
                      'No se encontraron citas registradas.',
                      style: TextStyle(fontSize: 16, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            )
          else
            ...filtered.map((apt) => _buildAppointmentCard(apt)),
          const SizedBox(height: 70), // Espacio para el FAB
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color, IconData icon) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    label,
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    value,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentCard(Appointment apt) {
    final isConfirmed = apt.status == 'confirmada';
    final isPending = apt.status == 'pendiente';

    Color badgeBg = const Color(0xFFF1F5F9);
    Color badgeColor = const Color(0xFF475569);
    if (isConfirmed) {
      badgeBg = const Color(0xFFD1FAE5);
      badgeColor = const Color(0xFF065F46);
    } else if (isPending) {
      badgeBg = const Color(0xFFFEF3C7);
      badgeColor = const Color(0xFF92400E);
    } else if (apt.status == 'cancelada') {
      badgeBg = const Color(0xFFFEE2E2);
      badgeColor = const Color(0xFF991B1B);
    }

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const CircleAvatar(
                        radius: 18,
                        backgroundColor: Color(0xFF0F172A),
                        child: Icon(Icons.person, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              apt.name,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                            Text(
                              apt.service,
                              style: const TextStyle(fontSize: 13, color: Color(0xFF10B981), fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    apt.status.toUpperCase(),
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: badgeColor),
                  ),
                ),
              ],
            ),
            const Divider(height: 24, color: Color(0xFFF1F5F9)),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 15, color: Color(0xFF64748B)),
                const SizedBox(width: 6),
                Text(apt.formattedDate, style: const TextStyle(fontSize: 13, color: Color(0xFF334155))),
                const SizedBox(width: 16),
                const Icon(Icons.access_time, size: 15, color: Color(0xFF64748B)),
                const SizedBox(width: 6),
                Text(apt.time, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                const SizedBox(width: 16),
                const Icon(Icons.phone, size: 15, color: Color(0xFF64748B)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    apt.phone,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (isPending) ...[
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () => _updateStatus(apt, 'confirmada'),
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Confirmar'),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFEF4444),
                      side: const BorderSide(color: Color(0xFFFCA5A5)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () => _updateStatus(apt, 'cancelada'),
                    icon: const Icon(Icons.close, size: 16),
                    label: const Text('Cancelar'),
                  ),
                  const SizedBox(width: 8),
                ],
                IconButton(
                  icon: const Icon(Icons.edit_outlined, color: Color(0xFF3B82F6), size: 20),
                  tooltip: 'Editar Cita',
                  onPressed: () => _openAppointmentFormDialog(apt),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 20),
                  tooltip: 'Eliminar Registro',
                  onPressed: () => _confirmDeleteDialog(apt),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // PESTAÑA 2: GESTIÓN DE PRECIOS & SERVICIOS
  // ==========================================
  Widget _buildPricesTab() {
    final List<ServicePrice> defaultFallbackPrices = [
      ServicePrice(id: '1', service: 'Fisioterapia Deportiva', price: 45, currency: '\$', duration: '50 min', note: 'Evaluación física y rehabilitación funcional'),
      ServicePrice(id: '2', service: 'Traumatología', price: 50, currency: '\$', duration: '45 min', note: 'Diagnóstico articular y musculoesquelético'),
      ServicePrice(id: '3', service: 'Psicología', price: 40, currency: '\$', duration: '50 min', note: 'Acompañamiento emocional y hábitos'),
      ServicePrice(id: '4', service: 'Nutrición', price: 35, currency: '\$', duration: '45 min', note: 'Plan personalizado y composición corporal'),
      ServicePrice(id: '5', service: 'Entrenamiento Funcional', price: 30, currency: '\$', duration: '60 min', note: 'Fuerza, estabilidad y movilidad'),
      ServicePrice(id: '6', service: 'Boxeo', price: 25, currency: '\$', duration: '60 min', note: 'Acondicionamiento físico y técnica'),
    ];

    final displayPrices = _prices.isNotEmpty ? _prices : defaultFallbackPrices;

    return RefreshIndicator(
      color: const Color(0xFF10B981),
      onRefresh: () => _fetchPrices(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              children: [
                Icon(Icons.sync_alt, color: Color(0xFF10B981), size: 28),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tarifas Sincronizadas en Tiempo Real',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      Text(
                        'Los cambios editados aquí se actualizan inmediatamente en la base de datos, en la web y en el asistente virtual bot.',
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ...displayPrices.map((price) => _buildPriceCard(price)),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildPriceCard(ServicePrice price) {
    // Mapeo de imagen por servicio
    String imageName = 'fisioterapia deportiva.jpg';
    IconData serviceIcon = Icons.fitness_center;

    final sLower = price.service.toLowerCase();
    if (sLower.contains('trauma')) {
      imageName = 'traumatologia.jpg';
      serviceIcon = Icons.healing;
    } else if (sLower.contains('psico')) {
      imageName = 'psicologia.jpg';
      serviceIcon = Icons.psychology;
    } else if (sLower.contains('nutri')) {
      imageName = 'nutricion.jpg';
      serviceIcon = Icons.restaurant_menu;
    } else if (sLower.contains('entrena') || sLower.contains('funcional')) {
      imageName = 'entrenamiento-funcional.jpg';
      serviceIcon = Icons.sports_gymnastics;
    } else if (sLower.contains('box')) {
      imageName = 'boxeo.jpg';
      serviceIcon = Icons.sports_mma;
    }

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      color: Colors.white,
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cabecera con Imagen del Servicio
          SizedBox(
            height: 120,
            width: double.infinity,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.network(
                  '$apiUrl/assets/images/$imageName',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Image.asset(
                      'assets/images/$imageName',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: const Color(0xFF0F172A),
                          child: Center(
                            child: Icon(serviceIcon, color: const Color(0xFF10B981), size: 48),
                          ),
                        );
                      },
                    );
                  },
                ),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.black.withOpacity(0.7), Colors.transparent],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 12,
                  left: 16,
                  right: 16,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        price.service,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          shadows: [Shadow(color: Colors.black, blurRadius: 4)],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${price.currency}${price.price.toStringAsFixed(0)}',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.timer_outlined, size: 16, color: Color(0xFF64748B)),
                    const SizedBox(width: 6),
                    Text(
                      'Duración: ${price.duration}',
                      style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  price.note.isNotEmpty ? price.note : 'Atención especializada integral.',
                  style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () => _openPriceEditDialog(price),
                      icon: const Icon(Icons.edit, size: 16),
                      label: const Text('Modificar Precio'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ==========================================
// MODELOS DE DATOS
// ==========================================
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
    return Appointment(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? 'Sin nombre').toString(),
      phone: (json['phone'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      service: (json['service'] ?? 'General').toString(),
      date: (json['date'] ?? '').toString(),
      time: (json['time'] ?? '09:00').toString(),
      status: (json['status'] ?? 'pendiente').toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'phone': phone,
        'email': email,
        'service': service,
        'date': date,
        'time': time,
        'status': status,
      };

  Appointment copyWith({
    String? id,
    String? name,
    String? phone,
    String? email,
    String? service,
    String? date,
    String? time,
    String? status,
  }) {
    return Appointment(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      service: service ?? this.service,
      date: date ?? this.date,
      time: time ?? this.time,
      status: status ?? this.status,
    );
  }

  String get formattedDate {
    if (date.isEmpty) return 'Fecha no especificada';
    final parsed = DateTime.tryParse(date);
    if (parsed == null) return date;
    return DateFormat('dd/MM/yyyy').format(parsed);
  }
}

class ServicePrice {
  final String id;
  final String service;
  final double price;
  final String currency;
  final String duration;
  final String note;

  ServicePrice({
    required this.id,
    required this.service,
    required this.price,
    required this.currency,
    required this.duration,
    required this.note,
  });

  factory ServicePrice.fromJson(Map<String, dynamic> json) {
    return ServicePrice(
      id: (json['id'] ?? '').toString(),
      service: (json['service'] ?? '').toString(),
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : double.tryParse(json['price'].toString()) ?? 0.0,
      currency: (json['currency'] ?? '\$').toString(),
      duration: (json['duration'] ?? '50 min').toString(),
      note: (json['note'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'service': service,
        'price': price,
        'currency': currency,
        'duration': duration,
        'note': note,
      };

  ServicePrice copyWith({
    String? id,
    String? service,
    double? price,
    String? currency,
    String? duration,
    String? note,
  }) {
    return ServicePrice(
      id: id ?? this.id,
      service: service ?? this.service,
      price: price ?? this.price,
      currency: currency ?? this.currency,
      duration: duration ?? this.duration,
      note: note ?? this.note,
    );
  }
}
