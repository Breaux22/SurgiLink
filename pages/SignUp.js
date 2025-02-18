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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

function SignUpPage () {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [usernameConflict, setUsernameConflict] = useState(null);
  const [noMatch, setNoMatch] = useState(null);
  const [choice, setChoice] = useState(styles.choice);
  const [plan, setPlan] = useState('');
  const [version, setVersion] = useState(styles.version1);
  const [usernameTooShort, setUsernameTooShort] = useState(null);
  const [passwordTooShort, setPasswordTooShort] = useState(null);

  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  async function createUser () {
    setNoMatch(null);
    setPasswordTooShort(null);
    setUsernameTooShort(null);
    let flag = 0;
    if (password != password2) {
      setNoMatch('Passwords Do Not Match.');
      flag = 1;
    } 
    if (username.length < 8) {
      setUsernameTooShort('Must be 8+ Characters.');
      flag = 1;
    } 
    if (password.length < 8) {
      setPasswordTooShort('Must be 8+ Characters.');
      flag = 1;
    } if (flag == 1) {
      return;
    } else {
      const data = {
        username: username,
        password: password,
        email: email,
        org: org,
        plan: plan
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(data)
      }
      //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/createUser';
      const url = 'https://surgiflow.replit.app/createUser'
      const response = await fetch(url, headers)
        .then(response => {
          if (!response.ok) {
            console.error('Error - createUser()');
          }
          return response.json()
        })
        .then(data => {return data})
      if (response.myMessage == 'Username Already In Use.') {
        setUsernameConflict('Username Already In Use.')
      } else {
          // user has been created
          /*const myData = {
            userInfo: response.data,
            surgeons: [],
            facilities: [],
            trays: [],
            trayUses: [],
            cases: [],
          }
          await AsyncStorage.setItem(username, JSON.stringify(myData));*/
          navigation.reset({
            index: 0,
            routes: [{ name: "Login", params: {} }],
          });
      }
      return;
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <TouchableOpacity
          style={styles.login}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login", params: {} }],
            });
          }}
          >
          <Text allowFontScaling={false} style={styles.loginText}>Back to Login</Text>
        </TouchableOpacity>
        <View style={styles.info}>
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.title}>Create Username:</Text>
            {usernameConflict && <Text allowFontScaling={false} style={styles.badUname}>{usernameConflict}</Text>}
            {usernameTooShort && <Text allowFontScaling={false} style={styles.badUname}>{usernameTooShort}</Text>}
          </View>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            value={username}
            onChangeText={(input) => {
              setUsername(input);
            }}
            />
          <Text allowFontScaling={false} style={styles.title}>Create Password:</Text>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            secureTextEntry={true}
            value={password}
            onChangeText={(input) => {
              setPassword(input);
            }}
            />
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.title}>Enter Password Again:</Text>
            <Text allowFontScaling={false} style={styles.badUname}>{noMatch}</Text>
          </View>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            secureTextEntry={true}
            value={password2}
            onChangeText={(input) => {
              setPassword2(input);
            }}
            />
          <Text allowFontScaling={false} style={styles.title}>Enter Recovery Email:</Text>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            value={email}
            onChangeText={(input) => {
              setEmail(input);
            }}
            />
          <Text allowFontScaling={false} style={styles.title}>Your Organization:</Text>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            value={org}
            onChangeText={(input) => {
              setOrg(input);
            }}
            />
          <TouchableOpacity
            style={styles.signUp}
            onPress={() => createUser()}
            >
            <Text allowFontScaling={false} style={styles.signUpText}>Create Account</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: height * 0.4}}/>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  collapsed: {
    display: "none",
  },
  back: {
    color: "rgba(0, 122, 255, 0.8)",
    marginLeft: width * 0.15,
    marginBottom: width * 0.05
  },
  planStyle: {
    textAlign: "center",
    fontSize: width * 0.05,
    marginBottom: width * 0.075,
  },
  chooseButton: {
    backgroundColor: "rgba(0, 122, 255, 0.5)",
    width: width * 0.4,
    height: width * 0.1,
    marginTop: width * 0.02,
    marginLeft: width * 0.23,
    borderWidth: width * 0.002,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: width * 0.04,
    marginLeft: width * 0.045,
    marginTop: width * 0.025
  },
  feature: {
    textAlign: "center",
    fontSize: width * 0.06
  },
  info: {
    width: width
  },
  bigIcon: {
    width: width * 0.4,
    height: width * 0.4,
    marginLeft: width * 0.3,
    marginTop: width * 0.25,
    marginBottom: width * 0.05,
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
    fontSize: height * 0.02,
    alignSelf: "center",
    marginBottom: height * 0.01,
    padding: height * 0.01,
    borderRadius: 5
  },
  login: {
    backgroundColor: "#d6d6d7",
    width: width * 0.4,
    height: height * 0.05,
    marginTop: height * 0.03,
    alignSelf: "center",
    marginBottom: height * 0.05,
    borderRadius: 5
  },
  loginText: {
    fontSize: height * 0.03,
    textAlign: "center",
    marginTop: height * 0.005
  },
  signUp: {
    backgroundColor: "#d6d6d7",
    width: width * 0.5,
    height: height * 0.05,
    marginTop: width * 0.06,
    alignSelf: "center",
    borderRadius: 5
  },
  signUpText: {
    fontSize: height * 0.03,
    textAlign: "center",
    marginTop: height * 0.005
  },
  version: {
    textAlign: "center",
    width: width,
  },
  version1: {
    textAlign: "center",
    width: width,
    marginTop: width * 0.35
  },  
  version2: {
    textAlign: "center",
    width: width,
    marginTop: width * 0.2
  },
  forgot: {
    marginTop: width * 0.05,
    textAlign: "center",
  },
})

export default SignUpPage;