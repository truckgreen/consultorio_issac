package com.example.equilibra.data.model

enum class UserRole {
    SUPERADMIN,
    SPECIALIST
}

data class AuthUser(
    val id: String,
    val username: String,
    val name: String,
    val role: UserRole,
    val specialty: String,
    val email: String,
    val pin: String = "1234",
    val avatarUrl: String = "",
    val phone: String = "+58 424-2724617"
) {
    val isSuperAdmin: Boolean
        get() = role == UserRole.SUPERADMIN

    val initials: String
        get() {
            val parts = name.split(" ").filter { it.isNotBlank() && !it.startsWith("Lic.", ignoreCase = true) && !it.startsWith("Dr.", ignoreCase = true) && !it.startsWith("Dra.", ignoreCase = true) && !it.startsWith("Prof.", ignoreCase = true) && !it.startsWith("Tec.", ignoreCase = true) }
            return if (parts.size >= 2) {
                "${parts[0].take(1)}${parts[1].take(1)}".uppercase()
            } else if (parts.isNotEmpty()) {
                parts[0].take(2).uppercase()
            } else {
                name.take(2).uppercase()
            }
        }
}

object PredefinedUsers {
    val SUPERADMIN = AuthUser(
        id = "admin",
        username = "admin",
        name = "Dirección Médica (Superadmin)",
        role = UserRole.SUPERADMIN,
        specialty = "Superadministrador General & Dirección Clínica",
        email = "admin@equilibrave.com",
        pin = "8421",
        avatarUrl = ""
    )

    val SPECIALISTS: List<AuthUser> = listOf(
        SUPERADMIN,
        AuthUser(
            id = "isaac-jewsiejew",
            username = "isaac",
            name = "Lic. Isaac Jewsiejew",
            role = UserRole.SPECIALIST,
            specialty = "Fisioterapeuta Deportivo",
            email = "isaac.jewsiejew@equilibrave.com",
            pin = "3957"
        ),
        AuthUser(
            id = "marivid-requena",
            username = "marivid",
            name = "Lic. Marivid Requena",
            role = UserRole.SPECIALIST,
            specialty = "Fisioterapeuta Pediátrica",
            email = "marivid.requena@equilibrave.com",
            pin = "1208"
        ),
        AuthUser(
            id = "laury-torrealba",
            username = "laury",
            name = "Lic. Laury Torrealba",
            role = UserRole.SPECIALIST,
            specialty = "Fisioterapeuta Geriátrica",
            email = "laury.torrealba@equilibrave.com",
            pin = "7462"
        ),
        AuthUser(
            id = "stephani-salina",
            username = "stephani",
            name = "Lic. Stephani Salina",
            role = UserRole.SPECIALIST,
            specialty = "Nutricionista Clínica & Deportiva",
            email = "stephani.salina@equilibrave.com",
            pin = "5531"
        ),
        AuthUser(
            id = "ruben-torrealba",
            username = "ruben",
            name = "Dr. Rubén Torrealba",
            role = UserRole.SPECIALIST,
            specialty = "Médico Traumatólogo",
            email = "ruben.torrealba@equilibrave.com",
            pin = "2894"
        ),
        AuthUser(
            id = "cristina-flores",
            username = "cristina",
            name = "Lic. Cristina Flores",
            role = UserRole.SPECIALIST,
            specialty = "Psicóloga Clínica",
            email = "cristina.flores@equilibrave.com",
            pin = "6109"
        ),
        AuthUser(
            id = "indira-acevedo",
            username = "indira",
            name = "Prof. Indira Acevedo",
            role = UserRole.SPECIALIST,
            specialty = "Entrenadora de Boxeo Técnico",
            email = "indira.acevedo@equilibrave.com",
            pin = "4376"
        ),
        AuthUser(
            id = "gabriela-rodriguez",
            username = "gabriela",
            name = "Lic. Gabriela Rodríguez",
            role = UserRole.SPECIALIST,
            specialty = "Fisioterapeuta",
            email = "gabriela.rodriguez@equilibrave.com",
            pin = "9214"
        ),
        AuthUser(
            id = "kareinys-martinez",
            username = "kareinys",
            name = "Lic. Kareinys Martínez",
            role = UserRole.SPECIALIST,
            specialty = "Fisioterapeuta",
            email = "kareinys.martinez@equilibrave.com",
            pin = "3085"
        ),
        AuthUser(
            id = "rebecca-triana",
            username = "rebecca",
            name = "Tec. Rebecca Triana",
            role = UserRole.SPECIALIST,
            specialty = "Asistente de Fisioterapia",
            email = "rebecca.triana@equilibrave.com",
            pin = "1742"
        )
    )
}
