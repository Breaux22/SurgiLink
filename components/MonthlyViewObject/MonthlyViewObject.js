import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get('window');

function formatTime12Hour(dateString) {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert hour "0" to "12";
  if (hours < 10) {
    hours = "0"+String(hours);
  }
  const minutesFormatted = minutes.toString().padStart(2, '0');
  return `${hours}:${minutesFormatted} ${ampm}`;
}

function Index({ caseProp }) {
  return (
      <View style={styles.container}>
        <View style={styles.rect11}>
          <View style={styles.loremIpsum4Stack}>
            <Text  allowFontScaling={false} style={styles.loremIpsum4}>{formatTime12Hour(caseProp.surgtime)}</Text>
            <Text  allowFontScaling={false} style={styles.acdf17}>{caseProp.proctype}</Text>
            <View style={styles.rect12}></View>
          </View>
          <View style={styles.ptCadRow}>
            <Text  allowFontScaling={false} style={styles.ptCad}>@ {caseProp.hosp}</Text>
          </View>
          <View style={styles.drStevensonRow}>
            <Text  allowFontScaling={false} style={styles.drStevenson}>{caseProp.dr}</Text>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.85,
    height: 105,
    marginLeft: width * 0.02,
    marginTop: 7
  },
  rect11: {
    width: width * 0.85,
    height: 105,
    backgroundColor: "rgba(225,68,97,0.6)",
    borderRadius: 25,
    shadowColor: "rgba(111,4,4,1)",
    shadowOffset: {
      width: 3,
      height: 3
    },
    elevation: 5,
    shadowOpacity: 0.25,
    shadowRadius: 0
  },
  loremIpsum4: {
    top: 0,
    left: 2,
    position: "absolute",
    fontFamily: "roboto-700",
    color: "#121212",
    height: 28,
    width: width * 0.3,
    fontSize: width * 0.05
  },
  rect12: {
    top: 27,
    left: 0,
    width: width * 0.79,
    height: 2,
    position: "absolute",
    backgroundColor: "rgba(111,4,4,0.5)"
  },
  loremIpsum4Stack: {
    width: width * 0.5,
    height: 29,
    marginTop: 5,
    marginLeft: width * 0.03
  },
  ptCad: {
    fontFamily: "roboto-700",
    color: "rgba(111,4,4,1)",
    height: 28,
    fontSize: width * 0.05
  },
  acdf17: {
    fontFamily: "roboto-700",
    color: "rgba(111,4,4,1)",
    height: 28,
    width: width * 0.62,
    fontSize: width * 0.05,
    textAlign: "right",
    marginLeft: width * 0.17
  },
  ptCadRow: {
    height: 28,
    flexDirection: "row",
    marginTop: 7,
    marginLeft: width * 0.03
  },
  drStevenson: {
    fontFamily: "roboto-italic",
    color: "rgba(111,4,4,1)",
    height: 28,
    fontSize: width * 0.05
  },
  drStevensonRow: {
    height: 28,
    flexDirection: "row",
    marginLeft: width * 0.03
  }
});

export default Index;
