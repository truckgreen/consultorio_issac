package com.example.equilibra.data.remote

import com.example.equilibra.BuildConfig
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime

object SupabaseClient {
    private val supabaseUrl = BuildConfig.SUPABASE_URL.ifBlank { "https://lzszxtxddlamplzsoihx.supabase.co" }
    private val supabaseKey = BuildConfig.SUPABASE_ANON_KEY.ifBlank { "dummy-key" }

    val client by lazy {
        try {
            createSupabaseClient(
                supabaseUrl = supabaseUrl,
                supabaseKey = supabaseKey
            ) {
                install(Postgrest)
                install(Realtime)
            }
        } catch (e: Exception) {
            // Fallback client to avoid immediate crash
            createSupabaseClient(
                supabaseUrl = "https://lzszxtxddlamplzsoihx.supabase.co",
                supabaseKey = "dummy-key"
            ) {
                install(Postgrest)
                install(Realtime)
            }
        }
    }
}
