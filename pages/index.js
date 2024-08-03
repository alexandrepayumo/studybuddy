// pages/index.js
import Head from 'next/head';
import styled from 'styled-components';
import { LoginButton } from '@/components/buttons/login-button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0 2rem;
`;

const Main = styled.main`
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;
`;

const Description = styled.p`
  text-align: center;
  font-size: 1.5rem;
`;

const Button = styled.a`
  margin-top: 2rem;
  padding: 1rem 2rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  font-size: 1.25rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #005bb5;
  }
`;

export default function Home() {
  return (
    <Container>
      <Head>
        <title>Landing Page</title>
        <meta name="description" content="Basic landing page using Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <Title>
          Welcome to Our Landing Page
        </Title>

        <Description>
          This is a basic landing page created with Next.js.
        </Description>
        <LoginButton></LoginButton>
       
      </Main>
    </Container>
  );
}
