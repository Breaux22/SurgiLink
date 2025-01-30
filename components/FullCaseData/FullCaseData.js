import React, { Component } from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import MaterialIconTextbox from "./components/MaterialIconTextbox";
import MaterialFixedLabelTextbox from "./components/MaterialFixedLabelTextbox";

function Index(props) {
  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <View style={styles.scrollArea}>
          <ScrollView
            horizontal={false}
            contentContainerStyle={styles.scrollArea_contentContainerStyle}
          >
            <Text  allowFontScaling={false}  style={styles.surgeryDate}>Surgery Date</Text>
            <MaterialIconTextbox
              style={styles.materialIconTextbox}
            ></MaterialIconTextbox>
            <Text  allowFontScaling={false}  style={styles.surgeryTime}>Surgery Time</Text>
            <MaterialFixedLabelTextbox
              style={styles.materialFixedLabelTextbox}
            ></MaterialFixedLabelTextbox>
            <View style={styles.materialFixedLabelTextbox2Stack}>
              <MaterialFixedLabelTextbox
                style={styles.materialFixedLabelTextbox2}
              ></MaterialFixedLabelTextbox>
              <Text  allowFontScaling={false}  style={styles.procedureType}>Procedure Type</Text>
            </View>
            <View style={styles.setsNeededUsedStack}>
              <Text  allowFontScaling={false}  style={styles.setsNeededUsed}>Sets Needed/Used</Text>
              <MaterialFixedLabelTextbox
                style={styles.materialFixedLabelTextbox3}
              ></MaterialFixedLabelTextbox>
            </View>
            <Text  allowFontScaling={false}  style={styles.ptInitials}>Pt. Initials</Text>
            <MaterialFixedLabelTextbox
              style={styles.materialFixedLabelTextbox8}
            ></MaterialFixedLabelTextbox>
            <Text  allowFontScaling={false}  style={styles.physician}>Physician</Text>
            <MaterialFixedLabelTextbox
              style={styles.materialFixedLabelTextbox9}
            ></MaterialFixedLabelTextbox>
            <Text  allowFontScaling={false}  style={styles.hospital}>Hospital</Text>
            <MaterialFixedLabelTextbox
              style={styles.materialFixedLabelTextbox10}
            ></MaterialFixedLabelTextbox>
            <Text  allowFontScaling={false}  style={styles.orderDate}>Order Date</Text>
            <MaterialFixedLabelTextbox
              style={styles.materialFixedLabelTextbox4}
            ></MaterialFixedLabelTextbox>
            <Text  allowFontScaling={false}  style={styles.receivedDate}>Received Date</Text>
            <MaterialFixedLabelTextbox
              style={styles.materialFixedLabelTextbox5}
            ></MaterialFixedLabelTextbox>
            <Text  allowFontScaling={false}  style={styles.addImages}>Add Images +</Text>
            <Text  allowFontScaling={false}  style={styles.returnByDate}>Return By Date</Text>
            <MaterialFixedLabelTextbox
              style={styles.materialFixedLabelTextbox6}
            ></MaterialFixedLabelTextbox>
            <Text  allowFontScaling={false}  style={styles.shipOutDate}>Ship Out Date</Text>
            <MaterialFixedLabelTextbox
              style={styles.materialFixedLabelTextbox7}
            ></MaterialFixedLabelTextbox>
            <Text  allowFontScaling={false}  style={styles.addImages2}>Add Images +</Text>
            <Text  allowFontScaling={false}  style={styles.notes}>Notes</Text>
            <MaterialFixedLabelTextbox
              style={styles.materialFixedLabelTextbox11}
            ></MaterialFixedLabelTextbox>
            <View style={styles.rect}>
              <Text  allowFontScaling={false}  style={styles.save}>Save</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 350,
    height: 1083,
    justifyContent: "center",
    marginLeft: 17,
    marginTop: 10,
    marginBottom: 20
  },
  group: {
    width: 350,
    height: 1083,
    alignSelf: "center"
  },
  scrollArea: {
    width: 346,
    height: 1075,
    backgroundColor: "rgba(186,210,243,0.9)",
    borderRadius: 25,
    marginLeft: 3
  },
  scrollArea_contentContainerStyle: {
    height: 1075,
    width: 346
  },
  surgeryDate: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 12,
    marginLeft: 6
  },
  materialIconTextbox: {
    height: 43,
    width: 328,
    backgroundColor: "#fff",
    marginLeft: 6
  },
  surgeryTime: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 3,
    marginLeft: 6
  },
  materialFixedLabelTextbox: {
    height: 43,
    width: 328,
    backgroundColor: "#fff",
    marginLeft: 6
  },
  materialFixedLabelTextbox2: {
    height: 43,
    width: 328,
    position: "absolute",
    left: 0,
    top: 19,
    backgroundColor: "#fff"
  },
  procedureType: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273
  },
  materialFixedLabelTextbox2Stack: {
    width: 328,
    height: 62,
    marginTop: 2,
    marginLeft: 6
  },
  setsNeededUsed: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273
  },
  materialFixedLabelTextbox3: {
    height: 43,
    width: 328,
    position: "absolute",
    left: 0,
    top: 18,
    backgroundColor: "#fff"
  },
  setsNeededUsedStack: {
    width: 328,
    height: 61,
    marginTop: 3,
    marginLeft: 6
  },
  ptInitials: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 5,
    marginLeft: 6
  },
  materialFixedLabelTextbox8: {
    height: 43,
    width: 328,
    backgroundColor: "#fff",
    marginLeft: 6
  },
  physician: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 5,
    marginLeft: 6
  },
  materialFixedLabelTextbox9: {
    height: 43,
    width: 328,
    backgroundColor: "#fff",
    marginTop: 1,
    marginLeft: 6
  },
  hospital: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 6,
    marginLeft: 6
  },
  materialFixedLabelTextbox10: {
    height: 43,
    width: 328,
    backgroundColor: "#fff",
    marginTop: 3,
    marginLeft: 6
  },
  orderDate: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 6,
    marginLeft: 6
  },
  materialFixedLabelTextbox4: {
    height: 43,
    width: 328,
    backgroundColor: "#fff",
    marginTop: 1,
    marginLeft: 6
  },
  receivedDate: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 4,
    marginLeft: 6
  },
  materialFixedLabelTextbox5: {
    height: 43,
    width: 328,
    backgroundColor: "#fff",
    marginLeft: 6
  },
  addImages: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    textAlign: "center",
    marginTop: 11,
    marginLeft: 34
  },
  returnByDate: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 12,
    marginLeft: 6
  },
  materialFixedLabelTextbox6: {
    height: 43,
    width: 328,
    backgroundColor: "#fff",
    marginLeft: 6
  },
  shipOutDate: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 4,
    marginLeft: 6
  },
  materialFixedLabelTextbox7: {
    height: 43,
    width: 328,
    backgroundColor: "#fff",
    marginLeft: 6
  },
  addImages2: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    textAlign: "center",
    marginTop: 13,
    marginLeft: 34
  },
  notes: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 20,
    width: 273,
    marginTop: 12,
    marginLeft: 9
  },
  materialFixedLabelTextbox11: {
    height: 128,
    width: 328,
    backgroundColor: "#fff",
    marginTop: 1,
    marginLeft: 9
  },
  rect: {
    width: 166,
    height: 52,
    backgroundColor: "#E6E6E6",
    borderRadius: 15,
    marginTop: 20,
    marginLeft: 87
  },
  save: {
    fontFamily: "roboto-700",
    color: "#121212",
    height: 26,
    width: 127,
    fontSize: 20,
    textAlign: "center",
    marginTop: 13,
    marginLeft: 20
  }
});

export default Index;
