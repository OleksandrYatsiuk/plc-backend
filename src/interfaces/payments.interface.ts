export interface Payment {
    language?: TPaymentLanguage;
    action: TPaymentAction;
    public_key: string;
    amount: number | string;
    currency?: TPaymentCurrency;
    description: string;
    order_id: string;
    version?: string;
}
export type TPaymentLanguage = 'ua' | 'en' | 'ru';
export type TPaymentAction = 'pay' | 'status';
export type TPaymentCurrency = 'UAH';
export enum EPaymentAction {
    PAY = 'pay',
    STATUS = 'status'
}

export interface PaymentForm {
    data: string;
    signature: string
}