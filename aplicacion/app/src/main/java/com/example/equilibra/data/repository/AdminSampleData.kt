package com.example.equilibra.data.repository

import com.example.equilibra.data.local.AppointmentEntity
import com.example.equilibra.data.model.AdminNotification
import com.example.equilibra.data.model.ContactLead
import java.time.LocalDate
import java.time.format.DateTimeFormatter

object AdminSampleData {

    private val today: LocalDate = LocalDate.now()
    private val formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE

    val INITIAL_APPOINTMENTS: List<AppointmentEntity> = listOf(
        AppointmentEntity(
            id = "app_1",
            code = "EQ-8901",
            serviceId = "fisioterapia-deportiva",
            serviceTitle = "Fisioterapia Deportiva",
            servicePrice = "$40",
            nombre = "Carlos",
            apellido = "Mendoza",
            telefono = "+58 414 123.45.67",
            email = "carlos.mendoza@gmail.com",
            fecha = today.format(formatter),
            hora = "08:30 AM",
            motivoConsulta = "Rehabilitación de desgarro en isquiotibial derecho (Fase 2 de readaptación).",
            primeraVisita = false,
            createdAt = System.currentTimeMillis() - 86400000 * 2,
            status = "confirmada",
            specialistName = "Isaac Jewsiejew",
            amount = 40.0,
            notes = "Paciente atleta, excelente evolución de arcos de movimiento."
        ),
        AppointmentEntity(
            id = "app_2",
            code = "EQ-8902",
            serviceId = "traumatologia",
            serviceTitle = "Traumatología y Ortopedia",
            servicePrice = "$50",
            nombre = "María Elena",
            apellido = "Gómez",
            telefono = "+58 412 987.65.43",
            email = "maria.gomez@hotmail.com",
            fecha = today.format(formatter),
            hora = "10:00 AM",
            motivoConsulta = "Dolor lumbar agudo irradiado a pierna izquierda (posible lumbociática).",
            primeraVisita = true,
            createdAt = System.currentTimeMillis() - 86400000 * 1,
            status = "en_curso",
            specialistName = "Dr. Rubén Torrealba",
            amount = 50.0,
            notes = "Traer radiografías lumbosacras previas."
        ),
        AppointmentEntity(
            id = "app_3",
            code = "EQ-8903",
            serviceId = "fisioterapia-pediatrica",
            serviceTitle = "Fisioterapia Pediátrica",
            servicePrice = "$35",
            nombre = "Sofía (Mamá: Andrea)",
            apellido = "Rodríguez",
            telefono = "+58 424 555.78.90",
            email = "andrea.rodriguez@gmail.com",
            fecha = today.format(formatter),
            hora = "11:30 AM",
            motivoConsulta = "Evaluación de marcha y postura por pie plano en niña de 6 años.",
            primeraVisita = false,
            createdAt = System.currentTimeMillis() - 86400000 * 3,
            status = "confirmada",
            specialistName = "Marivid Requena",
            amount = 35.0,
            notes = "Seguimiento de ejercicios de propiocepción plantar."
        ),
        AppointmentEntity(
            id = "app_4",
            code = "EQ-8904",
            serviceId = "nutricion",
            serviceTitle = "Nutrición Clínica y Deportiva",
            servicePrice = "$35",
            nombre = "Andrés",
            apellido = "Castillo",
            telefono = "+58 416 333.22.11",
            email = "andres.castillo@yahoo.com",
            fecha = today.format(formatter),
            hora = "02:00 PM",
            motivoConsulta = "Plan nutricional antiinflamatorio y recomposición corporal.",
            primeraVisita = false,
            createdAt = System.currentTimeMillis() - 86400000 * 4,
            status = "confirmada",
            specialistName = "Stephani Salina",
            amount = 35.0,
            notes = "Control mensual de bioimpedancia."
        ),
        AppointmentEntity(
            id = "app_5",
            code = "EQ-8905",
            serviceId = "fisioterapia-geriatrica",
            serviceTitle = "Fisioterapia Geriátrica",
            servicePrice = "$30",
            nombre = "Carmen",
            apellido = "Morales (72 años)",
            telefono = "+58 414 444.88.99",
            email = "familia.morales@gmail.com",
            fecha = today.format(formatter),
            hora = "03:30 PM",
            motivoConsulta = "Mantenimiento funcional, fortalecimiento de cuádriceps y equilibrio postural.",
            primeraVisita = false,
            createdAt = System.currentTimeMillis() - 86400000 * 5,
            status = "confirmada",
            specialistName = "Laury Torrealba",
            amount = 30.0,
            notes = "Sesión 4 del Pack Geriátrico."
        ),
        AppointmentEntity(
            id = "app_6",
            code = "EQ-8906",
            serviceId = "boxeo",
            serviceTitle = "Boxeo & Acondicionamiento",
            servicePrice = "$25",
            nombre = "Diego",
            apellido = "Paredes",
            telefono = "+58 424 777.66.55",
            email = "diego.paredes@gmail.com",
            fecha = today.plusDays(1).format(formatter),
            hora = "09:00 AM",
            motivoConsulta = "Entrenamiento técnico y descarga de estrés.",
            primeraVisita = false,
            createdAt = System.currentTimeMillis() - 86400000 * 1,
            status = "confirmada",
            specialistName = "Indira Acevedo",
            amount = 25.0,
            notes = "Uso de vendas propias."
        ),
        AppointmentEntity(
            id = "app_7",
            code = "EQ-8907",
            serviceId = "psicologia",
            serviceTitle = "Psicología Clínica",
            servicePrice = "$40",
            nombre = "Valeria",
            apellido = "Navarro",
            telefono = "+58 412 111.44.33",
            email = "valeria.navarro@outlook.com",
            fecha = today.plusDays(1).format(formatter),
            hora = "11:00 AM",
            motivoConsulta = "Gestión de ansiedad y adherencia al tratamiento físico.",
            primeraVisita = true,
            createdAt = System.currentTimeMillis() - 86400000 * 2,
            status = "confirmada",
            specialistName = "Cristina Flores",
            amount = 40.0,
            notes = "Primera consulta de abordaje integral."
        ),
        AppointmentEntity(
            id = "app_8",
            code = "EQ-8908",
            serviceId = "entrenamiento-funcional",
            serviceTitle = "Entrenamiento Funcional",
            servicePrice = "$25",
            nombre = "Gabriel",
            apellido = "Vargas",
            telefono = "+58 414 888.11.22",
            email = "gabriel.vargas@gmail.com",
            fecha = today.plusDays(2).format(formatter),
            hora = "04:00 PM",
            motivoConsulta = "Fortalecimiento de core y readaptación de columna.",
            primeraVisita = false,
            createdAt = System.currentTimeMillis() - 86400000 * 6,
            status = "confirmada",
            specialistName = "Juan Alzualde",
            amount = 25.0,
            notes = "Circuito de fuerza controlada."
        ),
        AppointmentEntity(
            id = "app_9",
            code = "EQ-8890",
            serviceId = "fisioterapia",
            serviceTitle = "Fisioterapia Manual",
            servicePrice = "$35",
            nombre = "Carlos",
            apellido = "Mendoza",
            telefono = "+58 414 123.45.67",
            email = "carlos.mendoza@gmail.com",
            fecha = today.minusDays(3).format(formatter),
            hora = "09:00 AM",
            motivoConsulta = "Sesión 1: Terapia manual y punción seca.",
            primeraVisita = false,
            createdAt = System.currentTimeMillis() - 86400000 * 7,
            status = "completada",
            specialistName = "Isaac Jewsiejew",
            amount = 35.0,
            notes = "Excelente respuesta al tratamiento."
        ),
        AppointmentEntity(
            id = "app_10",
            code = "EQ-8885",
            serviceId = "traumatologia",
            serviceTitle = "Traumatología y Ortopedia",
            servicePrice = "$50",
            nombre = "Patricia",
            apellido = "Herrera",
            telefono = "+58 416 999.00.11",
            email = "patricia.herrera@gmail.com",
            fecha = today.minusDays(5).format(formatter),
            hora = "10:30 AM",
            motivoConsulta = "Evaluación de hombro doloroso post-caída.",
            primeraVisita = true,
            createdAt = System.currentTimeMillis() - 86400000 * 10,
            status = "completada",
            specialistName = "Dr. Rubén Torrealba",
            amount = 50.0,
            notes = "Indicación de 10 sesiones de fisioterapia."
        )
    )

