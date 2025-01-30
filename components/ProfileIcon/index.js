import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function Index(props) {
  return (
    <View style={styles.container}>
      <Icon name="account-circle" style={styles.icon2}></Icon>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 43
  },
  icon2: {
    color: "rgba(128,128,128,1)",
    fontSize: 40
  }
});

export default Index;
