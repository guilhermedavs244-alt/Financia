
export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
}

export interface Investment {
  id: string;
  name: string;
  ticker?: string;
  amount: number;
  date: string;
  category: string;
}

export interface Tax {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  status: 'paid' | 'pending';
}

export enum TabType {
  INCOME = 'income',
  EXPENSE = 'expense',
  DASHBOARD = 'dashboard',
  SETTINGS = 'settings',
  INVESTMENTS = 'investments',
  TAXES = 'taxes'
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salário', color: '#34C759', icon: '💰' },
  { id: 'freelance', name: 'Freelance', color: '#5856D6', icon: '💻' },
  { id: 'investments', name: 'Investimentos', color: '#007AFF', icon: '📈' },
  { id: 'other_income', name: 'Outros', color: '#8E8E93', icon: '✨' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Alimentação', color: '#FF9500', icon: '🍔' },
  { id: 'rent', name: 'Moradia', color: '#FF3B30', icon: '🏠' },
  { id: 'transport', name: 'Transporte', color: '#5AC8FA', icon: '🚗' },
  { id: 'entertainment', name: 'Lazer', color: '#AF52DE', icon: '🍿' },
  { id: 'health', name: 'Saúde', color: '#FF2D55', icon: '🏥' },
  { id: 'other_expense', name: 'Outros', color: '#8E8E93', icon: '📦' },
];

export const INVESTMENT_CATEGORIES: Category[] = [
  { id: 'stocks', name: 'Ações', color: '#007AFF', icon: '📊' },
  { id: 'fixed_income', name: 'Renda Fixa', color: '#34C759', icon: '🛡️' },
  { id: 'fiis', name: 'FIIs', color: '#FF9500', icon: '🏢' },
  { id: 'crypto', name: 'Cripto', color: '#5856D6', icon: '₿' },
  { id: 'treasury', name: 'Tesouro', color: '#FF3B30', icon: '🇧🇷' },
  { id: 'other_invest', name: 'Outros', color: '#8E8E93', icon: '🪙' },
];

export const TAX_CATEGORIES: Category[] = [
  { id: 'irpf', name: 'IRPF', color: '#34C759', icon: '🦁' },
  { id: 'iptu', name: 'IPTU', color: '#5856D6', icon: '🏠' },
  { id: 'ipva', name: 'IPVA', color: '#007AFF', icon: '🚗' },
  { id: 'iss', name: 'ISS/MEI', color: '#FF9500', icon: '💼' },
  { id: 'tax_other', name: 'Taxas/Outros', color: '#8E8E93', icon: '📜' },
];

export const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: string }[] = [
  { id: 'pix', name: 'Pix', icon: '📱' },
  { id: 'credit', name: 'Crédito', icon: '💳' },
  { id: 'debit', name: 'Débito', icon: '🏧' },
  { id: 'cash', name: 'Dinheiro', icon: '💵' },
];
