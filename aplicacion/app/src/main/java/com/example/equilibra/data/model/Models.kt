package com.example.equilibra.data.model

data class ServiceItem(
    val id: String,
    val title: String,
    val category: String, // "fisioterapia", "medicina", "movimiento", "bienestar"
    val shortDescription: String,
    val fullDescription: String,
    val imageUrl: String,
    val benefits: List<String>,
    val duration: String,
    val price: Int,
    val priceFormatted: String,
    val packageOption: String? = null,
    val priceNote: String? = null,
    val targetAudience: List<String>,
    val methodology: String
)

data class SpecialtyItem(
    val id: String,
    val title: String,
    val description: String,
    val iconName: String,
    val highlights: List<String>,
    val subSpecialties: List<String>
)

data class TeamMember(
    val id: String,
    val name: String,
    val role: String,
    val specialty: String,
    val category: String, // "fisioterapia", "medicina", "nutricion", "psicologia", "entrenamiento", "asistencia"
    val imageUrl: String,
    val credentials: String,
    val bio: String,
    val relatedServiceId: String? = null
)

data class TestimonialItem(
    val id: String,
    val name: String,
    val role: String,
    val review: String,
    val rating: Int,
    val serviceReceived: String,
    val avatarUrl: String,
    val date: String
)

data class FaqItem(
    val category: String,
    val question: String,
    val answer: String
)

data class WhyUsItem(
    val id: String,
    val title: String,
    val description: String,
    val badge: String,
    val iconName: String
)

enum class SlotStatus {
    DISPONIBLE,
    POR_CONFIRMAR,
    OCUPADO
}

data class TimeSlotInfo(
    val time: String,
    val status: SlotStatus,
    val notes: String
)

enum class AdminNavTab {
    DASHBOARD,
    CITAS,
    PACIENTES,
    STAFF,
    SERVICIOS,
    MENSAJES,
    CONFIGURACION
}

data class AdminNotification(
    val id: String,
    val title: String,
    val message: String,
    val timestamp: String,
    val read: Boolean = false,
    val type: String = "appointment"
)

data class ContactLead(
    val id: String,
    val name: String,
    val phone: String,
    val email: String,
    val serviceInterested: String,
    val message: String,
    val date: String,
    val status: String = "NUEVO", // NUEVO, RESPONDIDO, ARCHIVADO
    val adminNotes: String = ""
)
