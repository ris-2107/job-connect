import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ActivityIndicator,
  Modal,
} from "react-native";
import axios from "axios";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as Animatable from "react-native-animatable";

const SignUpScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const scrollY = new Animated.Value(0);

  const handleSignUp = async () => {
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !street ||
      !city ||
      !zipcode
    ) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    //
    setLoading(true);
    setDisableButton(true);

    try {
      const response = await Promise.race([
        axios.post(
          "https://api.test-a.rissdev.xyz/api/delivereez/user-service/r/register-user",
          {
            username,
            email,
            password,
            roles: ["USER", "ADMIN"],
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            address: {
              street,
              city,
              zipcode,
            },
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: "active",
            },
          }
        ),
        new Promise(
          (_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 60000) // Timeout set to 1 minute (60000 ms)
        ),
      ]);

      if (response.status === 202) {
        setSuccessVisible(true); // Trigger success animation
        setTimeout(() => {
          setSuccessVisible(false); // Hide success animation after a delay
          // Reset form fields
          setUsername("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setStreet("");
          setCity("");
          setZipcode("");
        }, 2200);
      } else {
        Alert.alert("Error", "Failed to create account.");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setLoading(false); // Stop loading state
      setDisableButton(false); // Enable Sign Up button and screen interaction
    }
  };

  const handleZipcodeChange = async (zip: any) => {
    setZipcode(zip);
    if (zip.length === 6) {
      setLoading(true); // Start loading state
      try {
        const response = await axios.get(
          `https://api.postalpincode.in/pincode/${zip}`
        );
        if (response.data[0].Status === "Success") {
          const address = response.data[0].PostOffice[0];
          setStreet(address.Name);
          setCity(address.District);
          setAddressSuggestions({
            street: address.Name,
            city: address.District,
          });
        } else {
          Alert.alert("Error", "Invalid Zipcode.");
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        Alert.alert("Error", "Failed to fetch address. Please try again.");
      } finally {
        setLoading(false); // Stop loading state
      }
    } else {
      setAddressSuggestions(null);
    }
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [60, 100],
    extrapolate: "clamp",
  });

  const headerFontSize = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [34, 44],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <Animated.Text style={[styles.title, { fontSize: headerFontSize }]}>
          Create Account
        </Animated.Text>
      </Animated.View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.formContainer}
        extraScrollHeight={20}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Zipcode"
          value={zipcode}
          onChangeText={handleZipcodeChange}
          keyboardType="numeric"
          placeholderTextColor="#888"
        />
        {loading && (
          <ActivityIndicator
            style={{ marginTop: 10 }}
            size="small"
            color="#007bff"
          />
        )}
        {addressSuggestions && (
          <Animatable.View
            animation="fadeIn"
            duration={500}
            style={styles.addressSuggestions}
          >
            <TextInput
              style={styles.input}
              placeholder="Street"
              value={street}
              onChangeText={setStreet}
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#888"
            />
          </Animatable.View>
        )}
        <TouchableOpacity
          style={[styles.button, disableButton && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={disableButton}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Success modal overlay */}
        <Modal
          visible={successVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSuccessVisible(false)}
        >
          <View style={styles.overlay}>
            <Animatable.View
              animation="zoomIn"
              duration={1000}
              style={styles.successContainer}
            >
              <Text style={styles.successText}>
                Account created successfully!
              </Text>
            </Animatable.View>
          </View>
        </Modal>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    marginBottom: 20, // Add margin to separate from the form
  },
  formContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "300",
    color: "#333",
    fontFamily: "Roboto",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontFamily: "Roboto",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  addressSuggestions: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  successContainer: {
    backgroundColor: "#4BB543",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc", // Gray out the button
    shadowColor: "transparent",
  },
  successText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
});

export default SignUpScreen;
