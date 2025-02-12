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
import { useMemory } from '../MemoryContext';

const { width, height } = Dimensions.get('window');

function LoginPage () {
  const navigation = useNavigation();
  // login bypass
  /*navigation.reset({
    index: 0,
    routes: [{ name: "Monthly View", params: {month: new Date().getMonth(), year: new Date().getFullYear()} }],
  });
  */
  const [conflict, setConflict] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mainView, setMainView] = useState(styles.main);
  const [forgotView, setForgotView] = useState(styles.collapsed);
  const [nfStyle, setNfStyle] = useState(styles.collapsed);
  const [sentStyle, setSentStyle] = useState(styles.collapsed);
  const { myMemory, setMyMemory } = useMemory();

  async function saveData (userInfo) {
    setMyMemory((prev) => ({ ...prev, userInfo: userInfo }));
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
    const response = await fetch('https://surgiflow.replit.app/recoveryEmail', headers)
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
    const response = await fetch('https://surgiflow.replit.app/login', headers)
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
        await saveData(response.userInfo);
        if (response.userInfo.plan == "Individual") {
          navigation.reset({
            index: 0,
            routes: [{ name: "Monthly View", params: {month: new Date().getMonth(), year: new Date().getFullYear()} }],
          });
        } else if (response.userInfo.plan == "Business") {
          navigation.reset({
            index: 0,
            routes: [{ name: "Business Monthly View", params: {month: new Date().getMonth(), year: new Date().getFullYear()} }],
          });
        }
    }
    return;
  }

  return (
    <SafeAreaView>
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
          <Image source={require('../assets/icons/calendar.png')} style={styles.bigIcon}/>
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.title}>Username:</Text>
            <Text allowFontScaling={false} style={styles.badUname}>{conflict}</Text>
          </View>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            value={username}
            onChangeText={(input) => {
              setUsername(input);
            }}
            />
          <Text allowFontScaling={false} style={styles.title}>Password:</Text>
          <TextInput
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
            <Text style={{fontSize: width * 0.05, marginTop: width * 0.05, marginLeft: width * 0.1}}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text allowFontScaling={false} style={[styles.title, {marginTop: width * 0.05}]}>Enter Your Username:</Text>
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
            style={{marginBottom: width * 0.5, marginLeft: width * 0.5, borderWidth: width * 0.002, borderRadius: 5, width: width * 0.35, height: width * 0.1 }}
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
    width: width * 0.4,
    height: width * 0.4,
    marginLeft: width * 0.3,
    marginTop: width * 0.2,
    marginBottom: width * 0.05,
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
    marginBottom: width * 0.02,
  },  
  badUname: {
    marginLeft: width * 0.03,
    color: "#cc293c"
  },
  textInput: {
    backgroundColor: "#d6d6d7",
    width: width * 0.7,
    height: width * 0.1,
    marginLeft: width * 0.15,
    marginBottom: width * 0.02,
    padding: width * 0.02,
    borderRadius: 5
  },
  login: {
    backgroundColor: "#d6d6d7",
    width: width * 0.3,
    height: width * 0.1,
    marginTop: width * 0.06,
    marginLeft: width * 0.35,
    borderRadius: 5
  },
  loginText: {
    fontSize: width * 0.06,
    marginLeft: width * 0.075,
    marginTop: width * 0.01
  },
  version: {
    textAlign: "center",
    width: width
  },
  forgot: {
    marginTop: width * 0.1,
    textAlign: "center",
  },
  signUp: {
    fontSize: width * 0.06,
    marginLeft: width * 0.045,
    marginTop: width * 0.01
  },
})

export default LoginPage;