import { useRouter } from 'next/router';
import Navbar from '../organisms/Navbar';
import Footer from '../organisms/Footer';
import PageHeader, { GoBackProps } from '../molecule/PageHeader';
import TitleMain from '../molecule/TitleMain';
import { Container } from '../../styles/components/templates/PageTemplate';
import { HTMLAttributes } from 'react';
interface PageTemplateProps extends HTMLAttributes<HTMLDivElement>{
  titleMain?: {
    title?: string,
    subTitle?: string,
  };
  // backLinkUrl: UrlObject | string;
  buttonType: GoBackProps;
  containerStyle?: object;
}

const PageTemplate = ({ children, titleMain, buttonType, containerStyle = { maxWidth: 400 } }: PageTemplateProps) => {
  const router = useRouter();

  return (
    <>
      <Navbar />
        <Container className={router.pathname === '/carrinho' && 'cart-width'} style={containerStyle} >
          <PageHeader buttonType={buttonType} />

          {titleMain && <TitleMain title={titleMain.title} subtitle={titleMain.subTitle}/> }

          <div>
            { children }
          </div>
        </Container>
      <Footer />
    </>
  );
}

export default PageTemplate;
