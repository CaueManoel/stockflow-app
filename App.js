import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PedidoScreen from "./screens/PedidoScreen";
import ProdutoScreen from "./screens/ProdutoScreen";
import SplashScreen from "./screens/SplashScreen";
import { ErrorProvider } from "./context/ErrorContext";
import ErrorModal from "./components/ErrorModal";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <ErrorProvider>
        <Stack.Navigator
          initialRouteName="Produtos"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Produtos" component={ProdutoScreen} />
        </Stack.Navigator>
        <ErrorModal />
      </ErrorProvider>
    </NavigationContainer>
  );
}
