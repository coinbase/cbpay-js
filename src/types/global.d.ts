declare interface Window {
  // if the widget is rendered inside of react-native-webview, ReactNativeWebView will be defined;
  // if the <WebView> has an onMessage prop, postMessage will be defined (see https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md#the-windowreactnativewebviewpostmessage-method-and-onmessage-prop);
  // so those are independently nullable
  ReactNativeWebView?: { postMessage?: (message: string) => void };
}
