import React from 'react';
import {AppRegistry, StyleSheet, Text, View} from 'react-native';

class HelloWorld extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.hello}>RN 项目 我是更新的内容，来刷新我吧</Text>
        <Text style={styles.hello}>打包命令：
        react-native bundle --platform android --dev false --entry-file index.js --bundle-output app/src/main/assets/index.android.bundle --assets-dest app/src/main/res/
        </Text>
        <Text>
        –platform : 平台(android/ios)
        –dev : 开发模式
        –entry-file : 条目文件
        –bundle-output : bundle文件生成的目录
        –assets-dest : 资源文件生成的目录
        </Text>
      </View>
    );
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  hello: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

AppRegistry.registerComponent('rn_simple', () => HelloWorld);