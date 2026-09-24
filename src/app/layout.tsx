import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  return (
    <>
      {/* Configura automaticamente a barra de status do celular (bateria, hora) */}
      <StatusBar style="auto" />
      
      {/* Gerencia a pilha de navegação das páginas dentro de src/app */}
      <Stack>
        {/* Tela de Entrada: Login */}
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false 
          }} 
        />
        {/* Tela de Monitoramento e Sensores */}
        <Stack.Screen 
          name="telemetria" 
          options={{ 
            headerShown: false 
          }} 
        />
        {/* Tela de Cadastro de Descarte e Histórico SQLite */}
        <Stack.Screen 
          name="registro" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </>
  );
}
