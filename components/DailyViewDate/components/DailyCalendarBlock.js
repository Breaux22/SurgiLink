import React, { Component } from "react";
import { StyleSheet, View } from "react-native";

function DailyCalendarBlock(props) {
  return <View style={[styles.container, props.style]}></View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(213,251,246,1)",
    borderRadius: 25
  }
});

export default DailyCalendarBlock;
