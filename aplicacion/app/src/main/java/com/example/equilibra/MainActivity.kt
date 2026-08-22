package com.example.equilibra

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.equilibra.ui.components.*
import com.example.equilibra.ui.theme.AmberPrimary
import com.example.equilibra.ui.theme.EquilibraTheme
import com.example.equilibra.ui.viewmodel.EquilibraViewModel
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val viewModel: EquilibraViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val isDarkMode by viewModel.isDarkMode.collectAsStateWithLifecycle()

            EquilibraTheme(darkTheme = isDarkMode) {
                EquilibraMainScreen(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun EquilibraMainScreen(
    viewModel: EquilibraViewModel
) {
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    val isDarkMode by viewModel.isDarkMode.collectAsStateWithLifecycle()
    val allAppointments by viewModel.allAppointments.collectAsStateWithLifecycle()

    val selectedServiceCategory by viewModel.selectedServiceCategory.collectAsStateWithLifecycle()
    val selectedTeamCategory by viewModel.selectedTeamCategory.collectAsStateWithLifecycle()

    val activeDetailService by viewModel.activeDetailService.collectAsStateWithLifecycle()
    val activeDetailTeamMember by viewModel.activeDetailTeamMember.collectAsStateWithLifecycle()
    val showMyAppointmentsSheet by viewModel.showMyAppointmentsSheet.collectAsStateWithLifecycle()

    val assessmentStep by viewModel.assessmentStep.collectAsStateWithLifecycle()
    val assessmentGoal by viewModel.assessmentGoal.collectAsStateWithLifecycle()
    val recommendedServiceId by viewModel.recommendedServiceId.collectAsStateWithLifecycle()

    val bookingServiceId by viewModel.bookingServiceId.collectAsStateWithLifecycle()
    val bookingDate by viewModel.bookingDate.collectAsStateWithLifecycle()
    val bookingTime by viewModel.bookingTime.collectAsStateWithLifecycle()
    val nombre by viewModel.nombre.collectAsStateWithLifecycle()
    val apellido by viewModel.apellido.collectAsStateWithLifecycle()
    val telefono by viewModel.telefono.collectAsStateWithLifecycle()
    val email by viewModel.email.collectAsStateWithLifecycle()
    val motivo by viewModel.motivo.collectAsStateWithLifecycle()
    val primeraVisita by viewModel.primeraVisita.collectAsStateWithLifecycle()
    val formErrors by viewModel.formErrors.collectAsStateWithLifecycle()
    val isSubmitting by viewModel.isSubmitting.collectAsStateWithLifecycle()
    val latestConfirmedAppointment by viewModel.latestConfirmedAppointment.collectAsStateWithLifecycle()

    val scrollToBooking: (String?) -> Unit = { serviceId ->
        if (serviceId != null) {
            viewModel.setBookingServiceId(serviceId)
        }
        coroutineScope.launch {
            // Index of BookingSection in the LazyColumn is 8
            listState.animateScrollToItem(index = 8)
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            EquilibraTopBar(
                isDarkMode = isDarkMode,
                onToggleDarkMode = { viewModel.toggleDarkMode() },
                savedAppointmentsCount = allAppointments.size,
                onOpenMyAppointments = { viewModel.toggleMyAppointmentsSheet(true) },
                onScrollToBooking = { scrollToBooking(null) }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { scrollToBooking(null) },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier
                    .padding(bottom = 12.dp)
                    .testTag("fab_quick_booking")
            ) {
                Icon(
                    imageVector = Icons.Filled.CalendarMonth,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Agendar Cita",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            }
        }
    ) { innerPadding ->
        LazyColumn(
            state = listState,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .testTag("equilibra_main_scroll"),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            // 0. Hero Section
            item(key = "hero") {
                HeroSection(onOpenBooking = scrollToBooking)
            }

            // 1. About / Philosophy Highlights
            item(key = "about") {
                AboutSection()
            }

            // 2. Services Section
            item(key = "services") {
                ServicesSection(
                    selectedCategory = selectedServiceCategory,
                    onSelectCategory = { viewModel.selectServiceCategory(it) },
                    onServiceClick = { viewModel.showServiceDetail(it) },
                    onBookService = { scrollToBooking(it) }
                )
            }

            // 3. Interactive Assessment Guide
            item(key = "assessment") {
                InteractiveAssessmentSection(
                    step = assessmentStep,
                    selectedGoal = assessmentGoal,
                    recommendedServiceId = recommendedServiceId,
                    onSelectGoal = { viewModel.selectAssessmentGoal(it) },
                    onReset = { viewModel.resetAssessment() },
                    onOpenBooking = { scrollToBooking(it) }
                )
            }

            // 4. Team Section
            item(key = "team") {
                TeamSection(
                    selectedCategory = selectedTeamCategory,
                    onSelectCategory = { viewModel.selectTeamCategory(it) },
                    onMemberClick = { viewModel.showTeamDetail(it) },
                    onBookService = { scrollToBooking(it) }
                )
            }

            // 5. Specialties Section
            item(key = "specialties") {
                SpecialtiesSection(onBookService = { scrollToBooking(it) })
            }

            // 6. Philosophy Pillars
            item(key = "philosophy") {
                PhilosophySection()
            }

            // 7. Why Choose Us
            item(key = "why_us") {
                WhyUsSection()
            }

            // 8. Interactive Booking Engine
            item(key = "booking") {
                BookingSection(
                    selectedServiceId = bookingServiceId,
                    selectedDate = bookingDate,
                    selectedTime = bookingTime,
                    nombre = nombre,
                    apellido = apellido,
                    telefono = telefono,
                    email = email,
                    motivo = motivo,
                    primeraVisita = primeraVisita,
                    formErrors = formErrors,
                    isSubmitting = isSubmitting,
                    userBookedAppointments = allAppointments,
                    onSelectService = { viewModel.setBookingServiceId(it) },
                    onSelectDate = { viewModel.setBookingDate(it) },
                    onSelectTime = { viewModel.setBookingTime(it) },
                    onNombreChange = { viewModel.setNombre(it) },
                    onApellidoChange = { viewModel.setApellido(it) },
                    onTelefonoChange = { viewModel.setTelefono(it) },
                    onEmailChange = { viewModel.setEmail(it) },
                    onMotivoChange = { viewModel.setMotivo(it) },
                    onPrimeraVisitaChange = { viewModel.setPrimeraVisita(it) },
                    onSubmitBooking = { viewModel.validateAndSubmitBooking() }
                )
            }

            // 9. Testimonials
            item(key = "testimonials") {
                TestimonialsSection()
            }

            // 10. FAQ
            item(key = "faq") {
                FaqSection()
            }

            // 11. Contact Footer
            item(key = "footer") {
                ContactFooterSection()
            }
        }

        // Modals & Bottom Sheets
        activeDetailService?.let { service ->
            ServiceDetailBottomSheet(
                service = service,
                onDismiss = { viewModel.dismissServiceDetail() },
                onBookService = { scrollToBooking(it) }
            )
        }

        activeDetailTeamMember?.let { member ->
            TeamDetailBottomSheet(
                member = member,
                onDismiss = { viewModel.dismissTeamDetail() },
                onBookService = { scrollToBooking(it) }
            )
        }

        latestConfirmedAppointment?.let { app ->
            AppointmentSuccessDialog(
                appointment = app,
                onDismiss = { viewModel.dismissConfirmationDialog() }
            )
        }

        if (showMyAppointmentsSheet) {
            MyAppointmentsBottomSheet(
                appointments = allAppointments,
                onDismiss = { viewModel.toggleMyAppointmentsSheet(false) },
                onDeleteAppointment = { viewModel.deleteAppointment(it) }
            )
        }
    }
}
