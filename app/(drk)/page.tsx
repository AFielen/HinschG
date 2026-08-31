import type { Metadata } from 'next';
import HomeContent from './home-content';

export const metadata: Metadata = {
  title: 'Startseite – DRK Hinweisgebersystem',
  description:
    'Digitale Meldestelle nach dem Hinweisgeberschutzgesetz (HinSchG) – vertraulich oder anonym Hinweise auf Rechtsverstöße melden.',
};

export default function Home() {
  return <HomeContent />;
}
