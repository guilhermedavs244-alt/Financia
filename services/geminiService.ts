
import { GoogleGenAI, Chat, Type, FunctionDeclaration } from "@google/genai";
import { Transaction, Investment, Tax } from "../types";

// Always initialize GoogleGenAI using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const saveTransactionTool: FunctionDeclaration = {
  name: 'save_transaction',
  parameters: {
    type: Type.OBJECT,
    description: 'Registra uma nova transação financeira (receita ou despesa) baseada no relato do usuário.',
    properties: {
      description: {
        type: Type.STRING,
        description: 'Breve descrição do que foi comprado ou recebido.',
      },
      amount: {
        type: Type.NUMBER,
        description: 'O valor total da transação.',
      },
      category: {
        type: Type.STRING,
        description: 'A categoria que melhor se encaixa.',
      },
      type: {
        type: Type.STRING,
        description: 'Se é uma "income" ou "expense".',
      },
      paymentMethod: {
        type: Type.STRING,
        description: 'O método utilizado: pix, credit, debit, cash.',
      },
      date: {
        type: Type.STRING,
        description: 'Data no formato YYYY-MM-DD.',
      }
    },
    required: ['description', 'amount', 'category', 'type', 'paymentMethod'],
  },
};

const saveInvestmentTool: FunctionDeclaration = {
  name: 'save_investment',
  parameters: {
    type: Type.OBJECT,
    description: 'Registra um novo investimento feito pelo usuário.',
    properties: {
      name: {
        type: Type.STRING,
        description: 'Nome do ativo ou instituição (ex: Petrobras, Tesouro Selic, Bitcoin).',
      },
      ticker: {
        type: Type.STRING,
        description: 'Código do ativo se houver (ex: PETR4, BTC).',
      },
      amount: {
        type: Type.NUMBER,
        description: 'Valor investido.',
      },
      category: {
        type: Type.STRING,
        description: 'Categoria do investimento: stocks (Ações), fixed_income (Renda Fixa), fiis, crypto, treasury (Tesouro).',
      },
      date: {
        type: Type.STRING,
        description: 'Data no formato YYYY-MM-DD.',
      }
    },
    required: ['name', 'amount', 'category'],
  },
};

const saveTaxTool: FunctionDeclaration = {
  name: 'save_tax',
  parameters: {
    type: Type.OBJECT,
    description: 'Registra um novo imposto ou taxa a ser controlado.',
    properties: {
      name: {
        type: Type.STRING,
        description: 'Nome do imposto (ex: IPTU, IPVA, IRPF).',
      },
      amount: {
        type: Type.NUMBER,
        description: 'Valor do imposto.',
      },
      dueDate: {
        type: Type.STRING,
        description: 'Data de vencimento no formato YYYY-MM-DD.',
      },
      category: {
        type: Type.STRING,
        description: 'Categoria: irpf, iptu, ipva, iss, tax_other.',
      },
      status: {
        type: Type.STRING,
        description: 'Status: "paid" ou "pending". Se o usuário disser "paguei", use "paid".',
      }
    },
    required: ['name', 'amount', 'dueDate', 'category', 'status'],
  },
};

export const createFinancialChat = (transactions: Transaction[], investments: Investment[], taxes: Tax[]): Chat => {
  const transSummary = transactions.reduce((acc, curr) => {
    const key = `${curr.type === 'income' ? 'Receita' : 'Despesa'}: ${curr.category}`;
    acc[key] = (acc[key] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const taxSummary = taxes.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const today = new Date().toISOString().split('T')[0];

  const systemInstruction = `
    Você é o Assistente Financ.ia, o cérebro por trás da contabilidade pessoal do usuário.
    Data de hoje: ${today}.
    
    Capacidades:
    1. Transações comuns: 'save_transaction'.
    2. Investimentos/Aportes: 'save_investment'.
    3. Impostos e Taxas: 'save_tax'.
    
    Contexto Atual:
    - Transações: ${JSON.stringify(transSummary)}
    - Impostos: ${JSON.stringify(taxSummary)}
    
    Estilo:
    - Respostas curtas, elegantes e Apple-style.
    - Ajude o usuário a não esquecer prazos de impostos.
    - Use negrito em **valores** e **datas**.
  `;

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction,
      temperature: 0.5,
      tools: [{ functionDeclarations: [saveTransactionTool, saveInvestmentTool, saveTaxTool] }],
    },
  });
};
