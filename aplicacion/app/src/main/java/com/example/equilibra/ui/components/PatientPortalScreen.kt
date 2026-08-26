package com.example.equilibra.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.equilibra.ui.viewmodel.EquilibraViewModel
import kotlinx.coroutines.launch

@Composable
fun PatientPortalScreen(
    viewModel: EquilibraViewModel,
    onNavigateToAdmin: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    val coroutineScope = rememberCoroutineScope()

    val isDarkMode by viewModel.isDarkMode.collectAsStateWithLifecycle()
    val appointments by viewModel.allAppointments.collectAsStateWithLifecycle()
    val selectedServiceCategory by viewModel.selectedServiceCategory.collectAsStateWithLifecycle()
    val selectedTeamCategory by viewModel.selectedTeamCategory.collectAsStateWithLifecycle()
    val activeDetailService by viewModel.activeDetailService.collectAsStateWithLifecycle()
    val activeDetailTeamMember by viewModel.activeDetailTeamMember.collectAsStateWithLifecycle()
    val showMyAppointments by viewModel.showMyAppointmentsSheet.collectAsStateWithLifecycle()
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

    val scrollToBooking: () -> Unit = {
        coroutineScope.launch {
            // Scroll down towards booking
            scrollState.animateScrollTo(scrollState.maxValue)
        }
    }

    Scaffold(
        modifier = modifier
            .fillMaxSize()
            .testTag("patient_portal_screen"),
        topBar = {
            EquilibraTopBar(
                isDarkMode = isDarkMode,
                onToggleDarkMode = viewModel::toggleDarkMode,
                savedAppointmentsCount = appointments.size,
                onOpenMyAppointments = { viewModel.toggleMyAppointmentsSheet(true) },
                onScrollToBooking = scrollToBooking,
                onOpenSpecialistPortal = onNavigateToAdmin
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
        ) {
            // Hero
            HeroSection(
                onOpenBooking = { serviceId ->
                    if (serviceId != null) viewModel.setBookingServiceId(serviceId)
                    scrollToBooking()
                }
            )

            // About
            AboutSection()

            // Services
            ServicesSection(
                selectedCategory = selectedServiceCategory,
                onSelectCategory = viewModel::selectServiceCategory,
                onServiceClick = viewModel::showServiceDetail,
                onBookService = { sId ->
                    viewModel.setBookingServiceId(sId)
                    scrollToBooking()
                }
            )

            // Team
            TeamSection(
                selectedCategory = selectedTeamCategory,
                onSelectCategory = viewModel::selectTeamCategory,
                onMemberClick = viewModel::showTeamDetail,
                onBookService = { sId ->
                    viewModel.setBookingServiceId(sId)
                    scrollToBooking()
                }
            )

            // Specialties
            SpecialtiesSection(
                onBookService = { sId ->
                    viewModel.setBookingServiceId(sId)
                    scrollToBooking()
                }
            )

            // Philosophy
            PhilosophySection()

            // Why Us
            WhyUsSection()

            // Interactive Assessment
            InteractiveAssessmentSection(
                step = assessmentStep,
                selectedGoal = assessmentGoal,
                recommendedServiceId = recommendedServiceId,
                onSelectGoal = viewModel::selectAssessmentGoal,
                onReset = viewModel::resetAssessment,
                onOpenBooking = { sId ->
                    viewModel.setBookingServiceId(sId)
                    scrollToBooking()
                }
            )

            // Booking Form
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
                userBookedAppointments = appointments,
                onSelectService = viewModel::setBookingServiceId,
                onSelectDate = viewModel::setBookingDate,
                onSelectTime = viewModel::setBookingTime,
                onNombreChange = viewModel::setNombre,
                onApellidoChange = viewModel::setApellido,
                onTelefonoChange = viewModel::setTelefono,
                onEmailChange = viewModel::setEmail,
                onMotivoChange = viewModel::setMotivo,
                onPrimeraVisitaChange = viewModel::setPrimeraVisita,
                onSubmitBooking = { viewModel.validateAndSubmitBooking() }
            )

            // Testimonials
            TestimonialsSection()

            // FAQ
            FaqSection()

            // Contact & Footer
            ContactFooterSection()
        }

        // Modals / BottomSheets
        activeDetailService?.let { service ->
            ServiceDetailBottomSheet(
                service = service,
                onDismiss = viewModel::dismissServiceDetail,
                onBookService = { sId ->
                    viewModel.setBookingServiceId(sId)
                    viewModel.dismissServiceDetail()
                    scrollToBooking()
                }
            )
        }

        activeDetailTeamMember?.let { member ->
            TeamDetailBottomSheet(
                member = member,
                onDismiss = viewModel::dismissTeamDetail,
                onBookService = { sId ->
                    viewModel.setBookingServiceId(sId)
                    viewModel.dismissTeamDetail()
                    scrollToBooking()
                }
            )
        }

        if (showMyAppointments) {
            MyAppointmentsBottomSheet(
                appointments = appointments,
                onDismiss = { viewModel.toggleMyAppointmentsSheet(false) },
                onDeleteAppointment = viewModel::deleteAppointment
            )
        }

        latestConfirmedAppointment?.let { app ->
            AppointmentSuccessDialog(
                appointment = app,
                onDismiss = viewModel::dismissConfirmationDialog
            )
        }
    }
}
