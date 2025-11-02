// Minimal types for deployment
export interface RateRow {
  bank: string;
  product: string;
  productType?: string;
  tenureLabel?: string;
  tenureYears?: number[] | number;
  rateWithSalary?: string;
  rateWithoutSalary?: string;
  notes?: string;
  [key: string]: any;
}

export interface TariffRow {
  bank: string;
  product: string;  
  feeType: string;
  amount?: string;
  notes?: string;
  [key: string]: any;
}