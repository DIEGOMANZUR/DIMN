export interface FormData {
  sheetColor: string;
  header: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  bullet1Line1: string;
  bullet1Line2: string;
  bullet1Line3: string;
  bullet2Line1: string;
  bullet2Line2: string;
  bullet2Line3: string;
  bullet3Line1: string;
  bullet3Line2: string;
  bullet3Line3: string;
  bullet4Line1: string;
  bullet4Line2: string;
  bullet4Line3: string;
  footer: string;
  texture: string;
  otherDetails: string;
}

export interface SavedImage {
  id: string;
  type: 'normal' | 'improved';
  imageBase64: string;
  savedAt: number; // Timestamp for sorting
}
