import type { Metadata } from 'next';
import HilfeContent from './hilfe-content';

export const metadata: Metadata = {
  title: 'Hilfe – DRK Hinweisgebersystem',
  description: 'Hilfe und häufige Fragen zum DRK Hinweisgebersystem nach HinSchG.',
};

export default function Hilfe() {
  return <HilfeContent />;
}
