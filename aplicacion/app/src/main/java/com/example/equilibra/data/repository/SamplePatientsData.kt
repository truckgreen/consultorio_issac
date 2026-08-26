package com.example.equilibra.data.repository

import com.example.equilibra.data.local.PatientEntity
import com.example.equilibra.data.model.MedicalRecordDocument
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

object SamplePatientsData {

    val INITIAL_PATIENTS: List<PatientEntity> = listOf(
        PatientEntity(
            id = "pat_001",
            nombre = "Carlos",
            apellido = "Balladares",
            cedula = "V-18.452.910",
            fechaNacimiento = "1988-06-14",
            genero = "Masculino",
            telefono = "+58 414-3329011",
            email = "carlos.balladares@gmail.com",
            direccion = "Caracas, El Cafetal, Av. Principal",
            ocupacion = "Economista / Corredor Maratón",
            tipoSangre = "O+",
            alergias = "Penicilina",
            antecedentes = "Desgarro miofascial previo en gemelo interno izquierdo (2022).",
            medicamentos = "Colágeno hidrolizado, Magnesio 400mg",
            diagnosticoPrincipal = "Rotura fibrilar grado II en bíceps femoral derecho en fase de readaptación.",
            contactoEmergenciaNombre = "Patricia Balladares (Esposa)",
            contactoEmergenciaTelefono = "+58 412-9901122",
            notasFisioterapia = "Evolución favorable con terapia de alta frecuencia y punción seca. Se autoriza trote continuo a baja intensidad.",
            createdAt = System.currentTimeMillis() - 25 * 86400000L,
            documentsJson = Json.encodeToString(
                listOf(
                    MedicalRecordDocument(
                        id = "doc_carlos_01",
                        patientId = "pat_001",
                        title = "Resonancia Magnética Muslo Derecho",
                        category = "resonancia",
                        fileName = "RMN_Muslo_Derecho_CBalladares.pdf",
                        fileSize = "2.4 MB",
                        uploadDate = "2026-08-05",
                        doctorName = "Dr. Rubén Torrealba",
                        notes = "Imagen confirma cicatrización fibrosa al 85% en vientre muscular de bíceps femoral."
                    ),
                    MedicalRecordDocument(
                        id = "doc_carlos_02",
                        patientId = "pat_001",
                        title = "Protocolo de Retorno a Campo Deportivo",
                        category = "informe",
                        fileName = "Plan_Readaptacion_Deportiva.pdf",
                        fileSize = "1.1 MB",
                        uploadDate = "2026-08-18",
                        doctorName = "Lic. Isaac Jewsiejew",
                        notes = "Fase 3: Transferencia a carreras fraccionadas y pliometría controlada."
                    )
                )
            )
        ),
        PatientEntity(
            id = "pat_002",
            nombre = "Elvira",
            apellido = "Montana",
            cedula = "V-14.882.311",
            fechaNacimiento = "1979-11-23",
            genero = "Femenino",
            telefono = "+58 424-1188334",
            email = "elvira.montana@outlook.com",
            direccion = "Caracas, Los Palos Grandes, 3ra Avenida",
            ocupacion = "Abogada Corporativa",
            tipoSangre = "A+",
            alergias = "Ninguna conocida",
            antecedentes = "Cesárea (2015). Sedentarismo laboral prolongado.",
            medicamentos = "Complejo B, Ibuprofeno ocasional",
            diagnosticoPrincipal = "Lumbalgia mecánica postural crónica con protrusión discal L4-L5 sin radiculopatía aguda.",
            contactoEmergenciaNombre = "Manuel Montana (Hermano)",
            contactoEmergenciaTelefono = "+58 414-2200445",
            notasFisioterapia = "Trabajo intensivo en descompresión axial, fortalecimiento del transverso abdominal y ergonomía de puesto de trabajo.",
            createdAt = System.currentTimeMillis() - 40 * 86400000L,
            documentsJson = Json.encodeToString(
                listOf(
                    MedicalRecordDocument(
                        id = "doc_elvira_01",
                        patientId = "pat_002",
                        title = "Informe Traumatológico de Columna",
                        category = "informe",
                        fileName = "Informe_Traumatologia_Columna_EMontana.pdf",
                        fileSize = "1.8 MB",
                        uploadDate = "2026-07-28",
                        doctorName = "Dr. Rubén Torrealba",
                        notes = "Se descarta compromiso neurológico compresivo. Indicación formal de fisioterapia activa."
                    )
                )
            )
        ),
        PatientEntity(
            id = "pat_003",
            nombre = "Daniel",
            apellido = "Gómez",
            cedula = "V-22.109.844",
            fechaNacimiento = "1994-03-08",
            genero = "Masculino",
            telefono = "+58 416-5544332",
            email = "daniel.gomez@creativo.ve",
            direccion = "Caracas, Chacao, Calle Páez",
            ocupacion = "Diseñador UI/UX",
            tipoSangre = "O+",
            alergias = "Sulfas",
            antecedentes = "Esguince de tobillo grado I (2020).",
            medicamentos = "Ninguno",
            diagnosticoPrincipal = "Tendinopatía del manguito rotador (supraespinoso derecho) por sobreuso y mala postura.",
            contactoEmergenciaNombre = "Andrea Gómez (Hermana)",
            contactoEmergenciaTelefono = "+58 412-8877665",
            notasFisioterapia = "Excelente respuesta a terapia manual ortopédica y fortalecimiento de manguito rotador y serrato anterior.",
            createdAt = System.currentTimeMillis() - 15 * 86400000L,
            documentsJson = Json.encodeToString(
                listOf(
                    MedicalRecordDocument(
                        id = "doc_daniel_01",
                        patientId = "pat_003",
                        title = "Ecosonograma Musculoesquelético Hombro",
                        category = "resonancia",
                        fileName = "Eco_Hombro_Derecho_DGomez.pdf",
                        fileSize = "3.2 MB",
                        uploadDate = "2026-08-10",
                        doctorName = "Dr. Rubén Torrealba",
                        notes = "Engrosamiento peritendinoso del tendón supraespinoso sin rotura fibrilar."
                    )
                )
            )
        ),
        PatientEntity(
            id = "pat_004",
            nombre = "Mariana",
            apellido = "Rivas",
            cedula = "V-24.931.200",
            fechaNacimiento = "1997-09-19",
            genero = "Femenino",
            telefono = "+58 424-9988776",
            email = "mariana.rivas@gmail.com",
            direccion = "Caracas, Santa Mónica, Calle Teresa de la Parra",
            ocupacion = "Docente de Educación Inicial",
            tipoSangre = "B+",
            alergias = "Ninguna conocida",
            antecedentes = "Representante legal de Mateo Rivas (6 años).",
            medicamentos = "Suplementación pediátrica",
            diagnosticoPrincipal = "Fisioterapia Pediátrica: Alteración del patrón de marcha (marcha en puntillas idiopática leve) y pie plano valgo flexible.",
            contactoEmergenciaNombre = "Eduardo Rivas (Esposo)",
            contactoEmergenciaTelefono = "+58 414-7766554",
            notasFisioterapia = "Avance notable en la descarga de talón durante el ciclo de marcha con dinámicas lúdicas y plantillas correctivas.",
            createdAt = System.currentTimeMillis() - 10 * 86400000L,
            documentsJson = Json.encodeToString(
                listOf(
                    MedicalRecordDocument(
                        id = "doc_mariana_01",
                        patientId = "pat_004",
                        title = "Evaluación Psicomotriz y Postural Pediátrica",
                        category = "informe",
                        fileName = "Evaluacion_Pediatrica_MateoRivas.pdf",
                        fileSize = "1.5 MB",
                        uploadDate = "2026-08-15",
                        doctorName = "Lic. Marivid Requena",
                        notes = "Recomendación de estimulación propioceptiva y juego terapéutico 2 veces por semana."
                    )
                )
            )
        ),
        PatientEntity(
            id = "pat_005",
            nombre = "Gladys",
            apellido = "Mendoza",
            cedula = "V-8.742.119",
            fechaNacimiento = "1954-04-12",
            genero = "Femenino",
            telefono = "+58 412-6655443",
            email = "gladys.mendoza54@hotmail.com",
            direccion = "Caracas, San Bernardino, Av. Vollmer",
            ocupacion = "Jubilada",
            tipoSangre = "O+",
            alergias = "Aspirina",
            antecedentes = "Hipertensión arterial controlada, artrosis de rodilla bilateral.",
            medicamentos = "Losartán 50mg, Glucosamina con Condroitina",
            diagnosticoPrincipal = "Gonartrosis bilateral grado II-III, alteración del equilibrio estático y dinámico.",
            contactoEmergenciaNombre = "Valeria Mendoza (Hija)",
            contactoEmergenciaTelefono = "+58 424-3344556",
            notasFisioterapia = "Fortalecimiento isométrico de cuádriceps, reeducación propioceptiva y circuito para prevención de caídas.",
            createdAt = System.currentTimeMillis() - 60 * 86400000L,
            documentsJson = Json.encodeToString(
                listOf(
                    MedicalRecordDocument(
                        id = "doc_gladys_01",
                        patientId = "pat_005",
                        title = "Radiografía Comparativa de Rodillas",
                        category = "radiografia",
                        fileName = "RayosX_Rodillas_GMendoza.pdf",
                        fileSize = "2.9 MB",
                        uploadDate = "2026-07-10",
                        doctorName = "Dr. Rubén Torrealba",
                        notes = "Disminución del espacio articular femorotibial medial bilateral."
                    )
                )
            )
        )
    )
}
