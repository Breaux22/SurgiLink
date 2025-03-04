import * as React from 'react';
import { useCallback } from 'react';
import { useRoute } from "@react-navigation/native";
import { useState, useEffect, useRef } from 'react';
import { Image, StyleSheet, FlatList, SafeAreaView, View, ScrollView, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FullCalendar from '../components/FullCalendar/FullCalendar';
import MonthlyViewObject_1 from '../components/MonthlyViewObject/MonthlyViewObject_1';
import HeaderMenu from '../components/HeaderMenu/HeaderMenu';
import EntypoIcon from "react-native-vector-icons/Entypo";
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

function LoginPage () {
  const navigation = useNavigation();
  const [conflict, setConflict] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mainView, setMainView] = useState(styles.main);
  const [forgotView, setForgotView] = useState(styles.collapsed);
  const [nfStyle, setNfStyle] = useState(styles.collapsed);
  const [sentStyle, setSentStyle] = useState(styles.collapsed);

 async function saveData (userInfo) {
   console.log("login: ", userInfo)
    await SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // iOS security setting
    });
    return;
  };

  async function sendRecoveryEmail() {
    const data = {
      username: username,
    }
    const headers = {
      'method': 'POST',
      'headers': {
          'content-type': 'application/json'
      },
      'body': JSON.stringify(data)
    }
    const response = await fetch('https://SurgiLink.replit.app/recoveryEmail', headers)
      .then(response => {
        if (!response.ok) {
          console.error('Error - sendRecoveryEmail()')
        }
        return response.json()
      })
      .then(data => {return data})

    if (response.myMessage == "Email Sent.") {
      setSentStyle(styles.title);
      setNfStyle(styles.collapsed);
      setUsername('');
      //setMainView(styles.main);
      //setForgotView(styles.collapsed);
      setConflict('');
    } else if (response.myMessage == "User Not Found.") {
      setNfStyle(styles.title);
    } 
    return response;
  }
  
  async function tryLogin () {
    const data = {
      username: username,
      password: password,
    }
    const headers = {
      'method': 'POST',
      'headers': {
          'content-type': 'application/json'
      },
      'body': JSON.stringify(data)
    }
    const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/login'
    //const url = 'https://SurgiLink.replit.app/login'
    const response = await fetch(url, headers)
      .then(response => {
        if (!response.ok) {
          console.error('Error - login()')
        }
        return response.json()
      })
      .then(data => {return data})

    if (response.myMessage == 'Incorrect Username/Password.') {
      setConflict('Incorrect Username/Password.')
    } else {
        /*const myData = {
          userInfo: response.userInfo,
          surgeons: [],
          facilities: [],
          trays: [],
          trayUses: [],
          cases: [],
        }
        await AsyncStorage.setItem(username, JSON.stringify(myData));*/
        console.log("Login2: ", response.userInfo)
        await saveData(response.userInfo);
        navigation.reset({
          index: 0,
          routes: [{ name: "Monthly View", params: {month: new Date().getMonth(), year: new Date().getFullYear()} }],
        });
    }
    return;
  }

  return (
    <SafeAreaView style={{backgroundColor: "#fff", height: height,}}>
        <View style={mainView}>
          <TouchableOpacity
            style={styles.login}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Sign Up", params: {} }],
              });
            }}
            >
            <Text allowFontScaling={false} style={styles.signUp}>Sign Up!</Text>
          </TouchableOpacity>
          <Image source={require('../assets/icons/surgilink-logo.png')} resizeMode="contain" style={styles.bigIcon}/>
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.title}>Username:</Text>
            <Text allowFontScaling={false} style={styles.badUname}>{conflict}</Text>
          </View>
          <TextInput
            autoCapitalize="none"
            allowFontScaling={false}
            style={styles.textInput}
            value={username}
            onChangeText={(input) => {
              setUsername(input);
            }}
            />
          <Text allowFontScaling={false} style={styles.title}>Password:</Text>
          <TextInput
            autoCapitalize="none"
            allowFontScaling={false}
            style={styles.textInput}
            value={password}
            secureTextEntry={true}
            onChangeText={(input) => {
              setPassword(input);
            }}
            />
          <TouchableOpacity
            style={styles.login}
            onPress={() => tryLogin()}
            >
            <Text allowFontScaling={false} style={styles.loginText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {              
              setUsername('');
              setMainView(styles.collapsed);
              setForgotView(styles.main);
            }}            
          >
            <Text allowFontScaling={false} style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={forgotView}>
          <TouchableOpacity
            onPress={() => {
              setMainView(styles.main);
              setForgotView(styles.collapsed);
              setConflict('');
            }}
            >
            <Text style={{fontSize: height * 0.025, marginTop: height * 0.025, marginLeft: width * 0.15}}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text allowFontScaling={false} style={[styles.title, {marginTop: height * 0.025}]}>Enter Your Username:</Text>
          <Text style={nfStyle}>*Username Not Recognized</Text>
          <Text style={sentStyle}>*Reset Link Sent To Email On File.</Text>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            value={username}
            onChangeText={(input) => {
              setUsername(input);
            }}
            />
          <TouchableOpacity
            style={{marginBottom: height * 0.25, alignSelf: "center", borderWidth: height * 0.001, borderRadius: 5, width: height * 0.175, height: height * 0.06 }}
            onPress={() => sendRecoveryEmail()}
            >
            <Text allowFontScaling={false} style={styles.loginText}>Submit</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  bigIcon: {
    width: height * 0.3,
    alignSelf: "center",
    marginTop: height * 0.1,
    marginBottom: height * 0.025,
  },
  main: {
    width: width,
  },
  collapsed: {
    display: "none",
  },
  row: {
    flexDirection: "row",
  },
  title: {
    marginLeft: width * 0.15,
    marginBottom: height * 0.01,
  },  
  badUname: {
    marginLeft: width * 0.03,
    color: "#cc293c"
  },
  textInput: {
    backgroundColor: "#d6d6d7",
    width: width * 0.7,
    height: height * 0.05,
    marginLeft: width * 0.15,
    marginBottom: height * 0.01,
    padding: height * 0.01,
    borderRadius: 5
  },
  login: {
    backgroundColor: "#d6d6d7",
    width: height * 0.2,
    height: height * 0.055,
    marginTop: height * 0.03,
    alignSelf: "center",
    borderRadius: 5
  },
  loginText: {
    fontSize: height * 0.03,
    textAlign: "center",
    marginTop: height * 0.009
  },
  version: {
    textAlign: "center",
    width: width
  },
  forgot: {
    marginTop: height * 0.05,
    textAlign: "center",
  },
  signUp: {
    fontSize: height * 0.03,
    textAlign: "center",
    marginTop: height * 0.01
  },
})

export default LoginPage;