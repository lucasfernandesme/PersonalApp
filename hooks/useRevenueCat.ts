import { useState, useEffect } from 'react';
import { PurchasesOfferings, CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { RevenueCatService } from '../services/revenueCat';
import { useAuth } from '../contexts/AuthContext';

export function useRevenueCat() {
    const { user } = useAuth();
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (user?.id && Capacitor.isNativePlatform()) {
                setIsLoading(true);
                await RevenueCatService.initialize(user.id);
                const offs = await RevenueCatService.getOfferings();
                setOfferings(offs);
                const info = await RevenueCatService.getCustomerInfo();
                setCustomerInfo(info);
                setIsLoading(false);
            }
        };

        if (user?.id) {
            init();
        }
    }, [user?.id]);

    const purchasePackage = async (pkg: PurchasesPackage) => {
        setIsPurchasing(true);
        try {
            const result = await RevenueCatService.purchasePackage(pkg);
            if (result) {
                setCustomerInfo(result.customerInfo);
                return result;
            }
        } finally {
            setIsPurchasing(false);
        }
        return null;
    };

    const restorePurchases = async () => {
        setIsLoading(true);
        try {
            const info = await RevenueCatService.restorePurchases();
            if (info) {
                setCustomerInfo(info);
            }
            return info;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        offerings,
        customerInfo,
        isLoading,
        isPurchasing,
        purchasePackage,
        restorePurchases
    };
}
