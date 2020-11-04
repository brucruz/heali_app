import { useRouter } from 'next/router';
import { HTMLAttributes } from 'react';
import Navbar from '../organisms/Navbar';
import Footer from '../organisms/Footer';
import PageHeader, { GoBackProps } from '../molecule/PageHeader';
import TitleMain from '../molecule/TitleMain';
import { Container } from '../../styles/components/templates/PageTemplate';

interface PageTemplateProps extends HTMLAttributes<HTMLDivElement> {
  titleMain?: {
    title?: string;
    subTitle?: string;
  };
  // backLinkUrl: UrlObject | string;
  buttonType: GoBackProps;
}

const PageTemplate = ({
  children,
  titleMain,
  buttonType,
}: PageTemplateProps) => {
  const router = useRouter();

  console.log(router.pathname);

  return (
    <>
      <Navbar />
      <Container
        className={
          (router.pathname === '/carrinho' ||
            router.pathname.includes('confirmar')) &&
          'cart-width'
        }
      >
        <PageHeader buttonType={buttonType} />

        {titleMain && (
          <TitleMain title={titleMain.title} subtitle={titleMain.subTitle} />
        )}

        <div>{children}</div>
      </Container>
      <Footer />
    </>
  );
};

export default PageTemplate;
