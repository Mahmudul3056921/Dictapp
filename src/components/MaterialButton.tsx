import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  onPress: () => void;
  type?: "primary" | "secondary";
}

const MaterialButton = ({ label, onPress, type = "primary" }: Props) => {
  return (
    <Pressable
      android_ripple={{
        color: type === "primary" ? "rgba(255,255,255,0.3)" : "rgba(37,99,235,0.2)",
      }}
      style={({ pressed }) => [
        styles.button,
        type === "primary" ? styles.primary : styles.secondary,
        pressed && { opacity: 0.95 },
      ]}
      onPress={onPress}
    >
      <Text style={type === "primary" ? styles.primaryText : styles.secondaryText}>
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
};

export default MaterialButton;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  primary: {
    backgroundColor: "#2563EB",
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 14,
  },

  secondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.6,
    borderColor: "#2563EB",
  },
  secondaryText: {
    color: "#2563EB",
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 14,
  },
});
