import type { Metadata } from 'next';
import SpendenContent from './spenden-content';

export const metadata: Metadata = {
  title: 'Unterstützen – DRK Hinweisgebersystem',
  description: 'Unterstützen Sie das Deutsche Rote Kreuz mit einer Spende.',
};

export default function Spenden() {
  return <SpendenContent />;
}
