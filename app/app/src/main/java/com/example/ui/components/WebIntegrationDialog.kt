package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

@Composable
fun WebIntegrationDialog(
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var webUrl by remember { mutableStateOf("https://equilibra-fisioterapia.com/api") }
    var pingStatus by remember { mutableStateOf<PingResult?>(null) }
    var isChecking by remember { mutableStateOf(false) }
    var selectedTab by remember { mutableIntStateOf(0) }

    val tabs = listOf("Conexión & Test", "Guía de Integración", "API & Webhook")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = CircleShape,
                    modifier = Modifier.size(36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Language,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                Column {
                    Text(
                        text = "Conexión Web & Sincronización",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Integración Página Web ↔ App Móvil",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                TabRow(
                    selectedTabIndex = selectedTab,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    tabs.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            text = { Text(title, style = MaterialTheme.typography.labelSmall) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(380.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    when (selectedTab) {
                        0 -> {
                            // Tab 0: Test Connection
                            item {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Text(
                                            text = "URL del Servidor / Webhook de la Página Web",
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        Spacer(modifier = Modifier.height(6.dp))
                                        OutlinedTextField(
                                            value = webUrl,
                                            onValueChange = { webUrl = it },
                                            placeholder = { Text("https://mi-sitio.com/api") },
                                            singleLine = true,
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .testTag("web_url_input"),
                                            shape = RoundedCornerShape(10.dp)
                                        )
                                    }
                                }
                            }

                            item {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Button(
                                        onClick = {
                                            isChecking = true
                                            pingStatus = null
                                            coroutineScope.launch {
                                                val result = testHttpEndpoint(webUrl)
                                                pingStatus = result
                                                isChecking = false
                                            }
                                        },
                                        enabled = !isChecking && webUrl.isNotBlank(),
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier
                                            .weight(1f)
                                            .testTag("btn_test_web_connection")
                                    ) {
                                        if (isChecking) {
                                            CircularProgressIndicator(
                                                modifier = Modifier.size(16.dp),
                                                strokeWidth = 2.dp,
                                                color = MaterialTheme.colorScheme.onPrimary
                                            )
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Comprobando...", style = MaterialTheme.typography.labelMedium)
                                        } else {
                                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Verificar Conexión", style = MaterialTheme.typography.labelMedium)
                                        }
                                    }
                                }
                            }

                            // Result Status Card
                            item {
                                if (pingStatus != null) {
                                    val status = pingStatus!!
                                    Surface(
                                        color = if (status.isSuccess) Color(0xFFE8F5E9) else Color(0xFFFFEBEE),
                                        shape = RoundedCornerShape(12.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(14.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            Icon(
                                                imageVector = if (status.isSuccess) Icons.Default.CheckCircle else Icons.Default.Error,
                                                contentDescription = null,
                                                tint = if (status.isSuccess) Color(0xFF2E7D32) else Color(0xFFC62828),
                                                modifier = Modifier.size(24.dp)
                                            )
                                            Column {
                                                Text(
                                                    text = if (status.isSuccess) "Conexión Establecida (Código ${status.code})" else "Fallo de Conexión (${status.message})",
                                                    style = MaterialTheme.typography.titleSmall,
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (status.isSuccess) Color(0xFF2E7D32) else Color(0xFFC62828)
                                                )
                                                Text(
                                                    text = if (status.isSuccess) "Tiempo de respuesta: ${status.responseTimeMs} ms. La app puede comunicarse con tu servidor." else "Verifica que el servidor esté activo y acepte peticiones HTTPS.",
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = if (status.isSuccess) Color(0xFF1B5E20) else Color(0xFFB71C1C)
                                                )
                                            }
                                        }
                                    }
                                }
                            }

                            item {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Icon(Icons.Default.Info, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                                            Text(
                                                text = "¿Cómo funciona la conexión?",
                                                style = MaterialTheme.typography.titleSmall,
                                                fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.primary
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "Los pacientes reservan turnos en tu página web. Tu servidor envía un webhook o petición JSON a esta app o base de datos centralizada, notificando al instante al administrador de Equilibra.",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }

                        1 -> {
                            // Tab 1: Integration Guide
                            item {
                                Text(
                                    text = "3 Pasos para Integrar en tu Proyecto Web:",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }

                            item {
                                StepCard(
                                    stepNum = "1",
                                    title = "Formulario de Reserva Web",
                                    description = "En tu página web de fisioterapia, añade un formulario donde el paciente selecciona fecha, hora, especialista y motivo de consulta."
                                )
                            }

                            item {
                                StepCard(
                                    stepNum = "2",
                                    title = "Envío del Turno al Backend / API",
                                    description = "Cuando el paciente confirma en la web, tu backend guarda el turno y emite una notificación push o almacena el registro en formato JSON estándar."
                                )
                            }

                            item {
                                StepCard(
                                    stepNum = "3",
                                    title = "Sincronización con la App Móvil",
                                    description = "Los administradores reciben alertas automáticas en tiempo real en la app de Equilibra, pudiendo confirmar, reprogramar o contactar por WhatsApp al paciente con un solo toque."
                                )
                            }
                        }

                        2 -> {
                            // Tab 2: Code Snippets & API JSON Format
                            item {
                                Text(
                                    text = "Estructura JSON para Nuevos Turnos:",
                                    style = MaterialTheme.typography.labelLarge,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            item {
                                val jsonSnippet = """
                                    {
                                      "patientName": "Juan Pérez",
                                      "patientPhone": "+5491144556677",
                                      "date": "2026-08-25",
                                      "time": "10:30",
                                      "specialty": "Fisioterapia y Rehabilitación",
                                      "doctorName": "Lic. Isaac Rodríguez",
                                      "reason": "Rehabilitación esguince tobillo",
                                      "cost": 5000.0,
                                      "adminNotes": "Reservado desde formulario web"
                                    }
                                """.trimIndent()

                                CodeBlockCard(
                                    code = jsonSnippet,
                                    onCopy = {
                                        copyToClipboard(context, "JSON Turno", jsonSnippet)
                                    }
                                )
                            }

                            item {
                                Text(
                                    text = "Código JavaScript para tu Sitio Web:",
                                    style = MaterialTheme.typography.labelLarge,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            item {
                                val jsSnippet = """
                                    // Enviar turno desde la web a la API de Equilibra
                                    async function agendarTurnoWeb(datosTurno) {
                                      const res = await fetch('/api/turnos', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(datosTurno)
                                      });
                                      return await res.json();
                                    }
                                """.trimIndent()

                                CodeBlockCard(
                                    code = jsSnippet,
                                    onCopy = {
                                        copyToClipboard(context, "JS Integration", jsSnippet)
                                    }
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.testTag("btn_close_web_dialog")
            ) {
                Text("Entendido")
            }
        }
    )
}

@Composable
private fun StepCard(
    stepNum: String,
    title: String,
    description: String
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.Top
        ) {
            Surface(
                color = MaterialTheme.colorScheme.primary,
                shape = CircleShape,
                modifier = Modifier.size(26.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = stepNum,
                        color = MaterialTheme.colorScheme.onPrimary,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun CodeBlockCard(
    code: String,
    onCopy: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E2E)),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.Default.Code, contentDescription = null, tint = Color(0xFF89B4FA), modifier = Modifier.size(16.dp))
                    Text("Código", color = Color(0xFFCDD6F4), style = MaterialTheme.typography.labelSmall)
                }
                IconButton(
                    onClick = onCopy,
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = "Copiar", tint = Color(0xFFA6ADC8), modifier = Modifier.size(16.dp))
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
            ) {
                Text(
                    text = code,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = Color(0xFFA6E3A1),
                    lineHeight = 16.sp
                )
            }
        }
    }
}

data class PingResult(
    val isSuccess: Boolean,
    val code: Int,
    val responseTimeMs: Long,
    val message: String
)

private suspend fun testHttpEndpoint(urlString: String): PingResult = withContext(Dispatchers.IO) {
    val startTime = System.currentTimeMillis()
    try {
        val formattedUrl = if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
            "https://$urlString"
        } else {
            urlString
        }
        val url = URL(formattedUrl)
        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 4000
            readTimeout = 4000
            instanceFollowRedirects = true
            setRequestProperty("User-Agent", "Equilibra-Android/1.0")
        }
        val responseCode = connection.responseCode
        val elapsed = System.currentTimeMillis() - startTime
        val isOk = responseCode in 200..399
        PingResult(
            isSuccess = isOk,
            code = responseCode,
            responseTimeMs = elapsed,
            message = if (isOk) "HTTP OK" else "Código HTTP $responseCode"
        )
    } catch (e: Exception) {
        val elapsed = System.currentTimeMillis() - startTime
        PingResult(
            isSuccess = false,
            code = -1,
            responseTimeMs = elapsed,
            message = e.localizedMessage ?: "Error de red"
        )
    }
}

private fun copyToClipboard(context: Context, label: String, text: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    val clip = ClipData.newPlainText(label, text)
    clipboard.setPrimaryClip(clip)
    Toast.makeText(context, "Copiado al portapapeles", Toast.LENGTH_SHORT).show()
}
