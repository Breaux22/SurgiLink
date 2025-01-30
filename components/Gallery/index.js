import React, { Component } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import MaterialCardBasic from "./components/MaterialCardBasic";

function Index(props) {
  return (
    <View style={styles.container}>
      <View style={styles.scrollArea}>
        <ScrollView
          horizontal={false}
          contentContainerStyle={styles.scrollArea_contentContainerStyle}
        >
          <View style={styles.materialCardBasicRow}>
            <MaterialCardBasic
              style={styles.materialCardBasic}
            ></MaterialCardBasic>
            <MaterialCardBasic
              style={styles.materialCardBasic2}
            ></MaterialCardBasic>
          </View>
          <View style={styles.materialCardBasic3Row}>
            <MaterialCardBasic
              style={styles.materialCardBasic3}
            ></MaterialCardBasic>
            <MaterialCardBasic
              style={styles.materialCardBasic4}
            ></MaterialCardBasic>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 347,
    height: 720
  },
  scrollArea: {
    width: 347,
    height: 720,
    backgroundColor: "rgba(106,211,241,0.2)",
    borderRadius: 25
  },
  scrollArea_contentContainerStyle: {
    height: 721,
    width: 347
  },
  materialCardBasic: {
    height: 155,
    width: 155,
    borderRadius: 10
  },
  materialCardBasic2: {
    height: 155,
    width: 155,
    borderRadius: 10,
    marginLeft: 13
  },
  materialCardBasicRow: {
    height: 155,
    flexDirection: "row",
    marginTop: 11,
    marginLeft: 11,
    marginRight: 13
  },
  materialCardBasic3: {
    height: 155,
    width: 155,
    borderRadius: 10
  },
  materialCardBasic4: {
    height: 155,
    width: 155,
    borderRadius: 10,
    marginLeft: 13
  },
  materialCardBasic3Row: {
    height: 155,
    flexDirection: "row",
    marginTop: 11,
    marginLeft: 11,
    marginRight: 13
  }
});

export default Index;
