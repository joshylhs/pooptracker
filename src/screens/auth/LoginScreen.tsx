import { useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { sendPasswordReset, friendlyAuthError } from '../../services/auth';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';
import TextField from '../../components/shared/TextField';
import { CatAvatarCircle } from '../../components/avatar';
import SpinningRing from '../../components/shared/SpinningRing';
import { useTheme } from '../../hooks/useTheme';

const LOGIN_CAT = {
  bodyColor:    'black'    as const,
  snoutColor:   'white'    as const,
  eyeStyle:     'round'    as const,
  eyePrimary:   'green'    as const,
  eyeSecondary: 'green'    as const,
  cheekStyle:   'freckles' as const,
  headdress:    'none'     as const,
  wallColor:    'dusk'     as const,
  shirt:        'none'     as const,
  accessory:    'none'     as const,
};

const CAT_SIZE = 96;
const RING_SIZE = CAT_SIZE + 20;

const POOP_FACTS = [
  "the average person spends 3 years on the toilet. is it quality time?",
  "fun fact: koalas feed their babies poop. you're welcome.",
  "a group of cats is called a clowder.",
  "a group of poops is called your tuesday.",
  "the urge to poop can travel at 100mph through your nervous system.",
  "ancient romans used a shared sponge on a stick. communally.",
  "your gut has more neurons than your spinal cord. it literally thinks.",
  "healthy poop is 75% water. you're basically a water feature.",
];

export default function LoginScreen() {
  const logIn = useAuthStore(s => s.logIn);
  const { colours } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [poopFact, setPoopFact] = useState('');
  const [tapCount, setTapCount] = useState(0);

  const bounceY = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleCatPress = () => {
    setPoopFact(POOP_FACTS[Math.floor(Math.random() * POOP_FACTS.length)]);
    setTapCount(c => c + 1);
    setMouthOpen(true);
    setBubbleVisible(true);
    Animated.sequence([
      Animated.spring(bounceY, { toValue: -12, useNativeDriver: true, bounciness: 0, speed: 40 }),
      Animated.spring(bounceY, { toValue: 0,   useNativeDriver: true, bounciness: 8, speed: 12 }),
    ]).start();
    Animated.sequence([
      Animated.timing(bubbleOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(bubbleOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setMouthOpen(false);
      setBubbleVisible(false);
    });
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'Reset password',
      "Enter your email and we'll send you a reset link.",
      async enteredEmail => {
        const addr = (enteredEmail ?? email).trim();
        if (!addr) return;
        try {
          await sendPasswordReset(addr);
          Alert.alert('Email sent', `Check ${addr} for a reset link. If you don't see it, check your spam folder!`);
        } catch (e) {
          Alert.alert('Error', friendlyAuthError(e));
        }
      },
      'plain-text',
      email.trim(),
      'email-address',
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await logIn({ email: email.trim(), password });
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer centered>
      <View style={{ flex: 1 }} />

      {/* Cat + ring */}
      <View style={styles.catWrap}>
        {bubbleVisible && (
          <Animated.View style={[styles.bubble, { opacity: bubbleOpacity }]}>
            <View style={styles.bubbleBody}>
              <AppText variant="caption" style={styles.bubbleText}>{poopFact}</AppText>
            </View>
            <View style={styles.bubbleTail} />
          </Animated.View>
        )}
        <Animated.View style={{ transform: [{ translateY: bounceY }] }}>
          <Pressable onPress={handleCatPress}>
            <SpinningRing size={RING_SIZE} avatarSize={CAT_SIZE} color={colours.primary400} dashCount={50} dashRatio={0.2} rounded duration={16000}>
              <CatAvatarCircle
                config={LOGIN_CAT}
                size={CAT_SIZE}
                mood={mouthOpen ? 'default' : 'inactive'}
              />
            </SpinningRing>
          </Pressable>
        </Animated.View>
      </View>

      {/* Wordmark */}
      <AppText variant="screenTitle" style={styles.wordmark}>Welcome back!</AppText>
      <AppText variant="caption" colour="textSecondary" style={styles.subtext}>
        {tapCount >= 1 ? 'alright stop tapping him.' : "don't tap him."}
      </AppText>

      {/* Form */}
      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          placeholder="you@example.com"
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={error}
        />

        <Pressable
          onPress={handleForgotPassword}
          hitSlop={8}
          style={({ pressed }) => [styles.forgotLink, { opacity: pressed ? 0.45 : 1 }]}
        >
          <AppText variant="caption" colour="textSecondary">Forgot password?</AppText>
        </Pressable>

        <View style={styles.submit}>
          <Button
            title="Log in"
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
          />
        </View>
      </View>

      <View style={{ flex: 4 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  catWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bubble: {
    position: 'absolute',
    bottom: '40%',
    left: '57%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  bubbleBody: {
    backgroundColor: '#7F77DD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 160,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderTopWidth: 16,
    borderRightWidth: 16,
    borderTopColor: '#7F77DD',
    borderRightColor: 'transparent',
    marginLeft: 0,
    marginTop: -8,
    transform: [{ rotate: '30deg' }],
  },
  bubbleText: {
    color: '#fff',
  },
  wordmark: {
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 12,
  },
  subtext: { textAlign: 'center', marginTop: -18, marginBottom: 24 },
  forgotLink: { alignSelf: 'flex-end', marginTop: 4 },
  submit: { marginTop: 4 },
});
