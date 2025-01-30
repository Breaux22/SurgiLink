import React, { Component, useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { Image, StyleSheet, ScrollView, View, Text, Button, TouchableOpacity, Dimensions } from "react-native";
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

function Index({ day, week, cases, backTo }) {
  const [caseList, setCaseList] = useState([]);
  const [key, setKey] = useState(0);
  const [rowWidth, setRowWidth] = useState(styles.scrollBox);
  const route = useRoute();
  const navigation = useNavigation();

  function updateValues () {
    cases.then(myCases => {
      const sortedArr = myCases.sort((a, b) => new Date(a.dateString) - new Date(b.dateString));
      setCaseList(sortedArr);
      if (myCases.length > 1) {
        setRowWidth(styles.scrollBox1);
      } else {
        setRowWidth(styles.scrollBox);
      }
    })
  }

  function formatTo12HourTime(dateString) {
      const date = new Date(dateString);
      let hours = date.getHours(); // 0-23
      const minutes = date.getMinutes(); // 0-59
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // 0 becomes 12 in 12-hour format
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${hours}:${formattedMinutes} ${ampm}`;
  }

  useEffect(() => {
    if (cases) {
      updateValues();
    }
  }, [cases]);
  
  return (
      <View style={styles.row}>
        <TouchableOpacity style={styles.goToDaily} >
            <Text  allowFontScaling={false}  style={{fontWeight: "bold"}}>{day.slice(0,3)}</Text>
            <Text  allowFontScaling={false} >{week.monthString}, {week.day}</Text>
            <Text  allowFontScaling={false} >-</Text>
            <View>
              {caseList.length === 1 ? (
                <Text  allowFontScaling={false} >1 Case</Text>
              ) : caseList.length > 1 ? (
                <Text  allowFontScaling={false} >{caseList.length} Cases</Text>
              ) : (
                <Text  allowFontScaling={false} >No Cases</Text>
              )}
            </View>
        </TouchableOpacity>
        <View style={rowWidth}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.row}>
            {caseList.map((myCase, index) => (
              <TouchableOpacity 
                  key={myCase.surgdate + index} 
                  style={styles.case1} 
                  onPress={() => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Case Info', params: {backTo: backTo, caseProp: myCase}}],
                    });                                                                      
                  }}>
                <View style={styles.row1}>
                  <Text  allowFontScaling={false}  style={styles.time}>{formatTo12HourTime(myCase.dateString)}</Text>
                  <Text  allowFontScaling={false}  style={styles.proctype}>{myCase.proctype}</Text>
                </View>
                <Text  allowFontScaling={false} >{myCase.dr}</Text>
                <Text  allowFontScaling={false} >@{myCase.hosp}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  row: {
      flexDirection: 'row'
  },
  row1: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "rgba(79,2,2, 0.25)"
  },
  collapsed: {
    display: "none",
  },
  time: {
    marginRight: width * 0.08,
  },
  proctype: {
    textAlign: "right",
    marginLeft: "auto"
  },
  goToDaily: {
    backgroundColor: "#cbf5cf",
    marginLeft: width * 0.035,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: width * 0.002,
    borderColor: "rgba(41,6,15, 0.4)",
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    marginBottom: 5,
    height: 75,
    width: width * 0.28,
    padding: width * 0.009
  },
  scrollBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: width * 0.002,
    borderLeftWidth: width * 0.002,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderColor: "rgba(41,6,15, 0.4)",
    height: 75,
    width: width * 0.66,
    marginBottom: 7,
    paddingLeft: width * 0.015
  },
  scrollBox1: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: width * 0.002,
    borderLeftWidth: width * 0.002,
    borderColor: "rgba(41,6,15, 0.4)",
    height: 75,
    width: width * 0.685,
    marginBottom: 7,
    paddingLeft: width * 0.015
  },
  case1: {
    backgroundColor: "#dae9f7",
    height: 63,
    marginTop: 5,
    marginRight: width * 0.015,
    borderRadius: 5,
    padding: width * 0.01
  },
  case2: {
    backgroundColor: "rgba(225,68,97,0.6)",
    height: 63,
    marginTop: 5,
    marginLeft: width * 0.01,
    borderRadius: 5,
    padding: width * 0.01
  },
  dateGroup: {
    marginTop: 5,
  },
  menu: {
    backgroundColor: "#EFEFEF4",
    marginTop: width * 0.05,
    marginLeft: width * 0.02,
  },
  option: {
    backgroundColor: "rgba(0, 122, 255, 0.8)",
    width: width * 0.4,
    height: width * 0.09,
    marginBottom: width * 0.02,
    borderRadius: 5
  },
  optionText: {
    color: "#fff",
    fontSize: width * 0.06,
    marginTop: width * 0.0075,
    textAlign: "center"
  },
  menuButtons: {
    backgroundColor: "#EFEFEF4",
    marginBottom: width * 0.02,
  },
  collapsed: {
    display: 'none',
  },
  icon3: {
    width: width * 0.1,
    height: width * 0.1,
    marginLeft: width * 0.02,
  },
  menu: {
    position: "absolute", 
    backgroundColor: "#d6d7d8", 
    height: height, 
    width: width * 0.5, 
    zIndex: 1, 
    marginTop: width * 0.24, 
    opacity: 0.98
  },
  option: {
    //backgroundColor: "rgba(0, 122, 255, 0.8)",
    width: width * 0.4,
    height: width * 0.09,
    marginLeft: width * 0.02,
    marginTop: width * 0.04,
    marginBottom: width * 0.02,
    borderBottomWidth: 1,
    borderRadius: 5
  },
  optionText: {
    //color: "#fff",
    fontSize: width * 0.06,
    marginTop: width * 0.0075,
    textAlign: "center"
  },
});

export default Index;
