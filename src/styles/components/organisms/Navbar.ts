import device from '@/utils/devices';
import styled from 'styled-components';

export const Container = styled.header`
  z-index: 1000;
  position: fixed;
  margin: 0;
  top: 0;
  width: 100%;
  background: #ffffff;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);

  @media ${device.laptopL} {
    padding: 0 8.3%;
  }
`;

export const Content = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const SidebarAndLogo = styled.section`
  display: flex;
`;

export const Logo = styled.h2`
  font-style: normal;
  font-weight: 900;
  color: #4d49c4;
  letter-spacing: 0.07em;

  font-size: 22px;
  line-height: 30px;

  margin-top: 9px;
  margin-bottom: 8px;
  margin-left: 16px;

  cursor: pointer;

  @media ${device.laptopL} {
    font-size: 30px;
    line-height: 41px;
    margin-left: 0;
  }
`;

export const NavLinks = styled.section`
  display: none;

  @media ${device.laptopL} {
    display: flex;
  }

  margin-top: 22px;
  margin-bottom: 22px;

  a {
    cursor: pointer;
    text-decoration: none;

    font-weight: normal;
    font-size: 16px;
    line-height: 22px;
    /* identical to box height, or 137% */

    text-align: right;
    letter-spacing: 0.192941px;

    /* Titles */

    color: #232b3b;

    & + a {
      margin-left: 1.5rem;

      @media ${device.laptopL} {
        margin-left: 49px;
      }
    }

    &:last-child {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
`;

export const Badges = styled.section`
  display: flex;
`;
