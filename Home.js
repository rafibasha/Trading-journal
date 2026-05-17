
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import AppsAirPush from "appsairpush-react-native";
const COLORS = {
    background: '#0F172A',
    surface: '#1E293B',
    primary: '#f83858ff',
    secondary: '#94A3B8',
    text: '#F8FAFC',
    inputBg: '#334155',
    accent: '#10B981', // Emerald for profit/save
};
const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-2943384832166756/4887325747';
const adrewardUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-2943384832166756/6156780629';
const rewarded = RewardedAd.createForAdRequest(adrewardUnitId, {
    keywords: ['fashion', 'clothing'],
});

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', uppercase = false, editable = true, ...props }) => (
    <View style={styles.inputContainer}>
        <Text style={[styles.label, uppercase && styles.uppercaseLabel]}>{label}</Text>
        <TextInput
            style={[styles.input, !editable && { color: COLORS.secondary }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.secondary}
            keyboardType={keyboardType}
            editable={editable}
            {...props}
        />
    </View>
);

function Home() {
    const [capital, setCapital] = useState('50000');
    const [divideValue, setDivideValue] = useState('4');
    const [tradeCapital, setTradeCapital] = useState('12500');
    const [entry, setEntry] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [losspertrade, setLosspertrade] = useState('0');
    const [tp1, setTp1] = useState('');
    const [quantity, setQuantity] = useState('');
    const [rr, setRR] = useState('');
    const [risk, setRisk] = useState('');
    const [reward, setReward] = useState('');
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        AppsAirPush.sync({
            appId: 'journal-1778988119385'
        });
        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setLoaded(true);
        });
        const unsubscribeEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                console.log('User earned reward of ', reward);
            },
        );
        const unsubscribeClosed = rewarded.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setLoaded(false);
                rewarded.load();
            }
        );

        // Start loading the rewarded ad straight away
        rewarded.load();

        // Unsubscribe from events on unmount
        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
        };
    }, []);

    useEffect(() => {
        const cap = parseInt(capital) || 0;
        const div = parseInt(divideValue) || 1;
        const tc = parseInt(cap / div);

        setTradeCapital(tc.toString());

        const riskPerTrade = 500;
        const entryPrice = parseFloat(entry);
        const slPrice = parseFloat(stopLoss);
        const tpPrice = parseFloat(tp1);

        if (!isNaN(entryPrice) && !isNaN(slPrice)) {
            const riskPerShare = Math.abs(entryPrice - slPrice);

            if (riskPerShare > 0) {
                // Calculate quantity based on 500 total risk
                let calculatedQuantity = riskPerTrade / riskPerShare;

                // Limit quantity by trade capital
                const maxQuantityFromCapital = tc / entryPrice;
                if (calculatedQuantity > maxQuantityFromCapital) {
                    calculatedQuantity = maxQuantityFromCapital;
                }

                const finalQty = Math.floor(calculatedQuantity);
                setQuantity(finalQty.toString());

                // Update loss per trade based on final quantity and risk per share
                setLosspertrade((finalQty * riskPerShare).toFixed(2));
            } else {
                setQuantity('');
                setLosspertrade('0.00');
            }

            setRisk(riskPerShare.toFixed(2));

            if (!isNaN(tpPrice)) {
                const rewardVal = Math.abs(tpPrice - entryPrice);
                setReward(rewardVal.toFixed(2));
                if (riskPerShare > 0) {
                    setRR(`1:${(rewardVal / riskPerShare).toFixed(2)}`);
                } else {
                    setRR('');
                }
            }
            else if (!isNaN(stopLoss)) {

                setRR('1:0');
            }
            else {
                setReward('');
                setRR('0:0');
            }
        } else {
            setRisk('');
            setReward('');
            setQuantity('');
            setRR('0:0');
            setLosspertrade('0.00');
        }
    }, [capital, divideValue, entry, stopLoss, tp1]);

    const handleReset = () => {
        setDivideValue('4');
        setEntry('');
        setStopLoss('');
        setTp1('');
        setRR('');
        if (loaded) {
            rewarded.show();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <View>
                                <Text style={styles.title}>Trading Journal</Text>
                                <Text style={styles.subtitle}>Track your performance</Text>
                            </View>
                            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.resultCard}>
                        <Text style={styles.resultLabel}>QUANTITY</Text>
                        <Text style={styles.resultValue}>{quantity || '0'}</Text>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <InputField
                                    label="CAPITAL"
                                    value={capital}
                                    onChangeText={setCapital}
                                    placeholder="Total"
                                    keyboardType="numeric"
                                    uppercase
                                />
                            </View>
                            <View style={[styles.halfWidth, { marginLeft: 12 }]}>
                                <Text style={[styles.label, styles.uppercaseLabel]}>Devide capital</Text>
                                <View style={styles.stepperContainer}>
                                    <TouchableOpacity
                                        onPress={() => setDivideValue(Math.max(1, parseInt(divideValue) - 1).toString())}
                                        style={[styles.stepperButton, parseInt(divideValue) <= 1 && styles.disabledButton]}
                                        disabled={parseInt(divideValue) <= 1}
                                    >
                                        <Text style={styles.stepperButtonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.stepperValueText}>{divideValue}</Text>
                                    <TouchableOpacity
                                        onPress={() => setDivideValue(Math.min(10, parseInt(divideValue) + 1).toString())}
                                        style={[styles.stepperButton, parseInt(divideValue) >= 10 && styles.disabledButton]}
                                        disabled={parseInt(divideValue) >= 10}
                                    >
                                        <Text style={styles.stepperButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <InputField
                                    label="Trade Capital"
                                    value={tradeCapital}
                                    placeholder="Total"
                                    editable={false}
                                    uppercase
                                />
                            </View>
                            <View style={[styles.halfWidth, { marginLeft: 12 }]}>
                                <InputField
                                    label="R:R"
                                    value={rr}
                                    placeholder="1:2"
                                    editable={false}
                                    uppercase
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <InputField
                                    label="Risk"
                                    value={risk}
                                    placeholder="Price"
                                    editable={false}
                                    uppercase
                                />
                            </View>
                            <View style={[styles.halfWidth, { marginLeft: 12 }]}>
                                <InputField
                                    label="ENTRY"
                                    value={entry}
                                    onChangeText={setEntry}
                                    placeholder="Price"
                                    keyboardType="numeric"
                                    uppercase
                                />
                            </View>
                        </View>
                        <View style={styles.row}>

                            <View style={styles.halfWidth}>
                                <InputField
                                    label="Reward"
                                    value={reward}
                                    placeholder="Price"
                                    editable={false}
                                    uppercase
                                />
                            </View>
                            <View style={[styles.halfWidth, { marginLeft: 12 }]}>
                                <InputField
                                    label="SL"
                                    value={stopLoss}
                                    onChangeText={setStopLoss}
                                    placeholder="Price"
                                    keyboardType="numeric"
                                    uppercase
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <InputField
                                    label="Loss per trade"
                                    value={losspertrade}
                                    placeholder="Price"
                                    uppercase
                                    editable={false}
                                />
                            </View>

                            <View style={[styles.halfWidth, { marginLeft: 12 }]}>
                                <InputField
                                    label="TP1"
                                    value={tp1}
                                    onChangeText={setTp1}
                                    placeholder="Price"
                                    keyboardType="numeric"
                                    uppercase
                                />
                            </View>
                        </View>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
            <View style={styles.adContainer}>
                <BannerAd
                    unitId={adUnitId}
                    size={BannerAdSize.BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 5,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resetButton: {
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    resetButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.secondary,
        marginTop: 4,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primary,
        width: 80, // Decreased width for labels to give inputs more space
    },
    uppercaseLabel: {
        letterSpacing: 1,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        flex: 1,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    resultCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 32,
        marginTop: 20,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    resultLabel: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    resultValue: {
        color: COLORS.primary,
        fontSize: 56,
        fontWeight: '900',
        textShadowColor: 'rgba(56, 189, 248, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 40,
        maxHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    pickerList: {
        paddingVertical: 10,
    },
    pickerItem: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    pickerItemText: {
        color: COLORS.secondary,
        fontSize: 20,
        fontWeight: '500',
    },
    activePickerItemText: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: '800',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 4,
        marginTop: 4,
    },
    stepperButton: {
        width: 36,
        height: 36,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    stepperButtonText: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: '700',
    },
    stepperValueText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '800',
    },
    disabledButton: {
        opacity: 0.3,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    adContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: COLORS.background,
    },
});

export default Home;