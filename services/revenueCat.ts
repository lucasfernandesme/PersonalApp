import { Purchases, PurchasesOfferings, PurchasesPackage, CustomerInfo, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// TODO: Replace with your actual RevenueCat API Keys
const REVENUECAT_API_KEYS = {
    ios: "test_rQMmMBjbbhlroaMCZwCnrubDJOO", // Using test key for both for now
    android: "test_rQMmMBjbbhlroaMCZwCnrubDJOO"
};

export const RevenueCatService = {
    async initialize(userId: string) {
        if (!Capacitor.isNativePlatform()) {
            console.log('RevenueCat authentication skipped: Not running on native platform');
            return;
        }

        try {
            if (Capacitor.getPlatform() === 'ios') {
                await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.ios, appUserID: userId });
            } else if (Capacitor.getPlatform() === 'android') {
                await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.android, appUserID: userId });
            }

            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
            console.log('RevenueCat configured successfully');
        } catch (error) {
            console.error('Error configuring RevenueCat:', error);
        }
    },

    async getOfferings(): Promise<PurchasesOfferings | null> {
        if (!Capacitor.isNativePlatform()) return null;

        try {
            const offerings = await Purchases.getOfferings();
            return offerings;
        } catch (error) {
            console.error('Error fetching offerings:', error);
            return null;
        }
    },

    async purchasePackage(pkg: PurchasesPackage): Promise<{ customerInfo: CustomerInfo; productIdentifier: string; } | null> {
        if (!Capacitor.isNativePlatform()) return null;

        try {
            const { customerInfo, productIdentifier } = await Purchases.purchasePackage({ aPackage: pkg });
            return { customerInfo, productIdentifier };
        } catch (error: any) {
            if (error.userCancelled) {
                console.log('User cancelled purchase');
            } else {
                console.error('Error purchasing package:', error);
            }
            return null;
        }
    },

    async restorePurchases(): Promise<CustomerInfo | null> {
        if (!Capacitor.isNativePlatform()) return null;

        try {
            const { customerInfo } = await Purchases.restorePurchases();
            return customerInfo;
        } catch (error) {
            console.error('Error restoring purchases:', error);
            return null;
        }
    },

    async getCustomerInfo(): Promise<CustomerInfo | null> {
        if (!Capacitor.isNativePlatform()) return null;

        try {
            const { customerInfo } = await Purchases.getCustomerInfo();
            return customerInfo;
        } catch (error) {
            console.error("Error getting customer info:", error);
            return null;
        }
    }
};
