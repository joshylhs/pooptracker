import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import LoginScreen from '../screens/auth/LoginScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  Signup: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