    val INITIAL_LEADS: List<ContactLead> = listOf(
        ContactLead(
            id = "lead_1",
            name = "Mariana Silva",
            phone = "+58 414 908.12.34",
            email = "mariana.silva@gmail.com",
            serviceInterested = "Fisioterapia Pediátrica",
            message = "Hola, quisiera saber si tienen disponibilidad los sábados en la mañana para mi hijo de 4 años.",
            date = "Hoy, 09:15 AM",
            status = "NUEVO",
            adminNotes = ""
        ),
        ContactLead(
            id = "lead_2",
            name = "Roberto Alvarado",
            phone = "+58 412 345.67.89",
            email = "roberto.alvarado@hotmail.com",
            serviceInterested = "Traumatología",
            message = "Buenas tardes, ¿atienden con seguro médico o emiten factura para reembolso de la consulta médica?",
            date = "Ayer, 04:30 PM",
            status = "RESPONDIDO",
            adminNotes = "Se le indicó que emitimos factura fiscal para reembolso de seguros."
        ),
        ContactLead(
            id = "lead_3",
            name = "Elena Briceño",
            phone = "+58 424 812.45.60",
            email = "elena.briceno@yahoo.com",
            serviceInterested = "Fisioterapia Geriátrica",
            message = "Quisiera información sobre el costo del pack de sesiones para mi mamá de 78 años en Sabana Grande.",
            date = "20 Ago, 11:00 AM",
            status = "NUEVO",
            adminNotes = ""
        )
    )

    val INITIAL_NOTIFICATIONS: List<AdminNotification> = listOf(
        AdminNotification(
            id = "notif_1",
            title = "Cita en Curso",
            message = "Dr. Rubén Torrealba atendiendo a María Elena Gómez (Traumatología).",
            timestamp = "Hace 10 min",
            read = false,
            type = "appointment"
        ),
        AdminNotification(
            id = "notif_2",
            title = "Nueva Consulta Web",
            message = "Mariana Silva consultó por Fisioterapia Pediátrica para los sábados.",
            timestamp = "Hace 45 min",
            read = false,
            type = "lead"
        ),
        AdminNotification(
            id = "notif_3",
            title = "Confirmación de Turno",
            message = "Carlos Mendoza confirmó asistencia para las 08:30 AM.",
            timestamp = "Hace 2 horas",
            read = true,
            type = "appointment"
        )
    )
}
