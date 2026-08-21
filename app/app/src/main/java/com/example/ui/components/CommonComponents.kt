package com.example.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.AppointmentStatus
import com.example.ui.theme.StatusCancelledBg
import com.example.ui.theme.StatusCancelledText
import com.example.ui.theme.StatusCompletedBg
import com.example.ui.theme.StatusCompletedText
import com.example.ui.theme.StatusConfirmedBg
import com.example.ui.theme.StatusConfirmedText
import com.example.ui.theme.StatusInProgressBg
import com.example.ui.theme.StatusInProgressText
import com.example.ui.theme.StatusPendingBg
import com.example.ui.theme.StatusPendingText
import java.net.URLEncoder

@Composable
fun StatusBadge(
    status: AppointmentStatus,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (status) {
        AppointmentStatus.PENDIENTE -> StatusPendingBg to StatusPendingText
        AppointmentStatus.CONFIRMADO -> StatusConfirmedBg to StatusConfirmedText
        AppointmentStatus.EN_CURSO -> StatusInProgressBg to StatusInProgressText
        AppointmentStatus.ATENDIDO -> StatusCompletedBg to StatusCompletedText
        AppointmentStatus.CANCELADO, AppointmentStatus.NO_ASISTIO -> StatusCancelledBg to StatusCancelledText
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(12.dp),
        modifier = modifier
    ) {
        Text(
            text = status.label,
            color = textColor,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun PatientAvatar(
    name: String,
    modifier: Modifier = Modifier,
    size: Int = 44,
    backgroundColor: Color = MaterialTheme.colorScheme.primaryContainer,
    textColor: Color = MaterialTheme.colorScheme.onPrimaryContainer
) {
    val initials = name.split(" ")
        .filter { it.isNotBlank() }
        .take(2)
        .mapNotNull { it.firstOrNull()?.uppercase() }
        .joinToString("")
        .ifEmpty { "P" }

    Box(
        modifier = modifier
            .size(size.dp)
            .clip(CircleShape)
            .background(backgroundColor),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = initials,
            color = textColor,
            fontWeight = FontWeight.Bold,
            fontSize = (size / 2.5).sp
        )
    }
}

@Composable
fun MetricStatCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    containerColor: Color = MaterialTheme.colorScheme.surfaceVariant,
    iconColor: Color = MaterialTheme.colorScheme.primary,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        modifier = modifier
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(iconColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.outline
            )
        }
    }
}

@Composable
fun PatientQuickContactRow(
    patientPhone: String,
    patientEmail: String,
    patientName: String,
    appointmentDate: String? = null,
    appointmentTime: String? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // WhatsApp Action
        IconButton(
            onClick = {
                val cleanPhone = patientPhone.replace(Regex("[^0-9]"), "")
                val msg = if (appointmentDate != null && appointmentTime != null) {
                    "Hola $patientName, le recordamos desde Consultorio Isaac su turno médico programado para el día $appointmentDate a las $appointmentTime hs. ¿Nos confirma asistencia?"
                } else {
                    "Hola $patientName, le escribimos desde Consultorio Isaac respecto a su atención médica."
                }
                openWhatsApp(context, cleanPhone, msg)
            },
            modifier = Modifier
                .size(40.dp)
                .testTag("whatsapp_button"),
            colors = IconButtonDefaults.filledTonalIconButtonColors(
                containerColor = Color(0xFF25D366).copy(alpha = 0.15f),
                contentColor = Color(0xFF128C7E)
            )
        ) {
            Icon(
                imageVector = Icons.Default.Chat,
                contentDescription = "Enviar WhatsApp a $patientName",
                modifier = Modifier.size(20.dp)
            )
        }

        // Phone Call Action
        IconButton(
            onClick = {
                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$patientPhone"))
                context.startActivity(intent)
            },
            modifier = Modifier
                .size(40.dp)
                .testTag("call_button"),
            colors = IconButtonDefaults.filledTonalIconButtonColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.primary
            )
        ) {
            Icon(
                imageVector = Icons.Default.Call,
                contentDescription = "Llamar a $patientName",
                modifier = Modifier.size(20.dp)
            )
        }

        // Email Action
        if (patientEmail.isNotBlank()) {
            IconButton(
                onClick = {
                    val intent = Intent(Intent.ACTION_SENDTO).apply {
                        data = Uri.parse("mailto:$patientEmail")
                        putExtra(Intent.EXTRA_SUBJECT, "Consultorio Isaac - Notificación de Turno")
                    }
                    context.startActivity(intent)
                },
                modifier = Modifier
                    .size(40.dp)
                    .testTag("email_button"),
                colors = IconButtonDefaults.filledTonalIconButtonColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    contentColor = MaterialTheme.colorScheme.secondary
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Email,
                    contentDescription = "Enviar correo a $patientName",
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

fun openWhatsApp(context: Context, phone: String, message: String) {
    try {
        val encodedMessage = URLEncoder.encode(message, "UTF-8")
        val uri = Uri.parse("https://api.whatsapp.com/send?phone=$phone&text=$encodedMessage")
        val intent = Intent(Intent.ACTION_VIEW, uri)
        context.startActivity(intent)
    } catch (e: Exception) {
        // Fallback to general intent
        val sendIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, message)
        }
        context.startActivity(Intent.createChooser(sendIntent, "Enviar recordatorio"))
    }
}

@Composable
fun EmptyStateCard(
    title: String,
    subtitle: String,
    icon: ImageVector = Icons.Default.Info,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.outline,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
        }
    }
}
