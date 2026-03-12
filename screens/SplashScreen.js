import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Animated,
  Easing,
  Alert,
  BackHandler,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const APP_VERSION = "1.0";
const VERSION_URL = "https://bilapromo.com.br/api/v1/versao.php";

export default function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(50)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    validateVersion();
  }, []);

  async function validateVersion() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(VERSION_URL, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        BackHandler.exitApp();
        return;
      }

      const data = await response.json();

      if (!data?.versao) {
        BackHandler.exitApp();
        return;
      }

      if (data.versao !== APP_VERSION) {
        Alert.alert(
          "Atualização",
          "Existe uma nova versão do aplicativo. Atualize para continuar!",
          [
            {
              text: "OK",
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false }
        );
        return;
      }

      startAnimation();
    } catch (error) {
      BackHandler.exitApp();
    }
  }

  function startAnimation() {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          navigation.replace("Pedidos");
        });
      }, 1000);
    });
  }

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={["#ce0000", "#ce0000", "#ffffff", "#ffffff"]}
      locations={[0, 0.48, 0.52, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.Image
        source={require("../assets/logo.png")}
        style={[
          styles.logo,
          {
            opacity,
            transform: [{ scale }, { rotate: rotateInterpolate }],
          },
        ]}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 350,
    height: 350,
  },
});