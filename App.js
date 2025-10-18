import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import OrderScreen from './src/screen/orderScreen';
import MenuScreen from './src/screen/menuScreen';
import SalesScreen from './src/screen/salesScreen'

export default function App() {
  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#F6F6F6'}}>
      <MenuScreen/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  
});
