// pages/dashboard.js
import Head from 'next/head';
import { useState } from 'react';
import styled from 'styled-components';
import NavBar from '../components/NavBar';
import { withPageAuthRequired, useUser } from '@auth0/nextjs-auth0/client'; // Ensure correct import

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 300px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #005bb5;
  }
`;

const Dashboard = () => {
  const { user, error, isLoading } = useUser();
  const [text, setText] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      const data = await response.json();
      setApiResponse(data.content);
    } catch (error) {
      console.error(error);
      setApiResponse('Error fetching data from Google Gemini API: ' + error.message);
    }
  };

  const createCalendarEvent = async () => {
    try {
      const response = await fetch('/api/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      const data = await response.json();
      alert(`Event created: ${data.eventLink}`);
    } catch (error) {
      console.error(error);
      alert('Error creating event: ' + error.message);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <Container>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Basic dashboard using Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <Main>
        <Title>Dashboard</Title>
        <Description>Welcome to your dashboard, {user.name}.</Description>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter some text"
          />
          <Button type="submit">Submit</Button>
        </Form>

        {apiResponse !== null && (
          <p>Response from Google Gemini: {apiResponse}</p>
        )}

        <Button onClick={createCalendarEvent}>Create Calendar Event</Button>
      </Main>
    </Container>
  );
};

export default withPageAuthRequired(Dashboard); // Wrap Dashboard with withPageAuthRequired
