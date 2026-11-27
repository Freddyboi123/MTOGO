import { useState } from 'react';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import Hero from './Components/Hero';
import CuisineFilter from './Components/CuisineFilter';
import LocalFavorites from './Components/LocalFavorites';
import Inspiration from './Components/Inspiration';
import HowItWorks from './Components/HowItWorks';
import PartnerBand from './Components/PartnerBand';

export default function Landing() {
  const [cuisine, setCuisine] = useState('');
  const [query, setQuery] = useState('');

  return (
    <>
      <SiteHeader />
      <Hero />
      <CuisineFilter
        cuisine={cuisine}
        onCuisineChange={setCuisine}
        query={query}
        onQueryChange={setQuery}
      />
      <LocalFavorites cuisine={cuisine} query={query} />
      <Inspiration />
      <HowItWorks />
      <PartnerBand />
      <SiteFooter />
    </>
  );
}
