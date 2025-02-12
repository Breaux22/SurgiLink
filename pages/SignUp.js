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

function SignUpPage () {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [usernameConflict, setUsernameConflict] = useState('');
  const [noMatch, setNoMatch] = useState('');
  const [choice, setChoice] = useState(styles.choice);
  const [plan, setPlan] = useState('');
  const [version, setVersion] = useState(styles.version1);
  const {myMemory, setMyMemory} = useMemory();

  async function createUser () {
    if (password != password2) {
      setNoMatch('Passwords Do Not Match.');
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
      const response = await fetch('https://surgiflow.replit.app/createUser', headers)
        .then(response => {
          if (!response.ok) {
            console.error('Error - createUser()')
          }
          return response.json()
        })
        .then(data => {return data})
      if (response.myMessage == 'Username Already In Use.') {
        setUsernameConflict('Username Already In Use.')
      } else {
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
          <Text allowFontScaling={false} style={styles.planStyle}>You Chose: {plan}</Text>
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.title}>Create Username:</Text>
            <Text allowFontScaling={false} style={styles.badUname}>{usernameConflict}</Text>
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
        <Text allowFontScaling={false} style={version}>Distributed By: Tech Breauxs, Inc</Text>
        <Text allowFontScaling={false} style={[styles.version, {marginBottom: width * 0.35}]}>v1.0.3</Text>
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
  choice: {
    width: width,
  },
  choice1: {
    backgroundColor: "#fff",
    height: width * 0.6,
    width: width * 0.85,
    marginLeft: width * 0.075,
    borderRadius: 5,
    borderWidth: width * 0.002,
    marginBottom: width * 0.05
  },
  choice2: {
    backgroundColor: "#fff",
    height: width * 0.6,
    width: width * 0.85,
    marginLeft: width * 0.075,
    borderWidth: width * 0.002,
    borderRadius: 5,
  },
  choiceName: {
    textAlign: "center",
    fontSize: width * 0.1,
    fontWeight: "bold",
    marginTop: width * 0.04
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
    width: width * 0.4,
    height: width * 0.1,
    marginTop: width * 0.06,
    marginLeft: width * 0.3,
    marginBottom: width * 0.1,
    borderRadius: 5
  },
  loginText: {
    fontSize: width * 0.06,
    textAlign: "center",
    marginTop: width * 0.01
  },
  signUp: {
    backgroundColor: "#d6d6d7",
    width: width * 0.5,
    height: width * 0.1,
    marginTop: width * 0.06,
    marginLeft: width * 0.25,
    borderRadius: 5
  },
  signUpText: {
    fontSize: width * 0.06,
    marginLeft: width * 0.055,
    marginTop: width * 0.01
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