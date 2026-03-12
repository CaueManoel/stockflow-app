// components/Menu.js
import React, { useRef } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { useNavigationState, useNavigation } from "@react-navigation/native";

export default function Menu() {
  const navigation = useNavigation();

  const currentRouteName = useNavigationState(state => {
    if (!state || !state.routes || state.index == null) return null;
    return state.routes[state.index].name;
  });

  const animPedidos = useRef(new Animated.Value(1)).current;
  const animProdutos = useRef(new Animated.Value(1)).current;

  const animatePress = (anim, page) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.85,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate(page);
    });
  };

  const isActive = (screenName) => currentRouteName === screenName;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.container}>
        <TouchableWithoutFeedback
          onPress={() => animatePress(animPedidos, "Pedidos")}
        >
          <Animated.View
            style={[
              styles.menuItem,
              {
                transform: [{ scale: animPedidos }],
                backgroundColor: isActive("Pedidos") ? "#fff" : "#d32f2f",
              },
            ]}
          >
            <MaterialIcons
              name="receipt-long"
              size={28}
              color={isActive("Pedidos") ? "#b71c1c" : "#fff"}
            />
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback
          onPress={() => animatePress(animProdutos, "Produtos")}
        >
          <Animated.View
            style={[
              styles.menuItem,
              {
                transform: [{ scale: animProdutos }],
                backgroundColor: isActive("Produtos") ? "#fff" : "#d32f2f",
              },
            ]}
          >
            <MaterialIcons
              name="inventory"
              size={28}
              color={isActive("Produtos") ? "#b71c1c" : "#fff"}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
  },

  container: {
    height: 60,
    backgroundColor: "#c62828",
    borderRadius: 40,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    paddingHorizontal: 12,
    marginBottom: 40,
  },

  menuItem: {
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});