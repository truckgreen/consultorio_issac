package com.example.equilibra.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.equilibra.data.model.AuthUser
import com.example.equilibra.data.model.PredefinedUsers
import com.example.equilibra.data.model.UserRole
import com.example.equilibra.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: (AuthUser) -> Unit,
    onBackToPatientApp: () -> Unit
) {
    var selectedUser by remember { mutableStateOf<AuthUser?>(PredefinedUsers.SUPERADMIN) }
    var pinText by remember { mutableStateOf("1234") }
    var pinVisible by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var activeFilter by remember { mutableStateOf("TODOS") } // TODOS, ADMIN, ESPECIALISTAS

    val filteredUsers = remember(activeFilter) {
        when (activeFilter) {
            "ADMIN" -> listOf(PredefinedUsers.SUPERADMIN)
            "ESPECIALISTAS" -> PredefinedUsers.SPECIALISTS.filter { it.role == UserRole.SPECIALIST }
            else -> PredefinedUsers.SPECIALISTS
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        NavyDark,
                        Color(0xFF0F1E28),
                        Color(0xFF080F14)
                    )
                )
            )
            .testTag("admin_login_screen")
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            contentPadding = PaddingValues(top = 40.dp, bottom = 40.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header
            item {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(AmberPrimary, AmberDark)
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.HealthAndSafety,
                            contentDescription = "Logo Equilibra",
                            tint = NavyDark,
                            modifier = Modifier.size(40.dp)
                        )
                    }

                    Text(
                        text = "EQUILIBRA",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp
                        ),
                        color = Color.White
                    )

                    Text(
                        text = "Portal Clínico y Gestión de Especialistas",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.7f)
                    )

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color.White.copy(alpha = 0.08f),
                        modifier = Modifier.padding(top = 4.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Lock,
                                contentDescription = null,
                                tint = AmberPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Acceso Protegido por Rol • PIN por defecto: 1234",
                                style = MaterialTheme.typography.labelSmall,
                                color = AmberLight
                            )
                        }
                    }
                }
            }

            // Role Selector Tabs
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White.copy(alpha = 0.07f))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    val tabs = listOf(
                        "TODOS" to "Todos (${PredefinedUsers.SPECIALISTS.size})",
                        "ADMIN" to "Superadmin",
                        "ESPECIALISTAS" to "Especialistas"
                    )

                    tabs.forEach { (id, label) ->
                        val isSelected = activeFilter == id
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isSelected) AmberPrimary else Color.Transparent)
                                .clickable { activeFilter = id }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = label,
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = if (isSelected) NavyDark else Color.White.copy(alpha = 0.8f),
                                maxLines = 1
                            )
                        }
                    }
                }
            }

            // User Selection Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Selecciona tu Usuario / Perfil:",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = Color.White
                    )
                    Text(
                        text = "${filteredUsers.size} disponibles",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.6f)
                    )
                }
            }

            // Users List
            items(filteredUsers) { user ->
                val isSelected = selectedUser?.id == user.id
                Card(
                    onClick = {
                        selectedUser = user
                        errorMessage = null
                    },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) Color(0xFF1E3A4C) else Color.White.copy(alpha = 0.06f)
                    ),
                    border = if (isSelected) {
                        androidx.compose.foundation.BorderStroke(2.dp, AmberPrimary)
                    } else {
                        androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.08f))
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("user_select_${user.id}")
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Avatar / Initials
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(
                                    if (user.isSuperAdmin) {
                                        Brush.linearGradient(colors = listOf(Color(0xFFE11D48), Color(0xFF9F1239)))
                                    } else {
                                        Brush.linearGradient(colors = listOf(TealPrimary, TealDark))
                                    }
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (user.isSuperAdmin) "AD" else user.initials,
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Black),
                                color = Color.White
                            )
                        }

                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = user.name,
                                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                                    color = Color.White
                                )
                                if (user.isSuperAdmin) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = Color(0xFFE11D48).copy(alpha = 0.3f)
                                    ) {
                                        Text(
                                            text = "ADMIN",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                                            color = Color(0xFFFCA5A5),
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }

                            Text(
                                text = user.specialty,
                                style = MaterialTheme.typography.bodySmall,
                                color = if (isSelected) AmberLight else Color.White.copy(alpha = 0.7f),
                                maxLines = 1
                            )

                            Text(
                                text = user.email,
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.White.copy(alpha = 0.45f)
                            )
                        }

                        RadioButton(
                            selected = isSelected,
                            onClick = {
                                selectedUser = user
                                errorMessage = null
                            },
                            colors = RadioButtonDefaults.colors(
                                selectedColor = AmberPrimary,
                                unselectedColor = Color.White.copy(alpha = 0.4f)
                            )
                        )
                    }
                }
            }

            // PIN / Password Input Card
            item {
                selectedUser?.let { user ->
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF132430)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp),
                            verticalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Key,
                                    contentDescription = null,
                                    tint = AmberPrimary
                                )
                                Text(
                                    text = "Validar PIN de Acceso para ${user.name}",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = Color.White
                                )
                            }

                            OutlinedTextField(
                                value = pinText,
                                onValueChange = {
                                    pinText = it
                                    errorMessage = null
                                },
                                label = { Text("Código PIN de Seguridad", color = Color.White.copy(alpha = 0.7f)) },
                                placeholder = { Text("1234", color = Color.White.copy(alpha = 0.3f)) },
                                singleLine = true,
                                visualTransformation = if (pinVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.NumberPassword,
                                    imeAction = ImeAction.Done
                                ),
                                keyboardActions = KeyboardActions(
                                    onDone = {
                                        if (pinText == user.pin || pinText == "1234" || user.pin.isEmpty()) {
                                            onLoginSuccess(user)
                                        } else {
                                            errorMessage = "PIN incorrecto. Intenta con 1234"
                                        }
                                    }
                                ),
                                trailingIcon = {
                                    IconButton(onClick = { pinVisible = !pinVisible }) {
                                        Icon(
                                            imageVector = if (pinVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                                            contentDescription = if (pinVisible) "Ocultar" else "Mostrar",
                                            tint = Color.White.copy(alpha = 0.6f)
                                        )
                                    }
                                },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = AmberPrimary,
                                    unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    cursorColor = AmberPrimary
                                ),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("pin_input_field")
                            )

                            errorMessage?.let { err ->
                                Text(
                                    text = err,
                                    color = Color(0xFFEF4444),
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold)
                                )
                            }

                            Button(
                                onClick = {
                                    if (pinText == user.pin || pinText == "1234" || user.pin.isEmpty()) {
                                        onLoginSuccess(user)
                                    } else {
                                        errorMessage = "PIN de acceso incorrecto. Usa 1234."
                                    }
                                },
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (user.isSuperAdmin) AmberPrimary else TealPrimary,
                                    contentColor = NavyDark
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("login_submit_button")
                            ) {
                                Icon(Icons.Filled.Login, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (user.isSuperAdmin) "Ingresar como Superadministrador" else "Ingresar como Especialista",
                                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Black)
                                )
                            }
                        }
                    }
                }
            }

            // Switch to Patient View button
            item {
                OutlinedButton(
                    onClick = onBackToPatientApp,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White.copy(alpha = 0.8f)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                ) {
                    Icon(Icons.Filled.ArrowBack, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Volver a la Aplicación de Pacientes (Público)")
                }
            }
        }
    }
}
