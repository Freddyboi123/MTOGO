import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import Hero from './Components/Hero';
import CuisineFilter from './Components/CuisineFilter';
import LocalFavorites from './Components/LocalFavorites';
import Inspiration from './Components/Inspiration';
import HowItWorks from './Components/HowItWorks';
import PartnerBand from './Components/PartnerBand';

export default function Landing() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <CuisineFilter />
      <LocalFavorites />
      <Inspiration />
      <HowItWorks />
      <PartnerBand />
      <SiteFooter />
    </>
  );
}
