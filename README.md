在现有的Android项目中集成React-Native项目，是在原来的Android项目中添加RN项目。其结构大致如下：


## 一、配置ReactNative的JS环境
进入到项目的根目录，Termina窗口，输入以下命令
```npm init```

会提示输入配置信息：
package name： 项目名
version：版本号
description:对项目的描述
entry point：项目入口文件（一般使用那个JS文件作为node服务，就填写那个文件）
test command：项目启动的时候需要用什么来执行脚本文件（默认为node app.js）
keywirds：项目关键字
author：作者名字
license：发行项目需要的证书

输入完成后会得到一个package.json文件
```
{
  "name": "rn_simple",
  "version": "0.0.1",
  "description": "simple",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
  },
  "author": "ylp",
  "license": "ISC",
  "dependencies": {
    "react": "^16.8.3",
    "react-native": "^0.61.5"
  }
}
```
添加启动脚本到package.json中（在“scripts”对象中），注意脚本路径与实际目录是一致。
"start": "node node_modules/react-native/local-cli/cli.js start"


## 二、安装React和ReactNative
在Terminal窗口中输入如下命令
```
npm install --save react react-native
npm i -s react@16.8.3
```

## 三、添加ReactNative依赖到Android项目
在项目的build.gradle中添加
```
android {
    ...
    defaultConfig {
        ...
        ndk {
            //选择要添加的对应cpu类型的.so库。
            abiFilters 'armeabi', "armeabi-v7a", "armeabi-v7a", "x86"
        }
    }
   ...
    configurations.all {
        resolutionStrategy.force 'com.google.code.findbugs:jsr305:3.0.0'
    }
    ...
}

def jscFlavor = 'org.webkit:android-jsc:+'
project.ext.react = [
        entryFile   : "index.js",
        enableHermes: false,  // clean and rebuild if changing
]
def enableHermes = project.ext.react.get("enableHermes", false)
def useIntlJsc = false
dependencies {
    ...
    implementation "com.facebook.react:react-native:0.61.5"
    ...
   if (enableHermes) {
        def hermesPath = "../../node_modules/hermes-engine/android/"
        debugImplementation files(hermesPath + "hermes-debug.aar")
        releaseImplementation files(hermesPath + "hermes-release.aar")
    } else {
        implementation jscFlavor
    }
    if (useIntlJsc) {
        implementation 'org.webkit:android-jsc-intl:+'
    } else {
        implementation 'org.webkit:android-jsc:+'
    }
}
```
在根目录的build.gradle文件中添加
```
allprojects {
    repositories {
       ...
        mavenLocal()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/node_modules/react-native/android"
        }
        maven {
            // Android JSC is installed from npm
            url("$rootDir/node_modules/jsc-android/dist")
        }
    }
}
```

## 四、添加ReactNative界面
在根目录添加index.js文件，这个文件是ReactNative的入口文件
```
import React from 'react';
import {AppRegistry, StyleSheet, Text, View} from 'react-native';

class HelloWorld extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.hello}>RN 项目</Text>
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
```

## 五、使用Activity展示RN
在新版的RN，0.55以后版本，我们不需要实现DefaultHardwareBtnHandler接口，直接继承ReactActivity，实现getMainComponentName()方法，在该方法中返回一开始我们注册的ReactNative的名称即可，在ReactNative中，已经帮我们实现了ReactRoot与ReactInstanceMange的配置，在之前的版本中，ReactRoot与ReactInstanceManger需要我们自己去写。
```
public class BaseRnActivity extends ReactActivity {
    @Nullable
    @Override
    protected String getMainComponentName() {
        return "Android_With_RN";
    }
}
```

在AndroidManifest.xml中添加刚创建的Activity与DevSettingsActivity。
```
<activity
    android:name=".BaseRnActivity"
    android:label="@string/app_name"
    android:theme="@style/Theme.AppCompat.Light.NoActionBar">
</activity>
<activity android:name="com.facebook.react.devsupport.DevSettingsActivity"/>
```

## 六、添加权限
在AndroidManifest.xml中添加（debug模式需要悬浮窗权限）
```
<!-- 网络权限 -->
<uses-permission android:name="android.permission.INTERNET"/>
<!-- 弹框权限 -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
<!-- 窗体覆盖权限 -->
<uses-permission android:name="android.permission.SYSTEM_OVERLAY_WINDOW" />
```
Android6.0及以上需要动态申请权限
```
static final int OVERLAY_PERMISSION_REQ_CODE = 1000;
private void checkAppPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(this)) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + getPackageName()));
                startActivityForResult(intent, OVERLAY_PERMISSION_REQ_CODE);
            }
        }
    }
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == OVERLAY_PERMISSION_REQ_CODE) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(this)) {
                    //SYSTEM_ALERT_WINDOW被拒绝
                }
            }
        }
    }
```

## 七、在Application中实现ReactApplication接口
在MyApplication中初始化一个ReactNativeHost，该MyApplocation继承Application并实现ReactApplication，在源码loadApp方法时，会将当前的Activity的Application强制转换成ReactApplication。并在onCreate()方法中添加（SoLoader.init(this, false);）
```
public class MyApplication extends Application implements ReactApplication {
    ...
    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage()
            );
        }
    };
    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, false);
        ...
    }

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }
    ...
}
```

## 八、在原生界面添加跳转按钮启动BaseRnActivity.class
```
startActivity(new Intent(MainActivity.this, BaseRnActivity.class));
```

## 九、AndroidStudio打包
使用AndroidStudio来打release包，其步骤基本和原生应用一样，只是在每次编译之前需要先执行js文件的打包（即生成离线的jsbundle文件）。具体js打包命令如下：
```
react-native bundle --platform android --dev false --entry-file index.js --bundle-output app/src/main/assets/index.android.bundle --assets-dest app/src/main/res/
```
命令说明：
–platform : 平台(android/ios)
–dev : 开发模式
–entry-file : 条目文件
–bundle-output : bundle文件生成的目录
–assets-dest : 资源文件生成的目录
注意：bundle文件路径，把上述命令中的路径转换为你实际项目的路径。如果assets目录不存在，则需要手动的在app/src/main/目录中添加一个assets目录。

## 十、大功告成，运行项目即可



