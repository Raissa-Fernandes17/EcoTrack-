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
        {/* Define a tela index.tsx como a principal e remove a barra de topo padrão */}
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </>
  );
}
